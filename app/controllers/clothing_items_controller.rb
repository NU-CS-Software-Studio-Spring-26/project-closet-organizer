class ClothingItemsController < ApplicationController
  before_action :set_clothing_item, only: %i[show update destroy]

  def index
    @clothing_items = ClothingItem.includes(:user).order(:name)
    render json: @clothing_items.map { |clothing_item| clothing_item_payload(clothing_item) }
  end

  def show
    render json: clothing_item_payload(@clothing_item)
  end

  def create
    @clothing_item = ClothingItem.new(clothing_item_params)

    if @clothing_item.save
      render json: clothing_item_payload(@clothing_item), status: :created
    else
      render_validation_errors(@clothing_item)
    end
  end

  def update
    if @clothing_item.update(clothing_item_params)
      render json: clothing_item_payload(@clothing_item)
    else
      render_validation_errors(@clothing_item)
    end
  end

  def destroy
    @clothing_item.destroy
    head :no_content
  end

  private

  def set_clothing_item
    @clothing_item = ClothingItem.find(params[:id])
  end

  def clothing_item_params
    base_params = params.require(:clothing_item).permit(:name, :size, :date, :availability, :user_id)
    tag_params = params.require(:clothing_item).permit(:material, :season, :style, :brand, :color).to_h.compact_blank

    base_params.merge(tags: tag_params)
  end
end
