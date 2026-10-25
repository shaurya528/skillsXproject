import { Request, Response, NextFunction } from 'express';
import * as skillModel from '../models/skill.model';

export const listSkills = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skills = await skillModel.listSkills(req.supabase!, res.locals.query);
    res.status(200).json({ data: skills });
  } catch (err) {
    next(err);
  }
};