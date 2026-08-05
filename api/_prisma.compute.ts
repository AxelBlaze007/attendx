import { defineComputeConfig } from "@prisma/compute-sdk/config";

export default defineComputeConfig({
  app: {
    name: "attendx-api",
    framework: "custom",
    build: {
      command: "npx prisma generate && npx prisma migrate deploy && npm run build",
      outputDirectory: "dist",
      entrypoint: "server.js",
    },
  },
  region: "ap-southeast-1",
});
