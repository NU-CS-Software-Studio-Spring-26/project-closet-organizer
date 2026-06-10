import { useState } from "react";
import { requestPasswordReset } from "../../lib/closet";
import { navigateTo } from "../../lib/routes";
import { PrimitiveButton } from "../primitives/PrimitiveButton";
import { PrimitiveText } from "../primitives/PrimitiveText";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          Forgot password
        </PrimitiveText>
        <PrimitiveText as="p" tone="muted" className="mb-8">
          Enter the email address for your account and we'll send you a reset link.
        </PrimitiveText>

        {submitted ? (
          <div className="border border-emerald-300/40 bg-emerald-50 px-4 py-3">
            <PrimitiveText as="p" variant="bodySm" className="text-emerald-900">
              If that email is registered, you'll receive a reset link shortly. Check your inbox.
            </PrimitiveText>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-4">
            <div>
              <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-foreground">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="you@example.com"
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
              {isSubmitting ? "Sending…" : "Send reset link"}
            </PrimitiveButton>
          </form>
        )}

        <button
          type="button"
          onClick={() => navigateTo("/")}
          className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Back to sign in
        </button>
      </div>
    </section>
  );
}
