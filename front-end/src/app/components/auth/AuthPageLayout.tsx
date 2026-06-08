import { ReactNode } from "react";
import { motion } from "motion/react";
import { HomeFooterLinks } from "../info/HomeFooterLinks";
import { PrimitiveText } from "../primitives/PrimitiveText";

interface AuthPageLayoutProps {
  children: ReactNode;
  description?: string;
  title: string;
}

export function AuthPageLayout({ children, description, title }: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-foreground focus:bg-background focus:px-4 focus:py-2"
      >
        Skip to main content
      </a>

      <main id="main-content" className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <img
              src="/brand-mark.png"
              alt=""
              aria-hidden
              className="mx-auto mb-6 h-16 w-auto object-contain"
            />
            <PrimitiveText as="h1" variant="title" font="serif" className="mb-2">
              {title}
            </PrimitiveText>
            {description ? (
              <PrimitiveText as="p" tone="muted">
                {description}
              </PrimitiveText>
            ) : null}
          </div>

          {children}
        </motion.div>
      </main>

      <footer className="border-t border-border px-6 py-8">
        <HomeFooterLinks className="justify-center" />
      </footer>
    </div>
  );
}
