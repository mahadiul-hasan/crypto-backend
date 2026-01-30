import { prisma } from "../../configs/prisma";
import {
  cacheGetOrSet,
  cacheInvalidate,
  makeCacheKey,
} from "../../utils/cache";

type ListTagsParams = {
  page: number;
  pageSize: number;
};

const listTags = async ({ page, pageSize }: ListTagsParams) => {
  const key = makeCacheKey("tags:list", `${page}:${pageSize}`);

  return cacheGetOrSet(key, async () => {
    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: "asc" },
      }),
      prisma.tag.count(),
    ]);

    return { data: tags, total, page, pageSize };
  });
};

const createTag = async (name: string) => {
  const tag = await prisma.tag.create({ data: { name } });

  // Invalidate all tags list caches on new tag creation
  await cacheInvalidate("tags:list*");

  return tag;
};

const listTagsByCourse = async (courseId: string) => {
  const key = makeCacheKey("tags:course", courseId);

  return cacheGetOrSet(key, async () => {
    const courseTags = await prisma.courseTag.findMany({
      where: { courseId },
      include: { tag: true },
    });

    return courseTags.map((ct) => ct.tag);
  });
};

const attachTagsToCourse = async (courseId: string, tagIds: string[]) => {
  const data = tagIds.map((tagId) => ({ courseId, tagId }));

  await prisma.courseTag.createMany({
    data,
    skipDuplicates: true,
  });

  // Invalidate cache for this course's tags
  await cacheInvalidate(makeCacheKey("tags:course", courseId));
};

const detachTagsFromCourse = async (courseId: string, tagIds: string[]) => {
  await prisma.courseTag.deleteMany({
    where: {
      courseId,
      tagId: { in: tagIds },
    },
  });

  // Invalidate cache for this course's tags
  await cacheInvalidate(makeCacheKey("tags:course", courseId));
};

export const TagService = {
  listTags,
  createTag,
  listTagsByCourse,
  attachTagsToCourse,
  detachTagsFromCourse,
};
