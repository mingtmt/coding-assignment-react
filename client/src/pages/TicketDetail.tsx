import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTicketsStore } from "../store/tickets.store";
import { getUiStatus, STATUS_LABEL } from "../store/status";

export const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { tickets, load, assign, unassign, markComplete, markIncomplete } =
    useTicketsStore();

  useEffect(() => {
    void load();
  }, [load]);

  const ticket = useMemo(
    () => tickets.find((t) => String(t.id) === String(id)),
    [tickets, id]
  );
  const [assignee, setAssignee] = useState<number | "">("");

  if (!ticket) {
    return (
      <div>
        <Link to="..">← Back</Link>
        <p style={{ marginTop: 12 }}>Ticket not found.</p>
      </div>
    );
  }

  const ui = getUiStatus(ticket);

  return (
    <div>
      <Link to="..">← Back</Link>

      <div style={{ marginTop: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>
          Ticket #{String(ticket.id)}
        </h1>
        <p>
          <b>Description:</b> {ticket.description}
        </p>
        <p>
          <b>AssigneeId:</b> {ticket.assigneeId ?? "—"}
        </p>
        <p>
          <b>Status:</b> {STATUS_LABEL[ui]}
        </p>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            value={assignee}
            onChange={(e) =>
              setAssignee(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="assigneeId"
          />
          <button
            onClick={() =>
              assignee === "" ? null : assign(ticket.id, Number(assignee))
            }
          >
            Assign
          </button>
          {ui === "assigned" && (
            <button onClick={() => unassign(ticket.id)}>Unassign</button>
          )}
          {ui !== "resolved" ? (
            <button onClick={() => markComplete(ticket.id)}>Mark Resolved</button>
          ) : (
            <button onClick={() => markIncomplete(ticket.id)}>Reopen</button>
          )}
        </div>
      </div>
    </div>
  );
};
