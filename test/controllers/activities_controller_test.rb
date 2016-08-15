require 'test_helper'

class ActivitiesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @activity = activities(:one)
  end

  test "should get index" do
    get activities_url
    assert_response :success
  end

  test "should create activity" do
    assert_difference('Activity.count') do
      post activities_url, params: { activity: { case_id: @activity.case_id, description_i18n: @activity.description_i18n, name_i18n: @activity.name_i18n, pdf_url_i18n: @activity.pdf_url_i18n } }
    end

    assert_response 201
  end

  test "should show activity" do
    get activity_url(@activity)
    assert_response :success
  end

  test "should update activity" do
    patch activity_url(@activity), params: { activity: { case_id: @activity.case_id, description_i18n: @activity.description_i18n, name_i18n: @activity.name_i18n, pdf_url_i18n: @activity.pdf_url_i18n } }
    assert_response 200
  end

  test "should destroy activity" do
    assert_difference('Activity.count', -1) do
      delete activity_url(@activity)
    end

    assert_response 204
  end
end
