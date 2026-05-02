require "test_helper"

class OutfitDetectionTest < ActiveSupport::TestCase
  setup do
    @upload = OutfitUpload.new(user: users(:one), status: :succeeded)
    @upload.source_photo.attach(
      Rack::Test::UploadedFile.new(file_fixture("item-photo.png"), "image/png")
    )
    @upload.save!
  end

  test "prefers the final box when available" do
    detection = @upload.outfit_detections.create!(
      category: "shirt",
      position: 0,
      coarse_bbox_x: 0.1,
      coarse_bbox_y: 0.1,
      coarse_bbox_width: 0.5,
      coarse_bbox_height: 0.5,
      refined_bbox_x: 0.15,
      refined_bbox_y: 0.15,
      refined_bbox_width: 0.4,
      refined_bbox_height: 0.4,
      final_bbox_x: 0.2,
      final_bbox_y: 0.2,
      final_bbox_width: 0.3,
      final_bbox_height: 0.3,
      crop_status: :verified,
      crop_attempts: 2
    )

    assert_equal 0.2, detection.preferred_preview_box[:x]
    assert detection.crop_ready?
  end

  test "requires normalized staged boxes" do
    detection = @upload.outfit_detections.new(
      category: "shirt",
      position: 0,
      coarse_bbox_x: 0.8,
      coarse_bbox_y: 0.2,
      coarse_bbox_width: 0.5,
      coarse_bbox_height: 0.4
    )

    assert_not detection.valid?
    assert_includes detection.errors.full_messages.join(", "), "coarse bounding box"
  end
end
