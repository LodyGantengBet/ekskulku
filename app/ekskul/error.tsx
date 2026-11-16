"use client";

import { useEffect } from "react";

export default function ErrorEkskul({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-bold mb-2">Terjadi Kesalahan!</h2>
      <p className="text-slate-400 mb-6 max-w-md">
        {error.message || "Gagal memuat data ekstrakurikuler."}
      </p>
      <button
        onClick={() => reset()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition"
      >
        Coba lagi
      </button>
    </main>
  );
}
