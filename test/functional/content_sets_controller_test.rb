require 'test_helper'

class ContentSetsControllerTest < ActionController::TestCase
  setup do
    @content_set = content_sets(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:content_sets)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create content_set" do
    assert_difference('ContentSet.count') do
      post :create, content_set: { date: @content_set.date, name: @content_set.name }
    end

    assert_redirected_to content_set_path(assigns(:content_set))
  end

  test "should show content_set" do
    get :show, id: @content_set
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @content_set
    assert_response :success
  end

  test "should update content_set" do
    put :update, id: @content_set, content_set: { date: @content_set.date, name: @content_set.name }
    assert_redirected_to content_set_path(assigns(:content_set))
  end

  test "should destroy content_set" do
    assert_difference('ContentSet.count', -1) do
      delete :destroy, id: @content_set
    end

    assert_redirected_to content_sets_path
  end
end
