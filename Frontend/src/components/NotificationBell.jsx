import { useEffect, useState } from 'react';
import client from '../api/client';

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await client.get('/notifications');
    setItems(data);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const markRead = async (id) => {
    await client.put(`/notifications/${id}/read`);
    load();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-slate-300 hover:text-white"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-auto">
          {items.length === 0 && (
            <p className="p-4 text-slate-400 text-sm">No notifications</p>
          )}
          {items.map((n) => (
            <div
              key={n._id}
              onClick={() => markRead(n._id)}
              className={`p-3 border-b border-slate-700 cursor-pointer text-sm ${
                n.read ? 'text-slate-400' : 'text-white'
              }`}
            >
              {n.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}