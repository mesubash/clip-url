# ClipURL - Modern URL Shortener

A modern, high-performance URL shortener built with React (frontend) and FastAPI (backend).

🔗 **Live Demo**: [clipurl.subashsdhami.com.np](https://clipurl.subashsdhami.com.np)

## ✨ Features

- 🔗 Create short, memorable links in seconds
- ✏️ Custom aliases for branded links
- 📊 Click tracking and detailed analytics
- 📱 QR code generation with download support
- ⏰ Link expiration dates
- 🔐 User authentication with JWT (HTTP-only cookies)
- 🔑 Google OAuth login/signup
- ✉️ Email verification for new users
- 🔄 Password reset via email
- 🚫 Disposable/temporary email blocking
- 🔑 API key support for programmatic access
- 📱 Fully responsive dashboard
- ⌨️ Keyboard shortcuts (Cmd/Ctrl+Enter to submit)
- 🎨 Beautiful UI with dark mode support

## 🛠️ Tech Stack

### Frontend

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React 18** - UI library
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Data fetching and caching

### Backend

- **FastAPI** - Modern Python web framework
- **SQLAlchemy 2.0** - Async ORM
- **PostgreSQL** - Database (Neon)
- **Alembic** - Database migrations
- **JWT** - Authentication (HTTP-only cookies)
- **Google OAuth 2.0** - Social login
- **Resend** - Transactional emails

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+) or Bun
- Python 3.11+
- PostgreSQL database

### Frontend Setup

```sh
# Clone the repository
git clone https://github.com/mesubash/clip-url.git
cd clip-url

# Install dependencies
bun install  # or npm install

# Copy environment file
cp .env.example .env

# Start the development server
bun dev  # or npm run dev
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

API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🌐 Deployment

### Backend (Render with Docker)

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Select **Docker** as the runtime
4. Set **Root Directory** to `backend`
5. Add environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | Generate with `openssl rand -hex 32` |
| `DEBUG` | `false` |
| `FRONTEND_URL` | Your Vercel frontend URL |
| `BASE_URL` | Your Render backend URL |
| `RESEND_API_KEY` | Resend API key for emails |
| `EMAIL_FROM` | Sender email address |
| `EMAIL_FROM_NAME` | Sender name |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### Frontend (Vercel)

1. Import your repository on [Vercel](https://vercel.com)
2. Set **Root Directory** to `.` (root)
3. Add environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your Render backend URL |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   - `http://localhost:8080` (development)
   - `https://your-frontend-domain.com` (production)
4. Add to **Authorized redirect URIs**:
   - `http://localhost:8000/api/auth/google/callback` (development)
   - `https://your-backend-domain.com/api/auth/google/callback` (production)

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get token |
| POST | `/auth/logout` | Logout (clears cookie) |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/profile` | Update profile |
| POST | `/auth/change-password` | Change password |
| POST | `/auth/api-key` | Generate API key |
| DELETE | `/auth/api-key` | Revoke API key |
| POST | `/auth/verify-email` | Verify email address |
| POST | `/auth/resend-verification` | Resend verification email |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/google` | Google OAuth login/signup |

### URLs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/urls` | Create shortened URL |
| GET | `/urls` | List all user URLs |
| GET | `/urls/{id}` | Get URL details |
| PUT | `/urls/{id}` | Update URL |
| DELETE | `/urls/{id}` | Delete URL |
| GET | `/urls/stats` | Get overall stats |
| GET | `/urls/analytics` | Get aggregated analytics |
| GET | `/urls/{id}/analytics` | Get URL-specific analytics |

### Redirect

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/r/{slug}` | Redirect to original URL |

## 🔧 Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Backend (.env)

```env
# App
DEBUG=true

# Database (PostgreSQL)
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/clipurl

# JWT Authentication
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS
FRONTEND_URL=http://localhost:8080

# Base URL for short links
BASE_URL=http://localhost:8000

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=no-reply@yourdomain.com
EMAIL_FROM_NAME=ClipURL

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📁 Project Structure

```
clip-url/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── layout/         # Layout components
│   │   ├── shared/         # Shared components
│   │   └── ui/             # shadcn/ui components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities and API client
│   └── pages/              # Page components
├── backend/                # Backend source
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API routes
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   ├── alembic/            # Database migrations
│   └── Dockerfile          # Docker configuration
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 📜 Scripts

### Frontend

```sh
bun dev          # Start development server
bun build        # Build for production
bun preview      # Preview production build
bun lint         # Run ESLint
```

### Backend

```sh
uvicorn app.main:app --reload  # Start development server
alembic upgrade head           # Run migrations
alembic revision --autogenerate -m "message"  # Create new migration
```

## 🐳 Docker

Build and run the backend with Docker:

```sh
cd backend
docker build -t clipurl-backend .
docker run -p 8000:8000 --env-file .env clipurl-backend
```

## 📄 License

MIT

## 👤 Author

**Subash Sdhami**

- Website: [subashsdhami.com.np](https://subashsdhami.com.np)
- GitHub: [@mesubash](https://github.com/mesubash)
