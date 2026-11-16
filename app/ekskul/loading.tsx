export default function LoadingEkskul() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 animate-pulse">
      <div className="max-w-6xl mx-auto">
        <div className="h-8 bg-slate-800 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-slate-800 rounded w-1/2 mb-8"></div>
        <div className="h-12 bg-slate-800 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-64"
            ></div>
          ))}
        </div>
      </div>
    </main>
  );
}
