import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import client from '../api/client';

const startIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const endIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapView() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicle, setVehicle] = useState('');
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [route, setRoute] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [result, setResult] = useState(null);
  const [crisisMode, setCrisisMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/vehicles').then((r) => setVehicles(r.data));
  }, []);

  const pick = (coord) => {
    setError('');
    setResult(null);
    setRoute(null);
    setAlternatives([]);
    if (!start) setStart(coord);
    else if (!end) setEnd(coord);
    else {
      setStart(coord);
      setEnd(null);
    }
  };

  const calculate = async () => {
    if (!vehicle || !start || !end) return;
    setLoading(true);
    setError('');

    try {
      const { data: routeData } = await client.get('/route', {
        params: {
          startLat: start.lat,
          startLng: start.lng,
          endLat: end.lat,
          endLng: end.lng,
        },
      });

      setRoute(routeData.best.geometry);
      setAlternatives(routeData.alternatives);

      const { data: trip } = await client.post('/trips', {
        vehicle,
        start: `${start.lat.toFixed(3)}, ${start.lng.toFixed(3)}`,
        destination: `${end.lat.toFixed(3)}, ${end.lng.toFixed(3)}`,
        distance: routeData.best.distance,
        duration: routeData.best.duration,
        crisisMode,
      });

      setResult({
        ...trip,
        duration: routeData.best.duration,
        alternatives: routeData.alternatives.length,
      });
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not calculate route');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStart(null);
    setEnd(null);
    setRoute(null);
    setAlternatives([]);
    setResult(null);
    setError('');
  };

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card space-y-4">
        <h2 className="text-xl font-bold">Plan on Map</h2>

        <div>
          <label className="label">Vehicle</label>
          <select
            className="input"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
          >
            <option value="">Select</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name} — {v.fuelEfficiency} km/L
              </option>
            ))}
          </select>
        </div>

        <p className="text-slate-400 text-sm">
          Click the map to set {!start ? 'START' : !end ? 'END' : 'new START'}.
        </p>

        {start && (
          <p className="text-sm text-green-400">
            Start: {start.lat.toFixed(4)}, {start.lng.toFixed(4)}
          </p>
        )}
        {end && (
          <p className="text-sm text-red-400">
            End: {end.lat.toFixed(4)}, {end.lng.toFixed(4)}
          </p>
        )}

        <label className="flex items-center gap-2 text-slate-300 text-sm">
          <input
            type="checkbox"
            checked={crisisMode}
            onChange={(e) => setCrisisMode(e.target.checked)}
          />
          Crisis Mode
        </label>

        <button
          onClick={calculate}
          className="btn w-full"
          disabled={!vehicle || !start || !end || loading}
        >
          {loading ? 'Calculating…' : 'Calculate Route'}
        </button>

        <button onClick={reset} className="btn-ghost w-full">
          Reset
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {result && (
          <div className="mt-4 p-4 bg-slate-700 rounded-lg text-sm space-y-1">
            <p className="text-slate-300 font-bold mb-2">Route</p>
            <p>Distance: {result.distance.toFixed(2)} km</p>
            <p>Fuel: {result.estimatedFuel.toFixed(2)} L</p>
            <p>Time: {result.duration.toFixed(0)} min</p>
            <p className="text-slate-400 text-xs">
              {result.alternatives} alternative route
              {result.alternatives === 1 ? '' : 's'} found
            </p>
            {result.crisisMode && (
              <p className="text-red-400">
                Crisis Mode applied (+15% efficiency)
              </p>
            )}
          </div>
        )}
      </div>

      <div
        className="lg:col-span-2 card p-0 overflow-hidden"
        style={{ height: 600 }}
      >
        <MapContainer
          center={[30.3753, 69.3451]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={pick} />

          {start && (
            <Marker position={[start.lat, start.lng]} icon={startIcon}>
              <Popup>Start</Popup>
            </Marker>
          )}
          {end && (
            <Marker position={[end.lat, end.lng]} icon={endIcon}>
              <Popup>Destination</Popup>
            </Marker>
          )}

          {alternatives.map((alt, i) => (
            <Polyline
              key={i}
              positions={alt.geometry}
              pathOptions={{ color: '#64748b', weight: 3, dashArray: '6 6' }}
            />
          ))}

          {route && (
            <Polyline
              positions={route}
              pathOptions={{ color: '#38bdf8', weight: 5 }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}