import { prisma } from "../../configs/prisma";

type ListTagsParams = {
  page: number;
  pageSize: number;
};

const listTags = async ({ page, pageSize }: ListTagsParams) => {
  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: "asc" },
    }),
    prisma.tag.count(),
  ]);

  return { data: tags, total, page, pageSize };
};

const createTag = async (name: string) => {
  return prisma.tag.create({ data: { name } });
};

const listTagsByCourse = async (courseId: string) => {
  const courseTags = await prisma.courseTag.findMany({
    where: { courseId },
    include: { tag: true },
  });

  return courseTags.map((ct) => ct.tag);
};

const attachTagsToCourse = async (courseId: string, tagIds: string[]) => {
  const data = tagIds.map((tagId) => ({
    courseId,
    tagId,
  }));

  // Upsert: avoid duplicates by ignoring existing compound PK conflicts
  await prisma.courseTag.createMany({
    data,
    skipDuplicates: true,
  });
};

const detachTagsFromCourse = async (courseId: string, tagIds: string[]) => {
  await prisma.courseTag.deleteMany({
    where: {
      courseId,
      tagId: { in: tagIds },
    },
  });
};

export const TagService = {
  listTags,
  createTag,
  listTagsByCourse,
  attachTagsToCourse,
  detachTagsFromCourse,
};
