
import { test, expect } from '@playwright/test';

test('login page has expected content', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/login-page-screenshot.png' });
  await expect(page.getByText('Login')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Esqueceu a senha?' })).toBeVisible();
});
