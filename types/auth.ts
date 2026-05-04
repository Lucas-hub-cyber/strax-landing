export type UserRole = "admin" | "architect" | "client" | "viewer";

export type UserProfile = {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  status: string;
  created_at: string;
};

export type ClientMembership = {
  id: string;
  user_id: string;
  client_id: string;
  role: UserRole;
  created_at: string;
};
