# Database Setup Guide for MCreation Backend

## Prerequisites

- MySQL Server 8.0 or higher installed
- MySQL command line or MySQL Workbench

## Step 1: Create Database

### Using MySQL Command Line

1. Open MySQL command line:
```bash
mysql -u root -p
```

2. Enter your MySQL root password

3. Create the database:
```sql
CREATE DATABASE mcreation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Verify database creation:
```sql
SHOW DATABASES;
```

5. Exit MySQL:
```sql
EXIT;
```

### Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Click on "Create New Schema" icon (cylinder with + sign)
4. Enter schema name: `mcreation_db`
5. Set charset to `utf8mb4` and collation to `utf8mb4_unicode_ci`
6. Click "Apply"

## Step 2: Create Database User (Optional but Recommended)

For security, create a dedicated user for the application:

```sql
-- Create user
CREATE USER 'mcreation_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON mcreation_db.* TO 'mcreation_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;
```

## Step 3: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

2. Edit the `.env` file and update the database configuration:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mcreation_db
DB_USER=mcreation_user
DB_PASSWORD=your_secure_password
```

If using root user:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mcreation_db
DB_USER=root
DB_PASSWORD=your_root_password
```

## Step 4: Start the Backend Server

The application will automatically create the required tables on first run.

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# OR build and run in production
npm run build
npm start
```

## Expected Output

When the server starts successfully, you should see:

```
✓ Database connection established successfully
✓ Database models synchronized
╔════════════════════════════════════════════════╗
║                                                ║
║     🚀 MCreation Backend Server Started       ║
║                                                ║
╠════════════════════════════════════════════════╣
║  Port:        8000                             ║
║  Environment: development                      ║
║  CORS Origin: http://localhost:5173            ║
╠════════════════════════════════════════════════╣
║  API Endpoints:                                ║
║  • Health:    http://localhost:8000/api/health ║
║  • Auth:      http://localhost:8000/api/auth   ║
╚════════════════════════════════════════════════╝
```

## Step 5: Verify Database Tables

Check that the tables were created:

```sql
USE mcreation_db;
SHOW TABLES;
```

Expected tables:
- `users`
- `refresh_tokens`

View table structure:
```sql
DESCRIBE users;
DESCRIBE refresh_tokens;
```

## Database Schema

### Users Table
```sql
+-----------+--------------+------+-----+-------------------+-------------------+
| Field     | Type         | Null | Key | Default           | Extra             |
+-----------+--------------+------+-----+-------------------+-------------------+
| id        | int          | NO   | PRI | NULL              | auto_increment    |
| username  | varchar(50)  | NO   | UNI | NULL              |                   |
| email     | varchar(100) | NO   | UNI | NULL              |                   |
| password  | varchar(255) | NO   |     | NULL              |                   |
| isActive  | tinyint(1)   | NO   |     | 1                 |                   |
| createdAt | datetime     | NO   |     | CURRENT_TIMESTAMP |                   |
| updatedAt | datetime     | NO   |     | CURRENT_TIMESTAMP | on update         |
+-----------+--------------+------+-----+-------------------+-------------------+
```

### Refresh Tokens Table
```sql
+-----------+--------------+------+-----+-------------------+-------------------+
| Field     | Type         | Null | Key | Default           | Extra             |
+-----------+--------------+------+-----+-------------------+-------------------+
| id        | int          | NO   | PRI | NULL              | auto_increment    |
| userId    | int          | NO   | MUL | NULL              |                   |
| token     | varchar(500) | NO   | UNI | NULL              |                   |
| expiresAt | datetime     | NO   |     | NULL              |                   |
| isRevoked | tinyint(1)   | NO   |     | 0                 |                   |
| createdAt | datetime     | NO   |     | CURRENT_TIMESTAMP |                   |
| updatedAt | datetime     | NO   |     | CURRENT_TIMESTAMP | on update         |
+-----------+--------------+------+-----+-------------------+-------------------+
```

## Troubleshooting

### Cannot connect to database

**Error:** `ER_ACCESS_DENIED_ERROR` or `ECONNREFUSED`

**Solutions:**
1. Check MySQL service is running:
   ```bash
   # Windows
   net start MySQL80
   
   # Linux/Mac
   sudo systemctl start mysql
   ```

2. Verify credentials in `.env` file
3. Check MySQL is listening on port 3306:
   ```sql
   SHOW VARIABLES LIKE 'port';
   ```

### Database already exists

If you need to recreate the database:

```sql
DROP DATABASE IF EXISTS mcreation_db;
CREATE DATABASE mcreation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Tables not created

1. Check server logs for errors
2. Ensure `NODE_ENV` is set to `development` for auto-sync
3. Manually run synchronization by restarting the server

### Permission denied

Grant necessary permissions:
```sql
GRANT ALL PRIVILEGES ON mcreation_db.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

## Testing the Connection

Use the health check endpoint:

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-02-18T10:00:00.000Z"
}
```

## Security Recommendations

1. **Never use root user in production**
2. **Create a dedicated database user with minimal privileges**
3. **Use strong passwords**
4. **Enable SSL/TLS for database connections in production**
5. **Regular backups:**
   ```bash
   mysqldump -u root -p mcreation_db > backup.sql
   ```
6. **Keep MySQL updated to the latest stable version**

## Production Considerations

1. **Use environment-specific configurations**
2. **Enable MySQL slow query log**
3. **Configure proper connection pooling**
4. **Set up database monitoring**
5. **Implement backup strategy**
6. **Use read replicas for scaling**

## Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Node.js MySQL Best Practices](https://github.com/mysqljs/mysql#readme)
