import { useEffect, useState } from 'react';
import client from '../api/client';

const empty = {
  vehicle: '',
  start: '',
  destination: '',
  distance: '',
  crisisMode: false,
};

export default function Trips() {
  const [list, setList] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const [t, v] = await Promise.all([
      client.get('/trips'),
      client.get('/vehicles'),
    ]);
    setList(t.data);
    setVehicles(v.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await client.post('/trips', {
      vehicle: form.vehicle,
      start: form.start,
      destination: form.destination,
      distance: Number(form.distance) || 0,
      crisisMode: form.crisisMode,
    });
    setForm(empty);
    load();
  };

  const remove = async (id) => {
    await client.delete(`/trips/${id}`);
    load();
  };

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={submit} className="card space-y-4">
        <h2 className="text-xl font-bold">Plan Trip</h2>
        <div>
          <label className="label">Vehicle</label>
          <select
            className="input"
            value={form.vehicle}
            onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
            required
          >
            <option value="">Select</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Start</label>
          <input
            className="input"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Destination</label>
          <input
            className="input"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Distance (km)</label>
          <input
            type="number"
            className="input"
            value={form.distance}
            onChange={(e) => setForm({ ...form, distance: e.target.value })}
            required
          />
        </div>
        <label className="flex items-center gap-2 text-slate-300 text-sm">
          <input
            type="checkbox"
            checked={form.crisisMode}
            onChange={(e) => setForm({ ...form, crisisMode: e.target.checked })}
          />
          Crisis Mode
        </label>
        <button className="btn w-full">Create Trip</button>
      </form>

      <div className="lg:col-span-2 card">
        <h2 className="text-xl font-bold mb-4">Trips</h2>
        {list.length === 0 ? (
          <p className="text-slate-400">No trips yet</p>
        ) : (
          <table className="w-full text-left">
            <thead className="text-slate-400 text-sm">
              <tr>
                <th className="pb-2">Route</th>
                <th className="pb-2">km</th>
                <th className="pb-2">Fuel (L)</th>
                <th className="pb-2">Time (min)</th>
                <th className="pb-2">Mode</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t._id} className="border-t border-slate-700">
                  <td className="py-2">
                    {t.start} → {t.destination}
                  </td>
                  <td>{t.distance.toFixed(1)}</td>
                  <td>{t.estimatedFuel.toFixed(2)}</td>
                  <td>{t.estimatedTime.toFixed(0)}</td>
                  <td>
                    {t.crisisMode ? (
                      <span className="text-red-400">Crisis</span>
                    ) : (
                      <span className="text-slate-400">Normal</span>
                    )}
                  </td>
                  <td className="text-right">
                    <button onClick={() => remove(t._id)} className="btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}