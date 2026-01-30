import { prisma } from "../../configs/prisma";

type ListUsersParams = {
  page: number;
  pageSize: number;
  search?: string;
};

const listUsers = async ({ page, pageSize, search }: ListUsersParams) => {
  const where: any = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { data: users, total, page, pageSize };
};

const deleteUser = async (userId: string) => {
  await prisma.user.delete({ where: { id: userId } });
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

export const AdminService = {
  listUsers,
  deleteUser,
  getAdminAnalytics,
};
