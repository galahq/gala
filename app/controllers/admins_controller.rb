# frozen_string_literal: true

class AdminsController < ApplicationController
  Resource = Struct.new(:key, :path, :model_name, :label, keyword_init: true)

  RESOURCES = {
    'ahoy/events' => Resource.new(key: 'ahoy/events', path: 'ahoy/events', model_name: 'Ahoy::Event', label: 'Ahoy Events'),
    'announcements' => Resource.new(key: 'announcements', path: 'announcements', model_name: 'Announcement', label: 'Announcements'),
    'answers' => Resource.new(key: 'answers', path: 'answers', model_name: 'Answer', label: 'Answers'),
    'cases' => Resource.new(key: 'cases', path: 'cases', model_name: 'Case', label: 'Cases'),
    'comment_threads' => Resource.new(key: 'comment_threads', path: 'comment_threads', model_name: 'CommentThread', label: 'Comment Threads'),
    'comments' => Resource.new(key: 'comments', path: 'comments', model_name: 'Comment', label: 'Comments'),
    'deployments' => Resource.new(key: 'deployments', path: 'deployments', model_name: 'Deployment', label: 'Deployments'),
    'editorships' => Resource.new(key: 'editorships', path: 'editorships', model_name: 'Editorship', label: 'Editorships'),
    'enrollments' => Resource.new(key: 'enrollments', path: 'enrollments', model_name: 'Enrollment', label: 'Enrollments'),
    'forums' => Resource.new(key: 'forums', path: 'forums', model_name: 'Forum', label: 'Forums'),
    'group_memberships' => Resource.new(key: 'group_memberships', path: 'group_memberships', model_name: 'GroupMembership', label: 'Group Memberships'),
    'groups' => Resource.new(key: 'groups', path: 'groups', model_name: 'Group', label: 'Groups'),
    'questions' => Resource.new(key: 'questions', path: 'questions', model_name: 'Question', label: 'Questions'),
    'quizzes' => Resource.new(key: 'quizzes', path: 'quizzes', model_name: 'Quiz', label: 'Quizzes'),
    'readers' => Resource.new(key: 'readers', path: 'readers', model_name: 'Reader', label: 'Readers'),
    'reading_list_items' => Resource.new(key: 'reading_list_items', path: 'reading_list_items', model_name: 'ReadingListItem', label: 'Reading List Items'),
    'reading_list_saves' => Resource.new(key: 'reading_list_saves', path: 'reading_list_saves', model_name: 'ReadingListSave', label: 'Reading List Saves'),
    'reading_lists' => Resource.new(key: 'reading_lists', path: 'reading_lists', model_name: 'ReadingList', label: 'Reading Lists'),
    'submissions' => Resource.new(key: 'submissions', path: 'submissions', model_name: 'Submission', label: 'Submissions')
  }.freeze

  PER_PAGE = 50

  layout 'admin'

  before_action :authorize_admin
  before_action :set_resource_config
  before_action :set_record, only: %i[show edit update destroy copy_case]

  helper_method :admin_resources, :admin_collection_path, :admin_member_path,
                :admin_new_path, :admin_edit_path, :display_admin_value,
                :admin_field_type, :admin_attribute_label

  def index
    @page = [params.fetch(:page, 1).to_i, 1].max
    @total_count = scoped_records.count
    @records = ordered_records.limit(PER_PAGE).offset((@page - 1) * PER_PAGE)
    @attributes = index_attributes
  end

  def show
    @attributes = show_attributes
  end

  def new
    @record = model_class.new
    @attributes = form_attributes
  end

  def edit
    @attributes = form_attributes
  end

  def create
    @record = model_class.new(resource_params)

    if @record.save
      redirect_to admin_member_path(@record), notice: "#{model_class.model_name.human} created."
    else
      @attributes = form_attributes
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @record.update(resource_params)
      redirect_to admin_member_path(@record), notice: "#{model_class.model_name.human} updated."
    else
      @attributes = form_attributes
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @record.destroy
    redirect_to admin_collection_path, notice: "#{model_class.model_name.human} deleted."
  end

  def copy_case
    authorize_case_copy!
    clone = CaseCloner.call(@record, locale: locale).to_record
    redirect_to admin_member_path(clone)
  end

  private

  def authorize_admin
    redirect_to '/403' unless current_reader&.has_role?(:editor)
  end

  def authorize_case_copy!
    raise ActiveRecord::RecordNotFound unless model_class == Case
  end

  def set_resource_config
    @resource_config = RESOURCES.fetch(params.fetch(:resource, 'cases')) do
      raise ActiveRecord::RecordNotFound
    end
  end

  def set_record
    @record = find_record(params[:id])
  end

  def find_record(id)
    case model_class.name
    when 'Case'
      model_class.friendly.find(id)
    when 'ReadingList'
      model_class.find_by!(uuid: id)
    else
      model_class.find(id)
    end
  end

  def scoped_records
    case model_class.name
    when 'Ahoy::Event'
      model_class.all
    when 'Comment'
      model_class.reorder(created_at: :desc)
    when 'CommentThread'
      model_class.includes(card: { element: :case_element })
    else
      model_class.all
    end
  end

  def ordered_records
    return scoped_records.reorder(time: :desc) if model_class.name == 'Ahoy::Event'
    return scoped_records if scoped_records.order_values.present?
    return scoped_records.reorder(created_at: :desc) if model_class.column_names.include?('created_at')
    return scoped_records.reorder(id: :desc) if model_class.column_names.include?('id')

    scoped_records
  end

  def model_class
    @model_class ||= @resource_config.model_name.constantize
  end

  def resource_params
    params.fetch(:record, {}).permit(*form_attributes)
  end

  def index_attributes
    preferred = %w[id name title email slug kicker content created_at updated_at]
    (preferred & model_class.column_names).first(6).presence || model_class.column_names.first(6)
  end

  def show_attributes
    model_class.column_names
  end

  def form_attributes
    model_class.column_names - %w[id created_at updated_at]
  end

  def admin_resources
    RESOURCES.values
  end

  def admin_collection_path(resource = @resource_config)
    "/admin/#{resource.path}"
  end

  def admin_member_path(record, resource = @resource_config)
    "#{admin_collection_path(resource)}/#{record.to_param}"
  end

  def admin_new_path(resource = @resource_config)
    "#{admin_collection_path(resource)}/new"
  end

  def admin_edit_path(record, resource = @resource_config)
    "#{admin_member_path(record, resource)}/edit"
  end

  def display_admin_value(value)
    case value
    when Time, Date, DateTime
      helpers.localize(value)
    when Hash, Array
      JSON.pretty_generate(value)
    when NilClass
      'NULL'
    else
      value.to_s
    end
  end

  def admin_field_type(attribute)
    column = model_class.columns_hash.fetch(attribute)
    return :textarea if %i[text json jsonb].include?(column.type)
    return :checkbox if column.type == :boolean
    return :datetime if %i[datetime date time].include?(column.type)
    return :number if %i[integer float decimal].include?(column.type)

    :text
  end

  def admin_attribute_label(attribute)
    model_class.human_attribute_name(attribute)
  end
end
