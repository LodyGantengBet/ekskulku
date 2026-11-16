import Link from "next/link";
import { Metadata } from "next";
import { ambilSemuaEkskul } from "@/data/ambil";
import {
  DAFTAR_KATEGORI,
  DAFTAR_HARI,
  JAM_SESI,
  pendaftar,
} from "@/data/ekskul";

export const metadata: Metadata = {
  title: "Daftar Ekskul · EkskulKu",
};

export default async function BerandaEkskul({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; hari?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedKategori = resolvedSearchParams.kategori || "Semua kategori";
  const selectedHari = resolvedSearchParams.hari || "Semua hari";

  const semuaEkskul = await ambilSemuaEkskul();

  // Penyaringan (Filtering) di server berdasarkan parameter URL
  const filteredEkskul = semuaEkskul.filter((item) => {
    const matchKategori =
      selectedKategori === "Semua kategori" || !selectedKategori
        ? true
        : item.kategori === selectedKategori;
    const matchHari =
      selectedHari === "Semua hari" || !selectedHari
        ? true
        : item.hari === selectedHari;
    return matchKategori && matchHari;
  });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">EkskulKu</h1>
        <p className="text-slate-400 mb-6">
          Pilih ekstrakurikuler sekolah dengan mudah dan cepat.
        </p>

        {/* Form Saringan / Filter via URL (GET Method) */}
        <form
          method="GET"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Kategori
            </label>
            <select
              name="kategori"
              defaultValue={selectedKategori}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Semua kategori">Semua kategori</option>
              {DAFTAR_KATEGORI.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Hari</label>
            <select
              name="hari"
              defaultValue={selectedHari}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Semua hari">Semua hari</option>
              {DAFTAR_HARI.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Saring
            </button>
            <Link
              href="/ekskul"
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition flex items-center justify-center"
            >
              Reset
            </Link>
          </div>
        </form>

        {/* Tulisan Jumlah Ekskul Ditemukan */}
        <p className="text-slate-300 font-medium mb-6">
          {filteredEkskul.length} ekskul ditemukan.
        </p>

        {/* Daftar Kartu Ekskul */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEkskul.length === 0 ? (
            <p className="text-slate-400 col-span-full text-center py-10">
              Tidak ada ekskul yang cocok.
            </p>
          ) : (
            filteredEkskul.map((ekskul) => {
              const jumlahPendaftar = pendaftar.filter(
                (p) => p.ekskulId === ekskul.id,
              ).length;
              const sisaTempat = ekskul.kuota - jumlahPendaftar;
              const isPenuh = sisaTempat <= 0;

              return (
                <div
                  key={ekskul.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-900 text-blue-300">
                      {ekskul.kategori}
                    </span>
                    <h2 className="text-xl font-bold mt-3 mb-1">
                      {ekskul.nama}
                    </h2>
                    <p className="text-sm text-slate-400 mb-4">
                      Pembina: {ekskul.pembina}
                    </p>

                    <div className="space-y-1.5 text-sm text-slate-300 mb-6">
                      <p>
                        📅 {ekskul.hari}, Sesi {ekskul.sesi} (
                        {JAM_SESI[ekskul.sesi]})
                      </p>
                      <p>
                        👥 Status Kuota:{" "}
                        {isPenuh ? (
                          <span className="text-red-400 font-bold">Penuh</span>
                        ) : (
                          <span className="text-slate-200">
                            Sisa {sisaTempat} dari {ekskul.kuota} tempat
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/ekskul/${ekskul.id}`}
                    className="block text-center bg-slate-700 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition"
                  >
                    Lihat Detail & Daftar
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
