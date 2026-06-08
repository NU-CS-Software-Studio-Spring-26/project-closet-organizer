import { FormEvent, useState } from "react";
import { requestPasswordReset } from "../../lib/closet";
import { MAX_EMAIL } from "../../lib/inputLengthPolicy";
import { navigateTo } from "../../lib/routes";
import { PrimitiveButton } from "../primitives/PrimitiveButton";
import { PrimitiveText } from "../primitives/PrimitiveText";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AuthPageLayout } from "./AuthPageLayout";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [developmentResetUrl, setDevelopmentResetUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");
    setDevelopmentResetUrl("");
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset(email.trim());
      setStatusMessage(response.message);
      if (response.development_reset_url) {
        setDevelopmentResetUrl(response.development_reset_url);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to request a password reset right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      title="Reset password"
      description="We will email reset instructions if an account exists for that address."
    >
      <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="forgot-password-email">Email</Label>
          <Input
            id="forgot-password-email"
            type="email"
            autoComplete="email"
            required
            maxLength={MAX_EMAIL}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11"
          />
        </div>

        {statusMessage ? (
          <PrimitiveText as="p" variant="bodySm" role="status" className="text-emerald-900">
            {statusMessage}
          </PrimitiveText>
        ) : null}

        {developmentResetUrl ? (
          <PrimitiveText as="p" variant="bodySm" tone="muted">
            Development reset link:{" "}
            <a href={developmentResetUrl} className="underline underline-offset-2">
              open reset page
            </a>
          </PrimitiveText>
        ) : null}

        {errorMessage ? (
          <PrimitiveText as="p" variant="bodySm" className="text-destructive" role="alert">
            {errorMessage}
          </PrimitiveText>
        ) : null}

        <PrimitiveButton type="submit" disabled={isSubmitting} className="h-11 w-full">
          {isSubmitting ? "Sending..." : "Send reset instructions"}
        </PrimitiveButton>
      </form>

      <PrimitiveText as="p" variant="bodySm" tone="muted" className="text-center">
        <PrimitiveButton
          type="button"
          variant="link"
          className="h-auto px-0 py-0"
          onClick={() => navigateTo("/sign-in")}
        >
          Back to sign in
        </PrimitiveButton>
      </PrimitiveText>
    </AuthPageLayout>
  );
}
