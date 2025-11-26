export interface Group {
  id: string;
  name: string;
  missedMessages: number;
  memberNames: string[];
}

export interface MessageAuthor {
  id?: string;
  name?: string;
  firstName?: string;
  email?: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  author: MessageAuthor;
  isEdited: boolean;
}

export interface GroupCreationResult {
  group: Group;
  failedInvites: string[];
}
