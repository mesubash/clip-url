#!/bin/bash

# Script to commit authentication features
# Features: Email verification, Forgot password, Google OAuth, Disposable email blocking

set -e

echo "🔍 Checking git status..."
git status

echo ""
echo "📦 Staging all changes..."

# Stage backend changes
git add backend/app/config.py
git add backend/app/main.py
git add backend/app/models/user.py
git add backend/app/routers/auth.py
git add backend/app/schemas/__init__.py
git add backend/app/schemas/auth.py
git add backend/app/services/__init__.py
git add backend/app/services/auth_service.py
git add backend/app/services/email_service.py
git add backend/app/services/oauth_service.py
git add backend/requirements.txt
git add backend/alembic/versions/
git add backend/scripts/test_email.py

# Stage frontend changes
git add src/App.tsx
git add src/components/layout/AuthLayout.tsx
git add src/components/layout/Sidebar.tsx
git add src/components/shared/GoogleLoginButton.tsx
git add src/contexts/AuthContext.tsx
git add src/lib/auth.ts
git add src/lib/types.ts
git add src/pages/Dashboard.tsx
git add src/pages/ForgotPassword.tsx
git add src/pages/Index.tsx
git add src/pages/Login.tsx
git add src/pages/Register.tsx
git add src/pages/ResetPassword.tsx
git add src/pages/VerifyEmail.tsx

# Stage other changes
git add README.md
git add index.html
git add public/site.webmanifest

echo ""
echo "✅ Files staged. Current status:"
git status

echo ""
echo "📝 Committing changes..."

git commit -m "feat: Add email verification, password reset, and Google OAuth

Backend:
- Add email service with Resend API for sending emails
- Add disposable/temporary email blocking (100+ domains)
- Add email verification flow with token-based verification
- Add forgot password and reset password endpoints
- Add Google OAuth authentication with account binding
- Add new user fields: is_verified, oauth_provider, avatar_url
- Add database migration for new user fields

Frontend:
- Add GoogleLoginButton component with Google Identity Services
- Add VerifyEmail page for email verification
- Add ResetPassword page for password reset
- Update Login and Register pages with Google OAuth
- Update AuthContext with setUser method
- Update types with new User fields
- Add new routes for verification and password reset

Security:
- Block disposable/temporary email addresses during registration
- HTTP-only cookies for JWT tokens
- Secure password reset with expiring tokens
- Google OAuth binds to existing accounts if email matches"

echo ""
echo "🎉 Commit successful!"
echo ""
git log --oneline -1

echo ""
echo "💡 To push changes, run: git push origin main"
