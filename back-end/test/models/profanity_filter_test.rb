require "test_helper"

class ProfanityFilterTest < ActiveSupport::TestCase
  # --- ClothingItem ---

  test "clothing item with clean name is valid" do
    item = ClothingItem.new(
      name: "Blue Denim Jacket",
      size: "medium",
      user: users(:one)
    )
    assert item.valid?
  end

  test "clothing item name with profanity is invalid" do
    item = ClothingItem.new(
      name: "shit jacket",
      size: "medium",
      user: users(:one)
    )
    assert item.invalid?
    assert item.errors[:name].any?
  end

  test "clothing item brand with profanity is invalid" do
    item = ClothingItem.new(
      name: "Nice Jacket",
      brand: "damn brand",
      size: "medium",
      user: users(:one)
    )
    assert item.invalid?
    assert item.errors[:brand].any?
  end

  test "clothing item brand can be blank" do
    item = ClothingItem.new(
      name: "Nice Jacket",
      brand: "",
      size: "medium",
      user: users(:one)
    )
    assert item.valid?
  end

  # --- Outfit ---

  test "outfit with clean name is valid" do
    outfit = Outfit.new(
      name: "Weekend Capsule",
      user: users(:one)
    )
    assert outfit.valid?
  end

  test "outfit name with profanity is invalid" do
    outfit = Outfit.new(
      name: "my shit outfit",
      user: users(:one)
    )
    assert outfit.invalid?
    assert outfit.errors[:name].any?
  end

  test "outfit notes with profanity is invalid" do
    outfit = Outfit.new(
      name: "Weekend Look",
      notes: "this is fucking great",
      user: users(:one)
    )
    assert outfit.invalid?
    assert outfit.errors[:notes].any?
  end

  test "outfit notes can be blank" do
    outfit = Outfit.new(
      name: "Weekend Look",
      notes: "",
      user: users(:one)
    )
    assert outfit.valid?
  end
end
