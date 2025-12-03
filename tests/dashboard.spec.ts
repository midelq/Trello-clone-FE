import { test, expect } from '@playwright/test';

test.describe('Dashboard boards list', () => {
  test.beforeEach(async ({ page }) => {
    // Simulate that user is already logged in
    await page.addInitScript(tokenKey => {
      window.localStorage.setItem(tokenKey as string, 'fake-jwt-token');
    }, 'trello_auth_token');

    // Mock /api/auth/me
    await page.route('**/api/auth/me', async route => {
      await route.fulfill({
        json: {
          user: {
            id: 1,
            fullName: 'Test User',
            email: 'test@example.com',
            createdAt: new Date().toISOString()
          }
        }
      });
    });
  });

  test('should show empty state when user has no boards yet', async ({ page }) => {
    // Empty list of boards
    await page.route('**/api/boards', async route => {
      await route.fulfill({
        json: {
          boards: []
        }
      });
    });

    await page.goto('/dashboard');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Your Boards')).toBeVisible();
    await expect(page.getByText('You have 0 boards')).toBeVisible();

    // Create board button is available
    await expect(page.getByRole('button', { name: /Create Board/i })).toBeVisible();
  });

  test('should create a new board', async ({ page }) => {
    // Initially there are no boards
    await page.route('**/api/boards', async route => {
      await route.fulfill({
        json: {
          boards: []
        }
      });
    });

    // Mock board creation
    await page.route('**/api/boards', async route => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON?.() ?? {};
        await route.fulfill({
          json: {
            message: 'Board created',
            board: {
              id: 1,
              title: body.title ?? 'New Board',
              ownerId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        });
        return;
      }

      // fallback to empty list
      await route.fulfill({
        json: { boards: [] }
      });
    });

    await page.goto('/dashboard');

    // Open creation form
    await page.getByRole('button', { name: /Create Board/i }).click();

    const titleInput = page.getByPlaceholder('Enter board title...');
    await expect(titleInput).toBeVisible();

    await titleInput.fill('My New Board');
    await page.getByRole('button', { name: 'Save' }).click();

    // New board appeared in the list and counter updated
    await expect(page.getByText('My New Board')).toBeVisible();
    await expect(page.getByText('You have 1 boards')).toBeVisible();
  });

  test('should rename existing board', async ({ page }) => {
    // Initial list with one board (GET /api/boards)
    await page.route('**/api/boards', async route => {
      await route.fulfill({
        json: {
          boards: [
            {
              id: 1,
              title: 'Old Board',
              ownerId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      });
    });

    // Board update (PUT /api/boards/1)
    await page.route('**/api/boards/1', async route => {
      if (route.request().method() === 'PUT') {
        const body = route.request().postDataJSON?.() ?? {};
        await route.fulfill({
          json: {
            message: 'Board updated',
            board: {
              id: 1,
              title: body.title ?? 'Renamed Board',
              ownerId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        });
        return;
      }

      await route.fulfill({ json: {} });
    });

    await page.goto('/dashboard');

    // Make sure the board exists
    await expect(page.getByText('Old Board')).toBeVisible();

    // Open board menu and click Edit
    await page.locator('.board-menu-button').first().click();
    await page.getByRole('button', { name: 'Edit' }).click();

    const titleInput = page.getByPlaceholder('Enter board title...');
    await expect(titleInput).toBeVisible();

    await titleInput.fill('Renamed Board');
    await page.getByRole('button', { name: 'Update' }).click();

    await expect(page.getByText('Renamed Board')).toBeVisible();
    await expect(page.getByText('Old Board')).not.toBeVisible();
  });

  test('should delete existing board', async ({ page }) => {
    // Initial list with one board
    await page.route('**/api/boards', async route => {
      await route.fulfill({
        json: {
          boards: [
            {
              id: 1,
              title: 'Board To Delete',
              ownerId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      });
    });

    // Mock DELETE request
    await page.route('**/api/boards/1', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          json: {
            message: 'Board deleted'
          }
        });
        return;
      }

      await route.fulfill({ json: {} });
    });

    // Automatically accept confirm
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await page.goto('/dashboard');

    await expect(page.getByText('Board To Delete')).toBeVisible();

    // Open menu and click Delete
    await page.locator('.board-menu-button').first().click();
    await page.getByRole('button', { name: 'Delete' }).click();

    // After deletion the board is no longer there
    await expect(page.getByText('Board To Delete')).not.toBeVisible();
    await expect(page.getByText('You have 0 boards')).toBeVisible();
  });
});

