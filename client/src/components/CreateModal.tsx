import { useEffect, useRef, useState } from "react";
import { useTicketsStore } from "../store/tickets.store";
import { useUsersStore } from "../store/users.store";

type CreateModalProps = {
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
};

export const CreateModal: React.FC<CreateModalProps> = ({
  openModal,
  setOpenModal,
}) => {
  const { add, assign } = useTicketsStore();
  const users = useUsersStore();
  const [newDesc, setNewDesc] = useState("");
  const [newAssignee, setNewAssignee] = useState<string>("");
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void users.load();
  }, []);

  useEffect(() => {
    if (openModal) {
      setTimeout(() => firstInputRef.current?.focus(), 0);
    }
  }, [openModal]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    await add(newDesc.trim(), newAssignee ? Number(newAssignee) : null);
    setOpenModal(false);
    setNewDesc("");
    setNewAssignee("");
  };

  const onKeyDownModal = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpenModal(false);
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpenModal(false);
      }}
    >
      <div
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="newTicketTitle"
        onKeyDown={onKeyDownModal}
      >
        <div className="modal-head">
          <h3 id="newTicketTitle">Create Ticket</h3>
          <button className="ghost" onClick={() => setOpenModal(false)}>
            ✕
          </button>
        </div>
        <form className="modal-body" onSubmit={handleCreate}>
          <label className="label">Description *</label>
          <input
            ref={firstInputRef}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Describe the task…"
            required
          />

          <label className="label">Assignee</label>
          <select
            value={newAssignee}
            id="select-assignee"
            onChange={(e) => setNewAssignee(e.target.value)}
            aria-label="Select user to assign"
          >
            <option value="">(choose user)</option>
            {users.users.map((u) => (
              <option key={String(u.id)} value={String(u.id)}>
                {u.name}
              </option>
            ))}
          </select>

          <div className="modal-actions">
            <button
              type="button"
              className="ghost"
              onClick={() => setOpenModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary"
              disabled={!newDesc.trim()}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
