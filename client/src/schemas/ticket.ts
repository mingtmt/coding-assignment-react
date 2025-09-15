import { z } from 'zod';

export const TicketSchema = z.object({
  id: z.number().or(z.string()),
  description: z.string(),
  assigneeId: z.number().or(z.string()).nullable().optional(),
  completed: z.boolean(),
});

export type Ticket = z.infer<typeof TicketSchema>;

export const TicketListSchema = z.array(TicketSchema);

export const UserSchema = z.object({
  id: z.number().or(z.string()),
  name: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const UserListSchema = z.array(UserSchema);