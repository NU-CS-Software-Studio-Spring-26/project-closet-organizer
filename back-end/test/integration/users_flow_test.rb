require "test_helper"

class UsersFlowTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @admin = users(:two)
  end

  test "admin can load users index" do
    get users_url, headers: auth_headers(@admin), as: :json

    assert_response :success
    usernames = response_json["users"].map { |user| user["username"] }.sort
    expected = [ @user.username, @admin.username, users(:local_one).username ].sort
    assert_equal expected, usernames
    assert_equal 3, response_json.dig("meta", "total_count")
    assert_equal 1, response_json.dig("meta", "page")
  end

  test "users index paginates with page and per_page" do
    get users_url(page: 1, per_page: 1), headers: auth_headers(@admin), as: :json

    assert_response :success
    assert_equal 1, response_json["users"].size
    assert_equal 3, response_json.dig("meta", "total_count")
    assert_equal 3, response_json.dig("meta", "total_pages")
  end

  test "browser html request for users index falls back to the frontend app" do
    get "/users"

    assert_response :success
    assert_includes response.body, "<div id=\"root\"></div>"
  end

  test "non-admin cannot load users index" do
    get users_url, headers: auth_headers(@user), as: :json

    assert_response :forbidden
    assert_equal "You're not authorized to view this page.", response_json["error"]
  end

  test "admin can load user show" do
    get user_url(@user), headers: auth_headers(@admin), as: :json

    assert_response :success
    assert_equal @user.username, response_json["username"]
  end

  test "browser html request for user show falls back to the frontend app" do
    get "/users/#{@user.id}"

    assert_response :success
    assert_includes response.body, "<div id=\"root\"></div>"
  end

  test "non-admin cannot load user show" do
    get user_url(@admin), headers: auth_headers(@user), as: :json

    assert_response :forbidden
    assert_equal "You're not authorized to view this page.", response_json["error"]
  end

  test "local registration creates a new user" do
    assert_difference("User.count", 1) do
      post users_url, params: {
        user: {
          username: "brandnewuser",
          password: "hunter2hunter2",
          password_confirmation: "hunter2hunter2",
          terms_accepted: true
        }
      }, as: :json
    end

    assert_response :created
    assert_equal "brandnewuser", response_json["username"]
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
