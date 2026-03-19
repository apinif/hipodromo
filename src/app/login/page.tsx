import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/auth/SignInButton";
import { DevLoginForm } from "@/components/auth/DevLoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const isDev = process.env.NODE_ENV === "development";
  const hasGoogle = !!process.env.GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-6xl font-bold text-white mb-2">🏇 Hipodromo</h1>
          <p className="text-gray-400 text-lg">Daily standup random selector</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl max-w-sm mx-auto space-y-4">
          <p className="text-gray-300">
            Sign in to manage your team and run the draw
          </p>

          {hasGoogle && <SignInButton />}

          {isDev && hasGoogle && (
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-gray-600 text-xs">or</span>
              <div className="flex-1 h-px bg-gray-800" />
            </div>
          )}

          {isDev && <DevLoginForm />}
        </div>

        <p className="text-gray-600 text-sm">
          Tracks draw history so everyone gets a turn before the cycle resets
        </p>
      </div>
    </div>
  );
}
