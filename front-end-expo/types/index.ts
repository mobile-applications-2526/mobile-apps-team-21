export type RawUser = {
  id?: string;
  name?: string;
  firstName?: string;
  email?: string;
  phoneNumber?: string;
  visitedRestaurantsCount?: number;
  favoriteRestaurantsCount?: number;
};

export type RestRelResponse = {
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  visitDate: string;
  isFavorite: boolean;
  rating: number | null;
};

export type RestaurantStatus = {
  isFavorite: boolean;
  visitDate: string;
  rating: number | null;
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

export interface Restaurant{
  id: string,
  name: string,
  adress: string,
  phoneNumber: string,
  description: string
}

export interface RawRestaurant{
  id: string,
  name: string,
  adress?: string,
  phoneNumber?: string,
  description?: string
}

export interface SuggestedRestaurant {
  id: string;
  restaurant: Restaurant;
  recommenderEmail: string;
  voters: string[];
  recommendedAt?: string;
}