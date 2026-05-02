require "base64"

class ImageVariantsController < ApplicationController
  def preview
    source_photo = params.dig(:image_variant, :source_photo)
    if source_photo.blank?
      render json: { error: "Select an image before using the AI cleaner." }, status: :unprocessable_content
      return
    end

    generated = OpenrouterImageCleaner.call(source_photo)
    tempfile = generated.fetch(:tempfile)
    tempfile.rewind

    render json: {
      filename: generated.fetch(:filename),
      content_type: generated.fetch(:content_type),
      data_url: data_url_for(tempfile, generated.fetch(:content_type))
    }
  rescue StandardError => error
    render json: { error: error.message }, status: :unprocessable_content
  ensure
    tempfile&.close!
  end

  private

  def data_url_for(tempfile, content_type)
    encoded = Base64.strict_encode64(tempfile.read)
    "data:#{content_type};base64,#{encoded}"
  end
end
