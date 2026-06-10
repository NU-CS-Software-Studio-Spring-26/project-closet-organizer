require "test_helper"

class LocalAuthFlowTest < ActionDispatch::IntegrationTest
  # --- Registration (POST /users) ---

  test "registers a new local user with valid params" do
    post users_url, params: {
      user: { username: "newuser", password: "hunter2hunter2", password_confirmation: "hunter2hunter2",
              terms_accepted: true }
    }, as: :json

    assert_response :created
    assert_equal "newuser", response_json["username"]
  end

  test "registration returns 422 when username is missing" do
    post users_url, params: {
      user: { password: "hunter2hunter2", password_confirmation: "hunter2hunter2" }
    }, as: :json

    assert_response :unprocessable_entity
  end

  test "registration returns 422 when password is missing" do
    post users_url, params: {
      user: { username: "newuser2" }
    }, as: :json

    assert_response :unprocessable_entity
  end

  test "registration returns 422 when password confirmation does not match" do
    post users_url, params: {
      user: { username: "newuser3", password: "hunter2hunter2", password_confirmation: "wrong" }
    }, as: :json

    assert_response :unprocessable_entity
  end

  test "registration returns 422 when username is already taken" do
    post users_url, params: {
      user: { username: users(:local_one).username, password: "hunter2hunter2", password_confirmation: "hunter2hunter2" }
    }, as: :json

    assert_response :unprocessable_entity
  end

  # --- Login (POST /session) ---

  test "logs in with valid local credentials" do
    post session_path, params: { username: "sam", password: "localpass99" }, as: :json

    assert_response :success
    assert_equal users(:local_one).id, response_json["id"]
    assert_equal "sam", response_json["username"]
  end

  test "login returns 401 with wrong password" do
    post session_path, params: { username: "sam", password: "wrongpassword" }, as: :json

    assert_response :unauthorized
  end

  test "login returns 401 with unknown username" do
    post session_path, params: { username: "doesnotexist", password: "localpass99" }, as: :json

    assert_response :unauthorized
  end

  test "login returns 401 when attempting local login for a google user" do
    post session_path, params: { username: users(:one).username, password: "password123" }, as: :json

    assert_response :unauthorized
  end

  # --- Terms acceptance ---

  test "registration returns 422 when terms are not accepted" do
    post users_url, params: {
      user: { username: "termstester", password: "hunter2hunter2", password_confirmation: "hunter2hunter2",
              terms_accepted: false }
    }, as: :json

    assert_response :unprocessable_entity
  end

  test "registration returns 422 when terms param is absent" do
    post users_url, params: {
      user: { username: "termstester2", password: "hunter2hunter2", password_confirmation: "hunter2hunter2" }
    }, as: :json

    assert_response :unprocessable_entity
  end

  test "registration succeeds when terms are accepted" do
    post users_url, params: {
      user: { username: "termstester3", password: "hunter2hunter2", password_confirmation: "hunter2hunter2",
              terms_accepted: true }
    }, as: :json

    assert_response :created
  end
end
