export interface User {
  ID: number;
  Name: string;
  Email: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Event {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  ownerId: number;
  owner?: User;
  createdAt: string;
  updatedAt: string;
}

export interface SwapRequest {
  ID: number;
  RequesterID: number;
  Requester: User;
  ResponderID: number;
  Responder: User;
  RequesterEventID: number;
  RequesterEvent: Event;
  ResponderEventID: number;
  ResponderEvent: Event;
  Status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  CreatedAt: string;
  UpdatedAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateEventRequest {
  title: string;
  startTime: string;
  endTime: string;
}

export interface SwapRequestPayload {
  my_slot_id: number;
  their_slot_id: number;
}