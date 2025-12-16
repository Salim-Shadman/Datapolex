export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'member';
    department?: string;
    skills?: string[];
    avatar?: string;
}

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high';
    assignees?: User[];
    project?: string;
    sprint?: string;
    dueDate?: string;
    estimate?: number;
    actualHours?: number;
    subtasks?: { title: string; completed: boolean }[];
    comments?: any[];
    attachments?: string[];
}

export interface Project {
    _id: string;
    title: string;
    client: string;
    status: 'planned' | 'active' | 'completed';
    budget: number;
    startDate: string;
    endDate: string;
    thumbnail?: string;
    progress?: number;
    totalTasks?: number;
    completedTasks?: number;
}