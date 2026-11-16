import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      nav('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <form onSubmit={submit} className="card w-96 space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn w-full">Sign in</button>
        <p className="text-slate-400 text-sm text-center">
          No account?{' '}
          <Link to="/register" className="text-sky-400">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}