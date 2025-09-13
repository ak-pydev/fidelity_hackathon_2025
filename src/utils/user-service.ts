export type User = {
  id: string;
  username: string;
  createdAt: string;
};

const USER_KEY = 'currentUser';

export const userService = {
  signUp(username: string): User {
    const user: User = { id: Date.now().toString(), username, createdAt: new Date().toISOString() };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },
  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  signOut() {
    localStorage.removeItem(USER_KEY);
  }
};
