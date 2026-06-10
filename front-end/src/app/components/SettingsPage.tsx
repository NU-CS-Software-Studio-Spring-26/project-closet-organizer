import { useState } from "react";
import { changePassword } from "../lib/closet";
import type { User } from "../lib/closet";
import { PrimitiveButton } from "./primitives/PrimitiveButton";
import { PrimitiveText } from "./primitives/PrimitiveText";

interface SettingsPageProps {
  user: User;
}

export function SettingsPage({ user }: SettingsPageProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isLocalUser = user.provider === "local";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setSuccessMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <PrimitiveText
        as="h1"
        variant="display"
        font="serif"
        className="mb-8"
        style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: "1" }}
      >
        Account Settings
      </PrimitiveText>

      <section aria-labelledby="change-password-heading">
        <PrimitiveText as="h2" variant="title" id="change-password-heading" className="mb-4">
          Change Password
        </PrimitiveText>

        {!isLocalUser ? (
          <div className="border border-border bg-card px-4 py-3">
            <PrimitiveText as="p" tone="muted">
              Password changes are only available for username/password accounts. Your account uses
              Google sign-in.
            </PrimitiveText>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-4">
            <div>
              <label htmlFor="current-password" className="mb-1 block text-sm font-medium text-foreground">
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-foreground">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-foreground">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>

            {formError ? (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            ) : null}

            {successMessage ? (
              <p role="status" className="text-sm text-emerald-700">
                {successMessage}
              </p>
            ) : null}

            <PrimitiveButton
              type="submit"
              disabled={isSubmitting}
              className="mt-1 h-auto w-full px-6 py-3"
            >
              {isSubmitting ? "Updating…" : "Update password"}
            </PrimitiveButton>
          </form>
        )}
      </section>
    </div>
  );
}
