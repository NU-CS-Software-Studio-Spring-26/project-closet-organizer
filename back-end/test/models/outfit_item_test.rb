require "test_helper"

class OutfitItemTest < ActiveSupport::TestCase
  test "fixture outfit item is valid" do
    assert outfit_items(:one).valid?
  end

  test "clothing item is unique per outfit" do
    duplicate = OutfitItem.new(outfit: outfits(:one), clothing_item: clothing_items(:one))

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:clothing_item_id], "has already been taken"
  end

  test "clothing item must belong to the same user as outfit" do
    invalid = OutfitItem.new(outfit: outfits(:one), clothing_item: clothing_items(:two))

    assert_not invalid.valid?
    assert_includes invalid.errors[:clothing_item_id], "must belong to the same user as the outfit"
  end
end
