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
    username: "alexis_ward",
    email: "alexis.ward@example.com",
    provider: "google_oauth2",
    uid: "seed-alexis-ward",
    password: "password",
    preferred_style: "smart_casual",
    size_profile: :standard,
    item_count: 20
  },
  {
    username: "annabel_goldman",
    email: "annabel.goldman@example.com",
    provider: "google_oauth2",
    uid: "seed-annabel-goldman",
    password: "password",
    admin: true,
    preferred_style: "polished",
    item_count: 0
  },
  {
    username: "jordan_lee",
    email: "jordan.lee@example.com",
    provider: "google_oauth2",
    uid: "seed-jordan-lee",
    password: "password",
    preferred_style: "athleisure",
    items: [
      { name: "Heather Gray Running Hoodie", size: :large, date: Date.new(2026, 2, 2), tags: [ "nike", "performance fleece", "gray", "active", "hoodie" ] },
      { name: "Black Training Joggers", size: :large, date: Date.new(2026, 1, 24), tags: [ "lululemon", "recycled polyester", "black", "active", "joggers" ] },
      { name: "Forest Performance Tee", size: :medium, date: Date.new(2026, 3, 22), tags: [ "under armour", "moisture wicking", "green", "gym", "tee" ] },
      { name: "Navy Quarter-Zip Pullover", size: :large, date: Date.new(2025, 11, 3), tags: [ "vuori", "polyester", "navy", "layering", "athleisure" ] },
      { name: "Stone Utility Shorts", size: :medium, date: Date.new(2025, 8, 19), tags: [ "ten thousand", "nylon", "stone", "summer", "training" ] },
      { name: "Trail Running Vest", size: :medium, date: Date.new(2025, 10, 7), tags: [ "patagonia", "ripstop", "black", "outdoors", "running" ] },
      { name: "White Court Sneakers", size: :large, date: Date.new(2025, 7, 14), tags: [ "adidas", "leather", "white", "sport", "sneakers" ] },
      { name: "Slate Rain Shell Jacket", size: :large, date: Date.new(2026, 4, 12), tags: [ "arcteryx", "nylon", "slate", "outerwear", "rainy day" ] }
    ]
  },
  {
    username: "maya_patel",
    email: "maya.patel@example.com",
    provider: "google_oauth2",
    uid: "seed-maya-patel",
    password: "password",
    preferred_style: "minimal",
    items: [
      { name: "Oat Linen Blazer", size: :small, date: Date.new(2026, 3, 18), tags: [ "mango", "linen", "oat", "blazer", "capsule" ] },
      { name: "Black Rib Tank", size: :xs, date: Date.new(2026, 4, 4), tags: [ "uniqlo", "cotton", "black", "minimal", "tank" ] },
      { name: "Cream Slip Skirt", size: :small, date: Date.new(2025, 6, 9), tags: [ "zara", "satin", "cream", "dressy", "soft" ] },
      { name: "Charcoal Merino Sweater", size: :small, date: Date.new(2025, 12, 11), tags: [ "cos", "merino wool", "charcoal", "cozy", "sweater" ] },
      { name: "Brown Ankle Boots", size: :small, date: Date.new(2025, 10, 1), tags: [ "steve madden", "suede", "brown", "boots", "classic" ] },
      { name: "Light Wash Denim Jacket", size: :medium, date: Date.new(2025, 9, 21), tags: [ "levis", "denim", "light blue", "layering", "weekend" ] },
      { name: "Soft White T-Shirt", size: :small, date: Date.new(2026, 2, 27), tags: [ "everlane", "cotton", "white", "basics", "everyday" ] },
      { name: "Sand Pleated Trousers", size: :small, date: Date.new(2025, 11, 29), tags: [ "aritzia", "twill", "sand", "tailored", "office" ] }
    ]
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
