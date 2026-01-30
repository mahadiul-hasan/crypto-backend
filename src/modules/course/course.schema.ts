import { z } from "zod";

const createCourse = z.object({
  body: z.object({
    title: z.string().min(5),
    slug: z
      .string()
      .min(5)
      .regex(
        /^[a-z0-9-]+$/,
        "Slug must be lowercase, alphanumeric and hyphens",
      ),
    description: z.string().min(20), // sanitized HTML expected
    descriptionType: z.enum(["html"]).optional(),
    price: z.number().int().nonnegative(),
    isActive: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});
const updateCourse = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    slug: z
      .string()
      .min(5)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric and hyphens")
      .optional(),
    description: z.string().min(20).optional(),
    descriptionType: z.enum(["html"]).optional(),
    price: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const AdminCourseSchema = {
  createCourse,
  updateCourse,
};
