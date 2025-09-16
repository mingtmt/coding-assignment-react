import { getUiStatus } from './status';
import type { Ticket } from '../schemas/ticket';

describe('getUiStatus()', () => {
  it('unassigned when no assignee & not completed', () => {
    const t: Ticket = { id: 1, description: 'x', assigneeId: null, completed: false };
    expect(getUiStatus(t)).toBe('unassigned');
  });

  it('assigned when has assignee & not completed', () => {
    const t: Ticket = { id: 2, description: 'y', assigneeId: 10, completed: false };
    expect(getUiStatus(t)).toBe('assigned');
  });

  it('resolved when completed', () => {
    const t: Ticket = { id: 3, description: 'z', assigneeId: null, completed: true };
    expect(getUiStatus(t)).toBe('resolved');
  });
});
