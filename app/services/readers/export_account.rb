# frozen_string_literal: true

module Readers
  # A copy of everything Gala holds about a reader, as one JSON file: the
  # Art. 15 copy and the Art. 20 portable format (register 9b, A17). The
  # reader downloads it from the Your data page; a site admin downloads it
  # from the reader's admin page for a request emailed to hello@, or for a
  # closed account that can't sign in.
  #
  # The file opens with an "about" section: why the data is held, who
  # receives it, how long it is kept, where it came from, the person's rights
  # and a glossary of every section. Art. 15(1) requires that information
  # with the copy, and raw activity logs aren't intelligible without it
  # (EDPB Guidelines 01/2022, paras 112-113 and 140-141).
  #
  # Each record is turned into JSON by Postgres and the file is yielded in
  # pieces, a batch of rows at a time, so the largest accounts (tens of
  # thousands of visits and events) are never held in memory whole.
  #
  # Left out: the password hash and the reset, confirmation and remember-me
  # tokens, which are secrets rather than information about the person, and
  # other people's data: replies to their comments, who notified or invited
  # them, which admin erased their account.
  class ExportAccount
    BATCH_SIZE = 2_000

    # Every time in the file is UTC, written the same way whether Ruby or
    # Postgres produced it: 2026-11-11T21:28:32.970165Z. The columns are
    # timestamps without a zone, which Postgres would otherwise write with no
    # marker at all, leaving a program to guess.
    TIME_FORMAT = %q('YYYY-MM-DD"T"HH24:MI:SS.US"Z"')

    # In the order they appear in the file. Every section but "about" and
    # "account" is a list of records, and {#counts} counts each list.
    SECTIONS = %i[about account sign_in_methods enrollments group_memberships invitations
                  comments quiz_submissions quiz_answers reading_lists saved_reading_lists
                  quizzes_written cases_edited libraries_managed library_requests
                  reply_notifications spotlights_dismissed account_closures visits events].freeze
    LISTS = (SECTIONS - %i[about account]).freeze

    # The password hash and the tokens are left out: see the class comment.
    ACCOUNT_COLUMNS = %w[id name email unconfirmed_email initials locale persona image_url
                         send_reply_notifications created_password terms_of_service
                         sign_in_count current_sign_in_at last_sign_in_at
                         confirmed_at confirmation_sent_at reset_password_sent_at
                         seen_announcements_created_before created_at updated_at
                         closed_at anonymized_at].freeze

    # Why each list is held, grouped as the Your data page and the "about"
    # section explain it. Every list belongs to exactly one purpose.
    PURPOSES = {
      account: %i[sign_in_methods spotlights_dismissed account_closures],
      classes: %i[enrollments group_memberships invitations],
      quizzes: %i[quiz_submissions quiz_answers quizzes_written],
      discussions: %i[comments reply_notifications],
      reading_lists: %i[reading_lists saved_reading_lists],
      authoring: %i[cases_edited libraries_managed library_requests],
      activity: %i[visits events]
    }.freeze

    # @param file_url [#call] turns an ActiveStorage attachment into a link
    #   the person can download it from; the controller passes one, since
    #   only it knows the host
    def initialize(reader, file_url: ->(_attachment) {}, now: Time.current)
      @reader = reader
      @records = AccountRecords.new(reader)
      @file_url = file_url
      @now = now
    end

    def filename
      "gala-data-#{@reader.id}-#{@now.utc.to_date.iso8601}.json"
    end

    # @yield [String] the file, a piece at a time
    # @return [Enumerator] when no block is given
    def each(&)
      return enum_for(:each) unless block_given?

      yield '{'
      SECTIONS.each_with_index do |section, index|
        yield ',' if index.positive?
        yield "#{section.to_s.to_json}:"
        write_section(section, &)
      end
      yield "}\n"
    end

    # @return [Hash{Symbol => Integer}] how many records each list holds
    def counts
      LISTS.index_with { |section| list(section).count(:all) }
    end

    private

    def write_section(section, &)
      case section
      when :about then yield about.to_json
      when :account then yield account.to_json
      else write_list(list(section), decorator(section), &)
      end
    end

    # One JSON array, built a batch of rows at a time. The ids come first, so
    # each batch is a primary-key lookup however the list is scoped.
    def write_list(relation, decorate)
      table = relation.klass.arel_table
      relation = relation.unscope(:order)
      ids = relation.order(table[:id]).pluck(table[:id])
      columns = output_columns(relation)
      yield '['
      ids.each_slice(BATCH_SIZE).with_index do |batch, index|
        yield ',' if index.positive?
        yield json_rows(relation.where(id: batch), columns, decorate).join(',')
      end
      yield ']'
    end

    def json_rows(relation, columns, decorate)
      rows = connection.select_values(<<~SQL.squish)
        SELECT row_to_json(x)::text FROM (SELECT #{columns} FROM (#{relation.to_sql}) t) x ORDER BY x.id
      SQL
      return rows unless decorate

      decorate.call(rows.map { |row| JSON.parse(row) }).map(&:to_json)
    end

    # The list's columns as they go into the file, with each timestamp in
    # {TIME_FORMAT}. Postgres reports the types without fetching a row.
    def output_columns(relation)
      result = connection.select_all("SELECT * FROM (#{relation.to_sql}) t LIMIT 0")
      result.columns.map do |name|
        column = "t.#{connection.quote_column_name(name)}"
        case result.column_types[name]&.type
        when :datetime then "#{utc_text(column)} AS #{connection.quote_column_name(name)}"
        when :timestamptz then "#{utc_text("#{column} AT TIME ZONE 'UTC'")} AS #{connection.quote_column_name(name)}"
        else column
        end
      end.join(', ')
    end

    def utc_text(column)
      "to_char(#{column}, #{TIME_FORMAT})"
    end

    def list(section)
      send(:"#{section}_list")
    end

    def decorator(section)
      case section
      when :comments then method(:add_comment_files)
      when :reading_lists then method(:add_reading_list_image)
      end
    end

    def about
      text = I18n.t('my_data.about', address: ApplicationMailer::FROM_ADDRESS, deep_interpolation: true)
      {
        generated_at: @now.utc.iso8601(6),
        account_id: @reader.id,
        times: text[:times],
        why_we_hold_it: why_we_hold_it(text[:purposes]),
        where_it_comes_from: text[:sources],
        who_else_receives_it: text[:recipients].values + text[:recipient_detail].values,
        how_long_we_keep_it: text[:retention].values,
        your_rights: text[:rights],
        files: text[:files],
        glossary: text[:glossary]
      }
    end

    def why_we_hold_it(purposes)
      PURPOSES.to_h do |purpose, lists|
        sections = purpose == :account ? [:account, *lists] : lists
        [purpose, { sections: sections, what: purposes[purpose][:what], why: purposes[purpose][:why] }.compact]
      end
    end

    def account
      @reader.attributes.slice(*ACCOUNT_COLUMNS).transform_values { |value| utc(value) }.merge(
        'current_sign_in_ip' => @reader.current_sign_in_ip&.to_s,
        'last_sign_in_ip' => @reader.last_sign_in_ip&.to_s,
        'active_community' => Community.find_by(id: @reader.active_community_id)&.name,
        'roles' => @reader.roles.map { |role| role_entry(role) },
        'profile_photo' => (file_entry(@reader.image.attachment) if @reader.image.attached?)
      )
    end

    def utc(value)
      value.respond_to?(:utc) ? value.utc.iso8601(6) : value
    end

    def role_entry(role)
      { 'name' => role.name, 'on' => role.resource_type && "#{role.resource_type} #{role.resource_id}" }.compact
    end

    def sign_in_methods_list
      AuthenticationStrategy.where(reader_id: @reader.id)
                            .select(:id, :provider, :uid, :created_at)
    end

    def enrollments_list
      Enrollment.unscoped.where(reader_id: @reader.id)
                .joins('LEFT JOIN cases ON cases.id = enrollments.case_id')
                .joins('LEFT JOIN groups ON groups.id = enrollments.active_group_id')
                .select('enrollments.id', 'cases.slug AS case', 'cases.title AS case_title',
                        Arel.sql(enum_sql('enrollments.status', Enrollment.statuses, 'status')),
                        Arel.sql("#{translated('groups.name')} AS class"),
                        'enrollments.created_at AS enrolled_at')
    end

    def group_memberships_list
      GroupMembership.where(reader_id: @reader.id)
                     .joins('LEFT JOIN groups ON groups.id = group_memberships.group_id')
                     .select('group_memberships.id', Arel.sql("#{translated('groups.name')} AS class"),
                             Arel.sql(enum_sql('group_memberships.status', GroupMembership.statuses, 'role')),
                             'group_memberships.created_at AS joined_at')
    end

    def invitations_list
      Invitation.where(reader_id: @reader.id)
                .joins('LEFT JOIN communities ON communities.id = invitations.community_id')
                .select('invitations.id', Arel.sql("#{translated('communities.name')} AS community"),
                        'invitations.created_at AS invited_at', 'invitations.accepted_at',
                        'invitations.rescinded_at')
    end

    # Their own comments only: replies by others in the same thread are the
    # other people's data. The highlighted text is theirs when they started
    # the thread. A thread's case is its forum's, as in CommentThread#case:
    # comment_threads.case_id is often empty.
    def comments_list
      @records.comments
              .joins('LEFT JOIN comment_threads ON comment_threads.id = comments.comment_thread_id')
              .joins('LEFT JOIN forums ON forums.id = comment_threads.forum_id')
              .joins('LEFT JOIN cases ON cases.id = COALESCE(forums.case_id, comment_threads.case_id)')
              .select('comments.id', 'comments.comment_thread_id AS thread_id',
                      'cases.slug AS case', 'cases.title AS case_title',
                      Arel.sql(<<~SQL.squish),
                        CASE WHEN comment_threads.reader_id = #{@reader.id.to_i}
                             THEN comment_threads.original_highlight_text END AS highlighted_text
                      SQL
                      'comments.content AS text', 'comments.created_at AS written_at',
                      'comments.updated_at')
    end

    def quiz_submissions_list
      @records.submissions
              .joins('LEFT JOIN quizzes ON quizzes.id = submissions.quiz_id')
              .joins('LEFT JOIN cases ON cases.id = quizzes.case_id')
              .select('submissions.id', 'submissions.quiz_id', 'quizzes.title AS quiz_title',
                      'cases.slug AS case', 'submissions.created_at AS submitted_at')
    end

    # Not the question's correct answer: that is the quiz author's, and
    # "correct" already says how the person did.
    def quiz_answers_list
      @records.answers
              .joins('LEFT JOIN questions ON questions.id = answers.question_id')
              .select('answers.id', 'answers.submission_id', 'answers.quiz_id',
                      Arel.sql("#{translated('questions.content')} AS question"),
                      'questions.options AS choices', 'answers.content AS answer',
                      'answers.correct', 'answers.case_completion', 'answers.created_at AS answered_at')
    end

    def reading_lists_list
      ReadingList.where(reader_id: @reader.id)
                 .select('reading_lists.id', 'reading_lists.uuid', 'reading_lists.title',
                         'reading_lists.description', 'reading_lists.created_at',
                         'reading_lists.updated_at', Arel.sql(<<~SQL.squish))
                           (SELECT COALESCE(json_agg(json_build_object(
                                      'case', cases.slug, 'case_title', cases.title,
                                      'notes', items.notes, 'added_at', #{utc_text('items.created_at')})
                                    ORDER BY items.position), '[]')
                              FROM reading_list_items items
                              LEFT JOIN cases ON cases.id = items.case_id
                             WHERE items.reading_list_id = reading_lists.id) AS cases
                         SQL
    end

    def saved_reading_lists_list
      ReadingListSave.where(reader_id: @reader.id)
                     .joins('LEFT JOIN reading_lists ON reading_lists.id = reading_list_saves.reading_list_id')
                     .select('reading_list_saves.id', 'reading_lists.uuid', 'reading_lists.title',
                             'reading_list_saves.created_at AS saved_at')
    end

    def quizzes_written_list
      Quiz.where(author_id: @reader.id)
          .joins('LEFT JOIN cases ON cases.id = quizzes.case_id')
          .select('quizzes.id', 'quizzes.title', 'cases.slug AS case', 'quizzes.created_at')
    end

    def cases_edited_list
      Editorship.where(editor_id: @reader.id)
                .joins('LEFT JOIN cases ON cases.id = editorships.case_id')
                .select('editorships.id', 'cases.slug AS case', 'cases.title AS case_title',
                        'editorships.created_at AS since')
    end

    def libraries_managed_list
      Managership.where(manager_id: @reader.id)
                 .joins('LEFT JOIN libraries ON libraries.id = managerships.library_id')
                 .select('managerships.id', 'libraries.slug AS library',
                         Arel.sql("#{translated('libraries.name')} AS library_name"),
                         'managerships.created_at AS since')
    end

    def library_requests_list
      CaseLibraryRequest.where(requester_id: @reader.id)
                        .joins('LEFT JOIN cases ON cases.id = case_library_requests.case_id')
                        .joins('LEFT JOIN libraries ON libraries.id = case_library_requests.library_id')
                        .select('case_library_requests.id', 'cases.slug AS case', 'libraries.slug AS library',
                                'case_library_requests.status', 'case_library_requests.created_at AS requested_at')
    end

    # Not who replied: that is the other person's data.
    def reply_notifications_list
      ReplyNotification.where(reader_id: @reader.id)
                       .joins('LEFT JOIN cases ON cases.id = reply_notifications.case_id')
                       .select('reply_notifications.id', 'reply_notifications.comment_thread_id AS thread_id',
                               'reply_notifications.comment_id AS reply_id', 'cases.slug AS case')
    end

    def spotlights_dismissed_list
      SpotlightAcknowledgement.where(reader_id: @reader.id)
                              .select(:id, 'spotlight_key AS tip', 'created_at AS dismissed_at')
    end

    # Not which admin erased the account: that is the admin's data.
    def account_closures_list
      AccountDeletionRequest.where(reader_id: @reader.id)
                            .select(:id, :requested_at, 'scheduled_for AS deletion_due_at', :restored_at,
                                    'completed_at AS deleted_at', :erased_at, 'erasure_counts AS erased')
    end

    def visits_list
      @records.visits.select(*(Visit.column_names - %w[user_id]))
    end

    def events_list
      @records.events.select(:id, :visit_id, :name, :time, :properties)
    end

    # A batch of rows at a time, so a reader with many comments costs one
    # query per batch rather than one per comment.
    def add_comment_files(rows)
      files = attachments('Comment', rows).group_by(&:record_id)
      rows.map { |row| row.merge('files' => files.fetch(row['id'], []).map { |file| file_entry(file) }) }
    end

    def add_reading_list_image(rows)
      images = attachments('ReadingList', rows).where(name: 'social_image').index_by(&:record_id)
      rows.map { |row| images[row['id']] ? row.merge('image' => file_entry(images[row['id']])) : row }
    end

    def attachments(record_type, rows)
      ActiveStorage::Attachment.where(record_type: record_type, record_id: rows.pluck('id'))
                               .includes(:blob).order(:id)
    end

    def file_entry(attachment)
      { 'name' => attachment.filename.to_s, 'type' => attachment.content_type,
        'bytes' => attachment.byte_size, 'link' => @file_url.call(attachment) }.compact
    end

    # A Mobility-translated jsonb column, in the reader's language where there
    # is one, else English, else any. A plain string is returned as it is.
    def translated(column)
      locale = connection.quote(I18n.locale.to_s)
      <<~SQL.squish
        CASE WHEN jsonb_typeof(#{column}) = 'object'
             THEN COALESCE(#{column}->>#{locale}, #{column}->>'en',
                           (SELECT value FROM jsonb_each_text(#{column}) LIMIT 1))
             ELSE #{column} #>> '{}' END
      SQL
    end

    def enum_sql(column, mapping, as)
      whens = mapping.map { |name, value| "WHEN #{connection.quote(value)} THEN #{connection.quote(name)}" }
      "CASE #{column} #{whens.join(' ')} END AS #{as}"
    end

    def connection
      ActiveRecord::Base.connection
    end
  end
end
