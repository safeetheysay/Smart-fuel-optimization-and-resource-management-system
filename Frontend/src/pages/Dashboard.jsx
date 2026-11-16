import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import client from '../api/client';
import StatCard from '../components/StatCard';

const COLORS = ['#38bdf8', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({ from: '', to: '', vehicle: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    client.get('/vehicles').then((r) => setVehicles(r.data));
  }, []);

  const load = async () => {
    setLoading(true);
    const params = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.vehicle) params.vehicle = filters.vehicle;
    const { data } = await client.get('/analytics/summary', { params });
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filters]);

  const reset = () => setFilters({ from: '', to: '', vehicle: '' });

  const quickRange = (days) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setFilters({
      ...filters,
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    });
  };

  if (!stats) return <div className="p-8 text-slate-400">Loading...</div>;

  const monthly = Object.entries(stats.byMonth).map(([month, cost]) => ({
    month,
    cost,
  }));

  const perVehicle = Object.entries(stats.byVehicle).map(([name, v]) => ({
    name,
    liters: v.liters,
    cost: v.cost,
  }));

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {loading && <span className="text-slate-400 text-sm">Loading…</span>}
      </div>

      <div className="card space-y-4">
        <h2 className="text-xl font-bold">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">From</label>
            <input
              type="date"
              className="input"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            />
          </div>
          <div>
            <label className="label">To</label>
            <input
              type="date"
              className="input"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Vehicle</label>
            <select
              className="input"
              value={filters.vehicle}
              onChange={(e) =>
                setFilters({ ...filters, vehicle: e.target.value })
              }
            >
              <option value="">All vehicles</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={() => quickRange(30)} className="btn-ghost flex-1">
              30d
            </button>
            <button onClick={() => quickRange(90)} className="btn-ghost flex-1">
              90d
            </button>
            <button onClick={reset} className="btn-ghost flex-1">
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Cost (Rs)" value={stats.totalCost.toFixed(0)} />
        <StatCard label="Total Liters" value={stats.totalLiters.toFixed(1)} />
        <StatCard
          label="Total Distance (km)"
          value={stats.totalDistance.toFixed(0)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl mb-4">Monthly Spending</h2>
          {monthly.length === 0 ? (
            <p className="text-slate-400">No data for this range</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthly}>
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none' }}
                />
                <Bar dataKey="cost" fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl mb-4">Fuel per Vehicle (L)</h2>
          {perVehicle.length === 0 ? (
            <p className="text-slate-400">No data for this range</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={perVehicle}
                  dataKey="liters"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {perVehicle.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl mb-4">Per Vehicle Breakdown</h2>
        {perVehicle.length === 0 ? (
          <p className="text-slate-400">No data for this range</p>
        ) : (
          <table className="w-full text-left">
            <thead className="text-slate-400 text-sm">
              <tr>
                <th className="pb-2">Vehicle</th>
                <th className="pb-2">Liters</th>
                <th className="pb-2">Cost (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {perVehicle.map((v) => (
                <tr key={v.name} className="border-t border-slate-700">
                  <td className="py-2">{v.name}</td>
                  <td>{v.liters.toFixed(1)}</td>
                  <td>{v.cost.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}