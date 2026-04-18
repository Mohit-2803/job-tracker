import { signOut } from "@/lib/auth";
import type { User } from "next-auth";

export default function Header({ user }: { user: User }) {
  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-3">
        {user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <span className="text-sm text-gray-700">{user.name ?? user.email}</span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
