import { buildApiUrl } from '@/utils/apiConfig';
import { Group, GroupCreationResult, Message, RawGroupResponse, RawMessage, Restaurant } from '@/types';

async function handleJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) throw new Error('Empty response body');
  try { return JSON.parse(text) as T; } catch { throw new Error(text || 'Unexpected response'); }
}

async function request(path: string, init?: RequestInit, token?: string): Promise<Response> {
  const url = buildApiUrl(path);
  const headers = new Headers(init?.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return res;
}

async function fetchGroupMembers(groupId: string, token?: string): Promise<string[]> {
  try {
    const res = await request(`/groups/getMembers/${groupId}`, undefined, token);
    return await handleJson<string[]>(res);
  } catch { return []; }
}

function mapGroup(raw: RawGroupResponse, memberNames: string[]): Group {
  return { id: raw.id, name: raw.name, missedMessages: raw.missedMessages, memberNames };
}

function mapMessage(raw: RawMessage): Message {
  return {
    id: raw.id,
    content: raw.content,
    timestamp: raw.timestamp ?? new Date().toISOString(),
    author: {
      id: raw.author?.id,
      name: raw.author?.name,
      firstName: raw.author?.firstName,
      email: raw.author?.email,
    },
    isEdited: Boolean(raw.isEdited ?? raw.edited),
  };
}

export async function fetchGroups(userEmail: string, token?: string): Promise<Group[]> {
  if (!userEmail) throw new Error('Geen gebruiker bekend');
  const res = await request(`/users/groups?email=${encodeURIComponent(userEmail)}`, undefined, token);
  const rawGroups = await handleJson<RawGroupResponse[]>(res);
  const groups = await Promise.all(rawGroups.map(async g => {
    const members = await fetchGroupMembers(g.id, token);
    return mapGroup(g, members);
  }));
  return groups;
}

export async function createGroup(name: string, memberEmails: string[], currentUserEmail: string, token?: string): Promise<GroupCreationResult> {
  if (!name.trim()) throw new Error('Naam is verplicht');
  if (!currentUserEmail) throw new Error('Gebruiker vereist');
  const res = await request('/groups/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim() })
  }, token);
  const created = await handleJson<RawGroupResponse>(res);
  const failedInvites: string[] = [];
  for (const email of memberEmails) {
    const trimmed = email.trim();
    if (!trimmed || trimmed.toLowerCase() === currentUserEmail.toLowerCase()) continue;
    try {
      await request('/groups/addUser', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUserEmail: trimmed, groupId: created.id, adderEmail: currentUserEmail })
      }, token);
    } catch { failedInvites.push(trimmed); }
  }
  const memberNames = await fetchGroupMembers(created.id, token);
  return { group: mapGroup(created, memberNames), failedInvites };
}

export async function fetchMessages(group: Group, token?: string): Promise<Message[]> {
  const encodedName = encodeURIComponent(group.name);
  const res = await request(`/groups/${encodedName}/messages`, undefined, token);
  const rawMessages = await handleJson<RawMessage[]>(res);
  return rawMessages.map(mapMessage);
}

export async function sendMessage(group: Group, content: string, senderEmail: string, token?: string): Promise<void> {
  if (!content.trim()) return;
  if (!senderEmail) throw new Error('Geen afzender');
  const encodedName = encodeURIComponent(group.name);
  const url = `/messages/${encodedName}?${new URLSearchParams({ groupName: group.name }).toString()}`;
  await request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content.trim(), senderEmail, groupId: group.id })
  }, token);
}

export async function recommendRestaurantToGroup(group: Group, restaurant: Restaurant, token?: string): Promise<String> {
  if(!token) throw new Error('No authentication');
  try {
    const encodedRestId = encodeURIComponent(restaurant.id);
    const encodedGroupId = encodeURIComponent(group.id);
    const url = `/groups/restaurant?restId=${encodedRestId}&groupId=${encodedGroupId}`;
    const res = await request(url, {
      method: 'PUT'
    }, token)
    const text = await handleJson<string>(res)
    return text;
  } catch (err: any) {
    // If the server returned a meaningful message (e.g. "Restaurant has already been suggested to this group."),
    // `request()` throws an Error with that message. We catch and return it so callers can display it gracefully.
    if (err instanceof Error) return err.message;
    return String(err);
  }
}

export type { Group, Message, GroupCreationResult };