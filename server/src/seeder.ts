import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import colors from 'colors'; // Removed to avoid missing module error
import User from './models/User';
import Project from './models/Project';
import Sprint from './models/Sprint';
import Task from './models/Task';
import connectDB from './config/db';

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. Clear Database
    await Task.deleteMany();
    await Sprint.deleteMany();
    await Project.deleteMany();
    await User.deleteMany();

    console.log('🧹 Old Data Cleared...');

    // 2. Create Users
    const users = await User.create([
      { name: 'Salim Admin', email: 'admin@example.com', password: '123', role: 'admin', department: 'Headquarters', avatar: '' },
      { name: 'Tanvir Manager', email: 'manager@example.com', password: '123', role: 'manager', department: 'Product', avatar: '' },
      { name: 'Sarah Lead', email: 'sarah@example.com', password: '123', role: 'manager', department: 'Engineering', avatar: '' },
      { name: 'Rafiq Dev', email: 'dev1@example.com', password: '123', role: 'member', department: 'Backend', skills: ['Node.js', 'MongoDB'], avatar: '' },
      { name: 'Nusrat Dev', email: 'dev2@example.com', password: '123', role: 'member', department: 'Frontend', skills: ['React', 'Next.js'], avatar: '' },
      { name: 'Farhan Designer', email: 'design@example.com', password: '123', role: 'member', department: 'Design', skills: ['Figma', 'UI/UX'], avatar: '' },
      { name: 'Ayesha QA', email: 'qa@example.com', password: '123', role: 'member', department: 'QA', skills: ['Selenium', 'Jest'], avatar: '' },
      { name: 'Karim DevOps', email: 'devops@example.com', password: '123', role: 'member', department: 'Infrastructure', skills: ['AWS', 'Docker'], avatar: '' },
    ]);

    console.log(`👥 ${users.length} Users Created...`);

    const admin = users[0]._id;
    const members = users.slice(3).map(u => u._id);

    // 3. Create Projects
    const projectsData = [
      {
        title: 'E-Commerce Platform Revamp',
        description: 'Redesigning the shopping experience with Next.js and Microservices.',
        client: 'FashionHouse Ltd.',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 50000,
        status: 'active',
        thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=300&h=200'
      },
      {
        title: 'AI Chatbot Integration',
        description: 'Integrating OpenAI API for 24/7 customer support automation.',
        client: 'TechCorp Inc.',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-30'),
        budget: 15000,
        status: 'active',
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=300&h=200'
      },
      {
        title: 'Internal HR Portal',
        description: 'Employee management system with payroll, leave, and performance tracking.',
        client: 'Internal',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-12-31'),
        budget: 25000,
        status: 'completed',
        thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=300&h=200'
      },
      {
        title: 'Food Delivery Mobile App',
        description: 'Cross-platform mobile app for food delivery service using Flutter.',
        client: 'YummyFoods',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-01-01'),
        budget: 35000,
        status: 'planned',
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=300&h=200'
      },
      {
        title: 'Corporate Website Redesign',
        description: 'SEO optimized corporate website with modern CMS integration.',
        client: 'BigBiz',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-02-01'),
        budget: 8000,
        status: 'active',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300&h=200'
      }
    ];

    const createdProjects = await Project.create(projectsData);
    console.log(`🚀 ${createdProjects.length} Projects Created...`);

    // 4. Loop to Create Sprints & Tasks
    for (const project of createdProjects) {
        
        // --- Sprint 1: Past (Completed) ---
        // FIX: Result cast to 'any' to avoid TS Array vs Object error
        const pastSprint = (await Sprint.create({
            title: 'Sprint 1: Foundation Setup',
            goal: 'Setup architecture, DB schema and basic UI components',
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
            endDate: new Date(new Date().setDate(new Date().getDate() - 15)),
            status: 'completed',
            project: project._id
        } as any)) as any;

        // --- Sprint 2: Current (Active) ---
        const activeSprint = (await Sprint.create({
            title: 'Sprint 2: Core Features',
            goal: 'Implement authentication, dashboard and key API endpoints',
            startDate: new Date(new Date().setDate(new Date().getDate() - 5)),
            endDate: new Date(new Date().setDate(new Date().getDate() + 10)),
            status: 'active',
            project: project._id
        } as any)) as any;

        // --- Sprint 3: Future (Planned) ---
        const futureSprint = (await Sprint.create({
            title: 'Sprint 3: Testing & Polish',
            goal: 'QA testing, bug fixes and production deployment',
            startDate: new Date(new Date().setDate(new Date().getDate() + 15)),
            endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            status: 'planned',
            project: project._id
        } as any)) as any;

        // Task Generator Helper
        const generateTasks = async (sprintId: any, statusList: string[], count: number) => {
            for (let i = 0; i < count; i++) {
                const randomAssignee = members[Math.floor(Math.random() * members.length)];
                const randomAssignee2 = members[Math.floor(Math.random() * members.length)];
                const status = statusList[Math.floor(Math.random() * statusList.length)];
                const priority = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];

                const timeLogs = [];
                let actualHours = 0;
                if (status === 'done' || status === 'in-progress') {
                    actualHours = Math.floor(Math.random() * 8) + 1;
                    timeLogs.push({
                        user: randomAssignee,
                        hours: actualHours,
                        date: new Date()
                    });
                }

                const comments = [];
                if (status === 'done' || status === 'review') {
                    comments.push({
                        user: admin,
                        text: 'Looks good! Ready for QA.',
                        createdAt: new Date()
                    });
                }

                await Task.create({
                    title: `Task ${i+1} - ${sprintId ? 'Sprint Feature' : 'Backlog Item'} (${status.toUpperCase()})`,
                    description: 'This is a sample task description generated by the seeder script. Verify UI layout and responsiveness.',
                    project: project._id,
                    sprint: sprintId, 
                    assignees: [randomAssignee, randomAssignee2],
                    status: status as any,
                    priority: priority as any,
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                    estimate: Math.floor(Math.random() * 10) + 5,
                    actualHours: actualHours,
                    timeLogs: timeLogs,
                    comments: comments
                } as any);
            }
        };

        // --- Call Task Generation ---
        await generateTasks(pastSprint._id, ['done'], 6); 
        await generateTasks(activeSprint._id, ['todo', 'in-progress', 'review', 'done'], 10);
        await generateTasks(futureSprint._id, ['todo'], 5);
        await generateTasks(null, ['todo', 'in-progress'], 4);
    }

    console.log('✅ All Projects Populated with Full Sprints & Tasks!');
    console.log('🎉 Data Import Success!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

importData();