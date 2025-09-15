import { http } from "./client";
import { UserListSchema, UserSchema, type User } from "../schemas/ticket";

export async function fetchUsers(): Promise<User[]> {
  const raw = await http.get("users").json<any>();
  const list = Array.isArray(raw) ? raw : raw?.data ?? [];
  return UserListSchema.parse(list);
}

export async function fetchUserById(id: string | number): Promise<User> {
  const raw = await http.get(`users/${id}`).json<any>();
  return UserSchema.parse(raw);
}
