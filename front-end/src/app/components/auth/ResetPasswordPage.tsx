import { FormEvent, useState } from "react";
import { resetPassword } from "../../lib/closet";
import { navigateTo } from "../../lib/routes";
import { PrimitiveButton } from "../primitives/PrimitiveButton";
import { PrimitiveText } from "../primitives/PrimitiveText";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AuthPageLayout } from "./AuthPageLayout";

interface ResetPasswordPageProps {
  token: string | null;
}

export function ResetPasswordPage({ token }: ResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");

    if (!token) {
      setErrorMessage("This reset link is missing a token.");
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({
        token,
        password,
        passwordConfirmation,
      });
      setStatusMessage(response.message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to reset your password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout title="Choose a new password" description="Enter a new password for your account.">
      {!token ? (
        <PrimitiveText as="p" tone="muted" role="alert">
          This reset link is invalid. Request a new one from the forgot-password page.
        </PrimitiveText>
      ) : (
        <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="reset-password">New password</Label>
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reset-password-confirmation">Confirm new password</Label>
            <Input
              id="reset-password-confirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              className="h-11"
            />
          </div>

          {statusMessage ? (
            <PrimitiveText as="p" variant="bodySm" role="status" className="text-emerald-900">
              {statusMessage}
            </PrimitiveText>
          ) : null}

          {errorMessage ? (
            <PrimitiveText as="p" variant="bodySm" className="text-destructive" role="alert">
              {errorMessage}
            </PrimitiveText>
          ) : null}

          <PrimitiveButton type="submit" disabled={isSubmitting} className="h-11 w-full">
            {isSubmitting ? "Saving..." : "Update password"}
          </PrimitiveButton>
        </form>
      )}

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
