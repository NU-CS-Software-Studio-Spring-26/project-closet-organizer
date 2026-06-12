require "test_helper"

class RateLimitingTest < ActionDispatch::IntegrationTest
  setup do
    # Clear rack-attack cache between tests
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
    Rack::Attack.reset!
  end

  # --- Login throttling ---

  test "allows login attempts below the throttle threshold" do
    4.times do
      post session_url,
        params: { username: "nobody", password: "wrong" },
        headers: { "REMOTE_ADDR" => "1.2.3.4" },
        as: :json
      assert_not_equal 429, response.status
    end
  end

  test "blocks login after 5 failed attempts from the same IP" do
    5.times do
      post session_url,
        params: { username: "nobody", password: "wrong" },
        headers: { "REMOTE_ADDR" => "1.2.3.5" },
        as: :json
    end

    post session_url,
      params: { username: "nobody", password: "wrong" },
      headers: { "REMOTE_ADDR" => "1.2.3.5" },
      as: :json

    assert_response :too_many_requests
  end

  test "blocked login response includes JSON error message" do
    5.times do
      post session_url,
        params: { username: "nobody", password: "wrong" },
        headers: { "REMOTE_ADDR" => "1.2.3.6" },
        as: :json
    end

    post session_url,
      params: { username: "nobody", password: "wrong" },
      headers: { "REMOTE_ADDR" => "1.2.3.6" },
      as: :json

    body = JSON.parse(response.body)
    assert_includes body["error"].downcase, "too many"
  end

  # --- Registration throttling ---

  test "allows registration attempts below the throttle threshold" do
    2.times do
      post users_url,
        params: { username: "u#{rand(9999)}", password: "pass", email: "x@x.com", terms_accepted: "1" },
        headers: { "REMOTE_ADDR" => "2.2.3.4" },
        as: :json
      assert_not_equal 429, response.status
    end
  end

  test "blocks registration after 3 attempts from the same IP" do
    3.times do
      post users_url,
        params: { username: "u#{rand(9999)}", password: "pass", email: "x@x.com", terms_accepted: "1" },
        headers: { "REMOTE_ADDR" => "2.2.3.5" },
        as: :json
    end

    post users_url,
      params: { username: "new_user", password: "pass", email: "new@x.com", terms_accepted: "1" },
      headers: { "REMOTE_ADDR" => "2.2.3.5" },
      as: :json

    assert_response :too_many_requests
  end

  # --- Password reset throttling ---

  test "blocks password reset requests after 5 attempts from the same IP" do
    5.times do
      post password_resets_url,
        params: { email: "nobody@example.com" },
        headers: { "REMOTE_ADDR" => "3.2.3.5" },
        as: :json
    end

    post password_resets_url,
      params: { email: "nobody@example.com" },
      headers: { "REMOTE_ADDR" => "3.2.3.5" },
      as: :json

    assert_response :too_many_requests
  end
end
