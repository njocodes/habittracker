// Session type for NextAuth.js compatibility
export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export interface Session {
  user: SessionUser;
  expires: string;
}

// Client-side session type for useSession hook
export interface ClientSession {
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
  expires?: string;
}
