import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateModal } from './CreateModal';

// mock store tickets
const add = jest.fn();
jest.mock('../store/tickets.store', () => ({
  useTicketsStore: () => ({ add }),
}));

// mock users store (dropdown assignee)
jest.mock('../store/users.store', () => ({
  useUsersStore: () => ({
    users: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
    load: jest.fn(),
  }),
}));

describe('<CreateModal />', () => {
  beforeEach(() => add.mockReset());

  it('submits with description only', async () => {
    const setOpenModal = jest.fn();
    render(<CreateModal openModal={true} setOpenModal={setOpenModal} />);

    const desc = screen.getByPlaceholderText(/describe the task/i);
    await userEvent.type(desc, 'New ticket');

    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(add).toHaveBeenCalledWith('New ticket', null);
    expect(setOpenModal).toHaveBeenCalledWith(false);
  });

  it('submits with selected assignee', async () => {
    const setOpenModal = jest.fn();
    render(<CreateModal openModal={true} setOpenModal={setOpenModal} />);

    await userEvent.type(screen.getByPlaceholderText(/describe the task/i), 'Install arm');

    const sel = screen.getByRole('combobox');
    await userEvent.selectOptions(sel, ['2']); // Bob

    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(add).toHaveBeenCalledWith('Install arm', 2);
  });
});
