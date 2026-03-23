# PR Review Application - Backend

This is the API server for the PR Review Application, built with Express and MongoDB.

## 🛠️ Prerequisites
- Node.js (v16+)
- MongoDB (Local) or a MongoDB Atlas Cluster

## ⚙️ Installation

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    - Create a `.env` file (copy from `.env.example`).
    - Set your `MONGODB_URI` and `JWT_SECRET`.

3.  **Seed Database:**
    - Run the following command to create initial projects and users (including the System Admin):
    ```bash
    npm run seed
    ```

4.  **Run Server:**
    ```bash
    npm run dev
    ```
    The server runs on [http://localhost:5000](http://localhost:5000).

## 🗄️ Core Models
- **User**: Managed roles (Admin, Employee, Lead Developer).
- **PR**: Stores pull request data, findings, and signatures.
- **Project**: Groups PRs for better management.
