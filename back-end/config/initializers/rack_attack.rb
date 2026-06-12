class Rack::Attack
  # Use Rails cache so throttle counters survive across requests
  Rack::Attack.cache.store = Rails.cache

  # Throttle login attempts: 5 per IP per minute
  throttle("logins/ip", limit: 5, period: 1.minute) do |req|
    req.ip if req.path == "/session" && req.post?
  end

  # Throttle registration: 3 per IP per minute
  throttle("signups/ip", limit: 3, period: 1.minute) do |req|
    req.ip if req.path == "/users" && req.post?
  end

  # Throttle password reset requests: 5 per IP per 10 minutes
  throttle("password_resets/ip", limit: 5, period: 10.minutes) do |req|
    req.ip if req.path == "/password_resets" && req.post?
  end

  # Return JSON 429 instead of the default plain-text response
  self.throttled_responder = lambda do |_env|
    [
      429,
      { "Content-Type" => "application/json" },
      [ { error: "Too many requests. Please try again later." }.to_json ]
    ]
  end
end
