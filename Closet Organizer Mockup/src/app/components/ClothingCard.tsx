import { motion } from "motion/react";
import { Heart, Plus } from "lucide-react";
import { useState } from "react";

interface ClothingCardProps {
  id: number;
  name: string;
  size: string;
  tags: {
    material?: string;
    season?: string;
    style?: string;
    brand?: string;
    color?: string;
  };
  imageUrl: string;
  availability: boolean;
  index: number;
}

export function ClothingCard({ id, name, size, tags, imageUrl, availability, index }: ClothingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden bg-muted aspect-[3/4]">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
          style={{
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          }}
        />

        {!availability && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white tracking-[0.3em] uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>
              In Use
            </span>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          className="absolute bottom-4 left-4 right-4 flex gap-2"
        >
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="bg-white/90 backdrop-blur-sm p-2 hover:bg-white transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-black'}`}
            />
          </button>
          <button className="flex-1 bg-white/90 backdrop-blur-sm px-4 py-2 hover:bg-white transition-colors flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            <span style={{ fontFamily: 'Outfit, sans-serif' }}>Add to Outfit</span>
          </button>
        </motion.div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="tracking-wide" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          {name}
        </h3>
        <div className="flex items-center gap-2 text-muted-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
          <span className="uppercase tracking-wider">{size}</span>
          {tags.color && (
            <>
              <span>·</span>
              <span className="capitalize">{tags.color}</span>
            </>
          )}
        </div>
        {tags.brand && (
          <p className="italic opacity-60" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {tags.brand}
          </p>
        )}
      </div>
    </motion.div>
  );
}
