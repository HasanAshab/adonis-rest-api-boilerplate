import { Request, Response, NextFunction } from "express";
import RateLimit from "express-rate-limit";

export default class LimitRequestRate {
  async handle(req: Request, res: Response, next: NextFunction, windowMs: string, max: string){
    return await RateLimit({ 
      windowMs: parseInt(windowMs),
      max: parseInt(max)
    })(req, res, next);
  }
}