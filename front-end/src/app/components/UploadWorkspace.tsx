import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ItemHeroPreview } from "./ItemHeroPreview";

interface UploadWorkspaceProps {
  children: ReactNode;
  imageUrl?: string | null;
  previewLabel: string;
  previewPrimaryDetail: string;
  previewSecondaryDetail?: string | null;
  previewTitle: string;
}

export function UploadWorkspace({
  children,
  imageUrl,
  previewLabel,
  previewPrimaryDetail,
  previewSecondaryDetail,
  previewTitle,
}: UploadWorkspaceProps) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-start">
      <ItemHeroPreview
        imageUrl={imageUrl}
        label={previewLabel}
        primaryDetail={previewPrimaryDetail}
        secondaryDetail={previewSecondaryDetail}
        title={previewTitle}
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.06 }}
        className="space-y-5"
      >
        {children}
      </motion.div>
    </div>
  );
}
