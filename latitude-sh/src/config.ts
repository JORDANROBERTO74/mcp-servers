import { config as dotenvConfig } from "dotenv";
import { z } from "zod";

// Load environment variables from .env.local file
// Try to load .env.local, but don't fail if it doesn't exist
try {
  dotenvConfig({ path: ".env.local" });
} catch (error) {
  // .env.local doesn't exist, continue with system environment variables
  console.error("⚠️  .env.local not found, using system environment variables");
}

// Schema for environment variables validation
const EnvSchema = z.object({
  LATITUDE_API_KEY: z.string().min(1, "API key is required"),
  LATITUDE_BASE_URL: z
    .string()
    .url()
    .refine((url) => url.startsWith("https://"), {
      message: "Base URL must use HTTPS for security",
    })
    .refine(
      (url) => {
        try {
          const urlObj = new URL(url);
          return (
            urlObj.hostname.includes("latitude") ||
            urlObj.hostname.includes("api")
          );
        } catch {
          return false;
        }
      },
      {
        message: "Base URL must be a valid latitude.sh domain",
      }
    )
    .optional()
    .default("https://api.latitude.sh"),
  LATITUDE_TIMEOUT: z.coerce
    .number()
    .min(1000)
    .max(60000)
    .optional()
    .default(10000),
  NODE_ENV: z
    .enum(["development", "production"])
    .optional()
    .default("development"),
});

// Parse and validate environment variables
function loadConfig() {
  try {
    const envVars = EnvSchema.parse(process.env);

    return {
      apiKey: envVars.LATITUDE_API_KEY,
      baseURL: envVars.LATITUDE_BASE_URL,
      timeout: envVars.LATITUDE_TIMEOUT,
      environment: envVars.NODE_ENV,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => err.path.join("."))
        .join(", ");
      throw new Error(
        `Missing or invalid environment variables: ${missingVars}`
      );
    }
    throw error;
  }
}

export const config = loadConfig();

// Helper function to check if running in development mode
export const isDevelopment = config.environment === "development";

// Helper function to get configuration for API client
export const getAPIConfig = () => ({
  apiKey: config.apiKey,
  baseURL: config.baseURL,
  timeout: config.timeout,
});
