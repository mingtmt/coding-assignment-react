import { useEffect, useMemo, useState, useCallback } from "react";
import { useTicketsStore, selectTicketsFiltered } from "../store/tickets.store";
import { useUsersStore } from "../store/users.store";
import { getUiStatus } from "../store/status";
import { TicketCard } from "../components/TicketCard";
import { CreateModal } from "../components/CreateModal";

type ColumnKey = "unassigned" | "assigned" | "resolved";

const COLUMNS: { key: ColumnKey; title: string }[] = [
  { key: "unassigned", title: "Unassigned" },
  { key: "assigned", title: "Assigned" },
  { key: "resolved", title: "Resolved" },
];

export const TicketsList = () => {
  const {
    tickets,
    loading,
    error,
    load,
    assign,
    unassign,
    markComplete,
    markIncomplete,
    assigneeFilter,
    setAssigneeFilter,
  } = useTicketsStore();

  const users = useUsersStore();

  // load data
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { void users.load(); }, []);

  // UI state
  const [activeAssignee, setActiveAssignee] = useState<string>("")
  const [dragId, setDragId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"none" | "az" | "za">("none");
  const [openModal, setOpenModal] = useState(false);

  // 1) Lọc theo assignee từ store (KHÔNG ghi đè tickets)
  const listByAssignee = useMemo(
    () => selectTicketsFiltered(useTicketsStore.getState(), assigneeFilter),
    [tickets, assigneeFilter]
  );

  // 2) Search + Sort trên kết quả đã lọc theo assignee
  const filtered = useMemo(() => {
    const base = q
      ? listByAssignee.filter((t) =>
          t.description.toLowerCase().includes(q.toLowerCase())
        )
      : listByAssignee.slice();

    if (sort === "az") base.sort((a, b) => a.description.localeCompare(b.description));
    if (sort === "za") base.sort((a, b) => b.description.localeCompare(a.description));
    return base;
  }, [listByAssignee, q, sort]);

  // 3) Group theo status cho kanban
  const grouped = useMemo(() => {
    const map: Record<ColumnKey, typeof filtered> = {
      unassigned: [],
      assigned: [],
      resolved: [],
    };
    for (const t of filtered) map[getUiStatus(t)].push(t);
    return map;
  }, [filtered]);

  // Counters (tính trên toàn bộ tickets, không theo filter)
  const counters = useMemo(
    () => ({
      total: tickets.length,
      unassigned: tickets.filter((t) => getUiStatus(t) === "unassigned").length,
      assigned: tickets.filter((t) => getUiStatus(t) === "assigned").length,
      resolved: tickets.filter((t) => getUiStatus(t) === "resolved").length,
    }),
    [tickets]
  );

  // DnD handlers
  const onDragStart = (id: string | number) => setDragId(String(id));
  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  const onDropTo = useCallback(
    async (col: ColumnKey) => {
      if (!dragId) return;

      const t = tickets.find((x) => String(x.id) === dragId);
      if (!t) return;

      const from = getUiStatus(t);
      if (from === col) {
        setDragId(null);
        return;
      }

      try {
        // Nếu kéo từ resolved sang cột khác → reopen (markIncomplete) trước
        if (from === "resolved" && col !== "resolved") {
          await markIncomplete(t.id);
        }

        if (col === "unassigned") {
          await unassign(t.id);
        } else if (col === "assigned") {
          const chosen = activeAssignee ? Number(activeAssignee) : null;
          if (chosen == null) {
            const el = document.getElementById("activeAssigneeSel");
            el?.classList.add("shake");
            setTimeout(() => el?.classList.remove("shake"), 500);
            return;
          }
          await assign(t.id, chosen);
        } else if (col === "resolved") {
          await markComplete(t.id);
        }
      } finally {
        setDragId(null);
      }
    },
    [dragId, tickets, activeAssignee, assign, unassign, markComplete, markIncomplete]
  );

  if (loading) return <p className="muted">Loading…</p>;
  if (error)   return <p className="error">{error}</p>;

  return (
    <div className="board-wrap">
      {/* Top bar */}
      <div className="toolbar card">
        <div className="title">
          <div className="chips">
            <span className="chip">Total {counters.total}</span>
            <span className="badge unassigned">Unassigned {counters.unassigned}</span>
            <span className="badge assigned">Assigned {counters.assigned}</span>
            <span className="badge resolved">Resolved {counters.resolved}</span>
          </div>
        </div>

        <div className="controls">
          {/* Search */}
          <div className="field">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search description…"
              aria-label="Search tickets"
            />
          </div>

          <div className="field">
            <label className="label">Filter by assignee:</label>
            <select
              value={assigneeFilter === null ? "" : String(assigneeFilter)}
              onChange={(e) => {
                const v = e.target.value;
                setAssigneeFilter(v === "" ? null : Number(v));
              }}
              aria-label="Filter by assignee"
            >
              <option value="">(all)</option>
              <option value="__noassignee" disabled>──</option>
              {users.users.map((u) => (
                <option key={String(u.id)} value={String(u.id)}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="field">
            <label className="label">Sort by:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              aria-label="Sort"
            >
              <option value="none">None</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>

          <div className="spacer" />
          <button className="primary" onClick={() => setOpenModal(true)}>+ New Ticket</button>
        </div>
      </div>

      {/* Kanban grid */}
      <div className="board-grid">
        {COLUMNS.map((col) => (
          <section
            key={col.key}
            className="column"
            onDragOver={allowDrop}
            onDrop={() => onDropTo(col.key)}
            aria-label={`${col.title} column`}
          >
            <header className="column-header">
              <h2>{col.title}</h2>
              <span className="count">{grouped[col.key].length}</span>
            </header>

            <ul className="column-list">
              {grouped[col.key].map((t) => (
                <li
                  key={String(t.id)}
                  className={`card ticket ${dragId === String(t.id) ? "dragging" : ""}`}
                  draggable
                  onDragStart={() => onDragStart(t.id)}
                >
                  <TicketCard ticket={t} activeAssignee={activeAssignee} />
                </li>
              ))}
            </ul>

            {grouped[col.key].length === 0 && (
              <div className="empty">
                <p>No tickets</p>
                <small>Drag here to move tickets</small>
              </div>
            )}
          </section>
        ))}
      </div>

      {openModal && (
        <CreateModal openModal={openModal} setOpenModal={setOpenModal} />
      )}
    </div>
  );
};
