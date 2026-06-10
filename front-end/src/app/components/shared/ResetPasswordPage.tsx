import { useState } from "react";
import { resetPassword } from "../../lib/closet";
import { navigateTo } from "../../lib/routes";
import { PrimitiveButton } from "../primitives/PrimitiveButton";
import { PrimitiveText } from "../primitives/PrimitiveText";

interface ResetPasswordPageProps {
  token: string;
}

export function ResetPasswordPage({ token }: ResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [succeeded, setSucceeded] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      await resetPassword(token, password, passwordConfirmation);
      setSucceeded(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm text-center">
          <PrimitiveText as="p" tone="muted" className="mb-6">
            This reset link is missing a token. Please request a new one.
          </PrimitiveText>
          <PrimitiveButton onClick={() => navigateTo("/forgot-password")} className="h-auto px-6 py-3">
            Request new link
          </PrimitiveButton>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <PrimitiveText
          as="h1"
          variant="display"
          font="serif"
          className="mb-2"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: "1" }}
        >
          Reset password
        </PrimitiveText>
        <PrimitiveText as="p" tone="muted" className="mb-8">
          Choose a new password for your account.
        </PrimitiveText>

        {succeeded ? (
          <div className="border border-emerald-300/40 bg-emerald-50 px-4 py-3">
            <PrimitiveText as="p" variant="bodySm" className="mb-4 text-emerald-900">
              Your password has been reset. You can now sign in with your new password.
            </PrimitiveText>
            <PrimitiveButton
              onClick={() => navigateTo("/")}
              className="h-auto px-6 py-3"
            >
              Sign in
            </PrimitiveButton>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-4">
            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-foreground">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>

            {formError ? (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            ) : null}

            <PrimitiveButton
              type="submit"
              disabled={isSubmitting}
              className="h-auto w-full px-6 py-3"
            >
              {isSubmitting ? "Resetting…" : "Reset password"}
            </PrimitiveButton>
          </form>
        )}
      </div>
    </section>
  );
}
