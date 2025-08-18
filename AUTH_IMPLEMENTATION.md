# Authentication System Implementation

## Overview
A simple login/signup system has been implemented for the AI Farmers Application with the following features:

## Features Implemented

### Frontend (React/TypeScript)
1. **Login/Signup Page** (`src/pages/Login.tsx`)
   - Toggle between login and signup modes
   - Mobile number and password authentication
   - Location capture during signup (coordinates + address)
   - Form validation and error handling
   - Base64 password encoding
   - Local storage for user data

2. **Authentication Service** (`src/services/authApi.ts`)
   - Simple localStorage-based authentication
   - Base64 password encoding/decoding
   - User data management
   - Location data handling

3. **Header Integration** (`src/components/ui/Header.tsx`)
   - Shows logged-in user's name and location
   - Logout functionality
   - User profile dropdown

4. **Home Page Integration** (`src/pages/Home.tsx`)
   - Welcome message for logged-in users
   - Display user information (name, mobile, location)

### Backend (FastAPI/Python)
1. **Authentication Routes** (`app/api/routes/auth.py`)
   - POST `/auth/signup` - User registration
   - POST `/auth/login` - User authentication
   - GET `/auth/users` - Get all users (development)
   - GET `/auth/user/{user_id}` - Get user by ID
   - DELETE `/auth/users` - Clear all users (development)

2. **Data Storage**
   - JSON file-based storage (`users_data.json`)
   - Base64 password encoding
   - Location data storage (latitude, longitude, address)

## User Data Structure
```typescript
interface UserData {
  id: string;
  name: string;
  mobile: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  created_at: string;
}
```

## Authentication Flow

### Signup Process
1. User enters name, mobile number, and password
2. System automatically attempts to get user's location
3. Password is base64 encoded before storage
4. User data is stored in localStorage (frontend) and JSON file (backend)
5. User is automatically logged in and redirected to home page

### Login Process
1. User enters mobile number and password
2. System validates credentials against stored data
3. On success, user data is stored in localStorage
4. User is redirected to home page

### Logout Process
1. User clicks logout from header dropdown
2. User data is removed from localStorage
3. User is redirected to login page

## Security Notes
- **Development Only**: This implementation uses base64 encoding for passwords, which is NOT secure for production
- **Local Storage**: User data is stored in browser localStorage for simplicity
- **No Session Management**: No JWT tokens or session management implemented
- **No Password Hashing**: Passwords should be properly hashed in production (bcrypt, etc.)

## Usage

### Starting the Application
1. Frontend: `npm run dev` (from ai_farmers_application directory)
2. Backend: `python -m uvicorn app.main:app --reload` (from ai_farmers_application_backend directory)

### Testing the Authentication
1. Navigate to `/login` or root `/`
2. Click "Don't have an account? Sign up"
3. Fill in name, mobile number, and password
4. Allow location access when prompted
5. Click "Create Account"
6. You'll be redirected to home page with welcome message
7. Test logout from header dropdown

### API Endpoints
- `POST http://localhost:8000/auth/signup`
- `POST http://localhost:8000/auth/login`
- `GET http://localhost:8000/auth/users`
- `DELETE http://localhost:8000/auth/users`

## Files Modified/Created

### Frontend
- `src/pages/Login.tsx` - New login/signup page
- `src/services/authApi.ts` - New authentication service
- `src/components/ui/Header.tsx` - Updated with user info and logout
- `src/pages/Home.tsx` - Updated with welcome message
- `src/App.tsx` - Updated routes to include login page

### Backend
- `app/api/routes/auth.py` - New authentication routes
- `app/main.py` - Updated to include auth router

## Future Improvements for Production
1. Implement proper password hashing (bcrypt)
2. Add JWT token-based authentication
3. Use a proper database (PostgreSQL, MongoDB)
4. Add input sanitization and validation
5. Implement rate limiting
6. Add email verification
7. Add password reset functionality
8. Add proper error logging
9. Implement HTTPS
10. Add CSRF protection
