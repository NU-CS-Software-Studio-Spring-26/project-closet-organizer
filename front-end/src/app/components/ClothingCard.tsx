import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  formatDisplaySize,
} from "../lib/closet";

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
  image_url?: string | null;
  index: number;
  onSelect?: (id: number) => void;
}

export function ClothingCard({
  id,
  name,
  size,
  tags,
  image_url,
  index,
  onSelect,
}: ClothingCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const itemMetadata = [tags.material, tags.season, tags.style].filter(Boolean).join(" · ");
  const handleSelect = () => onSelect?.(id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="relative overflow-hidden bg-muted aspect-[3/4]">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out"
            style={{
              transform: isHovered ? "scale(1.08)" : "scale(1)",
            }}
          />
        ) : (
          <div
            className="h-full w-full p-6 flex flex-col justify-end bg-gradient-to-br from-stone-100 via-neutral-50 to-stone-200 text-stone-700 transition-transform duration-700 ease-out"
            style={{
              transform: isHovered ? "scale(1.03)" : "scale(1)",
            }}
          >
            <div className="space-y-2">
              {tags.color && (
                <p
                  className="uppercase tracking-[0.25em] text-xs"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {tags.color}
                </p>
              )}
              {itemMetadata && (
                <p
                  className="text-sm opacity-70"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {itemMetadata}
                </p>
              )}
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: image_url ? 0.72 : 0.12 }}
          animate={{ opacity: isHovered ? 1 : image_url ? 0.72 : 0.12 }}
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
        />

        <div className="absolute inset-x-0 top-0 p-5">
          <p
            className="uppercase tracking-[0.3em] text-[11px] mb-3"
            style={{
              color: image_url ? "rgba(255,255,255,0.75)" : "rgba(68,64,60,0.72)",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            Clothing Item
          </p>
          <h3
            className="max-w-[11ch] break-words"
            style={{
              color: image_url ? "white" : "rgba(68, 64, 60, 0.92)",
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: "0.95",
            }}
          >
            {name}
          </h3>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          className="absolute bottom-4 left-4 right-4"
        >
          <button
            onClick={(event) => {
              event.stopPropagation();
            }}
            className="w-full bg-white/90 backdrop-blur-sm px-4 py-2 hover:bg-white transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span style={{ fontFamily: 'Outfit, sans-serif' }}>Add to Outfit</span>
          </button>
        </motion.div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
          <span className="uppercase tracking-wider">{formatDisplaySize(size)}</span>
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
