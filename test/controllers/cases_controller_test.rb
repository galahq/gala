require 'test_helper'

class CasesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @case = cases(:one)
  end

  test "should get index" do
    get cases_url
    assert_response :success
  end

  test "should create case" do
    assert_difference('Case.count') do
      post cases_url, params: { case: { authors: @case.authors, published: @case.published, slug: @case.slug, summary: @case.summary, tags: @case.tags, text: @case.text, title: @case.title } }
    end

    assert_response 201
  end

  test "should show case" do
    get case_url(@case)
    assert_response :success
  end

  test "should update case" do
    patch case_url(@case), params: { case: { authors: @case.authors, published: @case.published, slug: @case.slug, summary: @case.summary, tags: @case.tags, text: @case.text, title: @case.title } }
    assert_response 200
  end

  test "should destroy case" do
    assert_difference('Case.count', -1) do
      delete case_url(@case)
    end

    assert_response 204
  end
end
