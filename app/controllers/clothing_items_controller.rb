class ClothingItemsController < ApplicationController
  before_action :set_clothing_item, only: %i[show edit update destroy]

  def index
    @clothing_items = ClothingItem.includes(:user).order(:name)
  end

  def show
  end

  def new
    @clothing_item = ClothingItem.new(availability: true)
  end

  def create
    @clothing_item = ClothingItem.new(clothing_item_params)

    if @clothing_item.save
      redirect_to @clothing_item, notice: "Clothing item created successfully."
    else
      render :new, status: :unprocessable_content
    end
  end

  def edit
  end

  def update
    if @clothing_item.update(clothing_item_params)
      redirect_to @clothing_item, notice: "Clothing item updated successfully."
    else
      render :edit, status: :unprocessable_content
    end
  end

  def destroy
    @clothing_item.destroy
    redirect_to clothing_items_path, notice: "Clothing item deleted successfully."
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
