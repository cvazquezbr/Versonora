
import { test, expect } from '@playwright/test';

test('login page has expected content', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});
