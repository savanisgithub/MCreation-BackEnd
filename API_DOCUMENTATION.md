# MCreation Backend API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Endpoints

### Health Check

#### Check API Status
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-02-18T10:00:00.000Z"
}
```

---

### Authentication Endpoints

#### 1. Sign Up

Register a new user account.

```http
POST /auth/signup
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Validation Rules:**
- `username`: 3-50 characters, alphanumeric and underscores only
- `email`: Valid email format
- `password`: Minimum 6 characters, must contain at least one uppercase letter, one lowercase letter, and one number

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User already exists",
  "error": "Email is already registered"
}
```

---

#### 2. Sign In

Authenticate an existing user.

```http
POST /auth/signin
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sign in successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Authentication failed",
  "error": "Invalid email or password"
}
```

---

#### 3. Refresh Access Token

Get a new access token using a refresh token.

```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

---

#### 4. Sign Out (Protected)

Sign out and revoke the refresh token.

```http
POST /auth/signout
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

---

#### 5. Get Current User (Protected)

Get the currently authenticated user's information.

```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2026-02-18T10:00:00.000Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## Token Information

### Access Token
- **Expiry:** 15 minutes
- **Use:** Authenticate API requests
- **Storage:** Store in memory or secure storage (NOT localStorage for production)

### Refresh Token
- **Expiry:** 7 days
- **Use:** Obtain new access tokens
- **Storage:** HttpOnly cookie (recommended) or secure storage
- **Revocation:** Tokens are revoked on sign out

---

## Rate Limiting

### General Endpoints
- **Limit:** 100 requests per 15 minutes per IP
- **Response Header:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Authentication Endpoints
- **Limit:** 5 requests per 15 minutes per IP
- **Applies to:** `/auth/signup`, `/auth/signin`
- **Note:** Successful requests are not counted

**Rate Limit Error (429):**
```json
{
  "message": "Too many authentication attempts, please try again later"
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Brief error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Frontend Integration Example

### Using Axios (Recommended)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      try {
        const response = await axios.post(
          'http://localhost:8000/api/auth/refresh-token',
          { refreshToken }
        );
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  token VARCHAR(500) UNIQUE NOT NULL,
  expiresAt DATETIME NOT NULL,
  isRevoked BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely:**
   - Access tokens: Memory or secure storage
   - Refresh tokens: HttpOnly cookies (preferred)
3. **Implement CORS properly**
4. **Use environment variables for secrets**
5. **Enable rate limiting**
6. **Implement request validation**
7. **Log security events**
8. **Keep dependencies updated**

---

## Environment Variables

```env
PORT=8000
NODE_ENV=production

DB_HOST=your_db_host
DB_PORT=3306
DB_NAME=mcreation_db
DB_USER=your_db_user
DB_PASSWORD=your_secure_password

JWT_ACCESS_SECRET=your_strong_access_secret_key
JWT_REFRESH_SECRET=your_strong_refresh_secret_key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

CORS_ORIGIN=https://your-frontend-domain.com
```

---

## Testing with cURL

### Sign Up
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Sign In
```bash
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Get Current User
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Support

For issues or questions, please contact the development team or create an issue in the project repository.
