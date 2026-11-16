import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beranda · EkskulKu",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-900 text-blue-300">
          Sistem Pendaftaran Ekstrakurikuler
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
          Selamat Datang di EkskulKu
        </h1>
        <p className="text-slate-400 text-lg mb-8">
          Temukan dan daftarkan dirimu pada berbagai kegiatan ekstrakurikuler
          sekolah sesuai minat dan jadwalmu.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/ekskul"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition"
          >
            Lihat Daftar Ekskul
          </Link>
          <Link
            href="/saya"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium px-8 py-3 rounded-xl transition"
          >
            Ekskul Saya
          </Link>
        </div>
      </div>
    </main>
  );
}
