class OutfitItem < ApplicationRecord
  belongs_to :outfit
  belongs_to :clothing_item

  validates :clothing_item_id, uniqueness: { scope: :outfit_id }
  validate :clothing_item_must_belong_to_outfit_user

  private

  def clothing_item_must_belong_to_outfit_user
    return unless outfit && clothing_item
    return if outfit.user_id == clothing_item.user_id

    errors.add(:clothing_item_id, "must belong to the same user as the outfit")
  end
end
