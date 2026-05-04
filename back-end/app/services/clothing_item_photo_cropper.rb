class ClothingItemPhotoCropper
  Error = Class.new(StandardError)

  def self.call(source_photo, bounding_box)
    new(source_photo, bounding_box).call
  end

  def initialize(source_photo, bounding_box)
    @source_photo = source_photo
    @bounding_box = bounding_box
  end

  def call
    with_source_file do |file_path, filename_root|
      crop_image(file_path).merge(
        filename: "#{filename_root}-crop.png",
        content_type: "image/png"
      )
    end
  rescue LoadError, StandardError => error
    raise Error, error.message
  end

  private

  attr_reader :bounding_box, :source_photo

  def crop_image(file_path)
    if vips_available?
      crop_with_vips(file_path)
    else
      crop_with_mini_magick(file_path)
    end
  end

  def crop_with_vips(file_path)
    require "image_processing/vips"
    require "vips"

    source_image = Vips::Image.new_from_file(file_path, access: :sequential)
    crop_box = pixel_crop_box(source_image.width, source_image.height)
    tempfile = ImageProcessing::Vips
      .source(file_path)
      .crop(crop_box.fetch(:x), crop_box.fetch(:y), crop_box.fetch(:width), crop_box.fetch(:height))
      .convert("png")
      .call

    { tempfile: tempfile }
  end

  def crop_with_mini_magick(file_path)
    require "image_processing/mini_magick"
    require "mini_magick"

    source_image = MiniMagick::Image.open(file_path)
    crop_box = pixel_crop_box(source_image.width, source_image.height)
    tempfile = ImageProcessing::MiniMagick
      .source(file_path)
      .crop("#{crop_box.fetch(:width)}x#{crop_box.fetch(:height)}+#{crop_box.fetch(:x)}+#{crop_box.fetch(:y)}")
      .convert("png")
      .call

    { tempfile: tempfile }
  end

  def pixel_crop_box(image_width, image_height)
    crop_width = [ (image_width * bounding_box.fetch(:width)).round, 1 ].max
    crop_height = [ (image_height * bounding_box.fetch(:height)).round, 1 ].max
    crop_x = (image_width * bounding_box.fetch(:x)).round.clamp(0, [ image_width - 1, 0 ].max)
    crop_y = (image_height * bounding_box.fetch(:y)).round.clamp(0, [ image_height - 1, 0 ].max)

    {
      width: [ crop_width, image_width - crop_x ].min,
      height: [ crop_height, image_height - crop_y ].min,
      x: crop_x,
      y: crop_y
    }
  end

  def vips_available?
    @vips_available ||= begin
      require "vips"
      true
    rescue LoadError, StandardError
      false
    end
  end

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
