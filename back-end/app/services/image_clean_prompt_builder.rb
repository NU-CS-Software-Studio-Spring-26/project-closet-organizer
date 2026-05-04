class ImageCleanPromptBuilder
  def self.for_detection(outfit_detection)
    new.build_for_detection(outfit_detection)
  end

  def self.for_clothing_item(clothing_item)
    new.build_for_clothing_item(clothing_item)
  end

  def build_for_detection(outfit_detection)
    details = outfit_detection.details || {}
    name = outfit_detection.suggested_name.presence || outfit_detection.category.to_s.titleize
    category = outfit_detection.category.presence
    color = details["dominant_color"].presence
    material = details["material_guess"].presence
    style = details["style_guess"].presence
    notes = details["notes"].presence
    appearance_summary = details["appearance_summary"].presence || detection_appearance_summary(
      name: name,
      category: category,
      color: color,
      material: material,
      style: style,
      notes: notes
    )

    {
      name: name,
      category: category,
      color: color,
      material: material,
      style: style,
      notes: notes,
      appearance_summary: appearance_summary,
      hard_constraints: build_detection_hard_constraints(
        category: category,
        color: color,
        appearance_summary: appearance_summary,
        notes: notes
      ),
      soft_hints: build_soft_hints(material: material, style: style)
    }.compact_blank
  end

  def build_for_clothing_item(clothing_item)
    color = clothing_item.tags["color"].presence
    material = clothing_item.tags["material"].presence
    style = clothing_item.tags["style"].presence
    name = clothing_item.name.presence
    appearance_summary = clothing_item_appearance_summary(
      name: name,
      color: color,
      material: material,
      style: style
    )

    {
      name: name,
      color: color,
      material: material,
      style: style,
      appearance_summary: appearance_summary,
      hard_constraints: build_item_hard_constraints(
        color: color,
        name: name
      ),
      soft_hints: build_soft_hints(material: material, style: style)
    }.compact_blank
  end

  private

  def detection_appearance_summary(name:, category:, color:, material:, style:, notes:)
    summary = []
    summary << "Reference item: #{name}." if name.present?

    descriptor_parts = [ color, material, category ].compact_blank
    if descriptor_parts.present?
      sentence = +"The item appears to be a #{descriptor_parts.join(' ')}."
      if style.present?
        sentence = sentence.delete_suffix(".") + " with a #{style} style."
      end
      summary << sentence
    elsif style.present?
      summary << "The item has a #{style} style."
    end

    summary << notes if notes.present?
    summary.compact_blank.join(" ").presence
  end

  def clothing_item_appearance_summary(name:, color:, material:, style:)
    summary = []
    summary << "Reference item: #{name}." if name.present?

    descriptor_parts = [ color, material ].compact_blank
    if descriptor_parts.present?
      sentence = +"The item appears to be #{descriptor_parts.join(' ')}."
      sentence = sentence.delete_suffix(".") + " It should keep a #{style} style." if style.present?
      summary << sentence
    elsif style.present?
      summary << "The item should keep a #{style} style."
    end

    summary.compact_blank.join(" ").presence
  end

  def build_detection_hard_constraints(category:, color:, appearance_summary:, notes:)
    constraints = []
    constraints << "Keep the item in the #{category} category." if category.present?
    constraints << "Preserve the dominant color as #{color}." if color.present?
    constraints << "Preserve the distinctive details described here: #{appearance_summary}" if appearance_summary.present?
    if notes.present? && notes != appearance_summary
      constraints << "Preserve the distinctive details described here: #{notes}"
    end
    constraints
  end

  def build_item_hard_constraints(color:, name:)
    constraints = []
    constraints << "Preserve the same item identity as #{name}." if name.present?
    constraints << "Preserve the dominant color as #{color}." if color.present?
    constraints
  end

  def build_soft_hints(material:, style:)
    hints = []
    hints << "Material cues should stay consistent with #{material}." if material.present?
    hints << "The styling should still read as #{style}." if style.present?
    hints
  end
end
