import { Request, Response, NextFunction } from 'express';
import * as memberModel from '../models/member.model';

export const listMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = res.locals.query;
    const { data, total } = await memberModel.listMembers(
      req.supabase!,
      res.locals.params.projectId,
      query
    );
    res.status(200).json({ data, meta: { page: query.page, limit: query.limit, total } });
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await memberModel.removeMember(
      req.supabase!,
      res.locals.params.projectId,
      req.user!.id,
      res.locals.params.userId
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};