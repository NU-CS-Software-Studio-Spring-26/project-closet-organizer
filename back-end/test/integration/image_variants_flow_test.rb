require "test_helper"

class ImageVariantsFlowTest < ActionDispatch::IntegrationTest
  test "can create a cleaned preview image from an uploaded file" do
    with_image_cleaner_stub do
      post preview_image_variants_url, params: {
        image_variant: {
          source_photo: item_photo_upload
        }
      }
    end

    assert_response :success
    assert_equal "image/png", response_json["content_type"]
    assert_match(/\Adata:image\/png;base64,/, response_json["data_url"])
  end

  private

  def item_photo_upload
    Rack::Test::UploadedFile.new(file_fixture("item-photo.png"), "image/png")
  end

  def with_image_cleaner_stub
    original = OpenrouterImageCleaner.method(:call)
    fixture_path = file_fixture("item-photo.png")

    OpenrouterImageCleaner.singleton_class.send(:define_method, :call) do |_source_photo, prompt_context: {}|
      tempfile = Tempfile.new([ "preview-photo", ".png" ])
      tempfile.binmode
      tempfile.write(File.binread(fixture_path))
      tempfile.rewind

      {
        tempfile: tempfile,
        filename: "preview-photo.png",
        content_type: "image/png",
        provider: "openrouter",
        model: "google/gemini-2.5-flash-image",
        raw_response: { "id" => "img_preview", "prompt_context" => prompt_context }
      }
    end

    yield
  ensure
    OpenrouterImageCleaner.singleton_class.send(:define_method, :call, original)
  end
end
