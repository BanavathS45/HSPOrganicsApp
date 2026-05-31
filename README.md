# HSP Organics 🌿 — From Farm To Home

A **Progressive Web App (PWA)** for organic grocery delivery, built with React + Vite + Firebase.

## ✨ Features
- 📱 Installable PWA with offline support
- 🔐 Google Authentication (Firebase Auth)
- 🛒 Full shopping cart with coupon system
- 🗺️ Live delivery tracking with Leaflet maps
- 📊 Admin dashboard with ChartJS analytics
- 🔔 Real-time push notifications (FCM)
- 🌙 Dark mode support

## 🚀 Getting Started

### 1. Clone and install
```bash
git clone https://github.com/BanavathS45/hspOrganics.git
cd hspOrganics
npm install
```

### 2. Configure Firebase
```bash
cp .env.example .env
# Edit .env with your Firebase project credentials
```

### 3. Firebase Setup Checklist
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project → **HSP Organics**
3. Enable **Authentication** → Sign-in methods → Enable **Google** and **Email/Password**
4. Add your Netlify domain to **Authorized Domains** (Authentication → Settings)
5. Copy **Web App config** into your `.env` file
6. (Optional) Enable **Firestore** for persistent data across devices

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:5174](http://localhost:5174)

## 🔑 Demo Credentials (Mock Mode)
When no `.env` is configured, the app runs in **LocalStorage mock mode**:
| Role | Email | Password |
|------|-------|----------|
| Customer | customer@gmail.com | any |
| Admin | admin@hsporganics.com | admin123 |

## 📦 Build & Deploy
```bash
npm run build   # production build → dist/
```
Deploy the `dist/` folder to Netlify. See `netlify.toml` for full config.

## 🛠️ Tech Stack
React 19 · Vite 8 · Firebase 11 · Bootstrap 5 · CoreUI · Leaflet · ChartJS · Lucide Icons

## 📄 License
MIT
