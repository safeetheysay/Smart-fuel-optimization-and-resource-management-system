import { useEffect, useState } from 'react';
import client from '../api/client';

const empty = { name: '', fuelEfficiency: '', tankCapacity: '', fuelType: 'Petrol' };

export default function Vehicles() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const { data } = await client.get('/vehicles');
    setList(data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      fuelEfficiency: Number(form.fuelEfficiency),
      tankCapacity: Number(form.tankCapacity),
      fuelType: form.fuelType,
    };
    if (editing) {
      await client.put(`/vehicles/${editing}`, payload);
    } else {
      await client.post('/vehicles', payload);
    }
    setForm(empty);
    setEditing(null);
    load();
  };

  const edit = (v) => {
    setEditing(v._id);
    setForm({
      name: v.name,
      fuelEfficiency: v.fuelEfficiency,
      tankCapacity: v.tankCapacity,
      fuelType: v.fuelType,
    });
  };

  const remove = async (id) => {
    await client.delete(`/vehicles/${id}`);
    load();
  };

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={submit} className="card space-y-4">
        <h2 className="text-xl font-bold">
          {editing ? 'Edit Vehicle' : 'Add Vehicle'}
        </h2>
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Fuel Efficiency (km/L)</label>
          <input
            className="input"
            type="number"
            step="0.1"
            value={form.fuelEfficiency}
            onChange={(e) => setForm({ ...form, fuelEfficiency: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Tank Capacity (L)</label>
          <input
            className="input"
            type="number"
            step="0.1"
            value={form.tankCapacity}
            onChange={(e) => setForm({ ...form, tankCapacity: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Fuel Type</label>
          <select
            className="input"
            value={form.fuelType}
            onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
          >
            <option>Petrol</option>
            <option>Diesel</option>
            <option>CNG</option>
            <option>Electric</option>
          </select>
        </div>
        <button className="btn w-full">{editing ? 'Update' : 'Add'}</button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm(empty);
            }}
            className="btn-ghost w-full"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="lg:col-span-2 card">
        <h2 className="text-xl font-bold mb-4">My Vehicles</h2>
        {list.length === 0 ? (
          <p className="text-slate-400">No vehicles yet</p>
        ) : (
          <table className="w-full text-left">
            <thead className="text-slate-400 text-sm">
              <tr>
                <th className="pb-2">Name</th>
                <th className="pb-2">km/L</th>
                <th className="pb-2">Tank (L)</th>
                <th className="pb-2">Type</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((v) => (
                <tr key={v._id} className="border-t border-slate-700">
                  <td className="py-2">{v.name}</td>
                  <td>{v.fuelEfficiency}</td>
                  <td>{v.tankCapacity}</td>
                  <td>{v.fuelType}</td>
                  <td className="space-x-2 text-right">
                    <button onClick={() => edit(v)} className="btn-ghost">
                      Edit
                    </button>
                    <button onClick={() => remove(v._id)} className="btn-danger">
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