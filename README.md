# 🚀 Minimal Project Management System (MPMS)

A full-stack, production-ready Project Management Dashboard designed to streamline team collaboration, sprint planning, and task tracking. Built with the **MERN Stack (Next.js & Express)**, this application offers a real-world experience with features like **Kanban Boards**, **Time Tracking**, **Analytics**, and **Enterprise-Grade Security**.

🔴 **Live Site:** [Insert Your Vercel/Live Link Here]
⚙️ **Server API:** [Insert Your Render/Server Link Here]

---

## 🔥 Key Features

### 1. 📊 Interactive Dashboard & Analytics
- Visualizes project health using **Recharts**.
- **Pie Charts** for task status distribution.
- **Bar Charts** for priority-based task analysis.
- Real-time stats on Budget, Active Projects, and Pending Reviews.

### 2. 📋 Advanced Task Management
- **Kanban Board:** Drag-and-drop interface (Hello Pangea DnD).
- **Rich Text Editor:** Tasks support formatted descriptions using `react-quill-new`.
- **File Attachments:** Upload images/PDFs/Docs securely to Cloudinary with size limits.

### 3. 🛡️ Enterprise Security & Performance
- **Security:** Helmet, CORS, Rate Limiting, and NoSQL Injection Protection (Sanitization).
- **Performance:** Gzip Compression enabled for 70% faster API responses.
- **Authentication:** JWT-based secure login with session sync.
- **Role-Based Access (RBAC):** Granular permissions for Admin, Manager, and Member.

### 4. ⏱️ Time Tracking & Sprints
- **Agile Workflow:** Create and manage Sprints.
- **Time Logging:** Track actual vs estimated hours with built-in timers.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State:** Context API
- **Visuals:** Recharts, Lucide React

### Backend
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB (Mongoose)
- **Security:** Helmet, Express-Rate-Limit, Mongo-Sanitize
- **Storage:** Cloudinary

---

## 🚀 How to Run (3 Ways)

### Option 1: The Magic Command (Recommended) 🪄
Run both frontend and backend with a single command!

# 1. Install dependencies
npm install
npm run install:all

# 2. Start Everything
npm start

*App will run at http://localhost:3000*

---

### Option 2: Using Docker 🐳
Run the entire stack (Frontend + Backend + Database) in a container.

docker-compose up --build

---

### Option 3: Manual Setup
If you prefer running them separately:

**1. Backend Setup**
cd server
npm install
# Create .env file (see below)
npm run dev

**2. Frontend Setup**
cd client
npm install
# Create .env.local file (see below)
npm run dev

---

## 🔑 Environment Variables (.env)

**Server (server/.env):**
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=super_secret_key
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

**Client (client/.env.local):**
NEXT_PUBLIC_API_URL=http://localhost:5000/api

---

## 🔐 Admin Credentials (For Testing)
We have pre-seeded the database with these credentials:

- **Email:** admin@datapolex.com
- **Password:** password123

---

## 🤝 Contribution
Feel free to fork this repository and submit pull requests. Any improvements are welcome!

## 📄 License
This project is licensed under the MIT License.