// Basic service layer & interfaces reflecting backend models (Groep, Persoon, Bericht)
// Uses placeholder endpoints; falls back to mock data if requests fail.

export interface Person {
  id?: string;
  naam: string; // last name
  voornaam: string; // first name
  email: string;
  telefoonnummer?: string;
}

export interface Group {
  id?: string;
  naam: string;
  leden?: Person[];
  voorgesteldeRestaurants?: any[]; // not used right now
}

export interface Message {
  id?: string;
  tekst: string;
  timestamp?: string; // ISO string
  auteur: Person;
  groep: string; // group id
  isEdited?: boolean;
}

// Mock data (in-memory) used until backend endpoints exist.
let mockGroups: Group[] = [
  { id: 'g1', naam: 'Foodie Friends', leden: [{ id: 'p1', naam: 'Doe', voornaam: 'Emma', email: 'emma@example.com' }] },
  { id: 'g2', naam: 'Uni Squad', leden: [{ id: 'p2', naam: 'Smith', voornaam: 'Tom', email: 'tom@example.com' }] },
  { id: 'g3', naam: 'Family Dinner', leden: [{ id: 'p3', naam: 'Taylor', voornaam: 'Sarah', email: 'sarah@example.com' }] },
  { id: 'g4', naam: 'Work Lunch', leden: [{ id: 'p4', naam: 'Brown', voornaam: 'Alex', email: 'alex@example.com' }] }
];

const mockMessages: Record<string, Message[]> = {
  g1: [
    { id: 'm1', tekst: 'La Piazza Italiana', auteur: mockGroups[0].leden![0], groep: 'g1', timestamp: new Date().toISOString() },
    { id: 'm2', tekst: "Looks good! I'm available friday and saturday.", auteur: { id: 'p2', naam: 'Smith', voornaam: 'Tom', email: 'tom@example.com' }, groep: 'g1', timestamp: new Date().toISOString() }
  ],
  g2: [],
  g3: [],
  g4: []
};

const API_BASE = '/api';

export async function fetchGroups(): Promise<Group[]> {
  try {
    const res = await fetch(`${API_BASE}/groups`);
    if (!res.ok) throw new Error('No groups endpoint yet');
    return await res.json();
  } catch (e) {
    return mockGroups;
  }
}

export async function createGroup(name: string, memberEmails: string[]): Promise<Group> {
  const payload = { naam: name, ledenEmails: memberEmails };
  try {
    const res = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Create group not implemented');
    return await res.json();
  } catch {
    // mock create
    const newGroup: Group = { id: `g${mockGroups.length + 1}`, naam: name, leden: memberEmails.map((e, i) => ({ id: `tmp${i}`, naam: '', voornaam: e.split('@')[0], email: e })) };
    mockGroups = [newGroup, ...mockGroups];
    mockMessages[newGroup.id!] = [];
    return newGroup;
  }
}

export async function fetchMessages(groupId: string): Promise<Message[]> {
  try {
    const res = await fetch(`${API_BASE}/groups/${groupId}/messages`);
    if (!res.ok) throw new Error('No messages endpoint yet');
    return await res.json();
  } catch {
    return mockMessages[groupId] || [];
  }
}

export async function sendMessage(groupId: string, text: string, author: Person): Promise<Message> {
  const payload = { tekst: text, groepId: groupId, auteurId: author.id };
  try {
    const res = await fetch(`${API_BASE}/groups/${groupId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Send message not implemented');
    return await res.json();
  } catch {
    const msg: Message = { id: `m${Date.now()}`, tekst: text, auteur: author, groep: groupId, timestamp: new Date().toISOString() };
    if (!mockMessages[groupId]) mockMessages[groupId] = [];
    mockMessages[groupId].push(msg);
    return msg;
  }
}
