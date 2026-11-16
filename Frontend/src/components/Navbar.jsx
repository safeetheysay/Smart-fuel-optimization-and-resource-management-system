import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav('/');
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="text-xl font-bold text-white">
          FuelOpt
        </Link>
        {user && (
          <div className="flex gap-4 text-slate-300 text-sm">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/vehicles">Vehicles</Link>
            <Link to="/fuel">Fuel</Link>
            <Link to="/trips">Trips</Link>
            <Link to="/map">Map</Link>
            <Link to="/budget">Budget</Link>
            <Link to="/crisis">Crisis</Link>
          </div>
        )}
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">{user.name}</span>
          <button onClick={handleLogout} className="btn-ghost">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}