import Link from "next/link";
import { Heart } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 group">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 transition-transform group-hover:scale-105">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">PairPocket</span>
      </Link>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
}
