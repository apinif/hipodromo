"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";

interface Props {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export function Header({ user }: Props) {
  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
      <div className="container mx-auto px-4 max-w-5xl h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏇</span>
          <span className="font-bold text-white text-lg">Hipodromo</span>
        </div>

        <div className="flex items-center gap-3">
          {user.image && (
            <Image
              src={user.image}
              alt={user.name ?? "User"}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <span className="text-gray-400 text-sm hidden sm:block">
            {user.name ?? user.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-gray-500 hover:text-gray-300 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
