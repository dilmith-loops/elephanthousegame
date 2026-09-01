# 🚀 Unified Hostinger Deployment Guide for Elephant House AR Game

Your repository is now completely restructured into a **single unified Git repository** containing both Frontend and Backend together.

---

## 📁 Repository Structure

```text
elephanthousegame/
├── .htaccess                 # Unified Apache/LiteSpeed routing for Hostinger
├── index.php                 # Root entrypoint routing API calls to Laravel
├── elephanthouse_game.sql    # Complete MySQL database export
├── HOSTINGER_DEPLOYMENT_GUIDE.md
├── frontend/                 # Next.js 16 AR Camera & Admin Portal
│   ├── src/                  # React & TypeScript source code
│   ├── public/               # Static models, wasm, logo, favicon
│   ├── out/                  # Compiled production static website
│   └── package.json
└── backend/                  # Laravel 11 Full-Stack REST API
    ├── app/                  # Controllers & Models (AdminController, GameController)
    ├── routes/               # API endpoints (api.php)
    ├── database/             # Migrations & Seeders
    ├── .env.example          # Template for database credentials
    └── artisan
```

---

## 🛠️ How It Works on Hostinger:

When you connect your GitHub repository in Hostinger, Hostinger pulls everything into `public_html/ElephantHouseGame/`:

1. **🎮 Frontend Requests** (`https://ai.loopsintegrated.co/ElephantHouseGame/` & `/eh-portal`):
   - `.htaccess` automatically serves the compiled static files from `frontend/out/`.
2. **🔌 Backend API Requests** (`https://ai.loopsintegrated.co/ElephantHouseGame/api/*`):
   - `.htaccess` forwards the request to `index.php`, which executes the Laravel backend in `backend/` and connects to the MySQL database.
3. **✨ 1-Click Deployment with Git**:
   - Whenever you push to GitHub, Hostinger automatically updates **both** the frontend and backend simultaneously!

---

## 🚀 Step-by-Step Setup:

### Step 1: Import Database into Hostinger phpMyAdmin
1. In Hostinger **hPanel ➔ Databases ➔ MySQL Databases**, create a database (e.g. `u123_elephanthouse`).
2. Open **phpMyAdmin**, click **Import**, and choose `elephanthouse_game.sql`.

### Step 2: Configure Database in `backend/.env`
In Hostinger File Manager, copy `backend/.env.example` to `backend/.env` and update:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u123_elephanthouse
DB_USERNAME=u123_admin
DB_PASSWORD=YourPasswordHere
```

### Step 3: Push to GitHub & Deploy in Hostinger
```bash
git add .
git commit -m "Unified frontend and backend in single repository"
git push origin main
```
In Hostinger **Git**, click **Deploy**!
