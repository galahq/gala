# frozen_string_literal: true

# Makes it easier to make forms in the [Blueprint](http://blueprintjs.com/)
# style
class BlueprintFormBuilder < ActionView::Helpers::FormBuilder
  FIELD_ERROR_PROC = proc do |html_tag, _instance_tag|
    html_tag
  end

  BLUEPRINT_CLASS_MAP = {
    'pt-button' => 'bp4-button',
    'pt-callout' => 'bp4-callout',
    'pt-checkbox' => 'bp4-checkbox',
    'pt-control' => 'bp4-control',
    'pt-control-group' => 'bp4-control-group',
    'pt-control-indicator' => 'bp4-control-indicator',
    'pt-dark' => 'bp4-dark',
    'pt-elevation-2' => 'bp4-elevation-2',
    'pt-elevation-4' => 'bp4-elevation-4',
    'pt-fill' => 'bp4-fill',
    'pt-file-input' => 'bp4-file-input',
    'pt-file-upload-input' => 'bp4-file-upload-input',
    'pt-form-content' => 'bp4-form-content',
    'pt-form-group' => 'bp4-form-group',
    'pt-form-helper-text' => 'bp4-form-helper-text',
    'pt-icon' => 'bp4-icon',
    'pt-input' => 'bp4-input',
    'pt-input-group' => 'bp4-input-group',
    'pt-intent-danger' => 'bp4-intent-danger',
    'pt-intent-primary' => 'bp4-intent-primary',
    'pt-intent-success' => 'bp4-intent-success',
    'pt-label' => 'bp4-label',
    'pt-minimal' => 'bp4-minimal',
    'pt-radio' => 'bp4-radio',
    'pt-round' => 'bp4-round',
    'pt-running-text' => 'bp4-running-text',
    'pt-select' => 'bp4-html-select',
    'pt-small' => 'bp4-small',
    'pt-tag' => 'bp4-tag',
    'pt-text-muted' => 'bp4-text-muted'
  }.freeze

  BLUEPRINT_PREFIX_MAP = {
    'pt-icon-' => 'bp4-icon-',
    'pt-intent-' => 'bp4-intent-',
    'pt-elevation-' => 'bp4-elevation-'
  }.freeze

  FIELD_HELPERS_WITH_BLUEPRINT_CLASSES = %i[
    color_field date_field datetime_field datetime_local_field
    email_field month_field number_field password_field search_field
    telephone_field text_area text_field time_field url_field week_field
  ].freeze

  FIELD_HELPERS_WITH_BLUEPRINT_CLASSES.each do |helper_name|
    define_method helper_name do |method, *args, **options|
      super(method, *args, **normalize_blueprint_options(options))
    end
  end

  # Creates a label, input, and helper text that are colored red together when
  # there is an error in the field.
  def form_group(method, label: nil, in_parens: nil, placeholder: nil,
                 helper_text: nil, **kwargs, &block)
    without_field_error_wrapper do
      classes = blueprint_classes('pt-form-group', *error_classes(method))
      @template.content_tag :div, class: classes, **kwargs do
        contents = ''.html_safe
        contents << label_with_text_in_parens(method, label, in_parens)
        contents << form_content(method, placeholder, helper_text, &block)
      end
    end
  end

  # Creates a callout listing the form’s errors if there are any
  def errors
    return if @object.errors.empty?

    classes = blueprint_classes('pt-callout', 'pt-intent-danger', 'pt-icon-error', 'form__callout')
    @template.content_tag :div, class: classes do
      contents = ''.html_safe
      contents << error_header
      contents << error_list
    end
  end

  def check_box(method, **options)
    without_field_error_wrapper do
      @template.content_tag :label, class: blueprint_classes('pt-control', 'pt-checkbox') do
        content = ''.html_safe
        content << super(method, normalize_blueprint_options(options))
        content << @template.content_tag(:span, '', class: blueprint_classes('pt-control-indicator'))
        content << default_label_text(method)
      end
    end
  end

  def radio_button(method, value, **options)
    without_field_error_wrapper do
      @template.content_tag :label, class: blueprint_classes('pt-control', 'pt-radio') do
        content = ''.html_safe
        content << super(method, value, normalize_blueprint_options(options))
        content << @template.content_tag(:span, '', class: blueprint_classes('pt-control-indicator'))
        content << default_label_text([method, value].join('.'))
      end
    end
  end

  # Creates a blueprint style file input
  def file_field(method, **kwargs)
    without_field_error_wrapper do
      with_blueprint_file_input method, **kwargs do |options|
        super(method, options)
      end
    end
  end

  def select(method, choices = nil, options = {}, html_options = {}, &block)
    super(method, choices, options, normalize_blueprint_options(html_options), &block)
  end

  def submit(*args, **kwargs)
    class_argument = Array(kwargs.delete(:class))
    classes = ['pt-button']

    if !class_argument.delete('pt-intent-none') &&
       !class_argument.any? { |value| value.to_s.start_with?('pt-intent-') }
      classes.push('pt-intent-success')
    end

    classes.push(*class_argument)
    super(*args, kwargs.merge(class: blueprint_classes(*classes)))
  end

  private

  def blueprint_classes(*class_names)
    normalized = Array(class_names)
                 .flatten
                 .compact
                 .flat_map { |value| value.to_s.split(/\s+/) }
                 .reject(&:empty?)

    expanded = normalized.flat_map do |value|
      mapped = BLUEPRINT_CLASS_MAP[value] || BLUEPRINT_PREFIX_MAP.find { |prefix, _| value.start_with?(prefix) }&.then { |prefix, replacement| value.sub(prefix, replacement) }
      mapped ? [value, mapped] : value
    end

    expanded.flatten.map(&:to_s).uniq
  end

  def normalize_blueprint_options(options)
    return options unless options.key?(:class)

    options.merge(class: blueprint_classes(options[:class]))
  end

  def error_classes(method)
    if @object.errors[method].any?
      blueprint_classes('pt-intent-danger')
    else
      []
    end
  end

  def label_with_text_in_parens(method, label, in_parens)
    contents = ''.html_safe

    contents << (label || default_label_text(method))

    unless in_parens.nil?
      contents << ' '
      contents << @template.content_tag(:span, "(#{in_parens})".html_safe,
                                        class: blueprint_classes('pt-text-muted'))
    end

    label method, contents, class: blueprint_classes('pt-label')
  end

  def default_label_text(method)
    defaults = []
    defaults << :"helpers.label.#{normalized_object_name}.#{method}"
    defaults << :"#{object.class.i18n_scope}.attributes.#{normalized_object_name}.#{method}"
    key = defaults.shift
    @template.translate key, default: defaults
  end

  def normalized_object_name
    @object_name.to_s.tr('[', '.').delete(']')
  end

  def form_content(method, placeholder, helper_text, &block)
    @template.content_tag :div, class: blueprint_classes('pt-form-content') do
      contents = ''.html_safe

      error_classes = error_classes(method)
      contents << if block_given?
                    capture_yielding self, error_classes, &block
                  else
                    classes = blueprint_classes('pt-input', 'pt-fill', *error_classes)
                    text_field(method, class: classes, placeholder: placeholder)
                  end

      unless helper_text.nil?
        contents << @template.content_tag(:div, helper_text,
                                          class: blueprint_classes('pt-form-helper-text'))
      end

      contents
    end
  end

  def capture_yielding(*args, &block)
    @template.capture(*args, &block)
  end

  def without_field_error_wrapper
    default_field_error_proc = ::ActionView::Base.field_error_proc
    begin
      ::ActionView::Base.field_error_proc = FIELD_ERROR_PROC
      yield
    ensure
      ::ActionView::Base.field_error_proc = default_field_error_proc
    end
  end

  def error_header
    @template.content_tag :h5, class: blueprint_classes('pt-callout-title', 'bp4-heading') do
      I18n.translate 'errors.template.header',
                     model: @object.model_name.human.downcase,
                     count: @object.errors.count
    end
  end

  def error_list
    @object.errors.full_messages
           .map { |error| @template.content_tag :div, error }
           .join
           .html_safe
  end

  def with_blueprint_file_input(method, instructions: nil, **options)
    label method, class: blueprint_classes('pt-label') do
      contents = ''.html_safe
      classes = blueprint_classes('pt-file-input', *Array(options.delete(:class)))
      contents << @template.content_tag(:div, class: classes) do
        div_contents = ''.html_safe
        div_contents << yield(normalize_blueprint_options(options))
        div_contents << file_input_span(instructions)
      end
    end
  end

  def file_input_span(instructions)
    @template.content_tag :span, class: blueprint_classes('pt-file-upload-input') do
      instructions || I18n.t('helpers.choose_an_image')
    end
  end
end
