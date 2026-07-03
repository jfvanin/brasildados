import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 30000,
    use: {
        baseURL: 'http://localhost:3100',
        channel: 'chrome', // use system Chrome, no browser download needed
        headless: true,
    },
    webServer: {
        command: 'python3 -m http.server 3100 --directory build',
        url: 'http://localhost:3100',
        reuseExistingServer: true,
        timeout: 30000,
    },
});
