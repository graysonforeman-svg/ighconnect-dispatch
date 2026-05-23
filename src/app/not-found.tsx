import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link href="/login" className="text-brand-400 underline">
        Go to login
      </Link>
    </div>
  );
}
