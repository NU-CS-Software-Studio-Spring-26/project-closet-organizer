require "test_helper"

class ImageCleanPromptBuilderTest < ActiveSupport::TestCase
  setup do
    @upload = OutfitUpload.new(user: users(:one), status: :succeeded)
    @upload.source_photo.attach(
      Rack::Test::UploadedFile.new(file_fixture("item-photo.png"), "image/png")
    )
    @upload.save!
  end

  test "builds rich prompt context for detections" do
    detection = @upload.outfit_detections.create!(
      category: "sweatshirt",
      suggested_name: "Green Graphic Sweatshirt",
      details: {
        dominant_color: "green",
        material_guess: "cotton",
        style_guess: "casual",
        appearance_summary: "Green cotton sweatshirt with a relaxed silhouette and a fish graphic on the front.",
        notes: "Long sleeves with ribbed cuffs."
      },
      position: 0
    )

    context = ImageCleanPromptBuilder.for_detection(detection)

    assert_equal "Green Graphic Sweatshirt", context[:name]
    assert_equal "sweatshirt", context[:category]
    assert_equal "green", context[:color]
    assert_equal "cotton", context[:material]
    assert_equal "casual", context[:style]
    assert_equal "Long sleeves with ribbed cuffs.", context[:notes]
    assert_includes context[:appearance_summary], "fish graphic"
    assert_includes context[:hard_constraints].join(" "), "dominant color"
    assert_includes context[:soft_hints].join(" "), "casual"
  end

  test "builds fallback appearance summary when detection summary is missing" do
    detection = @upload.outfit_detections.create!(
      category: "shirt",
      suggested_name: "White Shirt",
      details: {
        dominant_color: "white",
        material_guess: "linen",
        style_guess: "classic",
        notes: "Visible collar and long sleeves."
      },
      position: 0
    )

    context = ImageCleanPromptBuilder.for_detection(detection)

    assert_includes context[:appearance_summary], "white linen shirt"
    assert_includes context[:appearance_summary], "Visible collar"
  end

  test "builds prompt context for clothing items" do
    item = ClothingItem.new(
      name: "Ivory Silk Blouse",
      user: users(:one),
      size: :small,
      tags: {
        "color" => "ivory",
        "material" => "silk",
        "style" => "dressy"
      }
    )

    context = ImageCleanPromptBuilder.for_clothing_item(item)

    assert_equal "Ivory Silk Blouse", context[:name]
    assert_equal "ivory", context[:color]
    assert_equal "silk", context[:material]
    assert_equal "dressy", context[:style]
    assert_includes context[:appearance_summary], "Reference item: Ivory Silk Blouse."
    assert_includes context[:hard_constraints].join(" "), "Preserve the same item identity"
  end
end
