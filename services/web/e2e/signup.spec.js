// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Generates a random US phone number in the format XXX-XXX-XXXX
 * @returns {string} A randomly generated US phone number
 */
function generateRandomUsPhoneNumber() {
  const areaCode = Math.floor(Math.random() * 800) + 200;
  const exchangeCode = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `${areaCode}-${exchangeCode}-${lineNumber}`;
}

test('signup and redirect to lockout screen', async ({ page }) => {
  // Navigate to signup page
  await page.goto('http://localhost:2200/signup');

  // Generate a unique email using timestamp
  const timestamp = new Date().getTime();
  const email = `test.user.${timestamp}@example.com`;

  // Fill the form
  await page.getByRole('textbox', { name: 'First Name' }).fill('Test');
  await page.getByRole('textbox', { name: 'Last Name' }).fill('User');
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page
    .getByRole('textbox', { name: 'Phone' })
    .fill(generateRandomUsPhoneNumber());
  await page
    .getByRole('textbox', { name: 'Password' })
    .fill('TestPassword123!');

  // Submit the form
  await page.getByRole('button', { name: 'Signup' }).click();

  // Verify redirection to lockout page
  await expect(page).toHaveURL('http://localhost:2200/');

  // Verify the lockout message is displayed
  const lockoutMessage = await page
    .locator('p')
    .filter({ hasText: 'Your account is pending approval' });
  await expect(lockoutMessage).toBeVisible();

  // Verify logout button is present
  const logoutButton = await page.getByRole('link', { name: 'Logout' });
  await expect(logoutButton).toBeVisible();
});
