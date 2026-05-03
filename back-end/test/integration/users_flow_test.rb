require "test_helper"

class UsersFlowTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
  end

  test "users index loads" do
    get users_url, headers: auth_headers(@user), as: :json

    assert_response :success
    assert_equal @user.username, response_json.first["username"]
  end

  test "user show loads" do
    get user_url(@user), headers: auth_headers(@user), as: :json

    assert_response :success
    assert_equal @user.username, response_json["username"]
  end

  test "user creation is handled through google sign-in" do
    assert_no_difference("User.count") do
      post users_url, params: {
        user: {
          username: "sam",
          preferred_style: "smart casual",
          password: "password123",
          password_confirmation: "password123"
        }
      }, headers: auth_headers(@user), as: :json
    end

    assert_response :unauthorized
    assert_equal "User creation is handled through Google sign-in.", response_json["error"]
  end

  test "can update a user without changing password" do
    patch user_url(@user), params: {
      user: {
        username: "alex-updated",
        preferred_style: "minimal",
        password: "",
        password_confirmation: ""
      }
    }, headers: auth_headers(@user), as: :json

    assert_response :success
    assert_equal "alex-updated", @user.reload.username
    assert_equal "alex-updated", response_json["username"]
    assert @user.authenticate("password123")
  end

  test "can delete a user" do
    assert_difference("User.count", -1) do
      delete user_url(@user), headers: auth_headers(@user), as: :json
    end

    assert_response :no_content
  end
end
