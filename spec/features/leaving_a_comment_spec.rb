# frozen_string_literal: true

require 'rails_helper'

feature 'Leaving a comment' do
  let!(:enrollment) { create :enrollment }
  let!(:global_forum) { enrollment.case.forums.find_by community: nil }
  let!(:private_forum) do
    private_forum = create :forum, :with_community, case: enrollment.case
    enrollment.reader.invitations.create community: private_forum.community
  end

  before { login_as enrollment.reader }

  scenario 'is possible with a unique selection' do
    skip

    kase = enrollment.case
    card = kase.pages.first.cards.first
    card.raw_content = ContentState.with_text(
      'abcdefghijklmnopqrstuvwxyz'.each_char.map { |x| x * 5 }.join(' ')
    )
    card.save

    visit case_path kase

    first_page = kase.pages.first
    click_link first_page.title
    expect(page).to have_link 'Respond'
    click_link 'Respond', match: :first

    first_paragraph = find('.DraftEditor-root div[data-block]', match: :first)
    first_paragraph.double_click
    click_button 'Respond Here'
    expect(page).to have_selector '.public-DraftEditorPlaceholder-root'

    reply_placeholder = find('.public-DraftEditorPlaceholder-root',
                             text: 'Write a reply...')
                        .native
    page.driver.browser.action.move_to(reply_placeholder).click.perform
    page.driver.browser.action.send_keys('Test reply').perform
    click_button 'Submit'
    expect(page).to have_selector 'blockquote', text: 'Test reply'

    find('[aria-label="Close"]').click
    click_button 'Overview'
    click_button 'Conversation'
    click_link 'Test reply'
    reply_placeholder = find('.public-DraftEditorPlaceholder-root',
                             text: 'Write a reply...')
                        .native
    page.driver.browser.action.move_to(reply_placeholder).click.perform
    page.driver.browser.action.send_keys('Conversation view works!').perform
    find('button[aria-label="Respond"]').click
    expect(page).to have_content 'Conversation view works!'
    expect(page).to have_content 'Write a reply...'
  end

  scenario 'is not possible with a non-unique selection' do
    card = enrollment.case.pages.first.cards.first
    card.raw_content = ContentState.with_text('apple ' * 50)
    card.save

    visit case_path(enrollment.case) + '/1'
    click_link 'Respond', match: :first
    first_paragraph = find('.DraftEditor-root div[data-block]', match: :first)
    first_paragraph.double_click

    expect(page).to have_content 'Please select a few more words.'
  end

  scenario 'is not possible when your active community is not discussing the case' do
    other_community = create :community
    enrollment.reader.update active_community_id: other_community.id

    visit case_path(enrollment.case) + '/1'

    community_chooser = find('a', text: other_community.name).native
    page.driver.browser.action.move_to(community_chooser).perform
    expect(page)
      .to have_content 'Your active community is not discussing this case'

    expect(page).not_to have_content 'RESPOND'
  end

  let!(:other_reader) { create :reader }

  let!(:comment_thread) do
    first_card = enrollment.case.pages.first.cards.first
    first_letter = first_card.paragraphs[0][0]
    first_card.comment_threads.create(
      original_highlight_text: first_letter,
      reader: other_reader,
      locale: I18n.locale,
      forum: global_forum
    )
  end

  scenario 'makes it show up for other people looking at the same forum' do
    skip

    enrollment.reader.update(active_community_id: nil)
    visit case_path(enrollment.case) + '/1'
    expect(first('.CommentThreads__banner')).to have_content 'RESPOND'
    sleep(1)
    comment_thread.comments.create(
      content: 'Test comment',
      reader: other_reader
    )
    expect(first('.CommentThreads__banner')).to have_content '1 COMMENT'

    click_link GlobalCommunity.instance.name
    expect(page).to have_content private_forum.community.name
    find('.bp3-menu-item', text: private_forum.community.name).click
    expect(first('.CommentThreads__banner')).to have_content 'RESPOND'
    comment_thread.comments.create(
      content: 'Test comment',
      reader: other_reader
    )
    expect(first('.CommentThreads__banner')).to have_content 'RESPOND'

    click_link private_forum.community.name
    find('.bp3-menu-item', text: GlobalCommunity.instance.name).click
    expect(first('.CommentThreads__banner')).to have_content '2 COMMENTS'
    sleep(1)
    comment_thread.comments.create(
      content: 'Test comment',
      reader: other_reader
    )
    expect(first('.CommentThreads__banner')).to have_content '3 COMMENTS'
  end

  context 'in response to another comment' do
    let!(:comment) do
      comment_thread.comments.create(
        content: 'Test comment',
        reader: other_reader
      )
    end

    it 'is possible' do
      kase = enrollment.case
      visit case_path enrollment.case
      click_link kase.pages.first.title

      comment_entity = find '.c-comment-thread-entity'
      comment_entity.click
      expect(page).to have_content comment.content

      reply_placeholder = find('.public-DraftEditorPlaceholder-root',
                               text: 'Write a reply...')
                          .native
      page.driver.browser.action.move_to(reply_placeholder).click.perform
      page.driver.browser.action.send_keys('Test reply').perform
      find('button[aria-label="Respond"]').click
      sleep 1
      expect(page).to have_content 'Test reply'
      expect(page).to have_content 'Write a reply...'
    end

    it 'displays a toast to the other comment’s author' do
      comment_thread.comments.create(
        content: 'Test reply',
        reader: enrollment.reader
      )
      visit case_path(enrollment.case) + '/1'
      comment_thread.comments.create(
        content: 'Should trigger toast',
        reader: other_reader
      )
      expect(page).to have_content 'replied to your comment'
    end

    it 'sends an email to the other comment’s author with a link that works ' \
       'even when it the reader is in a different active community' do
      enrollment.reader.update(active_community_id: private_forum.community.id)
      comment_thread.comments.create content: 'Test reply',
                                     reader: enrollment.reader
      email = ActionMailer::Base.deliveries.last

      expect(email.to.first).to eq other_reader.email
      expect(email.text_part.body.to_s).to match 'Test reply'
      expect(email.html_part.body.to_s).to match 'Test reply'

      capy_email = Capybara::Node::Simple.new(email.html_part.body.to_s)
      link = capy_email.find_link("Reply online")
      expect(capy_email).to have_link("Reply online")
      visit link[:href].sub("http://localhost:3000","")
      expect(page).to have_content 'Test reply'
    end

    it 'doesn’t send an email notification if the other author has ' \
       'notifications turned off' do
      ActionMailer::Base.deliveries.clear
      other_reader.update send_reply_notifications: false

      comment_thread.comments.create content: 'Test reply',
                                     reader: enrollment.reader
      email = ActionMailer::Base.deliveries.last

      expect(email).to be_nil
    end
  end

  context 'as an author of the case' do
    it 'doesn’t lock the card you’re commenting on' do
      kase = enrollment.case
      card = kase.pages.first.cards.first

      enrollment.reader.my_cases << kase

      visit case_path(enrollment.case) + '/1'
      click_link 'Respond', match: :first
      first_paragraph = find('.DraftEditor-root div[data-block]', match: :first)
      first_paragraph.double_click

      expect(card).not_to be_locked
    end
  end
end
