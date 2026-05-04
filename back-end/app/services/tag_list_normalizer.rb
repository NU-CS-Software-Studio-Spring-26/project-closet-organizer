class TagListNormalizer
  def self.call(raw_tags)
    new(raw_tags).call
  end

  def initialize(raw_tags)
    @raw_tags = raw_tags
  end

  def call
    extracted_values
      .flat_map { |value| split_values(value) }
      .map { |value| normalize_tag(value) }
      .compact_blank
      .uniq
  end

  private

  attr_reader :raw_tags

  def extracted_values
    case raw_tags
    when ActionController::Parameters
      extracted_values_from_hash(raw_tags.to_unsafe_h)
    when Hash
      extracted_values_from_hash(raw_tags)
    when Array
      raw_tags
    when nil
      []
    else
      [ raw_tags ]
    end
  end

  def extracted_values_from_hash(hash)
    hash.values
  end

  def split_values(value)
    return value if value.is_a?(Array)

    value.to_s.split(/[,\n]/)
  end

  def normalize_tag(value)
    value.to_s.strip.downcase.gsub(/\s+/, " ")
  end
end
