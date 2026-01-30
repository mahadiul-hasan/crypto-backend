import { prisma } from "../../configs/prisma";
import { BatchStatus } from "../../generated/prisma/enums";
import {
  cacheGetOrSet,
  cacheInvalidate,
  makeCacheKey,
} from "../../utils/cache";

type ListClassesParams = {
  page: number;
  pageSize: number;
  batchId?: string;
  search?: string;
};

const invalidateClassCache = async (id: string) => {
  await cacheInvalidate([
    `class:detail:${id}`,
    `classes:list*`,
    `user:classes*`,
  ]);
};

const listClasses = async ({
  page,
  pageSize,
  batchId,
  search,
}: ListClassesParams) => {
  const key = makeCacheKey(
    "classes:list",
    `${page}:${pageSize}:${batchId ?? ""}:${search ?? ""}`,
  );

  return cacheGetOrSet(key, async () => {
    const where: any = {};
    if (batchId) where.batchId = batchId;
    if (search) where.title = { contains: search, mode: "insensitive" };

    const [classes, total] = await Promise.all([
      prisma.class.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { date: "desc" },
      }),
      prisma.class.count({ where }),
    ]);

    return { data: classes, total, page, pageSize };
  });
};

const getClass = async (id: string) => {
  const key = makeCacheKey("class:detail", id);

  return cacheGetOrSet(key, () =>
    prisma.class.findUnique({
      where: { id },
      include: { batch: true },
    }),
  );
};

const createClass = async (data: any) => {
  const result = await prisma.class.create({ data });
  await invalidateClassCache(result.id);
  return result;
};

const updateClass = async (id: string, data: any) => {
  try {
    const result = await prisma.class.update({ where: { id }, data });
    await invalidateClassCache(id);
    return result;
  } catch {
    return null;
  }
};

const deleteClass = async (id: string) => {
  await prisma.class.delete({ where: { id } });
  await invalidateClassCache(id);
};

const getUserClasses = async (userId: string) => {
  const key = makeCacheKey("user:classes", userId);

  return cacheGetOrSet(key, () =>
    prisma.class.findMany({
      where: {
        batch: {
          status: BatchStatus.ACTIVE,
          enrollments: {
            some: {
              userId,
            },
          },
        },
      },
      include: {
        batch: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    }),
  );
};

export const ClassService = {
  listClasses,
  createClass,
  getClass,
  updateClass,
  deleteClass,
  getUserClasses,
};
