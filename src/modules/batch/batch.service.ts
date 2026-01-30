import { prisma } from "../../configs/prisma";
import { BatchStatus } from "../../generated/prisma/enums";
import { Errors } from "../../utils/errorHelpers";
import {
  cacheGetOrSet,
  cacheInvalidate,
  makeCacheKey,
} from "../../utils/cache";

const allowedTransitions: Record<BatchStatus, BatchStatus[]> = {
  UPCOMING: ["ACTIVE"],
  ACTIVE: ["CLOSED"],
  CLOSED: [],
};

type ListBatchesParams = {
  page: number;
  pageSize: number;
  courseId?: string;
  status?: string;
  search?: string;
};

const listBatches = async ({
  page,
  pageSize,
  courseId,
  status,
  search,
}: ListBatchesParams) => {
  const key = makeCacheKey(
    "batches:list",
    `${page}:${pageSize}:${courseId ?? ""}:${status ?? ""}:${search ?? ""}`,
  );

  return cacheGetOrSet(key, async () => {
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: { course: true },
      }),
      prisma.batch.count({ where }),
    ]);

    return { data: batches, total, page, pageSize };
  });
};

const getBatch = async (id: string) => {
  const key = makeCacheKey("batch:detail", id);

  return cacheGetOrSet(key, () =>
    prisma.batch.findUnique({
      where: { id },
      include: { course: true, classes: true },
    }),
  );
};

const invalidateBatchCache = async (id: string) => {
  await cacheInvalidate([
    `batch:detail:${id}`,
    `batches:list*`,
    `batches:public*`,
    `user:batches*`,
  ]);
};

const createBatch = async (data: any) => {
  const batch = await prisma.batch.create({
    data,
    include: { course: true },
  });

  await invalidateBatchCache(batch.id);

  return batch;
};

const updateBatch = async (id: string, data: any) => {
  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.batch.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!current) throw Errors.BadRequest("No batch found");

    if (data.status) {
      const allowed = allowedTransitions[current.status];
      if (!allowed.includes(data.status)) {
        throw Errors.BadRequest("Invalid batch status transition");
      }
    }

    return tx.batch.update({
      where: { id },
      data,
      include: { course: true },
    });
  });

  await invalidateBatchCache(id);

  return result;
};

const deleteBatch = async (id: string) => {
  await prisma.batch.delete({ where: { id } });
  await invalidateBatchCache(id);
};

const getUserBatches = async (userId: string) => {
  const key = makeCacheKey("user:batches", userId);

  return cacheGetOrSet(key, () =>
    prisma.batch.findMany({
      where: {
        enrollments: {
          some: {
            userId,
          },
        },
      },
      include: {
        course: true,
        classes: {
          orderBy: {
            date: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  );
};

const listPublicBatches = async ({
  page,
  pageSize,
  courseId,
  status,
  search,
}: ListBatchesParams) => {
  const key = makeCacheKey(
    "batches:public",
    `${page}:${pageSize}:${courseId ?? ""}:${status ?? ""}:${search ?? ""}`,
  );

  return cacheGetOrSet(key, async () => {
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [batches, total] = await Promise.all([
      prisma.batch.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: { course: true },
      }),
      prisma.batch.count({ where }),
    ]);

    return { data: batches, total, page, pageSize };
  });
};

export const BatchService = {
  listBatches,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
  getUserBatches,
  listPublicBatches,
};
