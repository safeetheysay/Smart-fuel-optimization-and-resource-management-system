import { useEffect, useState } from 'react';
import client from '../api/client';

const empty = { vehicle: '', date: '', quantity: '', cost: '' };

export default function FuelRecords() {
  const [list, setList] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const [f, v] = await Promise.all([
      client.get('/fuel'),
      client.get('/vehicles'),
    ]);
    setList(f.data);
    setVehicles(v.data);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      vehicle: form.vehicle,
      date: form.date || undefined,
      quantity: Number(form.quantity),
      cost: Number(form.cost),
    };
    if (editing) {
      await client.put(`/fuel/${editing}`, payload);
    } else {
      await client.post('/fuel', payload);
    }
    setForm(empty);
    setEditing(null);
    load();
  };

  const edit = (r) => {
    setEditing(r._id);
    setForm({
      vehicle: r.vehicle?._id || '',
      date: r.date ? r.date.slice(0, 10) : '',
      quantity: r.quantity,
      cost: r.cost,
    });
  };

  const remove = async (id) => {
    await client.delete(`/fuel/${id}`);
    load();
  };

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={submit} className="card space-y-4">
        <h2 className="text-xl font-bold">
          {editing ? 'Edit Record' : 'Add Fuel Record'}
        </h2>
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
          <label className="label">Date</label>
          <input
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Quantity (L)</label>
          <input
            type="number"
            step="0.1"
            className="input"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Cost (Rs)</label>
          <input
            type="number"
            step="0.1"
            className="input"
            value={form.cost}
            onChange={(e) => setForm({ ...form, cost: e.target.value })}
            required
          />
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
        <h2 className="text-xl font-bold mb-4">Fuel History</h2>
        {list.length === 0 ? (
          <p className="text-slate-400">No records yet</p>
        ) : (
          <table className="w-full text-left">
            <thead className="text-slate-400 text-sm">
              <tr>
                <th className="pb-2">Date</th>
                <th className="pb-2">Vehicle</th>
                <th className="pb-2">Liters</th>
                <th className="pb-2">Cost (Rs)</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r._id} className="border-t border-slate-700">
                  <td className="py-2">
                    {new Date(r.date).toISOString().slice(0, 10)}
                  </td>
                  <td>{r.vehicle?.name}</td>
                  <td>{r.quantity}</td>
                  <td>{r.cost}</td>
                  <td className="space-x-2 text-right">
                    <button onClick={() => edit(r)} className="btn-ghost">
                      Edit
                    </button>
                    <button onClick={() => remove(r._id)} className="btn-danger">
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