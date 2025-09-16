import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TicketCard } from "./TicketCard";

// --- mocks for stores & status ---
const assign = jest.fn();
const unassign = jest.fn();
const markComplete = jest.fn();
const markIncomplete = jest.fn();

jest.mock("../store/tickets.store", () => ({
  useTicketsStore: () => ({ assign, unassign, markComplete, markIncomplete }),
}));

const load = jest.fn();
const getName = jest.fn((id: number | null) =>
  id === null ? null : id === 7 ? "Alice" : id === 5 ? "Bob" : `User ${id}`
);
const usersMock = [
  { id: 5, name: "Bob" },
  { id: 7, name: "Alice" },
];

jest.mock("../store/users.store", () => ({
  useUsersStore: () => ({ load, getName, users: usersMock }),
}));

// Mock router Link
jest.mock("react-router-dom", () => ({
  Link: ({ to, children }: any) => <a href={String(to)}>{children}</a>,
}));

// Mock status helpers
type UiStatus = "unassigned" | "assigned" | "resolved";
jest.mock("../store/status", () => ({
  getUiStatus: (ticket: any): UiStatus => {
    if (ticket.completed) return "resolved";
    if (ticket.assigneeId != null) return "assigned";
    return "unassigned";
  },
  STATUS_LABEL: {
    unassigned: "Unassigned",
    assigned: "Assigned",
    resolved: "Resolved",
  },
}));

describe("<TicketCard />", () => {
  beforeEach(() => {
    assign.mockReset();
    unassign.mockReset();
    markComplete.mockReset();
    markIncomplete.mockReset();
    load.mockReset();
  });

  it("displays Assigned badge & calls Unassign when clicked", async () => {
    const user = userEvent.setup();
    const ticket = {
      id: 1,
      description: "Desk move",
      assigneeId: 7,
      completed: false,
    };

    render(<TicketCard ticket={ticket} activeAssignee={7} />);

    // effect load users
    expect(load).toHaveBeenCalled();

    // Badge
    expect(screen.getByText("Assigned")).toBeInTheDocument();

    // Assignee name
    const assigneeMeta =
      screen.getByText(/Assignee:/i).closest(".meta") ??
      screen.getByText(/Assignee:/i).parentElement!;
    expect(within(assigneeMeta).getByText("Alice")).toBeInTheDocument();

    // Click Unassign
    await user.click(screen.getByRole("button", { name: /unassign/i }));
    expect(unassign).toHaveBeenCalledWith(1);
  });

  it("displays Unassigned & calls Assign when a user is selected", async () => {
    const user = userEvent.setup();
    const ticket = {
      id: 2,
      description: "Install monitor",
      assigneeId: null,
      completed: false,
    };

    render(<TicketCard ticket={ticket} activeAssignee={5} />);

    expect(load).toHaveBeenCalled();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();

    // Select "Bob" (id 5) from the dropdown to trigger assign
    const select = screen.getByLabelText(/select user to assign/i);
    await user.selectOptions(select, "5");

    expect(assign).toHaveBeenCalledWith(2, 5);
  });

  it("displays Resolved & calls Reopen (markIncomplete) when clicked", async () => {
    const user = userEvent.setup();
    const ticket = {
      id: 3,
      description: "Done task",
      assigneeId: null,
      completed: true,
    };

    render(<TicketCard ticket={ticket} />);

    expect(load).toHaveBeenCalled();
    expect(screen.getByText("Resolved")).toBeInTheDocument();

    // Reopen button calls markIncomplete
    await user.click(screen.getByRole("button", { name: /reopen/i }));
    expect(markIncomplete).toHaveBeenCalledWith(3);
  });

  it("calls markComplete when Resolve is clicked for non-resolved tickets", async () => {
    const user = userEvent.setup();
    const ticket = {
      id: 4,
      description: "Fix chair",
      assigneeId: 5,
      completed: false,
    };

    render(<TicketCard ticket={ticket} />);

    const resolveBtn = screen.getByRole("button", { name: /resolve/i });
    await user.click(resolveBtn);
    expect(markComplete).toHaveBeenCalledWith(4);
  });
});
