import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchTickets } from '../api/tickets';
import type { Ticket } from '../schemas/ticket';
import { type UiStatus } from '../store/status';

const TABS: { key: 'all' | UiStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'resolved', label: 'Resolved' },
];


export const TicketsList = () => {
  const [data, setData] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchTickets()
      .then((list) => alive && setData(list))
      .catch((e: any) => alive && setError(e?.message ?? 'Failed to load'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Tickets</h1>
        <button disabled>New Ticket</button>
      </div>

      {data.length === 0 ? (
        <p>No tickets.</p>
      ) : (
        <ul style={{ display: 'grid', gap: 8 }}>
          {data.map((t) => (
            <li
              key={String(t.id)}
              style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 12 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Link to={`/ticket/${t.id}`}>{t.description}</Link>
                <span>
                  completed: {t.completed ? 'true' : 'false'}
                </span>
              </div>
              <small>
                assigneeId: {t.assigneeId ?? '—'}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
