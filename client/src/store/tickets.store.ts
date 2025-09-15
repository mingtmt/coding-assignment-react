import { create } from 'zustand';
import type { Ticket } from '../schemas/ticket';
import { fetchTickets, createTicket, updateTicket } from '../api/tickets';
import { getUiStatus, type UiStatus } from './status';

export type Filter = 'all' | UiStatus;
