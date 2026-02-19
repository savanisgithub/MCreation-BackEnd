# MCreation Backend

A robust Node.js/Express backend with TypeScript, JWT authentication, and MySQL database.

## Features

- ✅ JWT-based Authentication (Access & Refresh Tokens)
- ✅ User Sign Up & Sign In
- ✅ Password Hashing with bcrypt
- ✅ Input Validation
- ✅ Rate Limiting
- ✅ Error Handling
- ✅ CORS Configuration
- ✅ TypeScript Support
- ✅ MySQL Database with Sequelize ORM

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a MySQL database:
   ```sql
   CREATE DATABASE mcreation_db;
   ```

4. Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with your database credentials and JWT secrets

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- **GET** `/api/health` - Check API status

### Authentication

#### Sign Up
- **POST** `/api/auth/signup`
- Body:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password123"
  }
  ```

#### Sign In
- **POST** `/api/auth/signin`
- Body:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123"
  }
  ```

#### Refresh Token
- **POST** `/api/auth/refresh-token`
- Body:
  ```json
  {
    "refreshToken": "your_refresh_token"
  }
  ```

#### Sign Out
- **POST** `/api/auth/signout`
- Headers: `Authorization: Bearer <access_token>`
- Body:
  ```json
  {
    "refreshToken": "your_refresh_token"
  }
  ```

#### Get Current User
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <access_token>`

## Password Requirements

- Minimum 6 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middlewares/     # Express middlewares
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
├── validators/      # Input validation rules
├── app.ts           # Express app setup
└── index.ts         # Entry point
```

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Error handling

## License

ISC
