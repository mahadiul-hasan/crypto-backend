import { Request, Response, NextFunction } from "express";
import { Role } from "../generated/prisma/enums.js";
import { Errors } from "../utils/errorHelpers.js";

export const authorize =
  (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw Errors.BadRequest("Authentication required");
    }

    const userRoles: Role[] = req.user.roles as Role[];

    const hasPermission = userRoles.some((role: Role) =>
      allowedRoles.includes(role),
    );

    if (!hasPermission) {
      throw Errors.Forbidden(
        `Access denied. ${req.user.role} role is not authorized for this resource.`,
      );
    }

    next();
  };
