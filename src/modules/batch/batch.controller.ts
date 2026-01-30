import { Request, Response } from "express";
import { BatchService } from "./batch.service";

const listBatches = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, courseId, status } = req.query;

  const batches = await BatchService.listBatches({
    page: Number(page),
    pageSize: Number(pageSize),
    courseId: courseId ? String(courseId) : undefined,
    status: status ? String(status) : undefined,
  });

  res.json(batches);
};

const getBatch = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const batch = await BatchService.getBatch(id);
  if (!batch) return res.status(404).json({ message: "Batch not found" });
  res.json(batch);
};

const createBatch = async (req: Request, res: Response) => {
  const batch = await BatchService.createBatch(req.body);
  res.status(201).json(batch);
};

const updateBatch = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const batch = await BatchService.updateBatch(id, req.body);
  if (!batch) return res.status(404).json({ message: "Batch not found" });
  res.json(batch);
};

const deleteBatch = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await BatchService.deleteBatch(id);
  res.status(204).send();
};

const getMyBatches = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const batches = await BatchService.getUserBatches(userId);

  res.json(batches);
};

const listPublicBatches = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 20 } = req.query;

  const batches = await BatchService.listPublicBatches({
    page: Number(page),
    pageSize: Number(pageSize),
  });

  res.json(batches);
};

export const BatchController = {
  listBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
  getMyBatches,
  listPublicBatches,
};
