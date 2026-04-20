import { motion } from "motion/react";
import { Plus, X } from "lucide-react";

interface OutfitItem {
  id: number;
  name: string;
  imageUrl: string;
}

interface Outfit {
  id: number;
  name: string;
  items: OutfitItem[];
  date: string;
}

interface OutfitBuilderProps {
  outfits: Outfit[];
  isOpen: boolean;
  onClose: () => void;
}

export function OutfitBuilder({ outfits, isOpen, onClose }: OutfitBuilderProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-muted transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Saved Outfits
        </h2>

        <div className="space-y-8">
          {outfits.map((outfit, index) => (
            <motion.div
              key={outfit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-b border-border pb-8 last:border-0"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {outfit.name}
                  </h3>
                  <p className="text-muted-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {outfit.date}
                  </p>
                </div>
                <button className="px-4 py-2 border border-foreground hover:bg-foreground hover:text-background transition-colors">
                  <span style={{ fontFamily: 'Outfit, sans-serif' }}>Wear Today</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {outfit.items.map((item) => (
                  <div key={item.id} className="aspect-[3/4] bg-muted overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          <button className="w-full py-8 border-2 border-dashed border-border hover:border-foreground transition-colors flex flex-col items-center justify-center gap-3">
            <Plus className="w-8 h-8" />
            <span className="uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Create New Outfit
            </span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
