import { Request, Response } from "express";
import { ClassService } from "./class.service";

const listClasses = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, batchId } = req.query;

  const classes = await ClassService.listClasses({
    page: Number(page),
    pageSize: Number(pageSize),
    batchId: batchId ? String(batchId) : undefined,
  });

  res.json(classes);
};

const getClass = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const cls = await ClassService.getClass(id);
  if (!cls) return res.status(404).json({ message: "Class not found" });
  res.json(cls);
};

const createClass = async (req: Request, res: Response) => {
  const cls = await ClassService.createClass(req.body);
  res.status(201).json(cls);
};

const updateClass = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const cls = await ClassService.updateClass(id, req.body);
  if (!cls) return res.status(404).json({ message: "Class not found" });
  res.json(cls);
};

const deleteClass = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await ClassService.deleteClass(id);
  res.status(204).send();
};

const getMyClasses = async (req: Request, res: Response) => {
  const userId = req.user!.id; // from auth middleware

  const classes = await ClassService.getUserClasses(userId);

  res.json(classes);
};

export const ClassController = {
  listClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  getMyClasses,
};
