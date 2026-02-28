# Tenant Management Backend

A production-ready Node.js REST API backend using Express.js, PostgreSQL, and Sequelize.

## Tech Stack
- Node.js & Express.js
- PostgreSQL (pg)
- Sequelize ORM
- dotenv
- nodemon

## Project Structure (Clean Architecture)
- `src/config`: Database connection and auto-creation logic
- `src/controllers`: Request handlers
- `src/middlewares`: Custom Express middlewares (like error handling)
- `src/models`: Database schema designs using Sequelize
- `src/routes`: API route definitions
- `src/services`: Business logic and database operations
- `src/app.js`: Express app setup
- `src/server.js`: Server entrypoint

## Installation & Setup

1. **Clone the repository** (or navigate to the project directory):
   \`\`\`bash
   cd tenant-mgmt-backend
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**:
   Create a \`.env\` file in the root directory and copy the contents of \`.env.example\` into it. Customize the database credentials as needed:
   \`\`\`env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=tenant_db
   \`\`\`

4. **Database Note**:
   When you start the server, the application will automatically check if the database \`tenant_db\` exists. If not, it will connect to the default \`postgres\` database and create it. It also automatically syncs the \`users\` table via Sequelize.

## Running the Server

- **Development Mode** (auto-reloads on file changes):
  \`\`\`bash
  npm run dev
  \`\`\`

- **Production Mode**:
  \`\`\`bash
  npm start
  \`\`\`