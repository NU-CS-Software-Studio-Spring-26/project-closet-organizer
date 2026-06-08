import { FormEvent, useState } from "react";
import { beginGoogleSignIn, signInWithEmail, type User } from "../../lib/closet";
import { authErrorMessage, navigateTo } from "../../lib/routes";
import { PrimitiveButton } from "../primitives/PrimitiveButton";
import { PrimitiveText } from "../primitives/PrimitiveText";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AuthPageLayout } from "./AuthPageLayout";

interface SignInPageProps {
  authError?: string | null;
  onSignedIn: (user: User) => void;
}

export function SignInPage({ authError, onSignedIn }: SignInPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(authError ? authErrorMessage(authError) : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const user = await signInWithEmail(email.trim(), password);
      onSignedIn(user);
      navigateTo("/closet");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthPageLayout title="Sign in" description="Access your closet with email or Google.">
      <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="sign-in-email">Email</Label>
          <Input
            id="sign-in-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="sign-in-password">Password</Label>
            <PrimitiveButton
              type="button"
              variant="link"
              className="h-auto px-0 py-0 text-sm"
              onClick={() => navigateTo("/forgot-password")}
            >
              Forgot password?
            </PrimitiveButton>
          </div>
          <Input
            id="sign-in-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11"
          />
        </div>

        {errorMessage ? (
          <PrimitiveText as="p" variant="bodySm" className="text-destructive" role="alert">
            {errorMessage}
          </PrimitiveText>
        ) : null}

        <PrimitiveButton type="submit" disabled={isSubmitting} className="h-11 w-full">
          {isSubmitting ? "Signing in..." : "Sign in with email"}
        </PrimitiveButton>
      </form>

      <div className="space-y-3">
        <PrimitiveButton
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={() => beginGoogleSignIn()}
        >
          Sign in with Google
        </PrimitiveButton>

        <PrimitiveText as="p" variant="bodySm" tone="muted" className="text-center">
          New here?{" "}
          <PrimitiveButton
            type="button"
            variant="link"
            className="h-auto px-0 py-0"
            onClick={() => navigateTo("/sign-up")}
          >
            Create an account
          </PrimitiveButton>
        </PrimitiveText>
      </div>
    </AuthPageLayout>
  );
}
