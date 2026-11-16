import { useEffect, useState } from 'react';
import client from '../api/client';

export default function CrisisMode() {
  const [notifs, setNotifs] = useState([]);

  const load = async () => {
    const { data } = await client.get('/notifications');
    setNotifs(data);
  };

  useEffect(() => {
    load();
  }, []);

  const crisis = notifs.filter((n) => n.type === 'crisis');

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-red-400">Crisis Mode</h1>

      <div className="card space-y-3">
        <h2 className="text-xl font-bold">Recommended Actions</h2>
        <ul className="list-disc pl-6 text-slate-300 space-y-2">
          <li>Combine multiple trips into a single route.</li>
          <li>Avoid non-essential travel.</li>
          <li>Maintain optimal tire pressure and reduce load.</li>
          <li>Use fuel-efficient routing (avoid traffic, uphill detours).</li>
          <li>Prioritize critical tasks only during shortages.</li>
        </ul>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-3">Crisis Notifications</h2>
        {crisis.length === 0 ? (
          <p className="text-slate-400">No crisis events yet</p>
        ) : (
          crisis.map((n) => (
            <div
              key={n._id}
              className="border-b border-slate-700 py-2 text-sm text-red-300"
            >
              {n.message}
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-3">How It Works</h2>
        <p className="text-slate-300 text-sm">
          When a trip is planned with Crisis Mode enabled, the system boosts
          effective fuel efficiency by 15% (assumes smarter routing and combined
          trips), lowers estimated fuel use, and logs a crisis notification for
          you.
        </p>
      </div>
    </div>
  );
}