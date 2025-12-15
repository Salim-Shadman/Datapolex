import { Request, Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import asyncHandler from '../middleware/asyncHandler';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    // 1. Project Stats
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });
    
    // 2. Budget Calculation
    const projects = await Project.find({}, 'budget');
    const totalBudget = projects.reduce((acc, curr) => acc + (curr.budget || 0), 0);

    // 3. Task Stats (for Charts)
    const tasks = await Task.find({}, 'status priority estimate actualHours');
    
    const taskStatusCounts = {
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        review: tasks.filter(t => t.status === 'review').length,
        done: tasks.filter(t => t.status === 'done').length,
    };

    const taskPriorityCounts = {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
    };

    res.json({
        projects: { total: totalProjects, active: activeProjects, completed: completedProjects },
        budget: totalBudget,
        tasks: { status: taskStatusCounts, priority: taskPriorityCounts }
    });
});