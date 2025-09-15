import { useParams, Link } from 'react-router-dom';

export default function DetailsScreen() {
  const { id } = useParams();
  return (
    <div>
      <Link to="..">← Back</Link>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>Ticket #{id}</h1>
      {/* Bước 2 sẽ call API getById + Zod validate */}
      <div style={{ marginTop: 12 }}>
        <p>Title: ...</p>
        <p>Description: ...</p>
        <p>Status: ...</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button>Assign</button>
          <button>Mark as Done</button>
        </div>
      </div>
    </div>
  );
}
