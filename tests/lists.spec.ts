import { test, expect } from '@playwright/test';

// TODO: These tests need to be updated for the new auth architecture
// The app now uses httpOnly cookies for refresh tokens and in-memory storage for access tokens
// instead of localStorage. The tests need to mock /api/auth/refresh endpoint properly.
test.describe.skip('Lists inside board', () => {
  test.beforeEach(async ({ page }) => {
    // Simulate authenticated user
    await page.addInitScript(tokenKey => {
      window.localStorage.setItem(tokenKey as string, 'fake-jwt-token');
    }, 'trello_auth_token');

    // Auth check
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

    // Full board data with one list
    await page.route('**/api/boards/1/full', async route => {
      await route.fulfill({
        json: {
          board: {
            id: 1,
            title: 'Test Board',
            ownerId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lists: [
              {
                id: 10,
                title: 'To Do',
                position: 0,
                boardId: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                cards: []
              }
            ]
          }
        }
      });
    });
  });

  test('should create a new list', async ({ page }) => {
    // Mock list creation
    await page.route('**/api/lists', async route => {
      const body = route.request().postDataJSON?.() ?? {};

      await route.fulfill({
        json: {
          message: 'List created',
          list: {
            id: 11,
            title: body.title ?? 'In Progress',
            position: body.position ?? 1,
            boardId: body.boardId ?? 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      });
    });

    await page.goto('/board/1');

    await page.getByRole('button', { name: 'Add list' }).click();

    const input = page.getByPlaceholder('List title');
    await expect(input).toBeVisible();

    await input.fill('In Progress');
    await page.getByRole('button', { name: 'Add' }).last().click();

    // Verify list title (heading), not activity log text
    await expect(
      page.getByRole('heading', { level: 2, name: 'In Progress' })
    ).toBeVisible();
  });

  test('should rename existing list', async ({ page }) => {
    // Mock list update
    await page.route('**/api/lists/10', async route => {
      if (route.request().method() === 'PUT') {
        const body = route.request().postDataJSON?.() ?? {};

        await route.fulfill({
          json: {
            message: 'List updated',
            list: {
              id: 10,
              title: body.title ?? 'Doing',
              position: 0,
              boardId: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        });
        return;
      }

      await route.fulfill({ json: {} });
    });

    await page.goto('/board/1');

    await expect(page.getByText('To Do')).toBeVisible();

    // Open list menu and click "Edit"
    await page.locator('button[aria-label="List menu"]').first().click();

    const listMenu = page.locator('div[role="menu"]').first();
    await expect(listMenu).toBeVisible();
    await listMenu.getByText('Edit').click();

    const editInput = page.getByRole('textbox').first();
    await expect(editInput).toBeVisible();

    await editInput.fill('Doing');
    await editInput.press('Enter');

    await expect(page.getByText('Doing')).toBeVisible();
    await expect(page.getByText('To Do')).not.toBeVisible();
  });

  test('should delete existing list', async ({ page }) => {
    // Mock delete list
    await page.route('**/api/lists/10', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          json: {
            message: 'List deleted'
          }
        });
        return;
      }

      await route.fulfill({ json: {} });
    });

    // Auto-accept confirm dialog
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await page.goto('/board/1');

    await expect(page.getByText('To Do')).toBeVisible();

    // Open list menu and click "Delete"
    await page.locator('button[aria-label="List menu"]').first().click();

    const listMenu = page.locator('div[role="menu"]').first();
    await expect(listMenu).toBeVisible();
    await listMenu.getByText('Delete').click();

    await expect(page.getByText('To Do')).not.toBeVisible();
  });

  test('should reorder lists with drag and drop', async ({ page }) => {
    // Mock list creation endpoint to create multiple lists via UI
    let nextId = 20;
    await page.route('**/api/lists', async route => {
      const body = route.request().postDataJSON?.() ?? {};

      await route.fulfill({
        json: {
          message: 'List created',
          list: {
            id: nextId++,
            title: body.title,
            position: body.position ?? 0,
            boardId: body.boardId ?? 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      });
    });

    // Mock list reorder endpoint
    await page.route('**/api/lists/*/reorder', async route => {
      await route.fulfill({
        json: {
          message: 'List reordered'
        }
      });
    });

    await page.goto('/board/1');

    // Ensure initial list exists
    await expect(
      page.getByRole('heading', { level: 2, name: 'To Do' })
    ).toBeVisible();

    // Helper to create list via UI
    const createList = async (title: string) => {
      await page.getByRole('button', { name: 'Add list' }).click();
      const input = page.getByPlaceholder('List title');
      await input.fill(title);
      await page.getByRole('button', { name: 'Add' }).last().click();
      await expect(
        page.getByRole('heading', { level: 2, name: title })
      ).toBeVisible();
    };

    // Create two additional lists
    await createList('In Progress');
    await createList('Done');

    // Select only list titles using data-testid
    const listTitles = page.getByTestId('list-title');
    expect(await listTitles.allTextContents()).toEqual(['To Do', 'In Progress', 'Done']);

    // Perform drag and drop using mouse events (works with @hello-pangea/dnd)
    const sourceList = page.locator('.bg-white.rounded-lg.w-80').filter({ hasText: 'Done' });
    const targetList = page.locator('.bg-white.rounded-lg.w-80').filter({ hasText: 'To Do' });

    // Get bounding boxes
    const sourceBox = await sourceList.boundingBox();
    const targetBox = await targetList.boundingBox();

    if (!sourceBox || !targetBox) {
      throw new Error('Could not find list elements for drag and drop');
    }

    // Perform drag and drop with mouse events
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + 10);
    await page.mouse.down();
    await page.waitForTimeout(100); // Wait for drag to start
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + 10, { steps: 10 });
    await page.waitForTimeout(100); // Wait for hover effect
    await page.mouse.up();

    // Wait for React DnD state update
    await page.waitForTimeout(500);

    // Verify new order
    expect(await listTitles.allTextContents()).toEqual(['Done', 'To Do', 'In Progress']);
  });
});
