require "test_helper"

class ClothingItemTest < ActiveSupport::TestCase
  test "fixture clothing item is valid" do
    assert clothing_items(:one).valid?
  end

  test "name is required" do
    item = ClothingItem.new(user: users(:one), size: :small)

    assert_not item.valid?
    assert_includes item.errors[:name], "can't be blank"
  end

  test "belongs to a user" do
    assert_equal users(:one), clothing_items(:one).user
  end
end
