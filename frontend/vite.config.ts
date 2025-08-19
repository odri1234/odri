import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/api/ws': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true,
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'query-vendor': ['@tanstack/react-query'],
          'chart-vendor': ['recharts'],
          
          // Feature chunks
          'auth-pages': [
            './src/pages/auth/LoginPage.tsx',
            './src/pages/auth/RegisterPage.tsx'
          ],
          'dashboard-pages': [
            './src/pages/dashboard/UltimateDashboard.tsx',
            './src/pages/dashboard/SuperAdminDashboard.tsx',
            './src/pages/dashboard/ISPDashboardPage.tsx'
          ],
          'user-pages': [
            './src/pages/users/UsersListPage.tsx',
            './src/pages/users/CreateUserPage.tsx',
            './src/pages/users/UserDetailsPage.tsx'
          ],
          'isp-pages': [
            './src/pages/isps/ISPsListPage.tsx',
            './src/pages/isps/CreateISPPage.tsx',
            './src/pages/isps/ISPDetailsPage.tsx'
          ],
          'plan-pages': [
            './src/pages/plans/PlansListPage.tsx',
            './src/pages/plans/CreatePlanPage.tsx',
            './src/pages/plans/PlanDetailsPage.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'axios',
      'zustand',
      'react-hook-form',
      '@hookform/resolvers',
      'zod'
    ]
  }
});
