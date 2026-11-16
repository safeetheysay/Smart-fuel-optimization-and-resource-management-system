import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Budget() {
  const [user, setUser] = useState(null);
  const [budget, setBudget] = useState('');
  const [stats, setStats] = useState(null);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    const [u, s] = await Promise.all([
      client.get('/users/me'),
      client.get('/analytics/summary'),
    ]);
    setUser(u.data);
    setBudget(u.data.monthlyBudget || '');
    setStats(s.data);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    await client.put('/users/me', { monthlyBudget: Number(budget) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    load();
  };

  if (!user || !stats) return <div className="p-8 text-slate-400">Loading...</div>;

  const currentMonth = new Date().toISOString().slice(0, 7);
  const spent = stats.byMonth[currentMonth] || 0;
  const limit = user.monthlyBudget || 0;
  const pct = limit ? Math.min((spent / limit) * 100, 100) : 0;
  const over = limit && spent > limit;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Budget</h1>

      <form onSubmit={save} className="card space-y-4">
        <div>
          <label className="label">Monthly Fuel Budget (Rs)</label>
          <input
            type="number"
            className="input"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 10000"
            required
          />
        </div>
        <button className="btn w-full">Save Budget</button>
        {saved && <p className="text-green-400 text-sm">Saved</p>}
      </form>

      <div className="card space-y-4">
        <h2 className="text-xl font-bold">This Month</h2>
        <p className="text-slate-400 text-sm">
          Spent: Rs {spent.toFixed(0)} / Rs {limit || '—'}
        </p>
        <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
          <div
            className={`h-4 ${over ? 'bg-red-500' : 'bg-sky-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {over ? (
          <p className="text-red-400 text-sm">
            Budget exceeded by Rs {(spent - limit).toFixed(0)}
          </p>
        ) : (
          <p className="text-slate-400 text-sm">
            Remaining: Rs {Math.max(limit - spent, 0).toFixed(0)}
          </p>
        )}
      </div>
    </div>
  );
}