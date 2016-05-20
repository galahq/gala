require 'test_helper'

class GalaControllerTest < ActionDispatch::IntegrationTest
  test "should get open" do
    get gala_open_url
    assert_response :success
  end

end
