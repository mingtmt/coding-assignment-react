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

export type Filter = "all" | UiStatus;

type TicketState = {
  tickets: Ticket[];
  loading: boolean;
  error?: string | null;
  filter: Filter;
};

type TicketActions = {
  load: () => Promise<void>;
  refreshOne: (id: string | number) => Promise<void>;
  setFilter: (f: Filter) => void;
  add: (description: string) => Promise<void>;
  assign: (ticketId: string | number, userId: string | number) => Promise<void>;
  unassign: (ticketId: string | number) => Promise<void>;
  markComplete: (ticketId: string | number) => Promise<void>;
  markIncomplete: (ticketId: string | number) => Promise<void>;
};

export const useTicketsStore = create<TicketState & TicketActions>((set, get) => ({
  tickets: [],
  loading: false,
  error: null,
  filter: "all",

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

  setFilter(f) {
    set({ filter: f });
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
    set({tickets: get().tickets.map(x => String(x.id) === String(ticketId) ? {...x, completed: true} :x)});
    await markCompleteTicket(ticketId);
    await get().refreshOne(ticketId);
  },

  async markIncomplete(ticketId) {
    set({tickets: get().tickets.map(x => String(x.id) === String(ticketId) ? {...x, completed: false} : x)});
    await markIncompleteTicket(ticketId);
    await get().refreshOne(ticketId);
  }
}));

export const selectFilteredTickets = (s: TicketState): Ticket[] => {
  if (s.filter === "all") return s.tickets;
  return s.tickets.filter((t) => getUiStatus(t) === s.filter);
}
