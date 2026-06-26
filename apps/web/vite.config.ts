import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      router: {
        quoteStyle: "double",
        routeFileIgnorePattern: ".*\\.test\\.tsx?$",
        semicolons: true,
      },
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
        failOnError: true,
      },
      pages: [
        {
          path: "/",
          prerender: { enabled: true, outputPath: "/index.html" },
        },
        {
          path: "/models",
          prerender: { enabled: true, outputPath: "/models/index.html" },
        },
        {
          path: "/pricing",
          prerender: { enabled: true, outputPath: "/pricing/index.html" },
        },
        {
          path: "/privacy",
          prerender: { enabled: true, outputPath: "/privacy/index.html" },
        },
        {
          path: "/terms",
          prerender: { enabled: true, outputPath: "/terms/index.html" },
        },
      ],
    }),
    react(),
  ],
});
