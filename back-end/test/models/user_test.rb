require "test_helper"
require "ostruct"

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

  test "google auth assigns a unique username when display name already exists" do
    User.create!(
      username: "Annabel Goldman",
      email: "existing@example.com",
      provider: "google_oauth2",
      uid: "existing-google-user",
      password: "password123"
    )

    auth_hash = OpenStruct.new(
      provider: "google_oauth2",
      uid: "new-google-user",
      info: OpenStruct.new(
        email: "annabel@example.com",
        name: "Annabel Goldman",
        image: "https://example.com/avatar.png"
      )
    )

    user = User.from_google_auth(auth_hash)

    assert_equal "Annabel Goldman 2", user.username
    assert_equal "annabel@example.com", user.email
  end

  test "google auth reuses the same user without renaming on repeat sign in" do
    auth_hash = OpenStruct.new(
      provider: "google_oauth2",
      uid: users(:one).uid,
      info: OpenStruct.new(
        email: "updated-alex@example.com",
        name: "Alex Renamed",
        image: "https://example.com/alex.png"
      )
    )

    user = User.from_google_auth(auth_hash)

    assert_equal users(:one).id, user.id
    assert_equal "alex", user.username
    assert_equal "updated-alex@example.com", user.email
  end
end
