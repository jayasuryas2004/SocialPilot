"use client";
import React from "react";
import { FaFacebook } from "react-icons/fa6";
import { getFacebookAuthUrl } from "@/lib/api/oauth";

export function ConnectFacebookButton({ 
  className = "", 
  children,
  onClick
}) {
  const handleConnect = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (typeof window !== "undefined") {
      window.location.href = getFacebookAuthUrl();
    }
  };

  return (
    <button
      type="button"
      onClick={handleConnect}
      className={
        className ||
        "px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
      }
    >
      <FaFacebook size={16} />
      <span>{children || "Connect Facebook"}</span>
    </button>
  );
}

export default ConnectFacebookButton;
