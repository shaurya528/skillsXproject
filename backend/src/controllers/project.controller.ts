import { Request, Response, NextFunction } from 'express';
import * as projectModel from '../models/project.model';

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectModel.createProject(req.supabase!, req.user!.id, req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

export const getProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await projectModel.getProject(req.supabase!, res.locals.params.projectId);
    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
};
export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await projectModel.updateProject(
        req.supabase!,
        res.locals.params.projectId,
        req.user!.id,
        req.body
      );
      res.status(200).json(project);
    } catch (err) {
      next(err);
    }
  };
  
  export const replaceRequiredSkills = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requiredSkills = await projectModel.replaceRequiredSkills(
        req.supabase!,
        res.locals.params.projectId,
        req.user!.id,
        req.body.skillIds
      );
      res.status(200).json({ requiredSkills });
    } catch (err) {
      next(err);
    }
  };
  
  export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await projectModel.deleteProject(req.supabase!, res.locals.params.projectId, req.user!.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
  export const changeProjectStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await projectModel.changeProjectStatus(
        req.supabase!,
        res.locals.params.projectId,
        req.user!.id,
        req.body.status
      );
      res.status(200).json(project);
    } catch (err) {
      next(err);
    }
  };