require 'test_helper'

class PodcastsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @podcast = podcasts(:one)
  end

  test "should get index" do
    get podcasts_url
    assert_response :success
  end

  test "should create podcast" do
    assert_difference('Podcast.count') do
      post podcasts_url, params: { podcast: { audio_url_i18n: @podcast.audio_url_i18n, case_id: @podcast.case_id, description_i18n: @podcast.description_i18n, title_i18n: @podcast.title_i18n } }
    end

    assert_response 201
  end

  test "should show podcast" do
    get podcast_url(@podcast)
    assert_response :success
  end

  test "should update podcast" do
    patch podcast_url(@podcast), params: { podcast: { audio_url_i18n: @podcast.audio_url_i18n, case_id: @podcast.case_id, description_i18n: @podcast.description_i18n, title_i18n: @podcast.title_i18n } }
    assert_response 200
  end

  test "should destroy podcast" do
    assert_difference('Podcast.count', -1) do
      delete podcast_url(@podcast)
    end

    assert_response 204
  end
end
