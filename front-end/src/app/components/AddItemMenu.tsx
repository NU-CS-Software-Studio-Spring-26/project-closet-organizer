import { useRef } from "react";
import { Camera, ChevronDown, PencilLine, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface AddItemMenuProps {
  disabled?: boolean;
  onSelectImage: (file: File) => void;
  onSelectManual: () => void;
}

export function AddItemMenu({
  disabled = false,
  onSelectImage,
  onSelectManual,
}: AddItemMenuProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";

          if (file) {
            onSelectImage(file);
          }
        }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="flex items-center justify-center gap-3 px-5 py-3 border border-border hover:border-foreground transition-colors disabled:opacity-50"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            <Plus className="w-4 h-4" />
            Add Item
            <ChevronDown className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onSelect={() => {
              window.setTimeout(() => inputRef.current?.click(), 0);
            }}
          >
            <Camera className="w-4 h-4" />
            <div className="flex flex-col">
              <span>Upload image</span>
              <span className="text-xs text-muted-foreground">Choose a photo before reviewing detected items.</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onSelectManual}>
            <PencilLine className="w-4 h-4" />
            <div className="flex flex-col">
              <span>Upload manually</span>
              <span className="text-xs text-muted-foreground">Enter the item details yourself.</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
