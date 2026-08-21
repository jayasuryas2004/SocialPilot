import { Suspense } from "react";
import ConnectAccountsForm from "@/components/onboarding/ConnectAccountsForm";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Connect Accounts | SocialPilot",
  description:
    "Link your social media accounts so SocialPilot can publish, schedule, and pull performance data on your behalf.",
};

export default function ConnectAccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
          <div className="flex items-center gap-3 text-purple-900 font-semibold">
            <Loader2 className="w-6 h-6 animate-spin text-[#5b21b6]" />
            Loading accounts dashboard...
          </div>
        </div>
      }
    >
      <ConnectAccountsForm />
    </Suspense>
  );
}
