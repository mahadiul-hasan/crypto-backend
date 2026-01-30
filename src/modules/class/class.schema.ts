import { z } from "zod";

const createClass = z.object({
  body: z.object({
    batchId: z.string().uuid(),
    title: z.string().min(3),
    date: z
      .string()
      .refine((d) => !isNaN(Date.parse(d)), { message: "Invalid date" }),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be HH:mm"),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be HH:mm"),
    meetingLink: z.string().url().optional(),
  }),
});
const updateClass = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    date: z
      .string()
      .refine((d) => !isNaN(Date.parse(d)))
      .optional(),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .optional(),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .optional(),
    meetingLink: z.string().url().optional(),
  }),
});

export const ClassSchema = {
  createClass,
  updateClass,
};
