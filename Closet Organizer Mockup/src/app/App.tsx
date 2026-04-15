import { useState } from "react";
import { motion } from "motion/react";
import { Plus, Grid3x3, LayoutGrid } from "lucide-react";
import { ClothingCard } from "./components/ClothingCard";
import { FilterBar } from "./components/FilterBar";
import { OutfitBuilder } from "./components/OutfitBuilder";

const mockClothingItems = [
  {
    id: 1,
    name: "Silk Blouse",
    size: "M",
    tags: { material: "Silk", season: "Spring", style: "Elegant", brand: "Maison Laurent", color: "Ivory" },
    imageUrl: "https://images.unsplash.com/photo-1655252205378-19e1efa5fa76?w=800&q=80",
    date: "2026-03-15",
    availability: true,
  },
  {
    id: 2,
    name: "Tailored Blazer",
    size: "S",
    tags: { material: "Wool", season: "Fall", style: "Professional", brand: "Studio Noir", color: "Charcoal" },
    imageUrl: "https://images.unsplash.com/photo-1655252205460-4cddd84586bc?w=800&q=80",
    date: "2026-02-20",
    availability: true,
  },
  {
    id: 3,
    name: "Linen Dress",
    size: "M",
    tags: { material: "Linen", season: "Summer", style: "Casual", brand: "Nomad", color: "Sand" },
    imageUrl: "https://images.unsplash.com/photo-1687481795360-77c1115d26c6?w=800&q=80",
    date: "2026-04-01",
    availability: false,
  },
  {
    id: 4,
    name: "Plaid Shirt",
    size: "L",
    tags: { material: "Cotton", season: "Fall", style: "Casual", brand: "Heritage", color: "Gray" },
    imageUrl: "https://images.unsplash.com/photo-1600247354058-a55b0f6fb720?w=800&q=80",
    date: "2026-01-10",
    availability: true,
  },
  {
    id: 5,
    name: "Cashmere Coat",
    size: "M",
    tags: { material: "Cashmere", season: "Winter", style: "Luxury", brand: "Atelier", color: "Camel" },
    imageUrl: "https://images.unsplash.com/photo-1719552979950-f35958f97ebe?w=800&q=80",
    date: "2025-12-05",
    availability: true,
  },
  {
    id: 6,
    name: "Cotton Tee",
    size: "S",
    tags: { material: "Cotton", season: "All", style: "Casual", brand: "Essentials", color: "White" },
    imageUrl: "https://images.unsplash.com/photo-1524282745852-a463fa495a7f?w=800&q=80",
    date: "2026-03-28",
    availability: true,
  },
  {
    id: 7,
    name: "Denim Jacket",
    size: "M",
    tags: { material: "Denim", season: "Spring", style: "Casual", brand: "Vintage Co", color: "Indigo" },
    imageUrl: "https://images.unsplash.com/photo-1629426958003-35a5583b2977?w=800&q=80",
    date: "2026-02-14",
    availability: true,
  },
  {
    id: 8,
    name: "Leather Belt",
    size: "One Size",
    tags: { material: "Leather", season: "All", style: "Accessory", brand: "Craftsmen", color: "Black" },
    imageUrl: "https://images.unsplash.com/photo-1603805785279-da750208c094?w=800&q=80",
    date: "2026-01-20",
    availability: true,
  },
];

const mockOutfits = [
  {
    id: 1,
    name: "Office Elegance",
    date: "April 10, 2026",
    items: [
      { id: 2, name: "Tailored Blazer", imageUrl: "https://images.unsplash.com/photo-1655252205460-4cddd84586bc?w=400&q=80" },
      { id: 1, name: "Silk Blouse", imageUrl: "https://images.unsplash.com/photo-1655252205378-19e1efa5fa76?w=400&q=80" },
      { id: 4, name: "Plaid Shirt", imageUrl: "https://images.unsplash.com/photo-1600247354058-a55b0f6fb720?w=400&q=80" },
      { id: 8, name: "Leather Belt", imageUrl: "https://images.unsplash.com/photo-1603805785279-da750208c094?w=400&q=80" },
    ],
  },
  {
    id: 2,
    name: "Weekend Casual",
    date: "April 13, 2026",
    items: [
      { id: 7, name: "Denim Jacket", imageUrl: "https://images.unsplash.com/photo-1629426958003-35a5583b2977?w=400&q=80" },
      { id: 6, name: "Cotton Tee", imageUrl: "https://images.unsplash.com/photo-1524282745852-a463fa495a7f?w=400&q=80" },
      { id: 3, name: "Linen Dress", imageUrl: "https://images.unsplash.com/photo-1687481795360-77c1115d26c6?w=400&q=80" },
    ],
  },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isOutfitBuilderOpen, setIsOutfitBuilderOpen] = useState(false);

  const filteredItems = mockClothingItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.color?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-2 tracking-tight"
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  lineHeight: '1',
                }}
              >
                Your Closet
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-muted-foreground tracking-wide"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {mockClothingItems.length} items · {mockOutfits.length} saved outfits
              </motion.p>
            </div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              onClick={() => setIsOutfitBuilderOpen(true)}
              className="flex items-center gap-3 px-6 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              <LayoutGrid className="w-5 h-5" />
              <span style={{ fontFamily: 'Outfit, sans-serif' }}>View Outfits</span>
            </motion.button>
          </div>

          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8 flex items-center justify-between"
        >
          <p className="text-muted-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted transition-colors">
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {filteredItems.map((item, index) => (
            <ClothingCard key={item.id} {...item} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 py-12 border-t border-border"
        >
          <button className="w-full max-w-md mx-auto block py-6 border-2 border-dashed border-border hover:border-foreground transition-colors flex items-center justify-center gap-3">
            <Plus className="w-6 h-6" />
            <span className="uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Add New Item
            </span>
          </button>
        </motion.div>
      </main>

      <OutfitBuilder
        outfits={mockOutfits}
        isOpen={isOutfitBuilderOpen}
        onClose={() => setIsOutfitBuilderOpen(false)}
      />
    </div>
  );
}