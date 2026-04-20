require "test_helper"

class UsersFlowTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
  end

  test "users index loads" do
    get users_url

    assert_response :success
    assert_includes response.body, @user.username
  end

  test "user show loads" do
    get user_url(@user)

    assert_response :success
    assert_includes response.body, @user.username
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
      }
    end

    assert_redirected_to user_url(User.order(:created_at).last)
  end

  test "can update a user without changing password" do
    patch user_url(@user), params: {
      user: {
        username: "alex-updated",
        preferred_style: "minimal",
        password: "",
        password_confirmation: ""
      }
    }

    assert_redirected_to user_url(@user)
    assert_equal "alex-updated", @user.reload.username
    assert @user.authenticate("password123")
  end

  test "can delete a user" do
    assert_difference("User.count", -1) do
      delete user_url(@user)
    end

    assert_redirected_to users_url
  end
end
