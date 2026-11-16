import Link from "next/link";
import { Metadata } from "next";
import { pendaftar, ekskul, JAM_SESI, Pendaftar } from "@/data/ekskul";

// Judul tab sesuai instruksi: "Ekskul Saya · EkskulKu"
export const metadata: Metadata = {
  title: "Ekskul Saya · EkskulKu",
};

export default async function EkskulSaya({
  searchParams,
}: {
  searchParams: { nama?: string; kelas?: string };
}) {
  const namaCari = searchParams.nama?.toLowerCase().trim() || "";
  const kelasCari = searchParams.kelas?.toLowerCase().trim() || "";

  // Filter pendaftar berdasarkan nama dan kelas yang dimasukkan murid
  const daftarDitemukan = pendaftar.filter((p: Pendaftar) => {
    if (!namaCari) return false;
    const matchNama = p.nama.toLowerCase().includes(namaCari);
    const matchKelas = kelasCari
      ? p.kelas.toLowerCase().includes(kelasCari)
      : true;
    return matchNama && matchKelas;
  });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/ekskul"
          className="text-blue-400 hover:underline mb-6 inline-block"
        >
          &larr; Kembali ke Daftar Ekskul
        </Link>

        <h1 className="text-3xl font-bold mb-2">Ekskul Saya</h1>
        <p className="text-slate-400 mb-8">
          Cari dan lihat daftar ekstrakurikuler yang sudah Anda ikuti.
        </p>

        {/* Form Pencarian Nama Murid */}
        <form
          method="GET"
          className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="nama"
              defaultValue={searchParams.nama || ""}
              required
              placeholder="Masukkan nama Anda..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Kelas (Opsional)
            </label>
            <input
              type="text"
              name="kelas"
              defaultValue={searchParams.kelas || ""}
              placeholder="Contoh: XI TKJ 1"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
            >
              Cek Ekskul Saya
            </button>
          </div>
        </form>

        {/* Hasil Pencarian */}
        {searchParams.nama && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">
              Hasil Pendaftaran untuk: &quot;{searchParams.nama}&quot;
            </h2>
            {daftarDitemukan.length === 0 ? (
              <p className="text-slate-400 text-sm">
                Tidak ditemukan pendaftaran atas nama tersebut.
              </p>
            ) : (
              <div className="space-y-4">
                {daftarDitemukan.map((item) => {
                  const dataEkskul = ekskul.find((e) => e.id === item.ekskulId);
                  if (!dataEkskul) return null;

                  return (
                    <div
                      key={item.nomor}
                      className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-900 text-blue-300">
                          {dataEkskul.kategori}
                        </span>
                        <h3 className="text-lg font-bold mt-2">
                          {dataEkskul.nama}
                        </h3>
                        <p className="text-sm text-slate-400">
                          Pembina: {dataEkskul.pembina}
                        </p>
                        <p className="text-sm text-slate-300 mt-1">
                          📅 {dataEkskul.hari}, Sesi {dataEkskul.sesi} (
                          {JAM_SESI[dataEkskul.sesi]})
                        </p>
                      </div>
                      <Link
                        href={`/ekskul/${dataEkskul.id}`}
                        className="text-xs bg-slate-800 hover:bg-blue-600 text-white px-4 py-2 rounded-lg border border-slate-700 transition"
                      >
                        Lihat Detail Ekskul
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
