🚀 Minimal Project Management System (MPMS)

A full-stack, production-ready Project Management Dashboard designed to streamline team collaboration, sprint planning, and task tracking. Built with the MERN Stack (Next.js & Express), this application offers a real-world experience with features like Kanban Boards, Time Tracking, Analytics, and Enterprise-Grade Security.

Live Site:
https://datapolex-client.vercel.app/

Server API:
https://datapolex.vercel.app/


====================
KEY FEATURES
====================

1) Interactive Dashboard & Analytics
- Project health visualization using Recharts
- Pie charts for task status distribution
- Bar charts for priority-based task analysis
- Real-time stats for Budget, Active Projects, and Pending Reviews

2) Advanced Task Management
- Kanban Board with drag-and-drop (Hello Pangea DnD)
- Rich Text Editor using react-quill-new
- Secure file uploads (Images / PDFs / Docs) via Cloudinary with size limits

3) Enterprise Security & Performance
- Security: Helmet, CORS, Rate Limiting, MongoDB Sanitization
- Performance: Gzip compression (up to 70% faster responses)
- Authentication: JWT-based secure login
- Role-Based Access Control (Admin, Manager, Member)

4) Time Tracking & Sprints
- Agile sprint creation and management
- Time logging (estimated vs actual hours)


====================
TECH STACK
====================

Frontend:
- Next.js 14 (App Router)
- Tailwind CSS
- Context API
- Recharts, Lucide React

Backend:
- Node.js
- Express.js
- MongoDB (Mongoose)
- Helmet, Express-Rate-Limit, Mongo-Sanitize
- Cloudinary for file storage


====================
HOW TO RUN THE PROJECT
====================

OPTION 1: MAGIC COMMAND (Recommended)

# Install dependencies
npm install
npm run install:all

# Start frontend & backend together
npm start

App runs on:
http://localhost:3000


OPTION 2: USING DOCKER

docker-compose up --build


OPTION 3: MANUAL SETUP

Backend Setup:
cd server
npm install
# create .env file
npm run dev

Frontend Setup:
cd client
npm install
# create .env.local file
npm run dev


====================
ENVIRONMENT VARIABLES
====================

Server (server/.env):

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=super_secret_key
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret


Client (client/.env.local):

NEXT_PUBLIC_API_URL=http://localhost:5000/api


====================
ADMIN CREDENTIALS (TESTING)
====================

Email: admin@datapolex.com
Password: password123


====================
CONTRIBUTION
====================

Feel free to fork this repository and submit pull requests.
All improvements are welcome.


====================
LICENSE
====================

MIT License
