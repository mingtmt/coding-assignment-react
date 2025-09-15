import { useEffect } from "react";
import type { Ticket } from "../schemas/ticket";
import { getUiStatus, STATUS_LABEL, type UiStatus } from "../store/status";
import { useTicketsStore } from "../store/tickets.store";
import { useUsersStore } from "../store/users.store";
import { Link } from "react-router-dom";

type TicketCardProps = {
  ticket: Ticket;
  activeAssignee?: string | number | null;
};

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  activeAssignee,
}) => {
  const { assign, unassign, markComplete, markIncomplete } = useTicketsStore();
  const users = useUsersStore();
  const status = getUiStatus(ticket);

  useEffect(() => {
    void users.load();
  }, []);

  return (
    <div>
      <div className="ticket-head">
        <Link to={`/ticket/${ticket.id}`} className="ticket-title">
          {ticket.description}
        </Link>
        <span className={`badge ${status}`}>
          {STATUS_LABEL[status as UiStatus]}
        </span>
      </div>

      <div className="ticket-meta">
        <span className="meta">
          Assignee: <strong>{users.getName(ticket.assigneeId ?? null) ?? "—"}</strong>
        </span>
        <span className="meta">ID #{String(ticket.id)}</span>
      </div>

      <div className="ticket-actions">
        {status === "unassigned" && (
          <div className="field">
            <label className="label">Assign to: </label>
            <select
              id="select-assignee"
              onChange={(e) => assign(ticket.id, Number(e.target.value))}
              aria-label="Select user to assign"
            >
              <option value="">(choose user)</option>
              {users.users.map((u) => (
                <option key={String(u.id)} value={String(u.id)}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {status === "assigned" && (
          <button className="ghost" onClick={() => unassign(ticket.id)}>
            Unassign
          </button>
        )}
        {status !== "resolved" ? (
          <button className="primary" onClick={() => markComplete(ticket.id)}>
            Resolve
          </button>
        ) : (
          <button className="ghost" onClick={() => markIncomplete(ticket.id)}>
            Reopen
          </button>
        )}
      </div>
    </div>
  );
};
