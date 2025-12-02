# ClipURL - URL Shortener

A modern, high-performance URL shortener built with React (frontend) and FastAPI (backend).

## Features

- Create short, memorable links in seconds
- Custom aliases for branded links
- Click tracking and analytics
- QR code generation
- User authentication with JWT (HTTP-only cookies)
- Google OAuth login/signup
- Email verification for new users
- Password reset via email
- Disposable/temporary email blocking
- API key support for programmatic access
- Dashboard to manage all your links

## Tech Stack

### Frontend

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Data fetching and caching

### Backend

- **FastAPI** - Modern Python web framework
- **SQLAlchemy 2.0** - Async ORM
- **PostgreSQL** - Database
- **Alembic** - Database migrations
- **JWT** - Authentication (HTTP-only cookies)
- **Google OAuth 2.0** - Social login

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python 3.10+
- PostgreSQL database

### Frontend Setup

```sh
# Navigate to the project directory
cd clip-url

# Install dependencies
npm install
# or
bun install

# Copy environment file
cp .env.example .env

# Start the development server
npm run dev
# or
bun dev
```

The frontend will be available at `http://localhost:8080`.

### Backend Setup

```sh
# Navigate to the backend directory
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

API documentation is available at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get token
- `POST /auth/logout` - Logout (clears cookie)
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `POST /auth/change-password` - Change password
- `POST /auth/api-key` - Generate API key
- `DELETE /auth/api-key` - Revoke API key
- `POST /auth/verify-email` - Verify email address
- `POST /auth/resend-verification` - Resend verification email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/google` - Google OAuth login/signup

### URLs

- `POST /urls` - Create shortened URL
- `GET /urls` - List all user URLs
- `GET /urls/{id}` - Get URL details
- `PUT /urls/{id}` - Update URL
- `DELETE /urls/{id}` - Delete URL
- `GET /urls/stats` - Get overall stats
- `GET /urls/analytics` - Get aggregated analytics
- `GET /urls/{id}/analytics` - Get URL-specific analytics

### Redirect

- `GET /r/{slug}` - Redirect to original URL

## Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Backend (.env)

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/clipurl
SECRET_KEY=your-secret-key
FRONTEND_URL=http://localhost:8080
BASE_URL=http://localhost:8000

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@clipurl.com
SMTP_FROM_NAME=ClipURL

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend

- `uvicorn app.main:app --reload` - Start development server
- `alembic upgrade head` - Run migrations
- `alembic revision --autogenerate -m "message"` - Create new migration

## Project Structure

```
clip-url/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities and API
│   └── pages/              # Page components
├── backend/                # Backend source
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API routes
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   └── alembic/            # Database migrations
└── docs/                   # Documentation
```

## License

MIT
