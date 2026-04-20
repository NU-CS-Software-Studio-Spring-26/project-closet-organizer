require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "fixture user is valid" do
    assert users(:one).valid?
  end

  test "username is required" do
    user = User.new(password: "password123", password_confirmation: "password123")

    assert_not user.valid?
    assert_includes user.errors[:username], "can't be blank"
  end

  test "authenticate works with fixture password" do
    assert users(:one).authenticate("password123")
  end
end
