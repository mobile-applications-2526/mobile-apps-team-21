export type RawUser = {
  id?: string;
  name?: string;
  firstName?: string;
  email?: string;
  phoneNumber?: string;
};

export type RawGroupResponse = {
  id: string;
  name: string;
  missedMessages: number;
};

export type RawMessage = {
  id: string;
  content: string;
  timestamp?: string;
  author?: RawUser;
  group?: RawGroupResponse;
  edited?: boolean;
  isEdited?: boolean;
};
