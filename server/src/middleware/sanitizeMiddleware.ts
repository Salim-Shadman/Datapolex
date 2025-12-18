import { Request, Response, NextFunction } from 'express';


const sanitize = (obj: any): any => {
    if (obj instanceof Array) {
        return obj.map((i) => sanitize(i));
    }
    if (obj instanceof Object && obj !== null) {
        return Object.keys(obj).reduce((acc: any, key) => {
            
            if (key.startsWith('$')) {
                return acc; 
            }
            
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
    
    if (req.body) {
        req.body = sanitize(req.body);
    }

    
    if (req.query) {
        const sanitizedQuery = sanitize(req.query);
        
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, sanitizedQuery);
    }

   
    if (req.params) {
        const sanitizedParams = sanitize(req.params);
       
        Object.keys(req.params).forEach((key) => delete req.params[key]);
        Object.assign(req.params, sanitizedParams);
    }

    next();
};