import ResetPasswordForm from "@/components/auth/forms/ResetPasswordForm";

export const metadata = {
  title: "Reset Password | SocialPilot",
  description: "Set a new password for your SocialPilot account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}