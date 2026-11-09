import { Request, Response, NextFunction } from 'express';
import * as applicationModel from '../models/application.model';

export const submitApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await applicationModel.submitApplication(
      req.supabase!,
      res.locals.params.projectId,
      req.user!.id,
      req.body.message
    );
    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
};

export const getApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await applicationModel.getApplication(
      req.supabase!,
      res.locals.params.applicationId
    );
    res.status(200).json(application);
  } catch (err) {
    next(err);
  }
};
export const listProjectApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = res.locals.query;
    const { data, total } = await applicationModel.listProjectApplications(
      req.supabase!,
      res.locals.params.projectId,
      req.user!.id,
      query
    );
    res.status(200).json({ data, meta: { page: query.page, limit: query.limit, total } });
  } catch (err) {
    next(err);
  }
};

export const decideApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const application = await applicationModel.decideApplication(
      req.supabase!,
      res.locals.params.applicationId,
      req.user!.id,
      req.body.status
    );
    res.status(200).json(application);
  } catch (err) {
    next(err);
  }
};