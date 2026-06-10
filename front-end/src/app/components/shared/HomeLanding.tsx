import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { beginGoogleSignIn, loginLocal, registerLocal } from "../../lib/closet";
import type { User } from "../../lib/closet";
import { navigateTo } from "../../lib/routes";
import { PrimitiveButton } from "../primitives/PrimitiveButton";
import { PrimitiveText } from "../primitives/PrimitiveText";

interface HomeLandingProps {
  homeMessage: { kind: "error" | "success"; text: string } | null;
  onAuthSuccess: (user: User) => void;
}

type AuthMode = "sign-in" | "register";

export function HomeLanding({ homeMessage, onAuthSuccess }: HomeLandingProps) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLocalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (mode === "register" && !termsAccepted) {
      setFormError("You must accept the Terms of Service to create an account.");
      return;
    }

    setIsSubmitting(true);

    try {
      let user: User;
      if (mode === "sign-in") {
        user = await loginLocal(username.trim(), password);
      } else {
        user = await registerLocal(username.trim(), password, passwordConfirmation, email.trim() || undefined);
      }
      onAuthSuccess(user);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    setFormError("");
    setPassword("");
    setPasswordConfirmation("");
    setTermsAccepted(false);
  }

  return (
    <section className="flex flex-1 items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm text-center"
      >
        <img
          src="/brand-mark.png"
          alt="Curated Closet logo"
          className="mx-auto mb-8 h-32 w-auto object-contain sm:h-40"
        />
        <PrimitiveText
          as="h1"
          variant="display"
          font="serif"
          className="mb-6"
          style={{
            fontSize: "clamp(3rem, 8vw, 5.5rem)",
            lineHeight: "0.95",
          }}
        >
          Curated Closet
        </PrimitiveText>
        <PrimitiveText
          as="p"
          variant="title"
          tone="muted"
          className="mb-10"
          style={{ lineHeight: "1.7" }}
        >
          Find your fit, faster.
        </PrimitiveText>

        <PrimitiveButton
          onClick={() => beginGoogleSignIn()}
          variant="outline"
          className="mb-6 h-auto w-full px-6 py-3"
        >
          Sign in with Google
          <ArrowRight className="h-4 w-4" />
        </PrimitiveButton>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <PrimitiveText as="span" variant="bodySm" tone="muted">or</PrimitiveText>
          <div className="flex-1 border-t border-border" />
        </div>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => switchMode("sign-in")}
            className={`flex-1 border-b-2 pb-2 text-sm font-medium transition-colors ${
              mode === "sign-in"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 border-b-2 pb-2 text-sm font-medium transition-colors ${
              mode === "register"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={(e) => void handleLocalSubmit(e)} noValidate className="flex flex-col gap-3 text-left">
          <div>
            <label htmlFor="local-username" className="mb-1 block text-sm font-medium text-foreground">
              Username
            </label>
            <input
              id="local-username"
              type="text"
              autoComplete="username"
              required
              maxLength={60}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="your username"
            />
          </div>

          {mode === "register" && (
            <div>
              <label htmlFor="local-email" className="mb-1 block text-sm font-medium text-foreground">
                Email <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="local-email"
                type="email"
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="you@example.com"
              />
            </div>
          )}

          <div>
            <label htmlFor="local-password" className="mb-1 block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="local-password"
              type="password"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="••••••••"
            />
          </div>

          {mode === "sign-in" ? (
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigateTo("/forgot-password")}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </button>
            </div>
          ) : null}

          {mode === "register" && (
            <div>
              <label htmlFor="local-password-confirm" className="mb-1 block text-sm font-medium text-foreground">
                Confirm password
              </label>
              <input
                id="local-password-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full border border-border bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>
          )}

          {mode === "register" && (
            <label className="flex items-start gap-2 text-sm text-foreground">
              <input
                id="local-terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 shrink-0 accent-foreground"
              />
              <span>
                I agree to the{" "}
                <a href="/terms" className="underline hover:text-muted-foreground">
                  Terms of Service
                </a>
              </span>
            </label>
          )}

          {formError ? (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          ) : null}

          <PrimitiveButton
            type="submit"
            disabled={isSubmitting || (mode === "register" && !termsAccepted)}
            className="mt-1 h-auto w-full px-6 py-3"
          >
            {isSubmitting
              ? mode === "sign-in" ? "Signing in…" : "Creating account…"
              : mode === "sign-in" ? "Sign in" : "Create account"}
          </PrimitiveButton>
        </form>

        {homeMessage ? (
          <motion.div
            className={`mt-6 px-4 py-3 text-sm ${
              homeMessage.kind === "success"
                ? "border border-emerald-300/40 bg-emerald-50 text-emerald-900"
                : "border border-destructive/30 bg-destructive/10 text-destructive"
            }`}
          >
            <PrimitiveText as="p" variant="bodySm">
              {homeMessage.text}
            </PrimitiveText>
          </motion.div>
        ) : null}
      </motion.div>
    </section>
  );
}
