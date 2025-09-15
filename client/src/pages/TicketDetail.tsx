import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useTicketsStore } from '../store/tickets.store';
import { getUiStatus, STATUS_LABEL } from '../store/status';
import { useUsersStore } from '../store/users.store';

export const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { tickets, load, assign, unassign, markComplete, markIncomplete } = useTicketsStore();
  const users = useUsersStore();

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { void users.load(); }, []);

  const ticket = useMemo(() => tickets.find(t => String(t.id) === String(id)), [tickets, id]);
  const [assignee, setAssignee] = useState<string>('');

  if (!ticket) {
    return (
      <div className="board-wrap">
        <Link to=".." className="muted">← Back</Link>
        <p style={{ marginTop: 12 }}>Ticket not found.</p>
      </div>
    );
  }

  const ui = getUiStatus(ticket);
  const currentName = users.getName(ticket.assigneeId ?? null);

  return (
    <div className="board-wrap">
      <div className="toolbar card">
        <div className="title" style={{ alignItems: 'baseline' }}>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <Link to=".." className="muted">← Back</Link>
            <h1>Ticket #{String(ticket.id)}</h1>
          </div>
          <span className={`chip ${ui === 'unassigned' ? 'tone-unassigned' : ui === 'assigned' ? 'tone-assigned' : 'tone-resolved'}`}>
            {STATUS_LABEL[ui]}
          </span>
        </div>
      </div>

      <div className="detail-grid">
        {/* Summary */}
        <section className="card">
          <h3 style={{ marginTop:0 }}>Summary</h3>
          <p style={{ margin:0, fontSize:16 }}>{ticket.description}</p>
        </section>

        {/* Assignee */}
        <section className="card">
          <h3 style={{ marginTop:0 }}>Assignee</h3>
          <p className="muted" style={{ marginBottom:8 }}>
            Current: <strong style={{ color:'var(--text)' }}>{currentName ?? '—'}</strong>
          </p>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">(choose user)</option>
              {users.users.map(u => (
                <option key={String(u.id)} value={String(u.id)}>{u.name}</option>
              ))}
            </select>
            <button
              className="ghost"
              onClick={() => { if (assignee) assign(ticket.id, Number(assignee)); }}
            >
              Assign
            </button>
            {ui === 'assigned' && (
              <button className="ghost" onClick={() => unassign(ticket.id)}>Unassign</button>
            )}
          </div>
        </section>

        {/* Status */}
        <section className="card">
          <h3 style={{ marginTop:0 }}>Status</h3>
          <p className="muted">This ticket is currently <strong style={{ color:'var(--text)' }}>{STATUS_LABEL[ui]}</strong>.</p>
          <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
            {ui !== 'resolved' ? (
              <button className="primary" onClick={() => markComplete(ticket.id)}>Mark Resolved</button>
            ) : (
              <button className="ghost" onClick={() => markIncomplete(ticket.id)}>Reopen</button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
