import Link from "next/link";
import { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ambilEkskul, ambilAnggota } from "@/data/ambil";
import {
  ekskul,
  pendaftar,
  tambahPendaftar,
  JAM_SESI,
  Ekskul,
  Pendaftar,
} from "@/data/ekskul";
import ClientForm from "./ClientForm";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    nama?: string;
    kelas?: string;
    error?: string;
    success?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  const dataEkskul = await ambilEkskul(id);

  if (!dataEkskul) {
    return {
      title: "Ekskul tidak ditemukan · EkskulKu",
    };
  }

  return {
    title: `${dataEkskul.nama} · EkskulKu`,
  };
}

// Server Action untuk memproses pendaftaran dengan validasi lengkap
async function handleDaftar(formData: FormData) {
  "use server";

  const ekskulId = Number(formData.get("ekskulId"));
  const nama = (formData.get("nama") as string)?.trim() || "";
  const kelas = (formData.get("kelas") as string)?.trim() || "";

  const targetEkskul = ekskul.find((e: Ekskul) => e.id === ekskulId);
  if (!targetEkskul) {
    redirect(
      `/ekskul/${ekskulId}?error=${encodeURIComponent("Ekstrakurikuler tidak ditemukan.")}&nama=${encodeURIComponent(nama)}&kelas=${encodeURIComponent(kelas)}`,
    );
  }

  // Validasi panjang karakter per kolom (nama min 3 huruf, kelas min 3 karakter)
  if (nama.length < 3 || kelas.length < 3) {
    const errNama = nama.length < 3 ? "Nama minimal 3 huruf. " : "";
    const errKelas = kelas.length < 3 ? "Kelas minimal 3 karakter." : "";
    redirect(
      `/ekskul/${ekskulId}?error=${encodeURIComponent((errNama + errKelas).trim())}&nama=${encodeURIComponent(nama)}&kelas=${encodeURIComponent(kelas)}`,
    );
  }

  const anggotaEkskul = pendaftar.filter(
    (p: Pendaftar) => p.ekskulId === ekskulId,
  );

  // Validasi kuota penuh
  if (anggotaEkskul.length >= targetEkskul.kuota) {
    redirect(
      `/ekskul/${ekskulId}?error=${encodeURIComponent(`Kuota ${targetEkskul.nama} sudah penuh (${targetEkskul.kuota} orang).`)}&nama=${encodeURIComponent(nama)}&kelas=${encodeURIComponent(kelas)}`,
    );
  }

  // Validasi sudah terdaftar di ekskul yang sama (case-insensitive)
  const sudahTerdaftarDiSini = anggotaEkskul.some(
    (p: Pendaftar) =>
      p.nama.toLowerCase() === nama.toLowerCase() &&
      p.kelas.toLowerCase() === kelas.toLowerCase(),
  );
  if (sudahTerdaftarDiSini) {
    redirect(
      `/ekskul/${ekskulId}?error=${encodeURIComponent(`${nama} (${kelas}) sudah terdaftar di ${targetEkskul.nama}.`)}&nama=${encodeURIComponent(nama)}&kelas=${encodeURIComponent(kelas)}`,
    );
  }

  // Ambil semua ekskul yang sudah diikuti oleh murid ini sebelumnya
  const ekskulDiikutiMurid = pendaftar.filter(
    (p: Pendaftar) =>
      p.nama.toLowerCase() === nama.toLowerCase() &&
      p.kelas.toLowerCase() === kelas.toLowerCase(),
  );

  // === FITUR BONUS: Validasi Maksimal 2 Ekskul ===
  if (ekskulDiikutiMurid.length >= 2) {
    redirect(
      `/ekskul/${ekskulId}?error=${encodeURIComponent(`Pendaftaran ditolak. ${nama} (${kelas}) sudah mengikuti maksimal 2 ekstrakurikuler.`)}&nama=${encodeURIComponent(nama)}&kelas=${encodeURIComponent(kelas)}`,
    );
  }

  // Validasi jadwal bentrok (hari dan sesi sama)
  for (const p of ekskulDiikutiMurid) {
    const eLain = ekskul.find((e: Ekskul) => e.id === p.ekskulId);
    if (
      eLain &&
      eLain.hari === targetEkskul.hari &&
      eLain.sesi === targetEkskul.sesi
    ) {
      redirect(
        `/ekskul/${ekskulId}?error=${encodeURIComponent(`Jadwal bentrok dengan ${eLain.nama} (${eLain.hari}, sesi ${eLain.sesi}).`)}&nama=${encodeURIComponent(nama)}&kelas=${encodeURIComponent(kelas)}`,
      );
    }
  }

  const nomorPendaftaran = tambahPendaftar({
    ekskulId,
    nama,
    kelas,
  });

  // Simpan cookie nama dan kelas agar otomatis terisi di ekskul lain
  const cookieStore = await cookies();
  cookieStore.set("nama_pendaftar", nama);
  cookieStore.set("kelas_pendaftar", kelas);

  const successMessage = `Pendaftaran #${nomorPendaftaran} berhasil: ${targetEkskul.nama}, ${targetEkskul.hari}, sesi ${targetEkskul.sesi} (${JAM_SESI[targetEkskul.sesi]}).`;
  redirect(
    `/ekskul/${ekskulId}?success=${encodeURIComponent(successMessage)}&nama=${encodeURIComponent(nama)}&kelas=${encodeURIComponent(kelas)}`,
  );
}

