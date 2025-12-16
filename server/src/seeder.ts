import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Project from './models/Project';
import Sprint from './models/Sprint';
import Task from './models/Task';
import connectDB from './config/db';

dotenv.config();

const importData = async () => {
  try {
    await connectDB();
    
    console.log('⏳ Destroying old data...');
    await Task.deleteMany();
    await Sprint.deleteMany();
    await Project.deleteMany();
    await User.deleteMany();
    console.log('✅ Old Data Destroyed.');

    // ---------------------------------------------------------
    // 1. CREATE USERS (LOOP METHOD TO ENSURE HASHING)
    // ---------------------------------------------------------
    console.log('👤 Creating Users...');
    
    const usersData = [
      {
        name: 'Salim Shadman',
        email: 'admin@datapolex.com',
        password: 'password123',
        role: 'admin',
        department: 'Management',
        skills: ['Leadership', 'System Architecture'],
        avatar: 'https://i.pravatar.cc/150?u=salim'
      },
      {
        name: 'Tanvir Hasan',
        email: 'manager@datapolex.com',
        password: 'password123',
        role: 'manager',
        department: 'Product',
        skills: ['Agile', 'Scrum'],
        avatar: 'https://i.pravatar.cc/150?u=tanvir'
      },
      {
        name: 'Rahim Uddin',
        email: 'dev1@datapolex.com',
        password: 'password123',
        role: 'member',
        department: 'Engineering',
        skills: ['React', 'Next.js'],
        avatar: 'https://i.pravatar.cc/150?u=rahim'
      },
      {
        name: 'Karim Ahmed',
        email: 'dev2@datapolex.com',
        password: 'password123',
        role: 'member',
        department: 'Engineering',
        skills: ['Node.js', 'MongoDB'],
        avatar: 'https://i.pravatar.cc/150?u=karim'
      },
      {
        name: 'Nasreen Akter',
        email: 'qa1@datapolex.com',
        password: 'password123',
        role: 'member',
        department: 'QA',
        skills: ['Automation', 'Jest'],
        avatar: 'https://i.pravatar.cc/150?u=nasreen'
      },
      {
        name: 'Farhana Yeasmin',
        email: 'design1@datapolex.com',
        password: 'password123',
        role: 'member',
        department: 'Design',
        skills: ['Figma', 'UI/UX'],
        avatar: 'https://i.pravatar.cc/150?u=farhana'
      }
    ];

    const createdUsers = [];
    
    // FIX: Create users one by one to trigger 'pre-save' hook for password hashing
    for (const u of usersData) {
        const user = new User(u);
        const savedUser = await user.save();
        createdUsers.push(savedUser);
    }

    // Access users by index for relations
    const admin = createdUsers[0];
    const manager = createdUsers[1];
    const dev1 = createdUsers[2];
    const dev2 = createdUsers[3];
    const qa1 = createdUsers[4];
    const des1 = createdUsers[5];

    // ---------------------------------------------------------
    // 2. CREATE PROJECTS
    // ---------------------------------------------------------
    console.log('📁 Creating Projects...');
    const projects = await Project.create([
      {
        title: 'E-Commerce Platform Revamp',
        client: 'TechCorp Inc.',
        description: 'Complete overhaul of the legacy e-commerce platform.',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        budget: 75000,
        status: 'active',
        thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Internal HR Portal',
        client: 'DataPollex Internal',
        description: 'Employee self-service portal.',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-05-15'),
        budget: 20000,
        status: 'active',
        thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
      },
      {
        title: 'Mobile Banking App',
        client: 'FinTrust Bank',
        description: 'Secure mobile banking application.',
        startDate: new Date('2023-11-01'),
        endDate: new Date('2024-08-01'),
        budget: 120000,
        status: 'active',
        thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80'
      }
    ] as any);

    const [ecommerce, hrPortal, bankingApp] = projects;

    // ---------------------------------------------------------
    // 3. CREATE SPRINTS
    // ---------------------------------------------------------
    console.log('🚀 Creating Sprints...');
    const sprints = await Sprint.create([
      {
        title: 'Sprint 1: Core Setup',
        goal: 'Project infrastructure',
        sprintNumber: 1,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-14'),
        status: 'completed',
        project: ecommerce._id
      },
      {
        title: 'Sprint 2: Auth & Profile',
        goal: 'Implement JWT auth',
        sprintNumber: 2,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-29'),
        status: 'active',
        project: ecommerce._id
      },
      {
        title: 'Sprint 1: UI/UX Design',
        goal: 'Finalize wireframes',
        sprintNumber: 1,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-02-28'),
        status: 'active',
        project: hrPortal._id
      }
    ] as any);

    const [ecomSprint1, ecomSprint2, hrSprint1] = sprints;

    // ---------------------------------------------------------
    // 4. CREATE TASKS
    // ---------------------------------------------------------
    console.log('📝 Creating Tasks...');
    
    const tasksData: any[] = [
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
        timeLogs: [{ user: dev2._id, hours: 8, date: new Date() }]
      },
      {
        title: 'Implement JWT Auth',
        description: 'Secure API endpoints.',
        project: ecommerce._id,
        sprint: ecomSprint2._id,
        assignees: [dev1._id],
        priority: 'high',
        status: 'review',
        estimate: 16,
        actualHours: 14,
        timeLogs: [{ user: dev1._id, hours: 14, date: new Date() }]
      },
      {
        title: 'Dashboard Wireframes',
        description: 'Low-fidelity wireframes.',
        project: hrPortal._id,
        sprint: hrSprint1._id,
        assignees: [des1._id],
        priority: 'medium',
        status: 'done',
        estimate: 10,
        actualHours: 10,
        timeLogs: [{ user: des1._id, hours: 10, date: new Date() }]
      },
      {
        title: 'Fix Biometric Login Bug',
        description: 'FaceID failing on iOS 17.',
        project: bankingApp._id,
        sprint: undefined,
        assignees: [dev1._id],
        priority: 'high',
        status: 'in-progress',
        estimate: 4,
        actualHours: 2,
        timeLogs: [{ user: dev1._id, hours: 2, date: new Date() }]
      }
    ];

    // Generate random tasks
    const statuses = ['todo', 'in-progress', 'review', 'done'];
    const priorities = ['low', 'medium', 'high'];

    for (let i = 1; i <= 15; i++) {
        const randStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randProj = projects[Math.floor(Math.random() * projects.length)];
        const randUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        
        tasksData.push({
            title: `Random Feature Request #${i}`,
            description: 'Auto-generated task.',
            project: randProj._id,
            sprint: undefined, 
            assignees: [randUser._id],
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            status: randStatus,
            estimate: Math.floor(Math.random() * 10) + 1,
            actualHours: randStatus === 'done' ? Math.floor(Math.random() * 5) + 1 : 0,
            timeLogs: randStatus === 'done' ? [{ user: randUser._id, hours: 2, date: new Date() }] : []
        });
    }

    await Task.create(tasksData);

    console.log(`✅ ${tasksData.length} Tasks Imported.`);
    console.log('🚀 SEEDING COMPLETE! Login details:');
    console.log('   Admin:   admin@datapolex.com / password123');
    console.log('   Manager: manager@datapolex.com / password123');
    
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
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