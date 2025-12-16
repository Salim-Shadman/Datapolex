import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import Project from './models/Project';
import Sprint from './models/Sprint';
import Task from './models/Task';
import connectDB from './config/db';

dotenv.config();

// --- HELPER FUNCTIONS FOR RANDOM DATA ---
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const projectPrefixes = ['Smart', 'Auto', 'Cyber', 'NextGen', 'Cloud', 'Quantum', 'Eco', 'Fin', 'Edu', 'Medi'];
const projectSuffixes = ['System', 'Platform', 'Dashboard', 'Analytics', 'Portal', 'App', 'Hub', 'Solution', 'Engine', 'Network'];
const clientNames = ['TechCorp', 'Globex', 'Acme Inc.', 'Stark Ind.', 'Wayne Ent.', 'Cyberdyne', 'Massive Dynamic', 'Hooli', 'Pied Piper'];

const taskVerbs = ['Fix', 'Implement', 'Design', 'Refactor', 'Test', 'Deploy', 'Update', 'Optimize', 'Review', 'Document'];
const taskNouns = ['API', 'Login', 'Dashboard', 'Database', 'UI', 'Button', 'Header', 'Footer', 'Auth', 'Payment Gateway', 'Search', 'Filters'];

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
    // 1. CREATE USERS
    // ---------------------------------------------------------
    console.log('👤 Creating Users...');
    
    const usersData = [
      // Core Users
      { name: 'Salim Shadman', email: 'admin@datapolex.com', role: 'admin', department: 'Management', skills: ['Leadership'] },
      { name: 'Tanvir Hasan', email: 'manager@datapolex.com', role: 'manager', department: 'Product', skills: ['Scrum'] },
      { name: 'Rahim Uddin', email: 'dev1@datapolex.com', role: 'member', department: 'Engineering', skills: ['React'] },
      { name: 'Karim Ahmed', email: 'dev2@datapolex.com', role: 'member', department: 'Engineering', skills: ['Node.js'] },
    ];

    // Generate 16 more random users
    const depts = ['Engineering', 'Design', 'QA', 'Marketing'];
    for (let i = 5; i <= 20; i++) {
        usersData.push({
            name: `User ${i}`,
            email: `user${i}@datapolex.com`,
            role: 'member',
            department: getRandomElement(depts),
            skills: ['JavaScript', 'Python', 'HTML']
        });
    }

    const createdUsers = [];
    // Loop to ensure password hashing works via pre-save hook
    for (const u of usersData) {
        const user = new User({ ...u, password: 'password123', avatar: `https://i.pravatar.cc/150?u=${u.email}` });
        const savedUser = await user.save();
        createdUsers.push(savedUser);
    }
    console.log(`✅ ${createdUsers.length} Users Created.`);


    // ---------------------------------------------------------
    // 2. CREATE PROJECTS
    // ---------------------------------------------------------
    console.log('📁 Creating Projects...');
    
    const projectsData = [];
    const statuses = ['planned', 'active', 'completed'];

    for (let i = 0; i < 15; i++) {
        const startDate = getRandomDate(new Date('2023-01-01'), new Date('2024-01-01'));
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + getRandomInt(3, 12));

        projectsData.push({
            title: `${getRandomElement(projectPrefixes)} ${getRandomElement(projectSuffixes)}`,
            client: getRandomElement(clientNames),
            description: 'Automated generated project for testing scalability.',
            startDate,
            endDate,
            budget: getRandomInt(10000, 500000),
            status: getRandomElement(statuses),
            thumbnail: `https://picsum.photos/seed/${i}/800/600` // Random image
        });
    }

    // FIX 1: Added 'as any' here
    const createdProjects = await Project.create(projectsData as any);
    console.log(`✅ ${createdProjects.length} Projects Created.`);

    // ---------------------------------------------------------
    // 3. CREATE SPRINTS & TASKS (The Heavy Lifting)
    // ---------------------------------------------------------
    console.log('🚀 Creating Sprints & Tasks...');
    
    let totalTasks = 0;
    const taskPriorities = ['low', 'medium', 'high'];
    const taskStatuses = ['todo', 'in-progress', 'review', 'done'];

    for (const project of createdProjects) {
        // Create 3-5 Sprints per project
        const sprintCount = getRandomInt(3, 5);
        const projectSprints = [];

        for (let s = 1; s <= sprintCount; s++) {
            const sprintStartDate = new Date(project.startDate);
            sprintStartDate.setDate(sprintStartDate.getDate() + (s * 14)); // 2 weeks gap
            const sprintEndDate = new Date(sprintStartDate);
            sprintEndDate.setDate(sprintEndDate.getDate() + 14);

            projectSprints.push({
                title: `Sprint ${s}: Phase ${s}`,
                goal: `Complete phase ${s} deliverables`,
                sprintNumber: s,
                startDate: sprintStartDate,
                endDate: sprintEndDate,
                status: s < sprintCount ? 'completed' : 'active', // Last one active, others done
                project: project._id
            });
        }
        
        // FIX 2: Added 'as any' here to solve the TypeScript error
        const createdSprints = await Sprint.create(projectSprints as any);

        // Create Tasks for this project
        const taskCount = getRandomInt(20, 40); // 20-40 tasks per project
        const tasksData = [];

        for (let t = 0; t < taskCount; t++) {
            const assignees = [getRandomElement(createdUsers)._id];
            if (Math.random() > 0.7) assignees.push(getRandomElement(createdUsers)._id); // 30% chance of multiple assignees

            const status = getRandomElement(taskStatuses);
            
            // 80% tasks in sprints, 20% in backlog (undefined sprint)
            const sprintId = Math.random() > 0.2 ? getRandomElement(createdSprints)._id : undefined;
            
            // Random Time Logs for Done tasks (to show in charts)
            const timeLogs = [];
            let actualHours = 0;
            if (status === 'done' || status === 'in-progress') {
                const logCount = getRandomInt(1, 3);
                for (let l = 0; l < logCount; l++) {
                    const h = getRandomInt(1, 5);
                    timeLogs.push({
                        user: assignees[0],
                        hours: h,
                        date: getRandomDate(new Date('2023-01-01'), new Date())
                    });
                    actualHours += h;
                }
            }

            tasksData.push({
                title: `${getRandomElement(taskVerbs)} ${getRandomElement(taskNouns)}`,
                description: 'Generated task description for testing.',
                project: project._id,
                sprint: sprintId,
                assignees,
                priority: getRandomElement(taskPriorities),
                status: status,
                dueDate: getRandomDate(new Date(), new Date('2025-01-01')),
                estimate: getRandomInt(4, 20),
                actualHours,
                timeLogs
            });
        }

        // FIX 3: Added 'as any' here
        await Task.create(tasksData as any);
        totalTasks += tasksData.length;
    }

    console.log(`✅ ${createdProjects.length * 4} Sprints Created (Approx).`);
    console.log(`✅ ${totalTasks} Tasks Created.`);
    
    console.log('\n🎉 SEEDING COMPLETE! Login details:');
    console.log('   Admin:   admin@datapolex.com / password123');
    console.log('   Manager: manager@datapolex.com / password123');
    console.log('   Dev:     dev1@datapolex.com / password123');
    
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