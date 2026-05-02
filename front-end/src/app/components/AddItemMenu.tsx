import { Camera, ChevronDown, PencilLine, Plus } from "lucide-react";
import { CreateItemMode } from "../lib/closet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface AddItemMenuProps {
  disabled?: boolean;
  onSelectMode: (mode: CreateItemMode) => void;
}

export function AddItemMenu({ disabled = false, onSelectMode }: AddItemMenuProps) {
  return (
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
        <DropdownMenuItem onSelect={() => onSelectMode("image")}>
          <Camera className="w-4 h-4" />
          <div className="flex flex-col">
            <span>Upload image</span>
            <span className="text-xs text-muted-foreground">Parse details from a photo first.</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onSelectMode("manual")}>
          <PencilLine className="w-4 h-4" />
          <div className="flex flex-col">
            <span>Upload manually</span>
            <span className="text-xs text-muted-foreground">Enter the item details yourself.</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
