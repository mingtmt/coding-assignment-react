import { Link } from 'react-router-dom';

export default function ListScreen() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Tickets</h1>
        <button>New Ticket</button> {/* sẽ wire ở bước 3 */}
      </div>

      {/* Tạm thời placeholder; bước 2 sẽ fetch từ API */}
      <ul style={{ display: 'grid', gap: 8 }}>
        <li style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/ticket/placeholder">Sample ticket title</Link>
            <span>status: open</span>
          </div>
          <small>assignee: (none)</small>
        </li>
      </ul>
    </div>
  );
}
