import { defineConfig } from '@playwright/test'

const CI = !!process.env.CI
// D-66: il giro ha porte sue (backend 8081, frontend 4173, Postgres 5433): i server di sviluppo e i loro dati restano fuori
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  workers: 1,
  retries: CI ? 1 : 0,
  reporter: CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    browserName: 'chromium',
    serviceWorkers: 'block',   // il giro prova l'app, non la cache
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 430, height: 932 },   // riferimento mobile del corso
    locale: 'it-IT',
    timezoneId: 'Europe/Rome',
  },
  webServer: [
    {
      command: 'sh mvnw -q spring-boot:run',
      cwd: '../BE',
      url: 'http://localhost:8081/actuator/health',
      timeout: 180_000,
      reuseExistingServer: !CI,
      env: {
        SERVER_PORT: '8081',
        JDBC_DATABASE_URL: 'jdbc:postgresql://localhost:5433/splittrip_e2e',
        DATABASE_USERNAME: 'splittrip',
        DATABASE_PASSWORD: 'splittrip',
        CORS_ORIGIN: 'http://localhost:4173',
      },
    },
    {
      command: 'npm run build && npx vite preview --port 4173 --strictPort',
      url: 'http://localhost:4173',
      timeout: 180_000,
      reuseExistingServer: !CI,
      env: { API_TARGET: 'http://localhost:8081' },
    },
  ],
})
