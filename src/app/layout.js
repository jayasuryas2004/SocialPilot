import "./globals.css";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/context/AuthProvider";
import { ToastProvider } from "@/hooks/useToast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

// ADD THIS METADATA OBJECT TO CHANGE YOUR BROWSER TAB TITLE
export const metadata = {
  title: "SocialPilot", // <--- CHANGE THIS TEXT
  description: "Social media management platform",
  icons: {
    icon: '/favicon.ico', // <--- THIS REGISTERS YOUR FAVICON
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={poppins.className}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}