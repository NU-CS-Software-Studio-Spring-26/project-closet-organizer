import { FormEvent, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  deleteCurrentUser,
  logoutSession,
  updateCurrentUser,
  type User,
} from "../lib/closet";
import { MAX_PREFERRED_STYLE, MAX_USERNAME } from "../lib/inputLengthPolicy";
import { navigateTo } from "../lib/routes";
import { PrimitiveButton } from "./primitives/PrimitiveButton";
import { PrimitiveText } from "./primitives/PrimitiveText";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface AccountSettingsPageProps {
  user: User;
  onAccountDeleted: () => void;
  onBack: () => void;
  onUserUpdated: (user: User) => void;
}

export function AccountSettingsPage({
  user,
  onAccountDeleted,
  onBack,
  onUserUpdated,
}: AccountSettingsPageProps) {
  const [username, setUsername] = useState(user.username);
  const [preferredStyle, setPreferredStyle] = useState(user.preferred_style ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const passwordLoginEnabled = Boolean(user.password_login_enabled);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");

    if (password && password !== passwordConfirmation) {
      setProfileError("New password confirmation does not match.");
      return;
    }

    setIsSavingProfile(true);

    try {
      const nextUser = await updateCurrentUser(user.id, {
        username: username.trim(),
        preferredStyle: preferredStyle.trim(),
        currentPassword: currentPassword || undefined,
        password: password || undefined,
        passwordConfirmation: passwordConfirmation || undefined,
      });
      onUserUpdated(nextUser);
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setProfileMessage("Account settings saved.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Unable to save account settings.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError("");
    setIsDeleting(true);

    try {
      await deleteCurrentUser(user.id, passwordLoginEnabled ? deletePassword : undefined);
      await logoutSession();
      onAccountDeleted();
      navigateTo("/");
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete your account.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <PrimitiveButton
        onClick={onBack}
        variant="ghost"
        className="mb-8 h-auto px-0 py-0 text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </PrimitiveButton>

      <PrimitiveText as="h1" variant="display" font="serif" className="mb-2">
        Account
      </PrimitiveText>
      <PrimitiveText as="p" tone="muted" className="mb-8">
        Manage your profile, password, and account deletion.
      </PrimitiveText>

      <section className="mb-10 space-y-5 border border-border p-6">
        <PrimitiveText as="h2" variant="title">
          Profile
        </PrimitiveText>

        <form className="space-y-4" onSubmit={(event) => void handleProfileSubmit(event)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="account-email">Email</Label>
            <Input id="account-email" value={user.email ?? ""} readOnly disabled className="h-11" />
            <PrimitiveText as="p" variant="bodySm" tone="muted">
              {passwordLoginEnabled
                ? "Signed in with email and password."
                : "Signed in with Google. Password changes are managed through Google."}
            </PrimitiveText>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-username">Username</Label>
            <Input
              id="account-username"
              maxLength={MAX_USERNAME}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-style">Preferred style</Label>
            <Input
              id="account-style"
              maxLength={MAX_PREFERRED_STYLE}
              value={preferredStyle}
              onChange={(event) => setPreferredStyle(event.target.value)}
              className="h-11"
            />
          </div>

          {passwordLoginEnabled ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="account-current-password">Current password</Label>
                <Input
                  id="account-current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-new-password">New password</Label>
                <Input
                  id="account-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-new-password-confirmation">Confirm new password</Label>
                <Input
                  id="account-new-password-confirmation"
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  className="h-11"
                />
              </div>
            </>
          ) : null}

          {profileMessage ? (
            <PrimitiveText as="p" variant="bodySm" role="status" className="text-emerald-900">
              {profileMessage}
            </PrimitiveText>
          ) : null}

          {profileError ? (
            <PrimitiveText as="p" variant="bodySm" className="text-destructive" role="alert">
              {profileError}
            </PrimitiveText>
          ) : null}

          <PrimitiveButton type="submit" disabled={isSavingProfile}>
            {isSavingProfile ? "Saving..." : "Save changes"}
          </PrimitiveButton>
        </form>
      </section>

      <section className="space-y-4 border border-destructive/30 bg-destructive/5 p-6">
        <PrimitiveText as="h2" variant="title">
          Delete account
        </PrimitiveText>
        <PrimitiveText as="p" tone="muted">
          This permanently removes your closet, outfits, and uploaded images. This cannot be undone.
        </PrimitiveText>

        {passwordLoginEnabled ? (
          <div className="space-y-2">
            <Label htmlFor="account-delete-password">Confirm with your password</Label>
            <Input
              id="account-delete-password"
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              className="h-11"
            />
          </div>
        ) : null}

        {deleteError ? (
          <PrimitiveText as="p" variant="bodySm" className="text-destructive" role="alert">
            {deleteError}
          </PrimitiveText>
        ) : null}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <PrimitiveButton
            type="button"
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/5"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete account
          </PrimitiveButton>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                All clothing items, outfits, and photos will be removed permanently.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isDeleting || (passwordLoginEnabled && !deletePassword)}
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={(event) => {
                  event.preventDefault();
                  void handleDeleteAccount();
                }}
              >
                {isDeleting ? "Deleting..." : "Delete account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
