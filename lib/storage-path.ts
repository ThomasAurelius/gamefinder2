import path from "path";

/**
 * Determines the appropriate data directory based on the environment.
 * In serverless environments (like AWS Lambda), the filesystem is read-only
 * except for /tmp. This function detects such environments and returns the
 * appropriate path.
 */
export function getDataDirectory(): string {
  // Check if we're in a serverless environment (AWS Lambda)
  // AWS Lambda sets the working directory to /var/task which is read-only
  const cwd = process.cwd();
  const isServerless = cwd === "/var/task" || cwd.startsWith("/var/task/");

  if (isServerless) {
    // Use /tmp directory in serverless environments as it's the only writable location
    return path.join("/tmp", "data");
  }

  // Use local data directory for development and other environments
  return path.join(cwd, "data");
}
