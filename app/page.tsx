import Link from "next/link";
import { ambilSemuaEkskul } from "@/data/ambil";
import {
  DAFTAR_KATEGORI,
  DAFTAR_HARI,
  JAM_SESI,
  pendaftar,
} from "@/data/ekskul";

export default async function Beranda({
  searchParams,
}: {
  searchParams: { q?: string; kategori?: string; hari?: string };
}) {
  const query = searchParams.q?.toLowerCase() || "";
  const selectedKategori = searchParams.kategori || "";
  const selectedHari = searchParams.hari || "";

  // Mengambil semua data ekskul dengan simulasi jeda dari data/ambil.ts
  const semuaEkskul = await ambilSemuaEkskul();

  // Filter data berdasarkan pencarian nama, kategori, dan hari
  const filteredEkskul = semuaEkskul.filter((item) => {
    const matchNama = item.nama.toLowerCase().includes(query);
    const matchKategori = selectedKategori
      ? item.kategori === selectedKategori
      : true;
    const matchHari = selectedHari ? item.hari === selectedHari : true;
    return matchNama && matchKategori && matchHari;
  });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">EkskulKu</h1>
        <p className="text-slate-400 mb-8">
          Pilih ekstrakurikuler sekolah dengan mudah dan cepat.
        </p>

        {/* Form Filter & Pencarian */}
        <form
          method="GET"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q || ""}
            placeholder="Cari nama ekskul..."
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />

          <select
            name="kategori"
            defaultValue={selectedKategori}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Semua Kategori</option>
            {DAFTAR_KATEGORI.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>

          <select
            name="hari"
            defaultValue={selectedHari}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Semua Hari</option>
            {DAFTAR_HARI.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>

          <div className="md:col-span-3 flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Filter
            </button>
            <a
              href="/"
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition flex items-center justify-center"
            >
              Reset
            </a>
          </div>
        </form>

        {/* Daftar Kartu Ekskul */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEkskul.length === 0 ? (
            <p className="text-slate-400 col-span-full text-center py-10">
              Tidak ada ekstrakurikuler yang ditemukan.
            </p>
          ) : (
            filteredEkskul.map((ekskul) => {
              // Menghitung jumlah pendaftar saat ini untuk melihat sisa kuota
              const jumlahPendaftar = pendaftar.filter(
                (p) => p.ekskulId === ekskul.id,
              ).length;
              const sisaKuota = ekskul.kuota - jumlahPendaftar;

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

                    <div className="space-y-1 text-sm text-slate-300 mb-6">
                      <p>
                        📅 {ekskul.hari}, Sesi {ekskul.sesi} (
                        {JAM_SESI[ekskul.sesi]})
                      </p>
                      <p>
                        👥 Kuota: {jumlahPendaftar} / {ekskul.kuota} (Sisa:{" "}
                        {sisaKuota})
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
