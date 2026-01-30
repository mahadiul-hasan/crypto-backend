import { Request, Response } from "express";
import { UserService } from "./user.service";

const getProfile = async (req: Request, res: Response) => {
  const user = await UserService.getProfile(req.user!.id);
  res.json(user);
};

const updateProfile = async (req: Request, res: Response) => {
  const profile = await UserService.updateProfile(req.user!.id, req.body);
  res.json(profile);
};

const updateWallets = async (req: Request, res: Response) => {
  const result = await UserService.updateWallets(
    req.user!.id,
    req.body.wallets,
  );
  res.json({ message: "Wallets updated", result });
};

export const UserController = {
  getProfile,
  updateProfile,
  updateWallets,
};
