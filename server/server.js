const app = require("./src/app");
const logger = require("./src/errorlogging/logger");

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason && reason.stack ? reason.stack : reason}`);
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error && error.stack ? error.stack : error}`);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/api/health`);
});
