# SlotSwapper

A peer-to-peer time-slot scheduling application where users can mark their busy slots as "swappable" and request to swap them with other users' swappable slots.

## Features

- **User Authentication**: Sign up and sign in with JWT tokens
- **Event Management**: Create, update, and delete calendar events
- **Slot Swapping**: Mark events as swappable and request swaps with other users
- **Marketplace**: Browse available swappable slots from other users
- **Swap Requests**: Send and respond to swap requests

## Tech Stack

- **Backend**: Go with Gin framework
- **Database**: PostgreSQL with GORM
- **Frontend**: React with TypeScript and Vite
- **Authentication**: JWT tokens
- **Containerization**: Docker & Docker Compose
- **Testing**: Go testing with Testify

## API Endpoints

### Authentication
- `POST /api/users/signup` - Register a new user
- `POST /api/users/signin` - Sign in user
- `GET /api/users/profile` - Get user profile (protected)

### Events
- `POST /api/events` - Create a new event (protected)
- `GET /api/events` - Get user's events (protected)
- `PUT /api/events/:id` - Update an event (protected)
- `DELETE /api/events/:id` - Delete an event (protected)

### Swapping
- `GET /api/swappable-slots` - Get all swappable slots from other users (protected)
- `POST /api/swap-request` - Create a swap request (protected)
- `GET /api/swap-requests/incoming` - Get incoming swap requests (protected)
- `GET /api/swap-requests/outgoing` - Get outgoing swap requests (protected)
- `POST /api/swap-response/:requestId` - Respond to a swap request (protected)

## Local Development Setup

### Option 1: Docker Compose (Recommended)

1. **Prerequisites:**
   - Docker
   - Docker Compose

2. **Clone and run:**
    ```bash
    git clone <repository-url>
    cd slotswapper
    docker-compose up --build
    ```

3. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8080
   - Database: localhost:5432

4. **Environment variables:**
   Update the secrets in `docker-compose.yml`:
   - `ACCESS_TOKEN_SECRET`: Your JWT access token secret
   - `REFRESH_TOKEN_SECRET`: Your JWT refresh token secret

### Option 2: Manual Setup

#### Prerequisites
- Go 1.19+
- Node.js 16+
- PostgreSQL

#### Backend Setup
1. Navigate to the backend directory:
    ```bash
    cd backend
    ```

2. Install dependencies:
    ```bash
    go mod download
    ```

3. Create a `.env` file in the backend directory with the following variables:
    ```
    PORT=8080
    DATABASE_URL=your_postgresql_connection_string
    ACCESS_TOKEN_SECRET=your_access_token_secret
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    ```

4. Run the backend:
    ```bash
    go run cmd/server/main.go
    ```

#### Frontend Setup
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

4. Open your browser to `http://localhost:5173`

## Deployment

This application is configured for deployment on Render using the `render.yaml` file.

### Environment Variables for Production
Set the following environment variables in your Render dashboard:
- `PORT`: 8080 (or your chosen port)
- `DATABASE_URL`: Your PostgreSQL connection string
- `ACCESS_TOKEN_SECRET`: A secure random string
- `REFRESH_TOKEN_SECRET`: A secure random string

### Frontend Production Build
For the frontend, set the `VITE_API_BASE_URL` environment variable to your backend's URL.

## Database Schema

The application uses three main models:

### User
- id (primary key)
- name
- email (unique)
- password (hashed)
- refresh_token
- created_at, updated_at, deleted_at

### Event
- id (primary key)
- title
- start_time
- end_time
- status (BUSY, SWAPPABLE, SWAP_PENDING)
- owner_id (foreign key to User)
- created_at, updated_at, deleted_at

### SwapRequest
- id (primary key)
- requester_id (foreign key to User)
- responder_id (foreign key to User)
- requester_event_id (foreign key to Event)
- responder_event_id (foreign key to Event)
- status (PENDING, ACCEPTED, REJECTED)
- created_at, updated_at

## Swap Logic

1. **Mark as Swappable**: User changes event status from BUSY to SWAPPABLE
2. **Browse Marketplace**: User views all SWAPPABLE events from other users
3. **Create Swap Request**: User selects one of their SWAPPABLE events and one from the marketplace to create a swap request
4. **Pending State**: Both events are set to SWAP_PENDING status
5. **Respond to Request**: Responder can ACCEPT or REJECT the request
6. **On Accept**: Event ownership is swapped, both events set to BUSY
7. **On Reject**: Both events are set back to SWAPPABLE

## Testing

Run the backend tests:
```bash
cd backend
go test ./internals/api/services/ -v
```

## Docker Commands

- **Start all services:**
  ```bash
  docker-compose up --build
  ```

- **Start in background:**
  ```bash
  docker-compose up -d --build
  ```

- **Stop services:**
  ```bash
  docker-compose down
  ```

- **View logs:**
  ```bash
  docker-compose logs -f [service-name]
  ```

- **Rebuild and restart:**
  ```bash
  docker-compose up --build --force-recreate
  ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.