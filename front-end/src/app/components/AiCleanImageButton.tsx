import { Sparkles } from "lucide-react";

interface AiCleanImageButtonProps {
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
  onClick: () => void;
}

export function AiCleanImageButton({
  className = "",
  disabled = false,
  isLoading = false,
  label = "AI clean PNG",
  onClick,
}: AiCleanImageButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 border border-border hover:border-foreground transition-colors disabled:opacity-50 ${className}`.trim()}
    >
      <Sparkles className="w-4 h-4" />
      {isLoading ? "Cleaning..." : label}
    </button>
  );
}
