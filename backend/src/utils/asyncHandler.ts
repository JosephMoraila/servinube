import { Router, Request, Response, NextFunction } from "express";

// Middleware para manejar async/await en Express
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};