export interface InviteCodeItem {
  id: string;
  plain_code?: string | null;
  role_name: string;
  store_name: string;
  created_by_user_name: string;
  used_at: string | null;
  created_at: string;
}

export async function getInviteCodes(
  params?: string,
): Promise<InviteCodeItem[]> {
  const url = params ? `/api/invite-codes?${params}` : "/api/invite-codes";

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = await res.json().catch(() => null as unknown);

  if (!res.ok) {
    const detail = (data as { detail?: string } | null)?.detail;
    throw new Error(detail || "Failed to fetch invite codes");
  }

  return (data as InviteCodeItem[]) ?? [];
}

export interface CreateInvitePayload {
  name: string;
  email: string;
  roleId: string;
}

export interface CreatedInviteResponse {
  id: string;
  plain_code: string | null;
  role_name: string;
  store_name: string;
  created_by_user_name: string;
  used_at: string | null;
  created_at: string;
}

export async function createInviteCode(
  payload: CreateInvitePayload,
): Promise<CreatedInviteResponse> {
  // Backend only needs the roleId; name/email are for UI only for now.
  const res = await fetch("/api/invite-codes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role_id: payload.roleId,
      to_email: payload.email,
    }),
  });

  const data = await res.json().catch(() => null as unknown);

  if (!res.ok) {
    const detail = (data as { detail?: string } | null)?.detail;
    throw new Error(detail || "Failed to create invite code");
  }

  return data as CreatedInviteResponse;
}

export interface InviteRoleOption {
  id: string;
  name: string;
}

export async function getInviteRoles(): Promise<InviteRoleOption[]> {
  const res = await fetch("/api/invite-codes/roles", {
    method: "GET",
    cache: "no-store",
  });

  const data = await res.json().catch(() => null as unknown);

  if (!res.ok) {
    const detail = (data as { detail?: string } | null)?.detail;
    throw new Error(detail || "Failed to fetch invite roles");
  }

  return (data as InviteRoleOption[]) ?? [];
}
