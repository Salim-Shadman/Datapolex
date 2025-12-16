import { Request, Response, NextFunction } from 'express';

// Recursive function to remove keys starting with '$' or containing '.'
const sanitize = (obj: any): any => {
    if (obj instanceof Array) {
        return obj.map((i) => sanitize(i));
    }
    if (obj instanceof Object && obj !== null) {
        return Object.keys(obj).reduce((acc: any, key) => {
            // Remove keys starting with $ (Mongo operators)
            if (key.startsWith('$')) {
                return acc; 
            }
            // Remove keys containing . (Dot notation attacks)
            if (key.includes('.')) {
                return acc;
            }
            acc[key] = sanitize(obj[key]);
            return acc;
        }, {});
    }
    return obj;
};

export const sanitizeData = (req: Request, res: Response, next: NextFunction) => {
    // 1. Sanitize Body (Safe to replace)
    if (req.body) {
        req.body = sanitize(req.body);
    }

    // 2. Sanitize Query (In-place modification to avoid "getter" error)
    if (req.query) {
        const sanitizedQuery = sanitize(req.query);
        // Clear original keys and copy sanitized ones
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, sanitizedQuery);
    }

    // 3. Sanitize Params (In-place modification)
    if (req.params) {
        const sanitizedParams = sanitize(req.params);
        // Clear original keys and copy sanitized ones
        Object.keys(req.params).forEach((key) => delete req.params[key]);
        Object.assign(req.params, sanitizedParams);
    }

    next();
};