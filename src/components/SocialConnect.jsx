"use client";
import React from "react";
import ConnectFacebookButton from "./ConnectFacebookButton";

export { ConnectFacebookButton };

export default function SocialConnect({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ConnectFacebookButton />
    </div>
  );
}
