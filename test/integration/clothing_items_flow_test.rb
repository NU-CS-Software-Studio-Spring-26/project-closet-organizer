require "test_helper"

class ClothingItemsFlowTest < ActionDispatch::IntegrationTest
  setup do
    @clothing_item = clothing_items(:one)
    @user = users(:one)
  end

  test "clothing items index loads" do
    get clothing_items_url

    assert_response :success
    assert_includes response.body, @clothing_item.name
  end

  test "clothing item show loads" do
    get clothing_item_url(@clothing_item)

    assert_response :success
    assert_includes response.body, @clothing_item.name
  end

  test "can create a clothing item" do
    assert_difference("ClothingItem.count", 1) do
      post clothing_items_url, params: {
        clothing_item: {
          name: "Camel Coat",
          user_id: @user.id,
          size: "large",
          date: "2026-04-20",
          availability: "1",
          material: "wool",
          season: "winter",
          style: "tailored",
          brand: "Studio North",
          color: "camel"
        }
      }
    end

    assert_redirected_to clothing_item_url(ClothingItem.order(:created_at).last)
  end

  test "can update a clothing item" do
    patch clothing_item_url(@clothing_item), params: {
      clothing_item: {
        name: "Ivory Silk Blouse",
        user_id: @user.id,
        size: "small",
        date: "2026-04-18",
        availability: "0",
        material: "silk",
        season: "spring",
        style: "dressy",
        brand: "Maison",
        color: "ivory"
      }
    }

    assert_redirected_to clothing_item_url(@clothing_item)

    @clothing_item.reload
    assert_equal "Ivory Silk Blouse", @clothing_item.name
    assert_equal "small", @clothing_item.size
    assert_not @clothing_item.availability?
    assert_equal "dressy", @clothing_item.tags["style"]
  end

  test "can delete a clothing item" do
    assert_difference("ClothingItem.count", -1) do
      delete clothing_item_url(@clothing_item)
    end

    assert_redirected_to clothing_items_url
  end
end
