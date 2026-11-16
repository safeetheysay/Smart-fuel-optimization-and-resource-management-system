export default function StatCard({ label, value }) {
  return (
    <div className="card">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}