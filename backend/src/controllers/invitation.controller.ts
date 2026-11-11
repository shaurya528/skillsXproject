import { Request, Response, NextFunction } from 'express';
import * as invitationModel from '../models/invitation.model';

export const sendInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invitation = await invitationModel.sendInvitation(
      req.supabase!,
      res.locals.params.projectId,
      req.user!.id,
      req.body
    );
    res.status(201).json(invitation);
  } catch (err) {
    next(err);
  }
};

export const listProjectInvitations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = res.locals.query;
    const { data, total } = await invitationModel.listProjectInvitations(
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

export const getInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invitation = await invitationModel.getInvitation(
      req.supabase!,
      res.locals.params.invitationId
    );
    res.status(200).json(invitation);
  } catch (err) {
    next(err);
  }
};
export const respondToInvitation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invitation = await invitationModel.respondToInvitation(
      req.supabase!,
      res.locals.params.invitationId,
      req.user!.id,
      req.body.status
    );
    res.status(200).json(invitation);
  } catch (err) {
    next(err);
  }
};