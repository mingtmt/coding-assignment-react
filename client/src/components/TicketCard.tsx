import type { Ticket } from "../schemas/ticket";
import { getUiStatus, STATUS_LABEL, type UiStatus } from "../store/status";
import { useTicketsStore } from "../store/tickets.store";
import { Link } from "react-router-dom";

type TicketCardProps = {
  ticket: Ticket;
  assignee: string | null;
  activeAssignee?: string | number | null;
};

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, assignee, activeAssignee }) => {
  const { assign, unassign, markComplete, markIncomplete } = useTicketsStore();
  const status = getUiStatus(ticket);
  
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
          Assignee: <strong>{assignee ?? "—"}</strong>
        </span>
        <span className="meta">ID #{String(ticket.id)}</span>
      </div>

      <div className="ticket-actions">
        {status !== "assigned" && (
          <button
            className="ghost"
            onClick={() =>
              assign(ticket.id, activeAssignee ? Number(activeAssignee) : 1)
            }
          >
            Assign
          </button>
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
