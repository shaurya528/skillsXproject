import { Request, Response, NextFunction } from 'express';
import * as userModel from '../models/user.model';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const me = await userModel.findMe(req.supabase!, req.user!.id);
    res.status(200).json(me);
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await userModel.updateProfile(req.supabase!, req.user!.id, req.body);
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
};

export const deleteMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userModel.deleteAccount(req.user!.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
export const replaceMySkills = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skills = await userModel.replaceSkills(
        req.supabase!,
        req.user!.id,
        req.body.skillIds
      );
      res.status(200).json({ skills });
    } catch (err) {
      next(err);
    }
  };
  export const getMyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contact = await userModel.getContact(req.supabase!, req.user!.id);
      res.status(200).json(contact);
    } catch (err) {
      next(err);
    }
  };
  
  export const updateMyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contact = await userModel.updateContact(req.supabase!, req.user!.id, req.body);
      res.status(200).json(contact);
    } catch (err) {
      next(err);
    }
  };