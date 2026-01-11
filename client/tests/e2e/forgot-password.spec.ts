import { test, expect } from '@playwright/test';

test('Forgot Password page should load', async ({ page }) => {
  // Listen for all console events and log them to the test output
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://localhost:3003/forgot-password');

  // Take a screenshot immediately after navigation to see the initial state
  await page.screenshot({ path: '/home/jules/verification/forgot_password_page_before_expect.png' });

  // Wait for the element with a longer timeout
  await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 10000 });

  await page.screenshot({ path: '/home/jules/verification/forgot_password_page.png' });
});
