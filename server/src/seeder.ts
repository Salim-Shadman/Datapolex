import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Project from './models/Project';
import Sprint from './models/Sprint';
import Task from './models/Task';
import connectDB from './config/db';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. Clear Existing Data
    await Task.deleteMany();
    await Sprint.deleteMany();
    await Project.deleteMany();
    await User.deleteMany();

    console.log('🗑️  Old Data Destroyed...');

    // 2. Create Users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        department: 'Management',
        skills: ['Leadership', 'System Architecture'],
        avatar: 'https://i.pravatar.cc/150?u=admin'
      },
      {
        name: 'Project Manager',
        email: 'manager@example.com',
        password: 'password123',
        role: 'manager',
        department: 'Product',
        skills: ['Agile', 'Scrum', 'Jira', 'Risk Management'],
        avatar: 'https://i.pravatar.cc/150?u=manager'
      },
      {
        name: 'Sarah Frontend',
        email: 'dev1@example.com',
        password: 'password123',
        role: 'member',
        department: 'Engineering',
        skills: ['React', 'Next.js', 'Tailwind', 'Redux'],
        avatar: 'https://i.pravatar.cc/150?u=sarah'
      },
      {
        name: 'Mike Backend',
        email: 'dev2@example.com',
        password: 'password123',
        role: 'member',
        department: 'Engineering',
        skills: ['Node.js', 'MongoDB', 'Docker', 'AWS'],
        avatar: 'https://i.pravatar.cc/150?u=mike'
      },
      {
        name: 'Alex Designer',
        email: 'design@example.com',
        password: 'password123',
        role: 'member',
        department: 'Design',
        skills: ['Figma', 'UI/UX', 'Adobe XD'],
        avatar: 'https://i.pravatar.cc/150?u=alex'
      },
      {
        name: 'Emily QA',
        email: 'qa@example.com',
        password: 'password123',
        role: 'member',
        department: 'Quality Assurance',
        skills: ['Selenium', 'Jest', 'Manual Testing'],
        avatar: 'https://i.pravatar.cc/150?u=emily'
      }
    ] as any);

    const [admin, manager, dev1, dev2, designer, qa] = users;
    console.log('✅ Users Imported...');

    // 3. Create Projects
    const projects = await Project.create([
      {
        title: 'E-Commerce Platform Revamp',
        client: 'TechCorp Inc.',
        description: 'Complete overhaul of the legacy e-commerce platform using Microservices.',
        startDate: new Date('2023-10-01'),
        endDate: new Date('2024-03-30'),
        budget: 75000,
        status: 'active',
        thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Internal HR Portal',
        client: 'DataPollex Internal',
        description: 'Employee self-service portal for leave management and payroll.',
        startDate: new Date('2023-11-15'),
        endDate: new Date('2024-02-15'),
        budget: 20000,
        status: 'active',
        thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
      }
    ] as any);

    const [ecommerce, hrPortal] = projects;
    console.log('✅ Projects Imported...');

    // 4. Create Sprints
    const sprints = await Sprint.create([
      {
        title: 'Sprint 1: Core Setup',
        goal: 'Project infrastructure and database design',
        sprintNumber: 1,
        startDate: new Date('2023-10-01'),
        endDate: new Date('2023-10-14'),
        status: 'completed',
        project: ecommerce._id
      },
      {
        title: 'Sprint 2: Auth & User Service',
        goal: 'Implement authentication and user management service',
        sprintNumber: 2,
        startDate: new Date('2023-10-15'),
        endDate: new Date('2023-10-29'),
        status: 'active',
        project: ecommerce._id
      }
    ] as any);

    const [ecomSprint1, ecomSprint2] = sprints;
    console.log('✅ Sprints Imported...');

    // 5. Create Tasks with Proper TimeLogs
    await Task.create([
      // --- Mike (Backend Dev) Tasks ---
      {
        title: 'Setup Monorepo Structure',
        description: 'Configure Turborepo.',
        project: ecommerce._id,
        sprint: ecomSprint1._id,
        assignees: [dev2._id],
        priority: 'high',
        status: 'done',
        estimate: 8,
        actualHours: 8,
        // FIX: Ensuring timeLogs exist so dashboard shows hours
        timeLogs: [{ user: dev2._id, hours: 8, date: new Date('2023-10-02') }]
      },
      {
        title: 'Implement JWT Auth Strategy',
        description: 'Secure API endpoints.',
        project: ecommerce._id,
        sprint: ecomSprint2._id,
        assignees: [dev2._id],
        priority: 'high',
        status: 'review',
        estimate: 10,
        actualHours: 9,
        // FIX: Adding logs for Mike
        timeLogs: [{ user: dev2._id, hours: 9, date: new Date() }],
        comments: [
            { user: qa._id, text: 'Found a bug in token refresh logic.', createdAt: new Date() }
        ]
      },

      // --- Sarah (Frontend Dev) Tasks ---
      {
        title: 'Login & Registration UI',
        description: 'Create responsive forms.',
        project: ecommerce._id,
        sprint: ecomSprint2._id,
        assignees: [dev1._id],
        priority: 'medium',
        status: 'in-progress',
        estimate: 12,
        actualHours: 4,
        // FIX: Adding logs for Sarah
        timeLogs: [{ user: dev1._id, hours: 4, date: new Date() }]
      },
      {
        title: 'Employee Profile Component',
        description: 'Component to display details.',
        project: hrPortal._id,
        sprint: null, // Backlog
        assignees: [dev1._id],
        priority: 'low',
        status: 'done',
        estimate: 4,
        actualHours: 4,
        // FIX: Adding logs for Sarah
        timeLogs: [{ user: dev1._id, hours: 4, date: new Date() }]
      },

      // --- Alex (Designer) Tasks ---
      {
        title: 'Dashboard Wireframes',
        description: 'Create low-fidelity wireframes.',
        project: hrPortal._id,
        sprint: null,
        assignees: [designer._id],
        priority: 'medium',
        status: 'done',
        estimate: 6,
        actualHours: 6,
        // FIX: Adding logs for Alex
        timeLogs: [{ user: designer._id, hours: 6, date: new Date() }]
      },

      // --- Admin / Manager Tasks ---
      {
        title: 'Requirement Analysis',
        description: 'Initial client meeting notes.',
        project: ecommerce._id,
        sprint: ecomSprint1._id,
        assignees: [manager._id],
        priority: 'high',
        status: 'done',
        estimate: 5,
        actualHours: 2,
        // FIX: Adding logs for Manager
        timeLogs: [{ user: manager._id, hours: 2, date: new Date() }]
      }
    ] as any);

    console.log('✅ Tasks Imported...');
    console.log('🚀 Data Seeded Successfully with Time Logs!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Task.deleteMany();
    await Sprint.deleteMany();
    await Project.deleteMany();
    await User.deleteMany();

    console.log('🔥 Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}