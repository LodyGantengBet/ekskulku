"use client";

import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition"
    >
      {pending ? "Memproses..." : "Daftar Sekarang"}
    </button>
  );
}

export default function ClientForm({
  ekskulId,
  defaultNama,
  defaultKelas,
  namaError,
  kelasError,
  action,
}: {
  ekskulId: number;
  defaultNama: string;
  defaultKelas: string;
  namaError: string;
  kelasError: string;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="ekskulId" value={ekskulId} />
      <div>
        <label className="block text-sm text-slate-400 mb-1">
          Nama Lengkap
        </label>
        <input
          type="text"
          name="nama"
          defaultValue={defaultNama}
          required
          placeholder="Contoh: Budi Santoso"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
        />
        {namaError && <p className="text-xs text-red-400 mt-1">{namaError}</p>}
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">Kelas</label>
        <input
          type="text"
          name="kelas"
          defaultValue={defaultKelas}
          required
          placeholder="Contoh: XI IPA 1"
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
        />
        {kelasError && (
          <p className="text-xs text-red-400 mt-1">{kelasError}</p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}
