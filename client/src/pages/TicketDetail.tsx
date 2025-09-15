import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchTicketById } from '../api/tickets';
import type { Ticket } from '../schemas/ticket';

export const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    fetchTicketById(id)
      .then((t) => alive && setData(t))
      .catch((e: any) => alive && setError(e?.message ?? 'Failed to load'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  return (
    <div>
      <Link to="..">← Back</Link>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {data && (
        <div style={{ marginTop: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>
            Ticket #{String(data.id)}
          </h1>
          <p><b>Description:</b> {data.description}</p>
          <p><b>AssigneeId:</b> {data.assigneeId ?? '—'}</p>
          <p><b>Completed:</b> {data.completed ? 'true' : 'false'}</p>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button disabled>Assign</button>
            <button disabled>Mark as Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
