# 🚀 Minimal Project Management System (MPMS)

A full-stack, feature-rich Project Management Dashboard designed to streamline team collaboration, sprint planning, and task tracking. Built with the **MERN Stack (Next.js)**, this application offers a real-world experience with features like **Kanban Boards**, **Time Tracking**, **Analytics**, and **Role-based Access Control**.

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
- **Kanban Board:** Drag-and-drop interface to move tasks between Todo, In Progress, Review, and Done.
- **Rich Text Editor:** Tasks support formatted descriptions (Bold, Italic, Lists, etc.) using `react-quill-new`.
- **File Attachments:** Upload images/PDFs directly to tasks (Powered by Cloudinary).

### 3. ⏱️ Time Tracking & Activity Logs
- **Time Logging:** Developers can log actual hours worked vs estimated hours.
- **Activity Story:** A unified feed showing who changed status, who commented, and who logged time (Audit Trail).

### 4. 🏃 Sprint Management
- Create, Edit, and Delete Sprints.
- Organize tasks within specific sprints for Agile workflow.

### 5. 🛡️ Security & Roles
- **Authentication:** JWT-based secure login system.
- **Role-Based Access (RBAC):**
  - **Admin/Manager:** Can create projects, sprints, delete data.
  - **Member:** Can only update task status, log time, and comment.
- **Confirmation Modals:** Custom beautiful UI warnings before deleting critical data (Projects/Tasks).

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Visuals:** Recharts (Charts), Lucide React (Icons)
- **Tools:** React Hook Form, React Hot Toast, Hello Pangea DnD (Kanban), React Quill New

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JSON Web Token (JWT)
- **Storage:** Cloudinary (Image/File Uploads)

---

## 📸 Screenshots

---

## 🚀 How to Run Locally

Follow these steps to set up the project on your local machine.

### Prerequisites
- Node.js installed
- MongoDB URI
- Cloudinary Credentials

### 1. Clone the Repository

git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name


### 2. Backend Setup
Navigate to the server folder:

cd server
npm install

Create a .env file in the server folder and add your credentials:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Start the backend server:

npm run dev


### 3. Frontend Setup
Open a new terminal and navigate to the client folder:

cd client
npm install

Create a .env.local file in the client folder:

NEXT_PUBLIC_API_URL=http://localhost:5000/api

Start the frontend application:

npm run dev

Visit http://localhost:3000 in your browser.

---

## 🔐 Admin Credentials (For Testing)

You can use these credentials to explore Admin features (or create a new one):
- **Email:** admin@example.com
- **Password:** 123456

---

## 🤝 Contribution
Feel free to fork this repository and submit pull requests. Any improvements are welcome!

## 📄 License
This project is licensed under the MIT License.