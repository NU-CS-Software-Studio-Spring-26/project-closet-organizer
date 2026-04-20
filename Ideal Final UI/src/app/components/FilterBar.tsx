import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
}

export function FilterBar({ searchQuery, setSearchQuery, selectedFilter, setSelectedFilter }: FilterBarProps) {
  const filters = ['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories'];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="relative">
        <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search your closet..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-b border-border pl-8 pr-4 py-3 focus:outline-none focus:border-foreground transition-colors"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        />
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        <div className="flex items-center gap-2 text-muted-foreground shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Filter
          </span>
        </div>
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 border transition-all shrink-0 ${
              selectedFilter === filter
                ? 'bg-foreground text-background border-foreground'
                : 'bg-transparent text-foreground border-border hover:border-foreground'
            }`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {filter}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
