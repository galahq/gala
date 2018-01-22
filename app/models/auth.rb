# frozen_string_literal: true

# A wrapper around an OmniAuth auth object that provides methods to extract
# the information we need for a Reader
#
# @example LTI Auth object example from Canvas
#   auth = {
#     'provider' => 'lti',
#     'uid' => 'f85d162948f58d136f44ca6d83dab4c7631ef99f',
#     'info' => {
#       'name' => 'Cameron',
#       'email' => 'cbothner@umich.edu',
#       'first_name' => 'Cameron',
#       'last_name' => 'Bothner',
#
#       'image' => 'https://secure.gravatar.com/avatar/a0c62b3a092ee04472a53de3a25bf0c5?s=50&d=https%3A%2F%2Fcanvas.instructure.com%2Fimages%2Fmessages%2Favatar-50.png'
#     },
#     'credentials' => {
#       'token' => 'key',
#       'secret' => 'secret'
#     },
#     'extra' => {
#       'raw_info' => {
#         'context_id' => 'a79c0d9cd98aebd8bf995ae91a72cb9d610eabaf',
#         'context_label' => 'Practice Course for Cameron Bothner',
#         'context_title' => 'Practice Course for Cameron Bothner',
#         'launch_presentation_document_target' => 'iframe',
#         'launch_presentation_height' => '400',
#         'launch_presentation_locale' => 'en',
#         'launch_presentation_return_url' => 'https://umich.instructure.com/courses/111466/external_content/success/external_tool_redirect',
#         'launch_presentation_width' => '800',
#         'lis_person_contact_email_primary' => 'cbothner@umich.edu',
#         'lis_person_name_family' => 'Bothner',
#         'lis_person_name_full' => 'Cameron Bothner',
#         'lis_person_name_given' => 'Cameron',
#         'lis_person_sourcedid' => '67133767',
#         'lti_message_type' => 'basic-lti-launch-request',
#         'lti_version' => 'LTI-1p0',
#         'oauth_callback' => 'about:blank',
#         'oauth_consumer_key' => 'key',
#         'oauth_nonce' => 'af3484c5335ea11ba0727a52155dacd3',
#         'oauth_signature' => '/dzK+JV067sEUm3UIW5KgWDC7xA=',
#         'oauth_signature_method' => 'HMAC-SHA1',
#         'oauth_timestamp' => '1516635547',
#         'oauth_version' => '1.0',
#         'resource_link_id' => 'a79c0d9cd98aebd8bf995ae91a72cb9d610eabaf',
#         'resource_link_title' => 'Localhost MSC',
#         'roles' => 'instructor',
#         'tool_consumer_info_product_family_code' => 'canvas',
#         'tool_consumer_info_version' => 'cloud',
#         'tool_consumer_instance_contact_email' => 'notifications@instructure.com',
#         'tool_consumer_instance_guid' => '7db438071375c02373713c12c73869ff2f470b68.umich.instructure.com',
#         'tool_consumer_instance_name' => 'University of Michigan - Ann Arbor',
#         'user_id' => 'f85d162948f58d136f44ca6d83dab4c7631ef99f',
#         'user_image' => 'https://secure.gravatar.com/avatar/a0c62b3a092ee04472a53de3a25bf0c5?s=50&d=https%3A%2F%2Fcanvas.instructure.com%2Fimages%2Fmessages%2Favatar-50.png',
#         'custom_canvas_enrollment_state' => 'active',
#         'custom_canvas_user_id' => '221761',
#         'custom_canvas_user_login_id' => 'cbothner',
#         'custom_canvas_course_id' => '111466',
#         'custom_canvas_workflow_state' => 'available',
#         'custom_canvas_api_domain' => 'umich.instructure.com',
#         'ext_roles' => 'urn:lti:instrole:ims/lis/Instructor,urn:lti:instrole:ims/lis/Student,urn:lti:role:ims/lis/Instructor,urn:lti:sysrole:ims/lis/User'
#       }
#     }
#   }
#
#   reader.attributes = Auth.new(auth).reader_attributes
class Auth
  def initialize(auth)
    @auth = auth
  end

  def reader_attributes
    {
      email: email,
      password: Devise.friendly_token[0, 20],
      created_password: false,
      confirmed_at: Time.zone.now,

      name: name,
      initials: initials,
      image_url: image_url,

      locale: locale
    }
  end

  def email
    @auth.info.email
  end

  def name
    name = @auth.dig 'extra', 'raw_info', 'lis_person_name_full'
    name ||= @auth.dig 'info', 'name'
    name
  end

  def initials
    name.split(' ').map(&:first).join
  end

  def image_url
    return if @auth['provider'] == 'lti' # LTI gives us a blank avatar image

    @auth.dig 'info', 'image'
  end

  def locale
    locale = @auth.dig 'extra', 'raw_info', 'locale'
    locale ||= @auth.dig 'extra', 'raw_info', 'launch_presentation_locale'
    locale
  end

  def instructor?
    instructor_role = %r{urn:lti:role:ims/lis/Instructor}
    @auth.dig('extra', 'raw_info', 'ext_roles') =~ instructor_role
  end
end
