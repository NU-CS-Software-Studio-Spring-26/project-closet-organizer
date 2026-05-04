require "test_helper"

class OutfitTest < ActiveSupport::TestCase
  test "fixture outfit is valid" do
    assert outfits(:one).valid?
  end

  test "name is required" do
    outfit = Outfit.new(user: users(:one), tags: [ "casual" ])

    assert_not outfit.valid?
    assert_includes outfit.errors[:name], "can't be blank"
  end

  test "tags must be an array when present" do
    outfit = Outfit.new(user: users(:one), name: "Weekend", tags: { style: "casual" })

    assert_not outfit.valid?
    assert_includes outfit.errors[:tags], "must be an array"
  end
end
