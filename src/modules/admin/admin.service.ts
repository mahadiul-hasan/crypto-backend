import { prisma } from "../../configs/prisma";
import { invalidateAllSessions } from "../../services/session.service";
import {
  cacheGetOrSet,
  cacheInvalidate,
  makeCacheKey,
} from "../../utils/cache";

type ListUsersParams = {
  page: number;
  pageSize: number;
  search?: string;
};

const listUsers = async (params: ListUsersParams) => {
  const key = makeCacheKey(
    "users:list",
    `${params.page}:${params.pageSize}:${params.search ?? ""}`,
  );

  return cacheGetOrSet(key, async () => {
    const where: any = {};

    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: "insensitive" } },
        { name: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return { data: users, total, page: params.page, pageSize: params.pageSize };
  });
};

const deleteUser = async (userId: string) => {
  await prisma.user.delete({ where: { id: userId } });
  await cacheInvalidate([`users:list*`, `user:detail:${userId}`]);
};

const getAdminAnalytics = async () => {
  const [
    totalUsers,
    activeUsers,
    totalCourses,
    activeCourses,
    totalPayments,
    verifiedPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        /* active = logged in or any other metric, e.g. sessions last 30 days */
      },
    }),
    prisma.course.count(),
    prisma.course.count({ where: { isActive: true } }),
    prisma.payment.count(),
    prisma.payment.count({ where: { status: "VERIFIED" } }),
  ]);

  return {
    totalUsers,
    activeUsers,
    totalCourses,
    activeCourses,
    totalPayments,
    verifiedPayments,
  };
};

const forceLogoutUser = async (userId: string) => {
  await invalidateAllSessions(userId);
};

export const AdminService = {
  listUsers,
  deleteUser,
  getAdminAnalytics,
  forceLogoutUser,
};
