import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'individual',
  });
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form.name, form.email, form.password, form.role);
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form onSubmit={submit} className="card w-96 space-y-4">
        <h1 className="text-2xl font-bold">Register</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          className="input"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          className="input"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="individual">Individual</option>
          <option value="organization">Organization</option>
        </select>
        <button className="btn w-full">Create account</button>
        <p className="text-slate-400 text-sm text-center">
          Have an account?{' '}
          <Link to="/" className="text-sky-400">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}