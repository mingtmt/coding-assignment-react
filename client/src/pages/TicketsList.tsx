import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTicketsStore, selectFilteredTickets } from "../store/tickets.store";
import { getUiStatus, type UiStatus, STATUS_LABEL } from "../store/status";

const TABS: { key: "all" | UiStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unassigned", label: "Unassigned" },
  { key: "assigned", label: "Assigned" },
  { key: "resolved", label: "Resolved" },
];

export const TicketsList = () => {
  const {
    tickets,
    loading,
    error,
    filter,
    setFilter,
    load,
    add,
    assign,
    unassign,
    markComplete,
    markIncomplete,
  } = useTicketsStore();

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () => selectFilteredTickets(useTicketsStore.getState()),
    [tickets, filter]
  );

  const [newDesc, setNewDesc] = useState("");
  const [newAssignee, setNewAssignee] = useState<number | "">("");

  if (loading) return <p>Loading…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Tickets</h1>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await add(newDesc.trim());
            setNewDesc("");
            setNewAssignee("");
          }}
          style={{ display: "flex", gap: 8 }}
        >
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="New ticket description"
          />
          <input
            value={newAssignee}
            onChange={(e) =>
              setNewAssignee(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            placeholder="assigneeId (optional)"
          />
          <button type="submit" disabled={!newDesc.trim()}>
            Add
          </button>
        </form>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #ddd",
              background: filter === t.key ? "#111" : "#fff",
              color: filter === t.key ? "#fff" : "#111",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p>No tickets.</p>
      ) : (
        <ul style={{ display: "grid", gap: 8 }}>
          {filtered.map((t) => {
            const ui = getUiStatus(t);
            return (
              <li
                key={String(t.id)}
                style={{
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Link to={`/ticket/${t.id}`}>{t.description}</Link>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "2px 8px",
                      borderRadius: 999,
                      border: "1px solid #ddd",
                      textTransform: "capitalize",
                    }}
                  >
                    {STATUS_LABEL[ui]}
                  </span>
                </div>
                <small>
                  assigneeId: {t.assigneeId ?? "—"} • completed:{" "}
                  {String(t.completed)}
                </small>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {ui !== "assigned" && (
                    <button onClick={() => assign(t.id, 1)}>
                      Assign to #1
                    </button>
                  )}
                  {ui === "assigned" && (
                    <button onClick={() => unassign(t.id)}>Unassign</button>
                  )}
                  {ui !== "resolved" ? (
                    <button onClick={() => markComplete(t.id)}>
                      Mark Resolved
                    </button>
                  ) : (
                    <button onClick={() => markIncomplete(t.id)}>Reopen</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
