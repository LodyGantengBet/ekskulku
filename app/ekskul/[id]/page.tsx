import Link from "next/link";
import { ambilEkskul, ambilAnggota } from "@/data/ambil";
import { ekskul, pendaftar, tambahPendaftar, JAM_SESI } from "@/data/ekskul";
import { redirect } from "next/navigation";

// Server Action untuk mendaftar ekskul dengan validasi lengkap
async function handleDaftar(formData: FormData) {
  "use server";

  const ekskulId = Number(formData.get("ekskulId"));
  const nama = (formData.get("nama") as string)?.trim();
  const kelas = (formData.get("kelas") as string)?.trim();

  if (!nama || !kelas) {
    throw new Error("Nama dan kelas harus diisi!");
  }

  // 1. Cari data ekskul yang dituju
  const targetEkskul = ekskul.find((e) => e.id === ekskulId);
  if (!targetEkskul) {
    throw new Error("Ekstrakurikuler tidak ditemukan.");
  }

  // 2. Ambil daftar anggota saat ini untuk ekskul tersebut
  const anggotaEkskul = pendaftar.filter((p) => p.ekskulId === ekskulId);

  // VALIDASI 1: Kuota Penuh
  if (anggotaEkskul.length >= targetEkskul.kuota) {
    throw new Error("Maaf, kuota untuk ekstrakurikuler ini sudah penuh!");
  }

  // VALIDASI 2: Murid sudah terdaftar di ekskul ini (dikenali dari nama dan kelas)
  const sudahTerdaftarDiSini = anggotaEkskul.some(
    (p) =>
      p.nama.toLowerCase() === nama.toLowerCase() &&
      p.kelas.toLowerCase() === kelas.toLowerCase(),
  );
  if (sudahTerdaftarDiSini) {
    throw new Error("Anda sudah terdaftar di ekstrakurikuler ini!");
  }

  // VALIDASI 3: Bentrok Jadwal (hari dan sesi sama dengan ekskul lain yang sudah diikuti murid)
  const ekskulDiikutiMurid = pendaftar.filter(
    (p) =>
      p.nama.toLowerCase() === nama.toLowerCase() &&
      p.kelas.toLowerCase() === kelas.toLowerCase(),
  );

  for (const p of ekskulDiikutiMurid) {
    const eLain = ekskul.find((e) => e.id === p.ekskulId);
    if (
      eLain &&
      eLain.hari === targetEkskul.hari &&
      eLain.sesi === targetEkskul.sesi
    ) {
      throw new Error(
        `Jadwal bentrok dengan ekskul ${eLain.nama} (${eLain.hari}, Sesi ${eLain.sesi}) yang sudah Anda ikuti!`,
      );
    }
  }

  // Jika lolos semua validasi, masukkan pendaftar baru
  tambahPendaftar({
    ekskulId,
    nama,
    kelas,
  });

  redirect(`/ekskul/${ekskulId}`);
}

// Server Action untuk membatalkan pendaftaran milik sendiri
async function handleBatal(formData: FormData) {
  "use server";

  const nomorPendaftaran = Number(formData.get("nomor"));
  const ekskulId = Number(formData.get("ekskulId"));

  const index = pendaftar.findIndex((p) => p.nomor === nomorPendaftaran);
  if (index !== -1) {
    pendaftar.splice(index, 1);
  }

  redirect(`/ekskul/${ekskulId}`);
}

export default async function DetailEkskul({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  const dataEkskul = await ambilEkskul(id);

  if (!dataEkskul) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 p-12 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Ekstrakurikuler tidak ditemukan.
        </h1>
        <Link href="/" className="text-blue-400 underline">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  const anggota = await ambilAnggota(id);
  const sisaKuota = dataEkskul.kuota - anggota.length;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-blue-400 hover:underline mb-6 inline-block"
        >
          &larr; Kembali ke Daftar Ekskul
        </Link>

        {/* Informasi Utama Ekskul */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 mb-8">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-900 text-blue-300">
            {dataEkskul.kategori}
          </span>
          <h1 className="text-3xl font-bold mt-4 mb-2">{dataEkskul.nama}</h1>
          <p className="text-slate-400 mb-6">Pembina: {dataEkskul.pembina}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
            <p>
              📅 **Hari & Sesi:** {dataEkskul.hari}, Sesi {dataEkskul.sesi} (
              {JAM_SESI[dataEkskul.sesi]})
            </p>
            <p>
              👥 **Kuota Terisi:** {anggota.length} dari {dataEkskul.kuota}{" "}
              (Sisa: {sisaKuota})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Pendaftaran */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Formulir Pendaftaran</h2>
            <form action={handleDaftar} className="space-y-4">
              <input type="hidden" name="ekskulId" value={dataEkskul.id} />
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama"
                  required
                  placeholder="Contoh: Budi Santoso"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Kelas
                </label>
                <input
                  type="text"
                  name="kelas"
                  required
                  placeholder="Contoh: XI IPA 1"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
              >
                Daftar Sekarang
              </button>
            </form>
          </div>

          {/* Daftar Anggota */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">
              Daftar Anggota ({anggota.length})
            </h2>
            {anggota.length === 0 ? (
              <p className="text-slate-400 text-sm">
                Belum ada murid yang terdaftar di ekskul ini.
              </p>
            ) : (
              <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {anggota.map((p) => (
                  <li
                    key={p.nomor}
                    className="bg-slate-900 border border-slate-700/50 p-3 rounded-xl flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-semibold text-white">{p.nama}</p>
                      <p className="text-xs text-slate-400">Kelas: {p.kelas}</p>
                    </div>
                    {/* Tombol Batalkan Pendaftaran Milik Sendiri */}
                    <form action={handleBatal}>
                      <input type="hidden" name="nomor" value={p.nomor} />
                      <input
                        type="hidden"
                        name="ekskulId"
                        value={dataEkskul.id}
                      />
                      <button
                        type="submit"
                        className="text-xs bg-red-900/40 hover:bg-red-800 text-red-300 px-3 py-1.5 rounded-lg border border-red-700/50 transition"
                      >
                        Batalkan
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
