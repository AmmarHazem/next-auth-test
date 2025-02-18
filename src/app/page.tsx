"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const session = useSession();
  console.log("SESSION === ", session);
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="mb-8">
        {session.status === "authenticated" ? (
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={() => signOut()}>
            Sign out
          </button>
        ) : (
          <Link href={"/login"}>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Sign in</button>
          </Link>
        )}
      </div>
      <code className="text-xs max-w-md border border-red-500 overflow-auto">{JSON.stringify(session)}</code>
    </div>
  );
}
