export const IAM_PROFILE_NOT_BOOTSTRAPPED = "IAM_PROFILE_NOT_BOOTSTRAPPED";

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

export class IamProfileApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
  ) {
    super(code ?? `IAM profile request failed with status ${status}`);
  }
}

export async function getIamProfile(token: string) {
  return requestIamProfile("GET", "/iam/profile", token);
}

export async function bootstrapIamProfile(token: string) {
  return requestIamProfile("POST", "/iam/profile/bootstrap", token);
}

export function isIamProfileNotBootstrapped(error: unknown) {
  return (
    error instanceof IamProfileApiError &&
    error.status === 404 &&
    error.code === IAM_PROFILE_NOT_BOOTSTRAPPED
  );
}

async function requestIamProfile(
  method: "GET" | "POST",
  path: string,
  token: string,
) {
  const response = await fetch(getApiUrl(path), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new IamProfileApiError(
      response.status,
      await readErrorCode(response),
    );
  }

  return (await response.json()) as IamProfile;
}

async function readErrorCode(response: Response) {
  try {
    const body = (await response.json()) as { code?: unknown };

    return typeof body.code === "string" ? body.code : null;
  } catch {
    return null;
  }
}

function getApiUrl(path: string) {
  const baseUrl = getConfiguredApiBaseUrl();

  return `${baseUrl}/api/v1${path}`;
}

function getConfiguredApiBaseUrl() {
  const value = import.meta.env.VITE_SUPAGEN_API_URL?.trim();

  return value ? value.replace(/\/$/, "") : "";
}
