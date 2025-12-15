import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
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

    console.log('🧹 Old Data Cleared...'.red.inverse);

    // 2. Create Users
    const users = await User.create([
      { name: 'Super Admin', email: 'admin@example.com', password: '123', role: 'admin', department: 'Headquarters', avatar: '' },
      { name: 'Tanvir Manager', email: 'manager@example.com', password: '123', role: 'manager', department: 'Product', avatar: '' },
      { name: 'Sarah Lead', email: 'sarah@example.com', password: '123', role: 'manager', department: 'Engineering', avatar: '' },
      { name: 'Rafiq Dev', email: 'dev1@example.com', password: '123', role: 'member', department: 'Backend', skills: ['Node.js', 'MongoDB'], avatar: '' },
      { name: 'Nusrat Dev', email: 'dev2@example.com', password: '123', role: 'member', department: 'Frontend', skills: ['React', 'Next.js'], avatar: '' },
      { name: 'Farhan Designer', email: 'design@example.com', password: '123', role: 'member', department: 'Design', skills: ['Figma', 'UI/UX'], avatar: '' },
      { name: 'Ayesha QA', email: 'qa@example.com', password: '123', role: 'member', department: 'QA', skills: ['Selenium', 'Jest'], avatar: '' },
      { name: 'Karim DevOps', email: 'devops@example.com', password: '123', role: 'member', department: 'Infrastructure', skills: ['AWS', 'Docker'], avatar: '' },
    ]);

    console.log(`👥 ${users.length} Users Created...`.green);

    const admin = users[0]._id;
    const members = users.slice(3).map(u => u._id); // All members (devs, qa, designers)

    // 3. Create Projects (Various Statuses)
    const projectsData = [
      {
        title: 'E-Commerce Platform Revamp',
        description: 'Complete overhaul of the legacy shopping platform with modern tech stack.',
        client: 'FashionHouse Ltd.',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31'),
        budget: 50000,
        status: 'active',
        thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=300&h=200'
      },
      {
        title: 'AI Customer Support Bot',
        description: 'Building an intelligent chatbot using GPT-4 API for automated support.',
        client: 'TechCorp Inc.',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2024-06-01'),
        budget: 15000,
        status: 'active',
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=300&h=200'
      },
      {
        title: 'HR Management Portal',
        description: 'Internal tool for managing employee leaves, payroll, and performance.',
        client: 'Internal',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2022-12-31'),
        budget: 25000,
        status: 'completed',
        thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=300&h=200'
      },
      {
        title: 'Food Delivery Mobile App',
        description: 'Cross-platform mobile app for food delivery service.',
        client: 'YummyFoods',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-08-01'),
        budget: 35000,
        status: 'planned', // Even planned projects will have sprints now
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=300&h=200'
      },
      {
        title: 'Corporate Website Redesign',
        description: 'SEO optimized corporate website with CMS integration.',
        client: 'BigBiz',
        startDate: new Date('2023-09-01'),
        endDate: new Date('2024-02-01'),
        budget: 8000,
        status: 'review',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=300&h=200'
      }
    ];

    const createdProjects = await Project.create(projectsData);
    console.log(`🚀 ${createdProjects.length} Projects Created...`.cyan);

    // 4. Create Sprints & Tasks for EVERY Project
    for (const project of createdProjects) {
        
        // --- Sprint 1: Past (Completed) ---
        const pastSprint = await Sprint.create({
            title: 'Sprint 1: Foundation',
            goal: 'Setup architecture and basic UI',
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)), // 1 month ago
            endDate: new Date(new Date().setDate(new Date().getDate() - 15)),
            status: 'completed',
            project: project._id
        });

        // --- Sprint 2: Current (Active) ---
        const activeSprint = await Sprint.create({
            title: 'Sprint 2: Core Features',
            goal: 'Implement key functionalities and API',
            startDate: new Date(new Date().setDate(new Date().getDate() - 5)), // Started 5 days ago
            endDate: new Date(new Date().setDate(new Date().getDate() + 10)), // Ends in 10 days
            status: 'active',
            project: project._id
        });

        // --- Sprint 3: Future (Planned) ---
        const futureSprint = await Sprint.create({
            title: 'Sprint 3: Testing & Polish',
            goal: 'QA, Bug fixes and Deployment',
            startDate: new Date(new Date().setDate(new Date().getDate() + 15)),
            endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            status: 'planned',
            project: project._id
        });

        // Task Generator Helper
        const generateTasks = async (sprintId: any, statusList: string[], count: number) => {
            for (let i = 0; i < count; i++) {
                const randomAssignee = members[Math.floor(Math.random() * members.length)];
                const randomAssignee2 = members[Math.floor(Math.random() * members.length)];
                const status = statusList[Math.floor(Math.random() * statusList.length)]; // Random status from list
                const priority = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];

                const timeLogs = [];
                let actualHours = 0;

                // Add logs only for done/in-progress
                if (status === 'done' || status === 'in-progress') {
                    actualHours = Math.floor(Math.random() * 10) + 1;
                    timeLogs.push({
                        user: randomAssignee,
                        hours: actualHours,
                        date: new Date()
                    });
                }

                await Task.create({
                    title: `Task ${i+1} for ${sprintId ? 'Sprint' : 'Backlog'} - ${status.toUpperCase()}`,
                    description: 'This is a mock task description to test the UI layout and responsiveness.',
                    project: project._id,
                    sprint: sprintId,
                    assignees: [randomAssignee, randomAssignee2],
                    status: status as any,
                    priority: priority as any,
                    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
                    actualHours: actualHours,
                    timeLogs: timeLogs,
                    comments: status === 'done' || status === 'review' ? [
                        { user: admin, text: 'Looks good, please check the PR.', createdAt: new Date() }
                    ] : []
                });
            }
        };

        // --- Create Tasks for each Sprint ---
        // 1. Past Sprint: Mostly Done tasks
        await generateTasks(pastSprint._id, ['done'], 5); 
        
        // 2. Active Sprint: Mix of Todo, In-Progress, Review, Done
        await generateTasks(activeSprint._id, ['todo', 'in-progress', 'review', 'done'], 8);
        
        // 3. Future Sprint: Mostly Todo tasks
        await generateTasks(futureSprint._id, ['todo'], 5);

        // 4. Backlog (No Sprint): Todo tasks
        await generateTasks(null, ['todo', 'in-progress'], 4);
    }

    console.log('✅ All Projects Populated with Full Sprints & Tasks!'.magenta);
    console.log('🎉 Data Import Success!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`.red.inverse);
    process.exit(1);
  }
};

importData();