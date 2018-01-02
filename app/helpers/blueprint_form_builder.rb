# frozen_string_literal: true

class BlueprintFormBuilder < ActionView::Helpers::FormBuilder
  FIELD_ERROR_PROC = proc do |html_tag, _instance_tag|
    html_tag
  end

  def form_group(method, label: nil, in_parens: nil, placeholder: nil,
                 helper_text: nil, &block)
    without_field_error_wrapper do
      classes = ['pt-form-group'] + error_classes(method)
      @template.content_tag :div, class: classes do
        contents = ''.html_safe
        contents << label_with_text_in_parens(method, label, in_parens)
        contents << form_content(method, placeholder, helper_text, &block)
      end
    end
  end

  private

  def error_classes(method)
    if @object.errors[method].any?
      ['pt-intent-danger']
    else
      []
    end
  end

  def label_with_text_in_parens(method, label, in_parens)
    contents = ''.html_safe

    contents << (label || @template.translate(
      "activerecord.attributes.#{@object_name}.#{method}"
    ))

    unless in_parens.nil?
      contents << ' '
      contents << @template.content_tag(:span, "(#{in_parens})",
                                        class: 'pt-text-muted')
    end

    label method, contents, class: 'pt-label'
  end

  def form_content(method, placeholder, helper_text)
    @template.content_tag :div, class: 'pt-form-content' do
      contents = ''.html_safe

      error_classes = error_classes(method)
      contents << if block_given?
                    @template.capture_haml do
                      yield self, error_classes
                    end
                  else
                    classes = %w[pt-input] + error_classes
                    text_field(method, class: classes, placeholder: placeholder)
                  end

      unless helper_text.nil?
        contents << @template.content_tag(:div, helper_text,
                                          class: 'pt-form-helper-text')
      end

      contents
    end
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
end
