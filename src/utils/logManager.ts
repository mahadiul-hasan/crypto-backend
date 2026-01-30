import fs from "fs";
import path from "path";

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: any;
}

export class LogManager {
  private static logDir = "logs";

  // Get logs for admin dashboard
  static getLogs(days: number = 7): LogEntry[] {
    const logs: LogEntry[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    try {
      const files = fs.readdirSync(this.logDir);

      files.forEach((file) => {
        if (file.endsWith(".log")) {
          const filePath = path.join(this.logDir, file);
          const fileDate = this.extractDateFromFilename(file);

          if (fileDate && fileDate >= cutoffDate) {
            const fileLogs = this.readLogFile(filePath);
            logs.push(...fileLogs);
          }
        }
      });

      return logs.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    } catch (error) {
      console.error("Error reading logs:", error);
      return [];
    }
  }

  // Get log statistics
  static getLogStats() {
    const logs = this.getLogs(7);
    const stats = {
      total: logs.length,
      byLevel: {} as Record<string, number>,
      byDay: {} as Record<string, number>,
      errors: logs.filter((log) => log.level === "error").length,
      warnings: logs.filter((log) => log.level === "warn").length,
    };

    logs.forEach((log) => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

      const date = new Date(log.timestamp).toISOString().split("T")[0];
      stats.byDay[date] = (stats.byDay[date] || 0) + 1;
    });

    return stats;
  }

  // Clean old logs (older than specified days)
  static cleanupOldLogs(daysToKeep: number = 7) {
    const files = fs.readdirSync(this.logDir);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    files.forEach((file) => {
      if (file.endsWith(".log")) {
        const fileDate = this.extractDateFromFilename(file);
        if (fileDate && fileDate < cutoffDate) {
          const filePath = path.join(this.logDir, file);
          fs.unlinkSync(filePath);
          console.log(`Deleted old log file: ${file}`);
        }
      }
    });
  }

  private static readLogFile(filePath: string): LogEntry[] {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      return content
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          try {
            return JSON.parse(line) as LogEntry;
          } catch {
            return {
              timestamp: new Date().toISOString(),
              level: "info",
              message: line,
            };
          }
        });
    } catch (error) {
      console.error(`Error reading log file ${filePath}:`, error);
      return [];
    }
  }

  private static extractDateFromFilename(filename: string): Date | null {
    const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return new Date(match[1]);
    }
    return null;
  }
}
