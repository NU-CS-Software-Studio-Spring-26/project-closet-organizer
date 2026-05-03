require "image_processing/mini_magick"
require "mini_magick"

class ClothingItemPhotoCropper
  def self.call(source_photo, bounding_box)
    new(source_photo, bounding_box).call
  end

  def initialize(source_photo, bounding_box)
    @source_photo = source_photo
    @bounding_box = bounding_box
  end

  def call
    with_source_file do |file_path, filename_root|
      source_image = MiniMagick::Image.open(file_path)
      crop_width = [ (source_image.width * bounding_box.fetch(:width)).round, 1 ].max
      crop_height = [ (source_image.height * bounding_box.fetch(:height)).round, 1 ].max
      crop_x = (source_image.width * bounding_box.fetch(:x)).round.clamp(0, [ source_image.width - 1, 0 ].max)
      crop_y = (source_image.height * bounding_box.fetch(:y)).round.clamp(0, [ source_image.height - 1, 0 ].max)

      crop_width = [ crop_width, source_image.width - crop_x ].min
      crop_height = [ crop_height, source_image.height - crop_y ].min

      tempfile = ImageProcessing::MiniMagick
        .source(file_path)
        .crop("#{crop_width}x#{crop_height}+#{crop_x}+#{crop_y}")
        .convert("png")
        .call

      {
        tempfile: tempfile,
        filename: "#{filename_root}-crop.png",
        content_type: "image/png"
      }
    end
  end

  private

  attr_reader :bounding_box, :source_photo

  def with_source_file
    if source_photo.respond_to?(:blob)
      source_photo.blob.open do |file|
        yield file.path, File.basename(source_photo.blob.filename.to_s, ".*").presence || "item-photo"
      end
    elsif source_photo.respond_to?(:tempfile) && source_photo.tempfile.present?
      yield source_photo.tempfile.path, base_filename_from_upload
    else
      yield source_photo.path, base_filename_from_upload
    end
  end

  def base_filename_from_upload
    File.basename(source_photo.original_filename.to_s, ".*").presence || "item-photo"
  end
end
