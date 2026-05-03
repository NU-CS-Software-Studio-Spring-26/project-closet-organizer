require "test_helper"

class ClothingItemsFlowTest < ActionDispatch::IntegrationTest
  setup do
    @clothing_item = clothing_items(:one)
    @user = users(:one)
  end

  test "clothing items index loads" do
    get clothing_items_url, headers: auth_headers(@user), as: :json

    assert_response :success
    assert_includes response_json.map { |item| item["name"] }, @clothing_item.name
  end

  test "clothing item show loads" do
    get clothing_item_url(@clothing_item), headers: auth_headers(@user), as: :json

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
          material: "wool",
          season: "winter",
          style: "tailored",
          brand: "Studio North",
          color: "camel"
        }
      }, headers: auth_headers(@user), as: :json
    end

    assert_response :created
    assert_equal "Camel Coat", response_json["name"]
    assert_equal "large", response_json["size"]
  end

  test "can create a clothing item with a photo" do
    assert_difference("ClothingItem.count", 1) do
      post clothing_items_url, params: {
        clothing_item: {
          name: "Photo Tee",
          user_id: @user.id,
          size: "medium",
          color: "white",
          photo: item_photo_upload
        }
      }, headers: auth_headers(@user)
    end

    assert_response :created
    assert_predicate ClothingItem.order(:created_at).last.photo, :attached?
    assert_match %r{/rails/active_storage/}, response_json["image_url"]
  end

  test "can update a clothing item" do
    patch clothing_item_url(@clothing_item), params: {
      clothing_item: {
        name: "Ivory Silk Blouse",
        user_id: @user.id,
        size: "small",
        date: "2026-04-18",
        material: "silk",
        season: "spring",
        style: "dressy",
        brand: "Maison",
        color: "ivory"
      }
    }, headers: auth_headers(@user), as: :json

    assert_response :success

    @clothing_item.reload
    assert_equal "Ivory Silk Blouse", @clothing_item.name
    assert_equal "small", @clothing_item.size
    assert_equal "dressy", @clothing_item.tags["style"]
    assert_equal "dressy", response_json["tags"]["style"]
  end

  test "can remove a clothing item photo" do
    @clothing_item.photo.attach(item_photo_upload)

    patch clothing_item_url(@clothing_item), params: {
      clothing_item: {
        name: @clothing_item.name,
        user_id: @user.id,
        size: @clothing_item.size,
        date: @clothing_item.date&.to_date&.iso8601,
        material: @clothing_item.tags["material"],
        season: @clothing_item.tags["season"],
        style: @clothing_item.tags["style"],
        brand: @clothing_item.tags["brand"],
        color: @clothing_item.tags["color"],
        remove_photo: "true"
      }
    }, headers: auth_headers(@user)

    assert_response :success

    @clothing_item.reload
    assert_not @clothing_item.photo.attached?
    assert_nil response_json["image_url"]
  end

  test "can delete a clothing item" do
    assert_difference("ClothingItem.count", -1) do
      delete clothing_item_url(@clothing_item), headers: auth_headers(@user), as: :json
    end

    assert_response :no_content
  end

  private

  def item_photo_upload
    Rack::Test::UploadedFile.new(file_fixture("item-photo.svg"), "image/svg+xml")
  end
end
