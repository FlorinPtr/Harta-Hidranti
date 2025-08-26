"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import LoginDialog from "./LoginDialog"; // importă dialogul tău
import { on } from "events";

type AvatarWidgetProps = {
  name?: string;
  imageUrl?: string;
};

export default function AvatarWidget({ name, imageUrl }: AvatarWidgetProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

 useEffect(() => {
  const checkAdmin = () => {
    const storedAdmin = localStorage.getItem("isAdmin") === "true";
    setIsAdmin(storedAdmin || isAdmin || false);
  };

  checkAdmin(); // run on mount

  window.addEventListener("isAdminChanged", checkAdmin);
  return () => window.removeEventListener("storage", checkAdmin);
}, [isAdmin]);


  return (
    <div className="relative">
      {/* Avatar */}
      <div
        className="flex flex-col items-center gap-0 cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Image
          src={imageUrl || "/default-avatar.png"}
          alt={`${name || "User"} Avatar`}
          width={57}
          height={57}
          className="rounded-full border border-gray-300"
        />
        <span className="text-gray-700 font-medium">
          {isAdmin
            ? "Admin"
            : "Guest"}
        </span>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg text-black border border-gray-200 z-50">
          {localStorage.getItem("isAdmin") == "true" ? (
            <button
              onClick={() => {
                localStorage.setItem("isAdmin", "false"); // persist state
                setIsAdmin(false);
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                setShowLoginDialog(true);
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              Login
            </button>
          )}
        </div>
      )}

      {/* Login Dialog */}
      {showLoginDialog && (
        <LoginDialog onClose={() => setShowLoginDialog(false)} />
      )}
    </div>
  );
}
