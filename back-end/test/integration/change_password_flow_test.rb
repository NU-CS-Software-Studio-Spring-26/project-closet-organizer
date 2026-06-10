require "test_helper"

class ChangePasswordFlowTest < ActionDispatch::IntegrationTest
  setup do
    @local_user = users(:local_one)
    @google_user = users(:one)
  end

  test "local user can change password with correct current password" do
    patch change_password_path,
      params: { current_password: "localpass99", password: "newpass1234", password_confirmation: "newpass1234" },
      headers: auth_headers(@local_user),
      as: :json

    assert_response :success
    assert @local_user.reload.authenticate("newpass1234")
  end

  test "returns 401 when current password is wrong" do
    patch change_password_path,
      params: { current_password: "wrongpassword", password: "newpass1234", password_confirmation: "newpass1234" },
      headers: auth_headers(@local_user),
      as: :json

    assert_response :unauthorized
  end

  test "returns 422 when new password confirmation does not match" do
    patch change_password_path,
      params: { current_password: "localpass99", password: "newpass1234", password_confirmation: "different" },
      headers: auth_headers(@local_user),
      as: :json

    assert_response :unprocessable_entity
  end

  test "returns 422 when new password is blank" do
    patch change_password_path,
      params: { current_password: "localpass99", password: "", password_confirmation: "" },
      headers: auth_headers(@local_user),
      as: :json

    assert_response :unprocessable_entity
  end

  test "returns 422 when google user tries to change password" do
    patch change_password_path,
      params: { current_password: "anything", password: "newpass1234", password_confirmation: "newpass1234" },
      headers: auth_headers(@google_user),
      as: :json

    assert_response :unprocessable_entity
  end

  test "returns 401 when not logged in" do
    patch change_password_path,
      params: { current_password: "localpass99", password: "newpass1234", password_confirmation: "newpass1234" },
      as: :json

    assert_response :unauthorized
  end
end
