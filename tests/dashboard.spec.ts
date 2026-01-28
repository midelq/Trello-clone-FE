import { test, expect } from '@playwright/test';

// TODO: These tests need to be updated for the new auth architecture
// The app now uses httpOnly cookies for refresh tokens and in-memory storage for access tokens
// instead of localStorage. The tests need to mock /api/auth/refresh endpoint properly.
test.describe.skip('Dashboard boards list', () => {
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

  test('should display multiple boards', async ({ page }) => {
    // Mock list with multiple boards
    await page.route('**/api/boards', async route => {
      await route.fulfill({
        json: {
          boards: [
            {
              id: 1,
              title: 'First Board',
              ownerId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 2,
              title: 'Second Board',
              ownerId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 3,
              title: 'Third Board',
              ownerId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      });
    });

    await page.goto('/dashboard');

    // All boards should be visible
    await expect(page.getByText('First Board')).toBeVisible();
    await expect(page.getByText('Second Board')).toBeVisible();
    await expect(page.getByText('Third Board')).toBeVisible();
    await expect(page.getByText('You have 3 boards')).toBeVisible();
  });

  test('should cancel board creation', async ({ page }) => {
    await page.route('**/api/boards', async route => {
      await route.fulfill({
        json: { boards: [] }
      });
    });

    await page.goto('/dashboard');

    // Open creation form
    await page.getByRole('button', { name: /Create Board/i }).click();
    const titleInput = page.getByPlaceholder('Enter board title...');
    await expect(titleInput).toBeVisible();

    // Fill input but cancel
    await titleInput.fill('Board That Will Not Be Created');
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Form should be closed and board should not exist
    await expect(titleInput).not.toBeVisible();
    await expect(page.getByText('Board That Will Not Be Created')).not.toBeVisible();
    await expect(page.getByText('You have 0 boards')).toBeVisible();
  });

  test('should cancel board editing', async ({ page }) => {
    await page.route('**/api/boards', async route => {
      await route.fulfill({
        json: {
          boards: [
            {
              id: 1,
              title: 'Original Board',
              ownerId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      });
    });

    await page.goto('/dashboard');

    // Open edit form
    await page.locator('.board-menu-button').first().click();
    await page.getByRole('button', { name: 'Edit' }).click();

    const titleInput = page.getByPlaceholder('Enter board title...');
    await expect(titleInput).toBeVisible();

    // Change title but cancel
    await titleInput.fill('Changed Title');
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Original title should remain
    await expect(page.getByText('Original Board')).toBeVisible();
    await expect(page.getByText('Changed Title')).not.toBeVisible();
  });

  test('should not create board with empty title', async ({ page }) => {
    await page.route('**/api/boards', async route => {
      await route.fulfill({
        json: { boards: [] }
      });
    });

    await page.goto('/dashboard');

    // Open creation form
    await page.getByRole('button', { name: /Create Board/i }).click();
    const titleInput = page.getByPlaceholder('Enter board title...');
    await expect(titleInput).toBeVisible();

    // Try to save with empty title (just spaces)
    await titleInput.fill('   ');
    await page.getByRole('button', { name: 'Save' }).click();

    // Form should still be visible (not closed) and no board created
    await expect(titleInput).toBeVisible();
    await expect(page.getByText('You have 0 boards')).toBeVisible();
  });

  test('should save board using Enter key', async ({ page }) => {
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
      await route.fulfill({ json: { boards: [] } });
    });

    await page.goto('/dashboard');

    await page.getByRole('button', { name: /Create Board/i }).click();
    const titleInput = page.getByPlaceholder('Enter board title...');
    await titleInput.fill('Board Created With Enter');
    await titleInput.press('Enter');

    // Board should be created
    await expect(page.getByText('Board Created With Enter')).toBeVisible();
    await expect(page.getByText('You have 1 boards')).toBeVisible();
  });

  test('should cancel form using Escape key', async ({ page }) => {
    await page.route('**/api/boards', async route => {
      await route.fulfill({
        json: { boards: [] }
      });
    });

    await page.goto('/dashboard');

    await page.getByRole('button', { name: /Create Board/i }).click();
    const titleInput = page.getByPlaceholder('Enter board title...');
    await titleInput.fill('Board That Will Be Cancelled');
    await titleInput.press('Escape');

    // Form should be closed
    await expect(titleInput).not.toBeVisible();
    await expect(page.getByText('Board That Will Be Cancelled')).not.toBeVisible();
  });

  test('should navigate to board when clicking on board card', async ({ page }) => {
    await page.route('**/api/boards', async route => {
      await route.fulfill({
        json: {
          boards: [
            {
              id: 1,
              title: 'My Board',
              ownerId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      });
    });

    await page.goto('/dashboard');

    // Click on board card
    await page.getByText('My Board').click();

    // Should navigate to board view
    await expect(page).toHaveURL(/\/board\/1/);
  });

  test('should show error message when board creation fails', async ({ page }) => {
    await page.route('**/api/boards', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          json: {
            message: 'Server error occurred'
          }
        });
        return;
      }
      await route.fulfill({ json: { boards: [] } });
    });

    await page.goto('/dashboard');

    await page.getByRole('button', { name: /Create Board/i }).click();
    const titleInput = page.getByPlaceholder('Enter board title...');
    await titleInput.fill('Board That Will Fail');
    await page.getByRole('button', { name: 'Save' }).click();

    // Error alert should appear (Playwright can catch alert)
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('error');
      await dialog.accept();
    });

    // Board should not be created
    await expect(page.getByText('Board That Will Fail')).not.toBeVisible();
  });

  test('should show error message when board update fails', async ({ page }) => {
    await page.route('**/api/boards', async route => {
      await route.fulfill({
        json: {
          boards: [
            {
              id: 1,
              title: 'Original Board',
              ownerId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      });
    });

    await page.route('**/api/boards/1', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 500,
          json: {
            message: 'Update failed'
          }
        });
        return;
      }
      await route.fulfill({ json: {} });
    });

    await page.goto('/dashboard');

    await page.locator('.board-menu-button').first().click();
    await page.getByRole('button', { name: 'Edit' }).click();

    const titleInput = page.getByPlaceholder('Enter board title...');
    await titleInput.fill('New Title');
    await page.getByRole('button', { name: 'Update' }).click();

    // Error alert should appear
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('error');
      await dialog.accept();
    });

    // Original title should still be visible
    await expect(page.getByText('Original Board')).toBeVisible();
  });

  test('should cancel board deletion', async ({ page }) => {
    await page.route('**/api/boards', async route => {
      await route.fulfill({
        json: {
          boards: [
            {
              id: 1,
              title: 'Board To Keep',
              ownerId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      });
    });

    // Reject the confirm dialog
    page.on('dialog', async dialog => {
      await dialog.dismiss();
    });

    await page.goto('/dashboard');

    await expect(page.getByText('Board To Keep')).toBeVisible();

    // Try to delete but cancel
    await page.locator('.board-menu-button').first().click();
    await page.getByRole('button', { name: 'Delete' }).click();

    // Board should still exist
    await expect(page.getByText('Board To Keep')).toBeVisible();
    await expect(page.getByText('You have 1 boards')).toBeVisible();
  });

  test('should show loading state while fetching boards', async ({ page }) => {
    // Delay the response to see loading state
    await page.route('**/api/boards', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        json: {
          boards: [
            {
              id: 1,
              title: 'Loaded Board',
              ownerId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
        }
      });
    });

    await page.goto('/dashboard');

    // Loading message should appear briefly
    const loadingText = page.getByText('Loading boards...');
    await expect(loadingText).toBeVisible();

    // Eventually board should load
    await expect(page.getByText('Loaded Board')).toBeVisible();
    await expect(loadingText).not.toBeVisible();
  });

  test('should show error message when fetching boards fails', async ({ page }) => {
    await page.route('**/api/boards', async route => {
      await route.fulfill({
        status: 500,
        json: {
          message: 'Failed to fetch boards'
        }
      });
    });

    await page.goto('/dashboard');

    // Error message should be displayed
    await expect(page.getByText('Failed to fetch boards')).toBeVisible();
  });
});

