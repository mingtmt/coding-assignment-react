import { create } from "zustand";
import type { User } from "../schemas/ticket";
import { fetchUsers, fetchUserById } from "../api/users";

type UserState = {
  users: User[];
  loading: boolean;
  error?: string | null;
};

type UserActions = {
  load: () => Promise<void>;
  ensureUser: (id: string | number) => Promise<void>;
  getName: (id: number | string | null | undefined) => string | null;
};

export const useUsersStore = create<UserState & UserActions>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  async load() {
    set({ loading: true, error: null });
    try {
      const list = await fetchUsers();
      set({ users: list, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? "Failed to load users" });
    }
  },

  async ensureUser(id) {
    if (!id) return;
    const exists = get().users.find((x) => String(x.id) === String(id));
    if (exists) return;
    try {
      const u = await fetchUserById(id);
      set({ users: [...get().users, u] });
    } catch {
      // ignore
    }
  },

  getName(id) {
    if (id == null) return null;
    const u = get().users.find((u) => String(u.id) === String(id));
    return u?.name ?? null;
  },
}));
