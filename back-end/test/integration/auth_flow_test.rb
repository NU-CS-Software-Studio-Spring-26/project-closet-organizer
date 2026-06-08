require "test_helper"

class AuthFlowTest < ActionDispatch::IntegrationTest
  test "can register with email and password" do
    assert_difference("User.count", 1) do
      post users_url, params: {
        user: {
          username: "sam closet",
          email: "sam@example.com",
          preferred_style: "minimal",
          password: "password123",
          password_confirmation: "password123",
          accepted_terms: true
        }
      }, as: :json
    end

    assert_response :created
    assert_equal "sam closet", response_json["username"]
    assert_equal "email", response_json["auth_provider"]
    assert response_json["password_login_enabled"]
  end

  test "registration requires accepted terms" do
    assert_no_difference("User.count") do
      post users_url, params: {
        user: {
          username: "no terms",
          email: "noterms@example.com",
          password: "password123",
          password_confirmation: "password123",
          accepted_terms: false
        }
      }, as: :json
    end

    assert_response :unprocessable_content
    assert_includes response_json["errors"], "Accepted terms must be accepted before creating an account."
  end

  test "can sign in with email and password" do
    post session_url, params: {
      session: {
        email: users(:one).email,
        password: "password123"
      }
    }, as: :json

    assert_response :unauthorized

    user = User.register_with_password!(
      username: "login user",
      email: "login@example.com",
      password: "password123",
      password_confirmation: "password123",
      accepted_terms: true
    )

    post session_url, params: {
      session: {
        email: user.email,
        password: "password123"
      }
    }, as: :json

    assert_response :success
    assert_equal user.id, response_json["id"]
  end

  test "can request and complete password reset for email accounts" do
    user = User.register_with_password!(
      username: "reset user",
      email: "reset@example.com",
      password: "password123",
      password_confirmation: "password123",
      accepted_terms: true
    )

    assert_enqueued_emails 1 do
      post password_reset_url, params: {
        password_reset: { email: user.email }
      }, as: :json
    end

    assert_response :success
    token = user.generate_token_for(:password_reset)

    patch password_reset_url, params: {
      password_reset: {
        token: token,
        password: "newpassword123",
        password_confirmation: "newpassword123"
      }
    }, as: :json

    assert_response :success
    assert user.reload.authenticate("newpassword123")
  end

  test "can change password with current password" do
    user = User.register_with_password!(
      username: "change pw",
      email: "changepw@example.com",
      password: "password123",
      password_confirmation: "password123",
      accepted_terms: true
    )

    patch user_url(user), params: {
      user: {
        current_password: "password123",
        password: "newpassword123",
        password_confirmation: "newpassword123"
      }
    }, headers: auth_headers(user), as: :json

    assert_response :success
    assert user.reload.authenticate("newpassword123")
  end

  test "google-linked user cannot register duplicate email" do
    assert_no_difference("User.count") do
      post users_url, params: {
        user: {
          username: "dup",
          email: users(:one).email,
          password: "password123",
          password_confirmation: "password123",
          accepted_terms: true
        }
      }, as: :json
    end

    assert_response :unprocessable_content
    assert_includes response_json["errors"], "Email is already linked to Google sign-in. Use Google to access that account."
  end
end
