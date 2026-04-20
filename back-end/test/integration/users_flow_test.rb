require "test_helper"

class UsersFlowTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
  end

  test "users index loads" do
    get users_url, as: :json

    assert_response :success
    assert_equal @user.username, response_json.first["username"]
  end

  test "user show loads" do
    get user_url(@user), as: :json

    assert_response :success
    assert_equal @user.username, response_json["username"]
  end

  test "can create a user" do
    assert_difference("User.count", 1) do
      post users_url, params: {
        user: {
          username: "sam",
          preferred_style: "smart casual",
          password: "password123",
          password_confirmation: "password123"
        }
      }, as: :json
    end

    assert_response :created
    assert_equal "sam", response_json["username"]
  end

  test "can update a user without changing password" do
    patch user_url(@user), params: {
      user: {
        username: "alex-updated",
        preferred_style: "minimal",
        password: "",
        password_confirmation: ""
      }
    }, as: :json

    assert_response :success
    assert_equal "alex-updated", @user.reload.username
    assert_equal "alex-updated", response_json["username"]
    assert @user.authenticate("password123")
  end

  test "can delete a user" do
    assert_difference("User.count", -1) do
      delete user_url(@user), as: :json
    end

    assert_response :no_content
  end
end
