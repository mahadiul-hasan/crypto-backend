import z from "zod";

const createTag = z.object({
  body: z.object({
    name: z.string().min(2).max(30),
  }),
});

const attachDetachTags = z.object({
  body: z.object({
    tagIds: z.array(z.string()).min(1),
  }),
});

export const TagSchema = {
  createTag,
  attachDetachTags,
};
