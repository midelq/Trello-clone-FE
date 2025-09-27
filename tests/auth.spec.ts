import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page by default', async ({ page }) => {
    await expect(page).toHaveTitle(/Trello Clone/);
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByText('Enter your credentials to access your boards')).toBeVisible();
  });

  test('should switch to signup mode', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
    await expect(page.getByText('Sign up to start organizing your projects')).toBeVisible();
  });

  test('should perform successful login', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Should redirect to dashboard after successful login
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
    
    // Should redirect to boards page after successful signup
    await expect(page).toHaveURL('/boards');
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
});