module ImageAttachmentPolicy
  MAX_BYTES = 10.megabytes
  MAX_HUMAN_SIZE = "10 MB".freeze
  ALLOWED_CONTENT_TYPES = %w[
    image/jpeg
    image/jpg
    image/png
    image/webp
    image/gif
    image/heic
    image/heif
  ].freeze
  ALLOWED_HUMAN_LIST = "JPEG, PNG, WebP, GIF, or HEIC".freeze

  module_function

  def allowed_content_type?(content_type)
    return false if content_type.blank?

    ALLOWED_CONTENT_TYPES.include?(content_type.to_s.downcase)
  end

  def within_size_limit?(byte_size)
    byte_size.to_i.positive? && byte_size.to_i <= MAX_BYTES
  end

  def content_type_error
    "must be a #{ALLOWED_HUMAN_LIST} image"
  end

  def size_error
    "must be #{MAX_HUMAN_SIZE} or smaller"
  end

  def validate_attached(record, attribute, attachment)
    return unless attachment.attached?

    content_type = attachment.blob&.content_type
    unless allowed_content_type?(content_type)
      record.errors.add(attribute, content_type_error)
      return
    end

    byte_size = attachment.blob&.byte_size
    unless within_size_limit?(byte_size)
      record.errors.add(attribute, size_error)
    end
  end

  def validate_uploaded_file(uploaded_file)
    return [ :missing, "Select an image before continuing." ] if uploaded_file.blank?

    content_type =
      if uploaded_file.respond_to?(:content_type)
        uploaded_file.content_type
      end
    unless allowed_content_type?(content_type)
      return [ :invalid_type, "Image #{content_type_error}." ]
    end

    byte_size =
      if uploaded_file.respond_to?(:size)
        uploaded_file.size
      elsif uploaded_file.respond_to?(:byte_size)
        uploaded_file.byte_size
      end
    unless within_size_limit?(byte_size)
      return [ :too_large, "Image #{size_error}." ]
    end

    nil
  end
end
