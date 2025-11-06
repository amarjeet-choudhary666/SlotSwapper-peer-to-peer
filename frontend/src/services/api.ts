import axios from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  SignupRequest, 
  Event, 
  CreateEventRequest, 
  SwapRequest, 
  SwapRequestPayload, 
  User
} from '../types';

const API_BASE_URL = 'https://servicehive-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes('/users/signin') || response.config.url?.includes('/users/register')) {
      return response; 
    }
    
    if (response.data && response.data.success && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/users/signin', credentials);
    return {
      token: response.data.access_token,
      refreshToken: response.data.refresh_token,
      user: response.data.user
    };
  },

  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    await api.post('/users/register', userData);
    const loginResponse = await api.post('/users/signin', {
      email: userData.email,
      password: userData.password
    });
    return {
      token: loginResponse.data.access_token,
      refreshToken: loginResponse.data.refresh_token,
      user: loginResponse.data.user
    };
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  }
};

export const eventsAPI = {
  getMyEvents: async (): Promise<Event[]> => {
    const response = await api.get('/events');
    return response.data;
  },

  createEvent: async (eventData: CreateEventRequest): Promise<Event> => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (eventId: string, eventData: Partial<Event>): Promise<Event> => {
    console.log('API: Updating event', eventId, 'with data:', eventData);
    try {
      const response = await api.put(`/events/${eventId}`, eventData);
      console.log('API: Update response:', response);
      console.log('API: Update response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('API: Update event error:', error);
      throw error;
    }
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await api.delete(`/events/${eventId}`);
  }
};

export const swapsAPI = {
  getSwappableSlots: async (): Promise<Event[]> => {
    console.log('Fetching swappable slots...');
    const response = await api.get('/swappable-slots');
    console.log('Swappable slots response:', response);
    console.log('Swappable slots response data:', response.data);
    return response.data || [];
  },

  createSwapRequest: async (swapData: SwapRequestPayload): Promise<SwapRequest> => {
    console.log('Creating swap request with data:', swapData);
    const response = await api.post('/swap-request', swapData);
    console.log('Swap request creation response:', response);
    return response.data;
  },

  getMySwapRequests: async (): Promise<{
    incoming: SwapRequest[];
    outgoing: SwapRequest[];
  }> => {
    const [incomingResponse, outgoingResponse] = await Promise.all([
      api.get('/swap-requests/incoming'),
      api.get('/swap-requests/outgoing')
    ]);
    return {
      incoming: incomingResponse.data || [],
      outgoing: outgoingResponse.data || []
    };
  },

  respondToSwapRequest: async (requestId: string, accept: boolean): Promise<void> => {
    await api.post(`/swap-response/${requestId}`, { accepted: accept });
  }
};

export default api;