require "date"

srand(20260425)

ClothingItem.destroy_all
User.destroy_all

WARDROBE_LIBRARY = {
  smart_casual: [
    [ "Oxford Shirt", [ "j.crew", "cotton", "blue", "office", "layering" ] ],
    [ "Merino Crewneck Sweater", [ "uniqlo", "merino wool", "charcoal", "cozy", "polished" ] ],
    [ "Straight-Leg Jeans", [ "madewell", "denim", "indigo", "everyday", "classic" ] ],
    [ "Tailored Chinos", [ "banana republic", "twill", "khaki", "workwear", "tailored" ] ],
    [ "Leather Loafers", [ "sam edelman", "leather", "black", "dressy", "classic" ] ],
    [ "Single-Breasted Blazer", [ "theory", "wool blend", "navy", "office", "sharp" ] ]
  ],
  athleisure: [
    [ "Training Joggers", [ "lululemon", "recycled polyester", "black", "active", "weekend" ] ],
    [ "Performance Tee", [ "nike", "moisture wicking", "heather gray", "gym", "breathable" ] ],
    [ "Running Hoodie", [ "under armour", "performance fleece", "gray", "cozy", "active" ] ],
    [ "Quarter-Zip Pullover", [ "vuori", "polyester", "navy", "layering", "commute" ] ],
    [ "Hybrid Shorts", [ "ten thousand", "nylon", "stone", "summer", "training" ] ],
    [ "Trail Shell Jacket", [ "patagonia", "ripstop", "olive", "outdoors", "weatherproof" ] ]
  ],
  minimal: [
    [ "Rib Tank", [ "uniqlo", "cotton", "black", "minimal", "basics" ] ],
    [ "Relaxed Trousers", [ "cos", "twill", "taupe", "workwear", "clean lines" ] ],
    [ "Linen Button-Down", [ "everlane", "linen", "white", "airy", "capsule" ] ],
    [ "Slip Skirt", [ "aritzia", "satin", "cream", "soft", "date night" ] ],
    [ "Wool Coat", [ "mango", "wool", "camel", "outerwear", "elevated" ] ],
    [ "Ankle Boots", [ "steve madden", "suede", "brown", "fall", "classic" ] ]
  ],
  vintage: [
    [ "Band Tee", [ "levis", "cotton", "washed black", "graphic", "casual" ] ],
    [ "High-Rise Mom Jeans", [ "levis", "denim", "light blue", "retro", "weekend" ] ],
    [ "Corduroy Jacket", [ "free people", "corduroy", "rust", "textured", "layering" ] ],
    [ "Pleated Midi Dress", [ "reformation", "viscose", "sage", "dressy", "romantic" ] ],
    [ "Western Boots", [ "frye", "leather", "cognac", "statement", "boots" ] ],
    [ "Wool Beret", [ "anthropologie", "wool", "burgundy", "accessory", "playful" ] ]
  ],
  polished: [
    [ "Silk Blouse", [ "sezane", "silk", "ivory", "polished", "workwear" ] ],
    [ "Pleated Trousers", [ "aritzia", "crepe", "black", "tailored", "office" ] ],
    [ "Cashmere Cardigan", [ "naadam", "cashmere", "oatmeal", "soft", "luxury" ] ],
    [ "Pencil Skirt", [ "theory", "wool blend", "charcoal", "office", "classic" ] ],
    [ "Block Heel Pumps", [ "cole haan", "leather", "black", "dressy", "heels" ] ],
    [ "Trench Coat", [ "everlane", "cotton blend", "sand", "outerwear", "timeless" ] ]
  ]
}.freeze

ADJECTIVES = %w[
  Classic Relaxed Textured Everyday Soft Structured Lightweight Refined Heritage
  Clean Tailored Cozy Cropped Oversized Slim Breathable Studio Weekend
].freeze

SIZE_PROFILES = {
  slim: %i[xs small medium medium medium],
  standard: %i[small medium medium large],
  relaxed: %i[medium large large xl]
}.freeze

seed_users = [
  {
    username: "annabel_goldman",
    email: "annabelgoldman2025@u.northwestern.edu",
    provider: "google_oauth2",
    uid: "seed-annabel-goldman",
    password: "password",
    admin: true,
    preferred_style: "polished",
    item_count: 20
  }
]

def random_purchase_date
  Date.today - rand(20..540)
end

def build_item_name(base_name)
  "#{ADJECTIVES.sample} #{base_name}"
end

created_items_count = 0

seed_users.each do |user_data|
  user = User.create!(
    username: user_data[:username],
    email: user_data[:email],
    provider: user_data[:provider],
    uid: user_data[:uid],
    password: user_data[:password],
    admin: user_data.fetch(:admin, false),
    preferred_style: user_data[:preferred_style]
  )

  if user_data[:items].present?
    user_data[:items].each do |item_data|
      ClothingItem.create!(
        name: item_data[:name],
        size: item_data[:size],
        date: item_data[:date],
        user: user,
        tags: item_data[:tags]
      )
      created_items_count += 1
    end
    next
  end

  style_pool = WARDROBE_LIBRARY.fetch(user.preferred_style.to_sym)
  size_pool = SIZE_PROFILES.fetch(user_data.fetch(:size_profile, :standard))

  user_data.fetch(:item_count, 0).times do
    base_name, base_tags = style_pool.sample

    ClothingItem.create!(
      name: build_item_name(base_name),
      size: size_pool.sample,
      date: random_purchase_date,
      user: user,
      tags: base_tags + [ user.preferred_style.to_s.tr("_", " ") ]
    )
    created_items_count += 1
  end
end

puts "Seeded #{User.count} users and #{created_items_count} clothing items"
