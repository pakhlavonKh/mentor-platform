import { User } from "../entities/User.js";

export type SafeUser = Omit<User, "password">;

export function sanitizeUser(user: User): SafeUser {
  const { password: _password, ...safe } = user;
  return safe;
}

export function sanitizeUsers(users: User[]): SafeUser[] {
  return users.map(sanitizeUser);
}
