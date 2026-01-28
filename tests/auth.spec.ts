import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/login', async route => {
      const json = {
        message: 'Login successful',
        user: {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User'
        },
        accessToken: 'fake-jwt-token'
      };
      await route.fulfill({ json });
    });

    await page.route('**/api/auth/register', async route => {
      const json = {
        message: 'Registration successful',
        user: {
          id: 2,
          email: 'john@example.com',
          fullName: 'John Doe'
        },
        accessToken: 'fake-jwt-token-2'
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


  test('should show error when server returns 401', async ({ page }) => {
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 401,
        json: { error: 'Invalid credentials' }
      });
    });

    await page.goto('/');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should show error when network fails', async ({ page }) => {
    await page.route('**/api/auth/login', route => route.abort('failed'));

    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: 'Sign In' }).click();


    await expect(page.getByText(/failed to fetch|network error|connection failed/i)).toBeVisible();
  });

  test('should show error when email already exists during signup', async ({ page }) => {
    await page.route('**/api/auth/register', async route => {
      await route.fulfill({
        status: 409,
        json: { error: 'Email already exists' }
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await page.fill('input[placeholder*="Enter your full name"]', 'John Doe');
    await page.fill('input[type="email"]', 'existing@example.com');
    await page.fill('input[placeholder*="Enter your password"]', 'password123');
    await page.fill('input[placeholder*="Confirm your password"]', 'password123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText(/email already exists/i)).toBeVisible();
  });

  test('should show error for weak password', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await page.fill('input[placeholder*="Enter your full name"]', 'John Doe');
    await page.fill('input[type="email"]', 'john@example.com');
    await page.fill('input[placeholder*="Enter your password"]', '123');
    await page.fill('input[placeholder*="Confirm your password"]', '123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText(/password must be at least 6 characters/i)).toBeVisible();
  });


  test('should authenticate and redirect to dashboard after login', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL('/dashboard');
    // Token is stored in memory, not localStorage (for security)
    // Verify authentication by checking we can see dashboard content
    await expect(page.getByText('Your Boards')).toBeVisible();
  });

  test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
    // Mock the refresh endpoint to fail (no valid session)
    await page.route('**/api/auth/refresh', async route => {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
    });

    await page.goto('/dashboard');

    await expect(page).toHaveURL('/');
  });

  // TODO: This test needs updated selectors for the new Navbar UI
  test.skip('should logout and redirect to login', async ({ page }) => {
    // Mock logout endpoint
    await page.route('**/api/auth/logout', async route => {
      await route.fulfill({ status: 200, json: { message: 'Logged out' } });
    });

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL('/dashboard');

    await page.locator('.user-menu-button').click();
    await page.getByRole('button', { name: /logout/i }).click();

    await expect(page).toHaveURL('/');
  });
});
