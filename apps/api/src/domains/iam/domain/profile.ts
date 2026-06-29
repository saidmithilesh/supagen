export type IamProfile = {
  user: {
    id: string;
    displayName: string | null;
    primaryEmail: string | null;
    avatarUrl: string | null;
  };
  memberships: Array<{
    role: "owner" | "admin" | "member";
    organization: {
      id: string;
      name: string;
    };
    workspaces: Array<{
      id: string;
      name: string;
    }>;
  }>;
};
