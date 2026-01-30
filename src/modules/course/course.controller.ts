import { Request, Response } from "express";
import { CourseService } from "./course.service";

const listCourses = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 20, search = "", isActive } = req.query;
  const courses = await CourseService.listCourses({
    page: Number(page),
    pageSize: Number(pageSize),
    search: String(search),
    isActive: isActive === undefined ? undefined : isActive === "true",
  });
  res.json(courses);
};

const getCourse = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const course = await CourseService.getCourse(id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  res.json(course);
};

const createCourse = async (req: Request, res: Response) => {
  const course = await CourseService.createCourse(req.body);
  res.status(201).json(course);
};

const updateCourse = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const updated = await CourseService.updateCourse(id, req.body);
  if (!updated) return res.status(404).json({ message: "Course not found" });
  res.json(updated);
};

const deleteCourse = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await CourseService.deleteCourse(id);
  res.status(204).send();
};

export const CourseController = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};
