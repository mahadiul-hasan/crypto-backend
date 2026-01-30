import { Request, Response } from "express";
import { TagService } from "./tag.service";

const listTags = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;

  const result = await TagService.listTags({ page, pageSize });
  res.json(result);
};

const createTag = async (req: Request, res: Response) => {
  const { name } = req.body;
  const tag = await TagService.createTag(name);
  res.status(201).json(tag);
};

const listTagsByCourse = async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const tags = await TagService.listTagsByCourse(courseId);
  res.json(tags);
};

const attachTagsToCourse = async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const { tagIds } = req.body;
  await TagService.attachTagsToCourse(courseId, tagIds);
  res.status(204).send();
};

const detachTagsFromCourse = async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const { tagIds } = req.body;
  await TagService.detachTagsFromCourse(courseId, tagIds);
  res.status(204).send();
};

export const TagController = {
  listTags,
  createTag,
  listTagsByCourse,
  attachTagsToCourse,
  detachTagsFromCourse,
};
