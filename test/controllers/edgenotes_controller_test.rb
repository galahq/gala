require 'test_helper'

class EdgenotesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @edgenote = edgenotes(:one)
  end

  test "should get index" do
    get edgenotes_url
    assert_response :success
  end

  test "should create edgenote" do
    assert_difference('Edgenote.count') do
      post edgenotes_url, params: { edgenote: { caption_i18n: @edgenote.caption_i18n, content_i18n: @edgenote.content_i18n, format: @edgenote.format, thumb: @edgenote.thumb } }
    end

    assert_response 201
  end

  test "should show edgenote" do
    get edgenote_url(@edgenote)
    assert_response :success
  end

  test "should update edgenote" do
    patch edgenote_url(@edgenote), params: { edgenote: { caption_i18n: @edgenote.caption_i18n, content_i18n: @edgenote.content_i18n, format: @edgenote.format, thumb: @edgenote.thumb } }
    assert_response 200
  end

  test "should destroy edgenote" do
    assert_difference('Edgenote.count', -1) do
      delete edgenote_url(@edgenote)
    end

    assert_response 204
  end
end
