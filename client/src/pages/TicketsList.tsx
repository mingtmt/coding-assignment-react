import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useTicketsStore } from "../store/tickets.store";
import { useUsersStore } from "../store/users.store";
import { useThemeStore } from "../store/theme.store";
import { getUiStatus, STATUS_LABEL, type UiStatus } from "../store/status";
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
  } = useTicketsStore();
  const users = useUsersStore();
  const { theme, toggle } = useThemeStore();

  // load data
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    void users.load();
  }, []);

  // UI state
  const [activeAssignee, setActiveAssignee] = useState<string>("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [q, setQ] = useState(""); // search
  const [sort, setSort] = useState<"recent" | "az" | "za">("recent");
  const [openModal, setOpenModal] = useState(false);

  // derived: search + sort
  const filtered = useMemo(() => {
    const list = q
      ? tickets.filter((t) =>
          t.description.toLowerCase().includes(q.toLowerCase())
        )
      : tickets.slice();

    if (sort === "az")
      list.sort((a, b) => a.description.localeCompare(b.description));
    if (sort === "za")
      list.sort((a, b) => b.description.localeCompare(a.description));

    return list;
  }, [tickets, q, sort]);

  // grouped by status
  const grouped = useMemo(() => {
    const map: Record<ColumnKey, typeof filtered> = {
      unassigned: [],
      assigned: [],
      resolved: [],
    };
    for (const t of filtered) map[getUiStatus(t)].push(t);
    return map;
  }, [filtered]);

  // counters numbers tickets of each status
  const counters = useMemo(
    () => ({
      total: tickets.length,
      unassigned: tickets.filter((t) => getUiStatus(t) === "unassigned").length,
      assigned: tickets.filter((t) => getUiStatus(t) === "assigned").length,
      resolved: tickets.filter((t) => getUiStatus(t) === "resolved").length,
    }),
    [tickets]
  );

  // dnd handlers
  const onDragStart = (id: string | number) => setDragId(String(id));
  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  const onDropTo = useCallback(
    async (col: ColumnKey) => {
      if (!dragId) return;
      const t = tickets.find((x) => String(x.id) === dragId);
      if (!t) return;

      const current = getUiStatus(t);
      if (current === col) {
        setDragId(null);
        return;
      }

      try {
        if (col === "unassigned") {
          if (t.completed) await markIncomplete(t.id);
          await unassign(t.id);
        } else if (col === "assigned") {
          const chosen = activeAssignee ? Number(activeAssignee) : null;
          if (chosen == null) {
            const el = document.getElementById("activeAssigneeSel");
            el?.classList.add("shake");
            setTimeout(() => el?.classList.remove("shake"), 500);
            return;
          }
          if (t.completed) await markIncomplete(t.id);
          await assign(t.id, chosen);
        } else if (col === "resolved") {
          await markComplete(t.id);
        }
      } finally {
        setDragId(null);
      }
    },
    [
      dragId,
      tickets,
      activeAssignee,
      assign,
      unassign,
      markComplete,
      markIncomplete,
    ]
  );

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="board-wrap">
      {/* Top bar */}
      <div className="toolbar card">
        <div className="title">
          <h1>Tickets</h1>
          <div className="chips">
            <span className="chip">Total {counters.total}</span>
            <span className="chip tone-unassigned">
              Unassigned {counters.unassigned}
            </span>
            <span className="chip tone-assigned">
              Assigned {counters.assigned}
            </span>
            <span className="chip tone-resolved">
              Resolved {counters.resolved}
            </span>
          </div>
          <button className="ghost" onClick={toggle}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="controls">
          <div className="field">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search description…"
              aria-label="Search tickets"
            />
          </div>

          <div className="field">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              aria-label="Sort"
            >
              <option value="recent">Recent</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Active assignee</label>
            <select
              id="activeAssigneeSel"
              value={activeAssignee}
              onChange={(e) => setActiveAssignee(e.target.value)}
              aria-label="Active assignee"
            >
              <option value="">(choose user)</option>
              {users.users.map((u) => (
                <option key={String(u.id)} value={String(u.id)}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="spacer" />
          <button className="primary" onClick={() => setOpenModal(true)}>
            + New Ticket
          </button>
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
              {grouped[col.key].map((t) => {
                const status = getUiStatus(t);
                const name = users.getName(t.assigneeId ?? null);
                return (
                  <li
                    key={String(t.id)}
                    className={`card ticket ${
                      dragId === String(t.id) ? "dragging" : ""
                    }`}
                    draggable
                    onDragStart={() => onDragStart(t.id)}
                  >
                    <TicketCard
                      ticket={t}
                      assignee={name}
                      activeAssignee={activeAssignee}
                    />
                  </li>
                );
              })}
            </ul>

            {/* Empty tickets */}
            {grouped[col.key].length === 0 && (
              <div className="empty">
                <p>No tickets</p>
                <small>Drag here to move tickets</small>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* CREATE MODAL */}
      {openModal && <CreateModal openModal={openModal} setOpenModal={setOpenModal} />}
    </div>
  );
};
