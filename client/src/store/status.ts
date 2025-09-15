import type { Ticket } from "../schemas/ticket";

export type UiStatus = "unassigned" | "assigned" | "resolved";

export function getUiStatus(t: Ticket): UiStatus {
  if (t.completed) return "resolved";
  if (t.assigneeId != null) return "assigned";
  return "unassigned";
}

export const STATUS_LABEL: Record<UiStatus, string> = {
  unassigned: "Unassigned",
  assigned: "Assigned",
  resolved: "Resolved",
};
