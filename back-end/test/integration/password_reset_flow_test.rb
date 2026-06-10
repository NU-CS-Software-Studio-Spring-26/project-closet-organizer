require "test_helper"

class PasswordResetFlowTest < ActionDispatch::IntegrationTest
  include ActiveSupport::Testing::TimeHelpers

  setup do
    @local_user = users(:local_one)
    @google_user = users(:one)
    ActionMailer::Base.deliveries.clear
  end

  # --- POST /password_resets (request reset) ---

  test "returns 200 and sends email for known local-account email" do
    post password_resets_url,
      params: { email: @local_user.email },
      as: :json

    assert_response :success
    assert_equal 1, ActionMailer::Base.deliveries.size
    assert_equal [ @local_user.email ], ActionMailer::Base.deliveries.first.to
  end

  test "returns 200 but sends no email for unknown email (user enumeration protection)" do
    post password_resets_url,
      params: { email: "nobody@example.com" },
      as: :json

    assert_response :success
    assert_empty ActionMailer::Base.deliveries
  end

  test "returns 200 but sends no email for google-account email" do
    post password_resets_url,
      params: { email: @google_user.email },
      as: :json

    assert_response :success
    assert_empty ActionMailer::Base.deliveries
  end

  # --- PATCH /password_resets (apply reset) ---

  test "resets password with valid token" do
    token = @local_user.generate_token_for(:password_reset)
    patch password_resets_url,
      params: { token: token, password: "brandnew99", password_confirmation: "brandnew99" },
      as: :json

    assert_response :success
    assert @local_user.reload.authenticate("brandnew99")
  end

  test "returns 422 for invalid token" do
    patch password_resets_url,
      params: { token: "badtoken", password: "brandnew99", password_confirmation: "brandnew99" },
      as: :json

    assert_response :unprocessable_entity
  end

  test "returns 422 for expired token" do
    token = @local_user.generate_token_for(:password_reset)
    travel 3.hours do
      patch password_resets_url,
        params: { token: token, password: "brandnew99", password_confirmation: "brandnew99" },
        as: :json
    end

    assert_response :unprocessable_entity
  end

  test "returns 422 when new password is blank" do
    token = @local_user.generate_token_for(:password_reset)
    patch password_resets_url,
      params: { token: token, password: "", password_confirmation: "" },
      as: :json

    assert_response :unprocessable_entity
  end

  test "returns 422 when password confirmation does not match" do
    token = @local_user.generate_token_for(:password_reset)
    patch password_resets_url,
      params: { token: token, password: "brandnew99", password_confirmation: "different" },
      as: :json

    assert_response :unprocessable_entity
  end
end
