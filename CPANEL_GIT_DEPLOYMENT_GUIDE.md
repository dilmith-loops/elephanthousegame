# 🚀 Complete cPanel Git Deployment Guide for Elephant House AR Game

This guide provides step-by-step instructions to host the Elephant House AR Game on any **cPanel** hosting account using **Git™ Version Control**.

---

## 🏗️ Architecture Overview

The repository is structured to run **both Frontend and Backend together** on Apache/LiteSpeed hosting without requiring Node.js on the server:

* **🎮 Frontend (Next.js 16)**: Pre-compiled static assets are located in [`frontend/out/`](frontend/out/). All HTML, JavaScript, WASM face-tracking modules, and 3D models are served directly by Apache.
* **🔌 Backend (Laravel 11)**: Located in [`backend/`](backend/), handling leaderboard scores, player sessions, admin dashboard, and system settings.
* **🔀 Root Router ([`.htaccess`](.htaccess) & [`index.php`](index.php))**:
  - Automatically routes `/api/*` to the Laravel backend.
  - Automatically routes web requests, game views, `eh-portal`, terms, and privacy policies to `frontend/out/`.

---

## 📋 Prerequisites Checklist in cPanel

Before deploying, ensure the following in your cPanel dashboard:

1. **PHP Version: 8.2 or 8.3**
   - Go to **cPanel ➔ MultiPHP Manager** (or **Select PHP Version**).
   - Set your domain to use **PHP 8.2** or **PHP 8.3**.
   - Ensure the following standard PHP extensions are enabled:
     `pdo_mysql`, `mbstring`, `openssl`, `bcmath`, `curl`, `fileinfo`, `tokenizer`, `xml`, `zip`.

2. **MySQL Database Setup**
   - Go to **cPanel ➔ MySQL® Databases**:
     1. **Create New Database**: e.g., `youruser_elephanthouse`.
     2. **Create New User**: e.g., `youruser_gameuser` with a strong password.
     3. **Add User to Database**: Select **ALL PRIVILEGES** and click **Make Changes**.
   - Go to **cPanel ➔ phpMyAdmin**:
     1. Select your newly created database.
     2. Click the **Import** tab at the top.
     3. Choose the [`elephanthouse_game.sql`](elephanthouse_game.sql) file from the repository root.
     4. Click **Import** (at the bottom) to load the schema and initial settings.

---

## 🚀 Step-by-Step Git Deployment

### Option A: Using cPanel Git™ Version Control (Recommended UI Method)

1. Log in to your **cPanel** account.
2. In the **Files** section, click **Git™ Version Control**.
3. Click the blue **Create** button in the top right.
4. Fill in the repository details:
   * **Clone URL**: `https://github.com/dilmith-loops/elephanthousegame.git`
   * **Repository Path**:
     - For primary domain root: `public_html` (Note: `public_html` must be empty or you can clone into a subfolder).
     - For subdomain or subfolder: `public_html/elephanthousegame` or `subdomains/game`.
   * **Repository Name**: `elephanthousegame`
5. Click **Create**. cPanel will clone the repository from GitHub.

---

### Option B: Using cPanel Terminal / SSH (Fastest Method)

If your cPanel has the **Terminal** tool enabled:

```bash
# 1. Navigate to your web root
cd ~
# If deploying directly to public_html:
git clone https://github.com/dilmith-loops/elephanthousegame.git public_html

# OR if public_html already exists and is empty:
cd public_html
git clone https://github.com/dilmith-loops/elephanthousegame.git .
```

---

## ⚙️ Backend Configuration

### 1. Create `backend/.env`
In cPanel **File Manager** (or Terminal):
1. Navigate to `backend/`.
2. Copy `backend/.env.cpanel.example` to `backend/.env`.
3. Open `backend/.env` and update your database credentials and domain:

```env
APP_NAME="Elephant House AR Game"
APP_ENV=production
APP_KEY=base64:ekLyZjg42eqEKw2jymhalp2GzRxia10qDSzpw0Gt8eA=
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=youruser_elephanthouse
DB_USERNAME=youruser_gameuser
DB_PASSWORD=YourPasswordHere

SESSION_DRIVER=database
CACHE_STORE=database
CORS_ALLOWED_ORIGINS=*
```

### 2. Install / Verify PHP Dependencies (`vendor/`)

#### If you have cPanel Terminal:
Run the following commands:
```bash
cd ~/public_html/backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
```

#### If you DO NOT have Terminal or Composer on your hosting:
1. On your local machine, open terminal in this project:
   ```bash
   cd /Applications/XAMPP/xamppfiles/htdocs/elephanthousegame/backend
   zip -r vendor.zip vendor
   ```
2. In cPanel **File Manager**, upload `vendor.zip` into `public_html/backend/` and click **Extract**.

### 3. Permissions Check
Ensure the following directories have write permissions (`775` or `755`):
* `backend/storage/` (and all subdirectories: `framework`, `logs`, `app`)
* `backend/bootstrap/cache/`

In cPanel Terminal:
```bash
chmod -R 775 ~/public_html/backend/storage
chmod -R 775 ~/public_html/backend/bootstrap/cache
```

---

## 🔄 How to Pull Future Updates with Git

Whenever you commit and push new code to GitHub `main`:

1. Open cPanel ➔ **Git™ Version Control**.
2. Find `elephanthousegame` and click **Manage**.
3. Switch to the **Pull or Deploy** tab.
4. Click **Update from Remote**.
5. Done! Your live website updates in seconds without any manual FTP re-uploading.

---

## 🛠️ Verification & Troubleshooting

| Check | Expected Result | Solution if Failing |
| :--- | :--- | :--- |
| **Game Home** (`https://yourdomain.com/`) | 3D Ice cream game interface loads with AR camera prompt. | Check that `.htaccess` is present and permissions are `644`. |
| **API Health** (`https://yourdomain.com/api/settings`) | Returns JSON with game settings (`status: true`). | Verify `backend/.env` database credentials and PHP version 8.2+. |
| **Admin Portal** (`https://yourdomain.com/eh-portal`) | Elephant House Admin Login screen. | Ensure `frontend/out/eh-portal/index.html` exists. |
| **500 Internal Error** | Error page displayed. | Check `backend/storage/logs/laravel.log` and ensure `storage/` directory permissions are `775`. |
| **Blank Screen / 404** | Assets not loading. | In cPanel File Manager, ensure **"Show Hidden Files"** is enabled so `.htaccess` was not missed. |
