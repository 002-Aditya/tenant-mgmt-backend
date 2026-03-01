# 🏢 Tenant Management Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white)

A robust, multi-schema REST API backend designed for managing tenants, authentication, and structured notifications. Built using **Node.js, Express, Sequelize ORM, and PostgreSQL**.

---

## 🌟 Key Features

- **Multi-Schema Architecture**: Keeps logical parts of the application cleanly separated directly at the database level (`auth`, `notification`, `lov`, `public`).
- **Targeted Model Synchronization**: Explicit control over Sequelize ORM syncing routines ensuring stable deployments. Supports automated `SYNC_ALTER` environmental toggles.
- **Internal Seed Configuration**: Automatically identifies empty tables and seeds necessary LOVs (List of Values) such as Genders dynamically on server startup.
- **Comprehensive Associations**: Deeply integrated UUID-based foreign keys across schemas.
- **Modern Security**: Powered by `bcryptjs` for encryption, `jsonwebtoken` for stateless authentication, and `passport-google-oauth2` ready for Single Sign-On (SSO).

---

## 🛠️ Technology Stack

| Architecture Layer    | Technology           |
| --------------------- | -------------------- |
| **Core Framework**    | Express (v5)         |
| **Database Engine**   | PostgreSQL           |
| **ORM Framework**     | Sequelize            |
| **Authentication**    | JWT, Passport GOAuth |
| **Middleware Engine** | body-parser, cors    |

---

## 🗄️ Database Architecture

The data is distinctly segmented into the following schemas:

- **`auth` Schema**
  - `UserMaster`: Tracks complete user identification, encrypted passwords, roles, and status modifiers.
- **`notification` Schema**
  - `OtpMaster`: Explicit mapping for OTP lifecycles containing generation timing, automated expiry calculation, and active retry limitations.
- **`lov` Schema**
  - `Gender`: Generic List of Value dictionary seeding system tables dynamically (`M=Male`, `F=Female`, `O=Other`).

---

## 🚀 Getting Started Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [PostgreSQL](https://www.postgresql.org/) (v12+ running locally)

### 1. Installation

Clone the repository and install the initial dependencies:

```bash
git clone https://github.com/002-Aditya/tenant-mgmt-backend.git
cd tenant-mgmt-backend
npm install
```

### 2. Environment Variables

Create a root `.env` file referencing your local PostgreSQL environment:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=tenant_db
```

### 3. Server Initialization

To launch the project using hot-reloading. The Database module will safely run raw PostgreSQL routines to create `tenant_db` schemas automatically if they do not exist:

```bash
npm run dev
```

> **Note on Table Alterations:**
> By default, the server only attempts database schema initialization (does not overwrite/alter existing tables). To force Sequelize to synchronize column structures against your backend code natively, use the explicit Environment flag:
>
> ```bash
> SYNC_ALTER=true npm run dev
> ```

---

## ⚙️ Scripts

- `npm start` / `npm run dev`: Boot development server with `nodemon`
- `npm test`: _Placeholder for future test suites_
