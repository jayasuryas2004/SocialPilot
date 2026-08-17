import RegisterForm from "@/components/auth/forms/RegisterForm";

export const metadata = {
  title: "Register | SocialPilot",
  description: "Create a new SocialPilot account to schedule posts and manage campaigns.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
