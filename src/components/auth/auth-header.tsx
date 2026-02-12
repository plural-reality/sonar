"use client";

export function AuthHeader({ email }: { email: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-[var(--muted-foreground)]">{email}</span>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="text-[var(--muted-foreground)] opacity-70 hover:opacity-100 transition-opacity"
        >
          ログアウト
        </button>
      </form>
    </div>
  );
}
