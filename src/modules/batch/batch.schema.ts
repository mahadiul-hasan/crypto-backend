import { z } from "zod";

const createBatch = z.object({
  body: z.object({
    courseId: z.string().uuid(),
    name: z.string().min(3),
    enrollmentOpen: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    enrollmentClose: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    status: z.enum(["UPCOMING", "ACTIVE", "CLOSED"]),
  }),
});

const updateBatch = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    enrollmentOpen: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)))
      .optional(),
    enrollmentClose: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)))
      .optional(),
    status: z.enum(["UPCOMING", "ACTIVE", "CLOSED"]).optional(),
  }),
});

export const BatchSchema = {
  createBatch,
  updateBatch,
};
