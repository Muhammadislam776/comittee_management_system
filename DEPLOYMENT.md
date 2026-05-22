# Committee Management System Production Deployment Guide 🚀

This document details the step-by-step procedures to deploy the Committee Management System to production environments using **Vercel** (for the Next.js frontend) and **Render** (for the Node.js Express & Socket.IO backend).

---

## 📂 Environment Variables Checklist

### 1. Backend Service (Render Environment variables)
Add the following keys in your Render service dashboard:

| Variable Name | Description | Example / Fallback |
|---|---|---|
| `PORT` | The port Express runs on | `5000` |
| `NODE_ENV` | Production tag environment | `production` |
| `MONGO_URI` | **MongoDB Atlas** Connection string | `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/prod_db` |
| `JWT_SECRET` | Super secure hashing salt key | `your_ultra_secure_jwt_random_secret_salt_phrase` |
| `FRONTEND_URL` | Whitelisted frontend Vercel URL | `https://committee-frontend.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Name (for Document Uploader) | `your_cloudinary_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `your_cloudinary_api_key` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret key | `your_cloudinary_api_secret` |

### 2. Frontend Service (Vercel Environment variables)
Add this key in Vercel settings:

| Variable Name | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | The HTTP endpoint for your Render Backend | `https://committee-backend.onrender.com/api` |
| `NEXT_PUBLIC_SOCKET_URL`| The WS endpoint for real-time channels | `https://committee-backend.onrender.com` |

---

## 🛠️ Step-by-Step Hosting Setup

### Step 1: Initialize MongoDB Atlas
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register a free cluster.
2. In **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere) to authorize Render dynamic server IPs.
3. In **Database Access**, create a user with a secure password.
4. Click **Connect** ➔ **Drivers** to copy the Node.js connection string. Replace `<username>` and `<password>` inside the link.

### Step 2: Persistent Media with Cloudinary
1. Register on [Cloudinary](https://cloudinary.com) (free account).
2. Grab your **Cloud Name**, **API Key**, and **API Secret** from the main dashboard console.

### Step 3: Deploy Backend on Render
1. Register at [Render](https://render.com) and link your GitHub account.
2. Click **New** ➔ **Blueprint** and import your repository to deploy automatically using [render.yaml](file:///f:/projects/SEC-A-FA23-BCS035-M.ISLAM-/comittee%20management%20system/render.yaml).
3. Alternatively, click **New Web Service**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add all environment variables listed above.

### Step 4: Deploy Frontend on Vercel
1. Register at [Vercel](https://vercel.com).
2. Click **Add New** ➔ **Project** and select your repository.
3. Configure the settings:
   - Root Directory: `frontend`
   - Framework Preset: **Next.js**
4. Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` in the environment values.
5. Click **Deploy**!
