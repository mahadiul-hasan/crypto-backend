import { prisma } from "../../configs/prisma";
import { BatchStatus } from "../../generated/prisma/enums";

type ListClassesParams = {
  page: number;
  pageSize: number;
  batchId?: string;
  search?: string;
};

const listClasses = async ({
  page,
  pageSize,
  batchId,
  search,
}: ListClassesParams) => {
  const where: any = {};

  if (batchId) where.batchId = batchId;

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

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
};

const getClass = async (id: string) => {
  return prisma.class.findUnique({
    where: { id },
    include: { batch: true },
  });
};

const createClass = async (data: any) => {
  return prisma.class.create({ data });
};

const updateClass = async (id: string, data: any) => {
  try {
    return prisma.class.update({ where: { id }, data });
  } catch {
    return null;
  }
};

const deleteClass = async (id: string) => {
  await prisma.class.delete({ where: { id } });
};

const getUserClasses = async (userId: string) => {
  return prisma.class.findMany({
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
  });
};

export const ClassService = {
  listClasses,
  createClass,
  getClass,
  updateClass,
  deleteClass,
  getUserClasses,
};
