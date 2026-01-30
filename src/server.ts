import "./queue/email.worker";
import app from "./app";
import { env } from "./configs/env";
import { scheduleStatusUpdate } from "./automation/statusAutomation.job";
import { scheduleClassReminders } from "./automation/sendClassReminder.job";

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    await scheduleStatusUpdate();
    await scheduleClassReminders();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
