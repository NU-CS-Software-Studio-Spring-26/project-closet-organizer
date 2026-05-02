require "test_helper"

class OutfitUploadsFlowTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
  end

  test "can create an outfit upload and persist detections" do
    detector_response = {
      provider: "openrouter",
      vision_model: "openai/gpt-4.1-mini",
      raw_response: { "id" => "resp_123" },
      items: [
        {
          category: "shirt",
          confidence: 0.92,
          suggested_name: "White Button-Up Shirt",
          details: {
            dominant_color: "white",
            material_guess: "cotton",
            style_guess: "classic",
            notes: "Long sleeves are visible."
          }
        },
        {
          category: "pants",
          confidence: 0.88,
          suggested_name: "Black Tailored Pants",
          details: {
            dominant_color: "black",
            material_guess: "",
            style_guess: "tailored",
            notes: ""
          }
        }
      ]
    }

    assert_difference("OutfitUpload.count", 1) do
      assert_difference("OutfitDetection.count", 2) do
        with_detector_stub(detector_response) do
          post outfit_uploads_url, params: {
            outfit_upload: {
              user_id: @user.id,
              source_photo: item_photo_upload
            }
          }
        end
      end
    end

    assert_response :created
    assert_equal "succeeded", response_json["status"]
    assert_equal "openai/gpt-4.1-mini", response_json["vision_model"]
    assert_equal 2, response_json["detections"].length
    assert_equal "shirt", response_json["detections"].first["category"]
    assert_match %r{/rails/active_storage/}, response_json["source_photo_url"]
  end

  test "returns a failed upload payload when detection raises an error" do
    with_detector_stub(->(_upload) { raise "OPENROUTER_API_KEY is not configured." }) do
      post outfit_uploads_url, params: {
        outfit_upload: {
          user_id: @user.id,
          source_photo: item_photo_upload
        }
      }
    end

    assert_response :created
    assert_equal "failed", response_json["status"]
    assert_equal "OPENROUTER_API_KEY is not configured.", response_json["error_message"]
    assert_equal [], response_json["detections"]
  end

  test "can fetch an existing outfit upload" do
    upload = OutfitUpload.new(user: @user)
    upload.source_photo.attach(item_photo_upload)
    upload.status = :succeeded
    upload.provider = "openrouter"
    upload.vision_model = "openai/gpt-4.1-mini"
    upload.save!
    upload.outfit_detections.create!(
      category: "jacket",
      confidence: 0.81,
      suggested_name: "Blue Denim Jacket",
      details: { dominant_color: "blue" },
      position: 0
    )

    get outfit_upload_url(upload), as: :json

    assert_response :success
    assert_equal upload.id, response_json["id"]
    assert_equal 1, response_json["detections"].length
    assert_equal "jacket", response_json["detections"].first["category"]
  end

  private

  def with_detector_stub(response)
    detector_class = OutfitPhotoDetector.singleton_class
    original_call = OutfitPhotoDetector.method(:call)

    detector_class.send(:define_method, :call) do |upload|
      response.respond_to?(:call) ? response.call(upload) : response
    end

    yield
  ensure
    detector_class.send(:define_method, :call, original_call)
  end

  def item_photo_upload
    Rack::Test::UploadedFile.new(file_fixture("item-photo.svg"), "image/svg+xml")
  end
end