// Komponen Daftar Anggota (Suspense)
async function DaftarAnggota({ id, kuota }: { id: number; kuota: number }) {
  const anggota = await ambilAnggota(id);
  const cookieStore = await cookies();
  const cookieNama =
    cookieStore.get("nama_pendaftar")?.value?.toLowerCase() || "";

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-2">Anggota terdaftar</h2>
      <p className="text-sm text-slate-400 mb-4">
        {anggota.length} dari {kuota} tempat terisi
      </p>

      {anggota.length === 0 ? (
        <p className="text-slate-400 text-sm">Belum ada anggota.</p>
      ) : (
        <ul className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {anggota.map((p: Pendaftar) => {
            const isKamu = cookieNama && p.nama.toLowerCase() === cookieNama;

            return (
              <li
                key={p.nomor}
                className="bg-slate-900 border border-slate-700/50 p-3 rounded-xl flex items-center justify-between text-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">{p.nama}</p>
                    {isKamu && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-900 text-blue-300 border border-blue-700">
                        Kamu
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">Kelas: {p.kelas}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default async function DetailEkskul({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const id = Number(resolvedParams.id);
  const dataEkskul = await ambilEkskul(id);

  if (!dataEkskul) {
    notFound();
  }

  const cookieStore = await cookies();
  const defaultNama =
    resolvedSearch.nama || cookieStore.get("nama_pendaftar")?.value || "";
  const defaultKelas =
    resolvedSearch.kelas || cookieStore.get("kelas_pendaftar")?.value || "";
  const errorMessage = resolvedSearch.error || "";
  const successMessage = resolvedSearch.success || "";

  const namaError = errorMessage.toLowerCase().includes("nama")
    ? errorMessage
    : "";
  const kelasError = errorMessage.toLowerCase().includes("kelas")
    ? errorMessage
    : "";
  const generalError =
    errorMessage && !namaError && !kelasError ? errorMessage : "";

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/ekskul"
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
            <p>📅 Hari: {dataEkskul.hari}</p>
            <p>
              ⏰ Sesi: Sesi {dataEkskul.sesi} ({JAM_SESI[dataEkskul.sesi]})
            </p>
          </div>
        </div>

        {/* Pesan Sukses atau Galat Umum di atas tombol */}
        {successMessage && (
          <div className="bg-green-900/50 border border-green-700 text-green-200 p-4 rounded-xl mb-6 text-sm">
            {successMessage}
          </div>
        )}

        {generalError && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-xl mb-6 text-sm">
            {generalError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulir Pendaftaran */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Formulir Pendaftaran</h2>
            <ClientForm
              ekskulId={dataEkskul.id}
              defaultNama={defaultNama}
              defaultKelas={defaultKelas}
              namaError={namaError}
              kelasError={kelasError}
              action={handleDaftar}
            />
          </div>

          {/* Daftar Anggota dengan Suspense */}
          <Suspense
            fallback={
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-slate-400 text-sm flex items-center justify-center">
                Memuat anggota...
              </div>
            }
          >
            <DaftarAnggota id={dataEkskul.id} kuota={dataEkskul.kuota} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
