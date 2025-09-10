"use client"

import Image from "next/image";
import AvatarWidget from "./AvatarWidget";


export default function Navbar() {

  return (
    <nav className="w-full bg-white/80 shadow-md px-6 py-3 flex items-center justify-between">
      {/* Left: Logo + Text */}
      <div className="flex items-center gap-3">
        <Image
          src="/hydrant.svg"
          alt="Hydrant Logo"
          width={24}
          height={24}
          className="rounded-md"
        />
        <span className="text-md font-semibold text-gray-800 text-center">
        Harta
         <br />
         Hidranți
          </span>
      </div>

      {/* Right: Avatar + Name */}
      <div className="flex items-center gap-3">
      <AvatarWidget/>
      </div>
    </nav>
  );
}
