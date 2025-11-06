# SlotSwapper Frontend

A React TypeScript frontend for the SlotSwapper peer-to-peer time-slot scheduling application.

## Features

- **User Authentication**: Sign up and login with JWT tokens
- **Dashboard**: View and manage your calendar events
- **Event Management**: Create, update status, and delete events
- **Marketplace**: Browse available swappable slots from other users
- **Swap Requests**: Send and receive swap requests with accept/reject functionality
- **Real-time State Management**: Dynamic updates without page refreshes

## Tech Stack

- **React 19** with TypeScript
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **date-fns** for date formatting
- **Vite** for build tooling

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   ├── ProtectedRoute.tsx
│   ├── EventCard.tsx   # Event display component
│   ├── CreateEventModal.tsx
│   ├── SwapRequestModal.tsx
│   └── SwapRequestCard.tsx
├── context/            # React context providers
│   └── AuthContext.tsx # Authentication state management
├── pages/              # Main application pages
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx   # User's calendar view
│   ├── Marketplace.tsx # Browse swappable slots
│   └── SwapRequests.tsx # Manage swap requests
├── services/           # API service layer
│   └── api.ts         # Axios configuration and API calls
├── types/             # TypeScript type definitions
│   └── index.ts
├── App.tsx            # Main app component with routing
└── main.tsx          # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend server running on http://localhost:8080

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Environment Configuration

The frontend is configured to connect to the backend at `http://localhost:8080/api`. If your backend is running on a different port, update the `API_BASE_URL` in `src/services/api.ts`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Events
- `GET /api/events` - Get user's events
- `POST /api/events` - Create new event
- `PUT /api/events/:id/status` - Update event status
- `DELETE /api/events/:id` - Delete event

### Swaps
- `GET /api/swappable-slots` - Get available swappable slots
- `POST /api/swap-request` - Create swap request
- `GET /api/swap-requests` - Get user's swap requests
- `POST /api/swap-response/:id` - Respond to swap request

## Key Features Implementation

### Authentication Flow
- JWT tokens stored in localStorage
- Automatic token inclusion in API requests
- Protected routes with redirect to login
- Context-based auth state management

### Event Management
- Create events with date/time validation
- Toggle between BUSY and SWAPPABLE status
- Visual status indicators with icons and colors
- Delete events (except those with pending swaps)

### Swap System
- Browse marketplace of available slots
- Modal-based swap request flow
- Select from your swappable events to offer
- Accept/reject incoming requests
- Real-time status updates

### UI/UX Features
- Responsive design with Tailwind CSS
- Loading states and error handling
- Form validation and user feedback
- Intuitive navigation with active state indicators
- Emoji icons for visual appeal

## State Management

The application uses React Context for authentication state and local component state for UI interactions. API calls automatically refresh data to keep the UI synchronized with the backend.

## Error Handling

- Network errors are caught and displayed to users
- Form validation prevents invalid submissions
- Loading states provide feedback during API calls
- Graceful fallbacks for empty states

## Future Enhancements

- Real-time notifications with WebSockets
- Calendar grid view
- Advanced filtering and search
- Email notifications
- Mobile app version