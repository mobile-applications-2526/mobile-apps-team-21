import { authFetch } from '../context/AuthContext';
import { Group, GroupCreationResult, Message } from '../models/groupChat';
import { RawGroupResponse, RawMessage, RawUser } from '../types/groupChat';
import { buildApiUrl } from '../utils/apiConfig';

async function handleJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    throw new Error('Empty response body');
  }
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(text || 'Unexpected response from server');
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const absoluteUrl = buildApiUrl(path);

  const response = await authFetch(absoluteUrl, init);
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    const message = errorText || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return response;
}

async function fetchGroupMembers(groupId: string): Promise<string[]> {
  try {
    const res = await request(`/groups/getMembers/${groupId}`);
    return await handleJson<string[]>(res);
  } catch {
    return [];
  }
}

function mapGroup(raw: RawGroupResponse, memberNames: string[]): Group {
  return {
    id: raw.id,
    name: raw.name,
    missedMessages: raw.missedMessages,
    memberNames
  };
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
      email: raw.author?.email
    },
    isEdited: Boolean(raw.isEdited ?? raw.edited)
  };
}

export async function fetchGroups(userEmail: string): Promise<Group[]> {
  if (!userEmail) {
    throw new Error('Cannot load groups without a user email');
  }

  const res = await request(`/users/groups?email=${encodeURIComponent(userEmail)}`);
  const rawGroups = await handleJson<RawGroupResponse[]>(res);

  const groupsWithMembers = await Promise.all(
    rawGroups.map(async (raw) => {
      const members = await fetchGroupMembers(raw.id);
      return mapGroup(raw, members);
    })
  );

  return groupsWithMembers;
}

export async function createGroup(name: string, memberEmails: string[], currentUserEmail: string): Promise<GroupCreationResult> {
  if (!name.trim()) {
    throw new Error('Group name is required');
  }
  if (!currentUserEmail) {
    throw new Error('Current user email is required');
  }

  const res = await request('/groups/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim() })
  });

  const created = await handleJson<RawGroupResponse>(res);

  const failedInvites: string[] = [];
  for (const email of memberEmails) {
    const trimmed = email.trim();
    if (!trimmed || trimmed.toLowerCase() === currentUserEmail.toLowerCase()) {
      continue;
    }

    try {
      await request('/groups/addUser', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUserEmail: trimmed,
          groupId: created.id,
          adderEmail: currentUserEmail
        })
      });
    } catch (error) {
      failedInvites.push(trimmed);
    }
  }

  const memberNames = await fetchGroupMembers(created.id);
  return {
    group: mapGroup(created, memberNames),
    failedInvites
  };
}

export async function fetchMessages(group: Group): Promise<Message[]> {
  const encodedName = encodeURIComponent(group.name);
  const res = await request(`/groups/${encodedName}/messages`);
  const rawMessages = await handleJson<RawMessage[]>(res);
  return rawMessages.map(mapMessage);
}

export async function sendMessage(group: Group, content: string, senderEmail: string): Promise<void> {
  if (!content.trim()) {
    return;
  }
  if (!senderEmail) {
    throw new Error('Cannot send a message without a sender email');
  }

  const encodedName = encodeURIComponent(group.name);
  const url = `/messages/${encodedName}?${new URLSearchParams({ groupName: group.name }).toString()}`;

  await request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: content.trim(),
      senderEmail,
      groupId: group.id
    })
  });
}

export type { Group, Message, GroupCreationResult };
