import { useAuth, useUser } from "@clerk/tanstack-react-start";
import { useQuery } from "@tanstack/react-query";

import {
  bootstrapIamProfile,
  getIamProfile,
  isIamProfileNotBootstrapped,
} from "../../api/iam-profile";

export const IAM_PROFILE_QUERY_KEY = ["iam-profile"] as const;

export function useWorkspaceProfile() {
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();

  return useQuery({
    enabled: isLoaded && Boolean(user),
    queryKey: [...IAM_PROFILE_QUERY_KEY, user?.id],
    queryFn: async () => {
      const token = await getToken();

      if (!token) {
        throw new Error("Missing Clerk session token.");
      }

      try {
        return await getIamProfile(token);
      } catch (error) {
        if (isIamProfileNotBootstrapped(error)) {
          return await bootstrapIamProfile(token);
        }

        throw error;
      }
    },
  });
}
