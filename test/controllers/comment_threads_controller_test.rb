require 'test_helper'

class CommentThreadsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @comment_thread = comment_threads(:one)
  end

  test "should get index" do
    get comment_threads_url
    assert_response :success
  end

  test "should create comment_thread" do
    assert_difference('CommentThread.count') do
      post comment_threads_url, params: { comment_thread: { case_id: @comment_thread.case_id, group_id: @comment_thread.group_id } }
    end

    assert_response 201
  end

  test "should show comment_thread" do
    get comment_thread_url(@comment_thread)
    assert_response :success
  end

  test "should update comment_thread" do
    patch comment_thread_url(@comment_thread), params: { comment_thread: { case_id: @comment_thread.case_id, group_id: @comment_thread.group_id } }
    assert_response 200
  end

  test "should destroy comment_thread" do
    assert_difference('CommentThread.count', -1) do
      delete comment_thread_url(@comment_thread)
    end

    assert_response 204
  end
end
