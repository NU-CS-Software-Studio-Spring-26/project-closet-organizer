import { FormEvent, useState } from "react";
import { beginGoogleSignIn, registerUser, type User } from "../../lib/closet";
import { MAX_EMAIL, MAX_PREFERRED_STYLE, MAX_USERNAME } from "../../lib/inputLengthPolicy";
import { navigateTo } from "../../lib/routes";
import { PrimitiveButton } from "../primitives/PrimitiveButton";
import { PrimitiveText } from "../primitives/PrimitiveText";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AuthPageLayout } from "./AuthPageLayout";

interface SignUpPageProps {
  onRegistered: (user: User) => void;
}

export function SignUpPage({ onRegistered }: SignUpPageProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [preferredStyle, setPreferredStyle] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");

    if (!acceptedTerms) {
      setErrorMessage("Please accept the terms and privacy policy before creating an account.");
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await registerUser({
        username: username.trim(),
        email: email.trim(),
        preferredStyle: preferredStyle.trim(),
        password,
        passwordConfirmation,
        acceptedTerms,
      });
      onRegistered(user);
      navigateTo("/closet");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create your account right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout title="Create account" description="Register with email or continue with Google.">
      <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="sign-up-username">Username</Label>
          <Input
            id="sign-up-username"
            autoComplete="username"
            required
            maxLength={MAX_USERNAME}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sign-up-email">Email</Label>
          <Input
            id="sign-up-email"
            type="email"
            autoComplete="email"
            required
            maxLength={MAX_EMAIL}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sign-up-style">Preferred style (optional)</Label>
          <Input
            id="sign-up-style"
            maxLength={MAX_PREFERRED_STYLE}
            value={preferredStyle}
            onChange={(event) => setPreferredStyle(event.target.value)}
            placeholder="e.g. minimal, polished"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sign-up-password">Password</Label>
          <Input
            id="sign-up-password"
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
          <Label htmlFor="sign-up-password-confirmation">Confirm password</Label>
          <Input
            id="sign-up-password-confirmation"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            className="h-11"
          />
        </div>

        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-1 size-4 border border-input"
          />
          <span>
            I agree to the{" "}
            <PrimitiveButton
              type="button"
              variant="link"
              className="h-auto px-0 py-0"
              onClick={() => navigateTo("/terms")}
            >
              terms
            </PrimitiveButton>{" "}
            and{" "}
            <PrimitiveButton
              type="button"
              variant="link"
              className="h-auto px-0 py-0"
              onClick={() => navigateTo("/privacy")}
            >
              privacy policy
            </PrimitiveButton>
            .
          </span>
        </label>

        {errorMessage ? (
          <PrimitiveText as="p" variant="bodySm" className="text-destructive" role="alert">
            {errorMessage}
          </PrimitiveText>
        ) : null}

        <PrimitiveButton type="submit" disabled={isSubmitting} className="h-11 w-full">
          {isSubmitting ? "Creating account..." : "Create account"}
        </PrimitiveButton>
      </form>

      <div className="space-y-3">
        <PrimitiveButton
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={() => beginGoogleSignIn()}
        >
          Sign up with Google
        </PrimitiveButton>

        <PrimitiveText as="p" variant="bodySm" tone="muted" className="text-center">
          Already have an account?{" "}
          <PrimitiveButton
            type="button"
            variant="link"
            className="h-auto px-0 py-0"
            onClick={() => navigateTo("/sign-in")}
          >
            Sign in
          </PrimitiveButton>
        </PrimitiveText>
      </div>
    </AuthPageLayout>
  );
}
