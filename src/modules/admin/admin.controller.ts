import { Request, Response } from "express";
import { LogManager, LogEntry } from "../../utils/logManager";
import { Errors } from "../../utils/errorHelpers";
import { AdminService } from "./admin.service";
import { invalidateAllSessions } from "../../services/session.service";

// Get logs with filtering and pagination
const getLogs = async (req: Request, res: Response) => {
  try {
    const { days = "7", level, search, page = "1", limit = "50" } = req.query;

    let logs = LogManager.getLogs(parseInt(days as string));

    // Apply filters
    logs = applyLogFilters(logs, {
      level: level as string,
      search: search as string,
    });

    // Apply pagination
    const pagination = paginateLogs(
      logs,
      parseInt(page as string),
      parseInt(limit as string),
    );

    res.json({
      success: true,
      data: pagination.data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      },
    });
  } catch (error: any) {
    // Throw custom error
    throw Errors.InternalServerError("Failed to fetch logs");
  }
};

// Get log statistics
const getLogStats = async (req: Request, res: Response) => {
  try {
    const stats = LogManager.getLogStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    throw Errors.InternalServerError("Failed to fetch log statistics");
  }
};

// Clean old logs manually
const cleanLogs = async (req: Request, res: Response) => {
  try {
    const { days = 7 } = req.body;

    // Validate input
    if (!days || isNaN(Number(days))) {
      throw Errors.BadRequest(
        "Days parameter is required and must be a number",
      );
    }

    if (days < 1 || days > 365) {
      throw Errors.BadRequest("Days must be between 1 and 365");
    }

    LogManager.cleanupOldLogs(days);

    res.json({
      success: true,
      message: `Logs older than ${days} days have been cleaned up`,
    });
  } catch (error: any) {
    throw Errors.InternalServerError("Failed to clean up logs");
  }
};

// Download logs as CSV
const downloadLogs = async (req: Request, res: Response) => {
  try {
    const { days = "7" } = req.query;
    const parsedDays = parseInt(days as string);

    // Input validation
    if (isNaN(parsedDays)) {
      throw Errors.BadRequest("Days must be a valid number");
    }

    if (parsedDays < 1 || parsedDays > 30) {
      throw Errors.BadRequest("Days must be between 1 and 30");
    }

    const logs = LogManager.getLogs(parsedDays);

    if (logs.length === 0) {
      throw Errors.BadRequest("No logs found for the specified period");
    }

    // Convert logs to CSV
    const csvContent = convertLogsToCSV(logs);

    // Set headers for file download
    const filename = `logs-${new Date().toISOString().split("T")[0]}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    res.send(csvContent);
  } catch (error: any) {
    throw Errors.InternalServerError("Failed to download logs");
  }
};

// Helper: Apply filters to logs
const applyLogFilters = (
  logs: LogEntry[],
  filters: { level?: string; search?: string },
): LogEntry[] => {
  let filteredLogs = [...logs];

  if (filters.level) {
    filteredLogs = filteredLogs.filter((log) => log.level === filters.level);
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredLogs = filteredLogs.filter(
      (log) =>
        log.message.toLowerCase().includes(searchTerm) ||
        (log.meta &&
          JSON.stringify(log.meta).toLowerCase().includes(searchTerm)),
    );
  }

  return filteredLogs;
};

// Helper: Paginate logs
const paginateLogs = (logs: LogEntry[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    data: logs.slice(startIndex, endIndex),
    page,
    limit,
    total: logs.length,
    totalPages: Math.ceil(logs.length / limit),
  };
};

// Helper: Convert logs to CSV
const convertLogsToCSV = (logs: LogEntry[]): string => {
  const headers = ["Timestamp", "Level", "Message", "Meta"];
  const rows = logs.map((log) =>
    [
      `"${log.timestamp}"`,
      `"${log.level}"`,
      `"${log.message.replace(/"/g, '""')}"`,
      `"${JSON.stringify(log.meta || {}).replace(/"/g, '""')}"`,
    ].join(","),
  );

  return headers.join(",") + "\n" + rows.join("\n");
};

const listUsers = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const search = req.query.search?.toString();

  const data = await AdminService.listUsers({ page, pageSize, search });
  res.json(data);
};

const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await AdminService.deleteUser(id);
  res.status(204).send();
};

const getAnalytics = async (req: Request, res: Response) => {
  const data = await AdminService.getAdminAnalytics();
  res.json(data);
};

export const forceLogoutUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await AdminService.forceLogoutUser(id);

  res.json({ message: "User disconnected" });
};

// Export all functions as controller object
export const AdminController = {
  getLogs,
  getLogStats,
  cleanLogs,
  downloadLogs,
  listUsers,
  deleteUser,
  getAnalytics,
  forceLogoutUser,
};
