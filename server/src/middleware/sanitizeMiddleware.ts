import { Request, Response, NextFunction } from 'express';

// FIX: Prevents NoSQL Injection by removing '$' and '.' from input keys
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
    req.body = sanitize(req.body);
    req.query = sanitize(req.query);
    req.params = sanitize(req.params);
    next();
};