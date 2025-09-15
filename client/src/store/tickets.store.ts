import { create } from "zustand";
import type { Ticket } from "../schemas/ticket";
import {
  fetchTickets,
  fetchTicketById,
  createTicket,
  assignTicket,
  unassignTicket,
  markCompleteTicket,
  markIncompleteTicket,
} from "../api/tickets";
import { getUiStatus, type UiStatus } from "./status";

type TicketState = {
  tickets: Ticket[];
  loading: boolean;
  error?: string | null;
  assigneeFilter: number | null;
};

type TicketActions = {
  load: () => Promise<void>;
  refreshOne: (id: string | number) => Promise<void>;
  add: (description: string) => Promise<void>;
  assign: (ticketId: string | number, userId: string | number) => Promise<void>;
  unassign: (ticketId: string | number) => Promise<void>;
  markComplete: (ticketId: string | number) => Promise<void>;
  markIncomplete: (ticketId: string | number) => Promise<void>;
  setAssigneeFilter: (assigneeId: number | null) => void;
  getByAssignee: (assigneeId: number | null) => Ticket[];
};

export const useTicketsStore = create<TicketState & TicketActions>(
  (set, get) => ({
    tickets: [],
    loading: false,
    error: null,
    assigneeFilter: null,

    async load() {
      set({ loading: true, error: null });
      try {
        const list = await fetchTickets();
        set({ tickets: list, loading: false });
      } catch (e: any) {
        set({ loading: false, error: e?.message ?? "Failed to load tickets" });
      }
    },

    async refreshOne(id) {
      try {
        const t = await fetchTicketById(id);
        set({ tickets: get().tickets.map((x) => (x.id === t.id ? t : x)) });
      } catch (e: any) {
        // ignore
      }
    },

    async add(description) {
      const t = await createTicket({ description });
      set({ tickets: [t, ...get().tickets] });
    },

    async assign(ticketId, userId) {
      set({
        tickets: get().tickets.map((x) =>
          String(x.id) === String(ticketId)
            ? { ...x, assigneeId: userId, completed: false }
            : x
        ),
      });
      await assignTicket(ticketId, userId);
      await get().refreshOne(ticketId);
    },

    async unassign(ticketId) {
      set({
        tickets: get().tickets.map((x) =>
          String(x.id) === String(ticketId) ? { ...x, assigneeId: null } : x
        ),
      });
      await unassignTicket(ticketId);
      await get().refreshOne(ticketId);
    },

    async markComplete(ticketId) {
      set({
        tickets: get().tickets.map((x) =>
          String(x.id) === String(ticketId) ? { ...x, completed: true } : x
        ),
      });
      await markCompleteTicket(ticketId);
      await get().refreshOne(ticketId);
    },

    async markIncomplete(ticketId) {
      set({
        tickets: get().tickets.map((x) =>
          String(x.id) === String(ticketId) ? { ...x, completed: false } : x
        ),
      });
      await markIncompleteTicket(ticketId);
      await get().refreshOne(ticketId);
    },

    setAssigneeFilter(assigneeId: number | null) {
      set({ assigneeFilter: assigneeId });
    },

    getByAssignee(assigneeId: number | null): Ticket[] {
      const list = get().tickets;
      if (assigneeId === null) return list.filter((t) => t.assigneeId == null);
      return list.filter((t) => t.assigneeId === assigneeId);
    },
  })
);

export function selectTicketsFiltered(
  s: TicketState,
  assigneeId: number | null,
): Ticket[] {
  let list = s.tickets;

  if (assigneeId !== null) {
    list = list.filter(t => t.assigneeId === assigneeId);
  }

  return list;
}
