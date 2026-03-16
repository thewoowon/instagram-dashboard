import { type PostDraft, type Account, type ContentIdea } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const API = `${BASE_URL}/api/v1`;

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

// Accounts
export const getAccounts = () => req<Account[]>("/accounts");

// Ideas
export const getIdeas = (params?: { account_id?: string; status?: string }) => {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  return req<ContentIdea[]>(`/ideas${qs ? `?${qs}` : ""}`);
};

export const createIdea = (body: Omit<ContentIdea, "id" | "created_at" | "account">) =>
  req<ContentIdea>("/ideas", { method: "POST", body: JSON.stringify(body) });

// Drafts
export const getDrafts = (params?: { account_id?: string; approval_status?: string }) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v != null))
  ).toString();
  return req<PostDraft[]>(`/drafts${qs ? `?${qs}` : ""}`);
};

export const getDraft = (id: string) => req<PostDraft>(`/drafts/${id}`);

export const createDraft = (body: Partial<PostDraft>) =>
  req<PostDraft>("/drafts", { method: "POST", body: JSON.stringify(body) });

export const updateDraft = (id: string, body: { hook?: string; caption?: string; hashtags?: string[]; cta?: string }) =>
  req<PostDraft>(`/drafts/${id}`, { method: "PATCH", body: JSON.stringify(body) });

export const approveDraft = (id: string, action: "approve" | "reject", scheduled_at?: string) =>
  req<PostDraft>(`/drafts/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ action, scheduled_at }),
  });

export const deleteDraft = (id: string) =>
  req<void>(`/drafts/${id}`, { method: "DELETE" });

// Generate
export const generateDraft = (body: {
  account_id: string;
  topic: string;
  angle?: string;
  format_type: string;
  idea_id?: string;
}) => req<PostDraft>("/generate/draft", { method: "POST", body: JSON.stringify(body) });

export const generateIdeas = (body: { account_id: string; count?: number }) =>
  req<ContentIdea[]>("/generate/ideas", { method: "POST", body: JSON.stringify(body) });
