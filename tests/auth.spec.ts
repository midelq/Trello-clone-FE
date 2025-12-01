import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/login', async route => {
      const json = {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User'
        },
        token: 'fake-jwt-token'
      };
      await route.fulfill({ json });
    });

    await page.route('**/api/auth/register', async route => {
      const json = {
        user: {
          id: 2,
          email: 'john@example.com',
          name: 'John Doe'
        },
        token: 'fake-jwt-token-2'
      };
      await route.fulfill({ json });
    });

    await page.route('**/api/boards', async route => {
      await route.fulfill({ json: { boards: [] } });
    });

    await page.goto('/');
  });

  test('should display login page by default', async ({ page }) => {
    await expect(page).toHaveTitle(/Trello Clone/);
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('should perform successful login', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for empty login fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('Please enter email and password.')).toBeVisible();
  });

  test('should perform successful signup', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await page.fill('input[placeholder*="Enter your full name"]', 'John Doe');
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[placeholder*="Enter your password"]', 'password123');
    await page.fill('input[placeholder*="Confirm your password"]', 'password123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for password mismatch in signup', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await page.fill('input[placeholder*="Enter your full name"]', 'John Doe');
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[placeholder*="Enter your password"]', 'password123');
    await page.fill('input[placeholder*="Confirm your password"]', 'different123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText('Passwords do not match.')).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    
    await expect(page).toHaveURL('/');
  });
});