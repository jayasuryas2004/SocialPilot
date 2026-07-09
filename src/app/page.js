import { redirect } from "next/navigation";

export default function Home() {
  // Instantly send anyone who visits the root URL straight to the login page!
  redirect("/login");
}