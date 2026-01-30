import { prisma } from "../../configs/prisma";
import {
  cacheGetOrSet,
  cacheInvalidate,
  makeCacheKey,
} from "../../utils/cache";

type ListCoursesParams = {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
};

const listCourses = async ({
  page,
  pageSize,
  search,
  isActive,
}: ListCoursesParams) => {
  const key = makeCacheKey(
    "courses:list",
    `${page}:${pageSize}:${search ?? ""}:${isActive ?? "all"}`,
  );

  return cacheGetOrSet(key, async () => {
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        {
          courseTags: {
            some: {
              tag: { name: { contains: search, mode: "insensitive" } },
            },
          },
        },
      ];
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          courseTags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    // Flatten tags from courseTags join table
    const data = courses.map((course) => ({
      ...course,
      tags: course.courseTags.map((ct) => ct.tag),
    }));

    return { data, total, page, pageSize };
  });
};

const getCourse = async (id: string) => {
  const key = makeCacheKey("course:detail", id);

  return cacheGetOrSet(key, async () => {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        batches: true,
        courseTags: { include: { tag: true } },
      },
    });

    if (!course) return null;

    return {
      ...course,
      tags: course.courseTags.map((ct) => ct.tag),
    };
  });
};

const createCourse = async (data: any) => {
  const { tags = [], ...rest } = data;

  const course = await prisma.course.create({
    data: rest,
  });

  if (tags.length > 0) {
    for (const tagName of tags) {
      let tag = await prisma.tag.findUnique({ where: { name: tagName } });
      if (!tag) {
        tag = await prisma.tag.create({ data: { name: tagName } });
      }
      await prisma.courseTag.create({
        data: {
          courseId: course.id,
          tagId: tag.id,
        },
      });
    }
  }

  const invalidateCoursesCache = () => cacheInvalidate("courses:list*");
  await invalidateCoursesCache();

  return getCourse(course.id);
};

const updateCourse = async (id: string, data: any) => {
  const { tags, ...rest } = data;

  await prisma.course.update({
    where: { id },
    data: rest,
  });

  if (tags) {
    await prisma.courseTag.deleteMany({ where: { courseId: id } });

    for (const tagName of tags) {
      let tag = await prisma.tag.findUnique({ where: { name: tagName } });
      if (!tag) {
        tag = await prisma.tag.create({ data: { name: tagName } });
      }
      await prisma.courseTag.create({
        data: {
          courseId: id,
          tagId: tag.id,
        },
      });
    }
  }

  const invalidateCoursesCache = () => cacheInvalidate("courses:list*");
  await invalidateCoursesCache();

  return getCourse(id);
};

const deleteCourse = async (id: string) => {
  await prisma.courseTag.deleteMany({ where: { courseId: id } });
  await prisma.course.delete({ where: { id } });

  const invalidateCoursesCache = () => cacheInvalidate("courses:list*");
  await invalidateCoursesCache();
};

export const CourseService = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};
