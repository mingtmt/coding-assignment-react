import { http } from "./client";
import { TicketSchema, TicketListSchema, type Ticket } from "../schemas/ticket";

// Get all tickets
export const fetchTickets = async (): Promise<Ticket[]> => {
  const raw = await http.get("tickets").json<any>();
  const list = Array.isArray(raw) ? raw : raw?.data ?? [];
  return TicketListSchema.parse(list);
};

// Get ticket by id
export const fetchTicketById = async (id: string | number): Promise<Ticket> => {
  const raw = await http.get(`tickets/${id}`).json<any>();
  return TicketSchema.parse(raw);
};

// Create a new ticket
export const createTicket = async (input: {
  description: string;
}): Promise<Ticket> => {
  const body = {
    description: input.description,
  };
  const raw = await http.post("tickets", { json: body }).json<any>();
  return TicketSchema.parse(raw);
};

// Assign user to ticket
export const assignTicket = async (
  ticketId: string | number,
  userId: string | number
): Promise<void> => {
  await http.put(`tickets/${ticketId}/assign/${userId}`);
};

// Unassign user from ticket
export const unassignTicket = async (
  ticketId: string | number
): Promise<void> => {
  await http.put(`tickets/${ticketId}/unassign`);
};

// Mark ticket as complete
export const markCompleteTicket = async (
  id: string | number
): Promise<void> => {
  await http.put(`tickets/${id}/complete`);
};

// Mark ticket as incomplete
export const markIncompleteTicket = async (
  id: string | number
): Promise<void> => {
  await http.delete(`tickets/${id}/complete`);
};
