require "test_helper"

class ClothingItemsFlowTest < ActionDispatch::IntegrationTest
  setup do
    @clothing_item = clothing_items(:one)
    @user = users(:one)
  end

  test "clothing items index loads" do
    get clothing_items_url, as: :json

    assert_response :success
    assert_includes response_json.map { |item| item["name"] }, @clothing_item.name
  end

  test "clothing item show loads" do
    get clothing_item_url(@clothing_item), as: :json

    assert_response :success
    assert_equal @clothing_item.name, response_json["name"]
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
      }, as: :json
    end

    assert_response :created
    assert_equal "Camel Coat", response_json["name"]
    assert_equal "large", response_json["size"]
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
    }, as: :json

    assert_response :success

    @clothing_item.reload
    assert_equal "Ivory Silk Blouse", @clothing_item.name
    assert_equal "small", @clothing_item.size
    assert_not @clothing_item.availability?
    assert_equal "dressy", @clothing_item.tags["style"]
    assert_equal "dressy", response_json["tags"]["style"]
  end

  test "can delete a clothing item" do
    assert_difference("ClothingItem.count", -1) do
      delete clothing_item_url(@clothing_item), as: :json
    end

    assert_response :no_content
  end
end
