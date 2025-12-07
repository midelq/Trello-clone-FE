import { test, expect } from '@playwright/test';

test.describe('Cards inside lists', () => {
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

  test('should create a new card', async ({ page }) => {
    // Mock card creation
    await page.route('**/api/cards', async route => {
      const body = route.request().postDataJSON?.() ?? {};

      await route.fulfill({
        json: {
          message: 'Card created',
          card: {
            id: 100,
            title: body.title ?? 'New Card',
            description: body.description ?? null,
            listId: body.listId ?? 10,
            position: body.position ?? 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      });
    });

    await page.goto('/board/1');

    // Wait for board to load
    const toDoHeading = page.getByTestId('list-title').filter({ hasText: 'To Do' });
    await expect(toDoHeading).toBeVisible();

    // Find the list container that contains "To Do" heading
    // The container has class "bg-white rounded-lg w-80" and contains our heading
    const toDoListContainer = page.locator('.bg-white.rounded-lg.w-80').filter({ 
      has: toDoHeading 
    });
    await expect(toDoListContainer).toBeVisible();
    
    // Find "Add card" button inside this specific list container
    const addCardButton = toDoListContainer.getByRole('button', { name: 'Add card' });
    await expect(addCardButton).toBeVisible({ timeout: 5000 });
    await addCardButton.click();

    // Wait for form to appear and fill card title
    const titleInput = page.getByPlaceholder('Card title');
    await expect(titleInput).toBeVisible({ timeout: 5000 });
    await titleInput.fill('New Card');

    // Fill card description (optional)
    const descriptionInput = page.getByPlaceholder('Card description');
    await descriptionInput.fill('Card description');

    // Find and click Add button inside the form (within the list container)
    const addButton = toDoListContainer.getByRole('button', { name: 'Add' });
    await expect(addButton).toBeVisible();
    
    // Click Add button and wait for form to disappear (indicating API call started)
    await addButton.click();
    
    // Wait for form to close (title input should disappear)
    await expect(titleInput).not.toBeVisible({ timeout: 5000 });

    // Wait for API call to complete and card to appear in the list
    // Find card by its h3 title element (which distinguishes it from activity log text)
    // The card has an h3 with class "font-medium text-gray-900"
    const cardTitle = toDoListContainer.locator('h3.font-medium.text-gray-900').filter({ hasText: 'New Card' });
    await expect(cardTitle).toBeVisible({ timeout: 5000 });
    
    // Find the card container - it's the ancestor div with classes "bg-white rounded-md"
    const cardContainer = cardTitle.locator('xpath=ancestor::div[contains(@class, "bg-white") and contains(@class, "rounded-md")]');
    
    // Verify card description is also visible inside the card
    await expect(cardContainer.getByText('Card description')).toBeVisible();
  });

  test('should edit card title and description', async ({ page }) => {
    // Initial board data with one card
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
                cards: [
                  {
                    id: 100,
                    title: 'Original Card',
                    description: 'Original description',
                    listId: 10,
                    position: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                ]
              }
            ]
          }
        }
      });
    });

    // Mock card update
    await page.route('**/api/cards/100', async route => {
      if (route.request().method() === 'PUT') {
        const body = route.request().postDataJSON?.() ?? {};

        await route.fulfill({
          json: {
            message: 'Card updated',
            card: {
              id: 100,
              title: body.title ?? 'Updated Card',
              description: body.description ?? 'Updated description',
              listId: 10,
              position: 0,
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

    // Verify original card is visible
    await expect(page.getByText('Original Card')).toBeVisible();

    // Find card menu button (three dots) and click it
    const cardElement = page.locator('.bg-white.rounded-md').filter({ hasText: 'Original Card' });
    const menuButton = cardElement.locator('button').last();
    await menuButton.click();

    // Click Edit in the menu
    await page.getByText('Edit').first().click();

    // Edit title
    const titleInput = page.getByPlaceholder('Enter title...');
    await expect(titleInput).toBeVisible();
    await titleInput.clear();
    await titleInput.fill('Updated Card');

    // Edit description
    const descriptionInput = page.getByPlaceholder('Enter description...');
    await descriptionInput.clear();
    await descriptionInput.fill('Updated description');

    // Click Save
    await page.getByRole('button', { name: 'Save' }).last().click();

    // Verify updated card
    await expect(page.getByText('Updated Card')).toBeVisible();
    await expect(page.getByText('Updated description')).toBeVisible();
    await expect(page.getByText('Original Card')).not.toBeVisible();
  });

  test('should delete a card', async ({ page }) => {
    // Initial board data with one card
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
                cards: [
                  {
                    id: 100,
                    title: 'Card to Delete',
                    description: 'This card will be deleted',
                    listId: 10,
                    position: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                ]
              }
            ]
          }
        }
      });
    });

    // Mock card delete
    await page.route('**/api/cards/100', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          json: {
            message: 'Card deleted'
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

    // Verify card is visible
    await expect(page.getByText('Card to Delete')).toBeVisible();

    // Find card element
    const cardElement = page.locator('.bg-white.rounded-md').filter({ hasText: 'Card to Delete' });
    
    // Find card menu button (the three dots button) and click it
    const menuButton = cardElement.locator('button').last();
    await menuButton.click();

    // Wait for menu to appear - find it through the card's relative container
    // The menu is inside a div.relative and has class "rounded-lg bg-white shadow-lg"
    const cardMenuContainer = cardElement.locator('div.relative');
    const cardMenu = cardMenuContainer.locator('.rounded-lg.bg-white.shadow-lg');
    await expect(cardMenu).toBeVisible();
    
    // Click Delete button inside the card's menu
    const deleteButton = cardMenu.getByText('Delete');
    await deleteButton.click();

    // Verify card is deleted
    await expect(page.getByText('Card to Delete')).not.toBeVisible();
  });

  test('should cancel card creation', async ({ page }) => {
    await page.goto('/board/1');

    // Wait for board to load
    const toDoHeading = page.getByTestId('list-title').filter({ hasText: 'To Do' });
    await expect(toDoHeading).toBeVisible();

    // Find the list container that contains "To Do" heading
    // The container has class "bg-white rounded-lg w-80" and contains our heading
    const toDoListContainer = page.locator('.bg-white.rounded-lg.w-80').filter({ 
      has: toDoHeading 
    });
    await expect(toDoListContainer).toBeVisible();
    
    // Find "Add card" button inside this specific list container
    const addCardButton = toDoListContainer.getByRole('button', { name: 'Add card' });
    await expect(addCardButton).toBeVisible({ timeout: 5000 });
    await addCardButton.click();

    // Wait for form to appear
    const titleInput = page.getByPlaceholder('Card title');
    await expect(titleInput).toBeVisible({ timeout: 5000 });

    // Fill some data
    await titleInput.fill('Card that will be cancelled');

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).last().click();

    // Verify form is hidden and card is not created
    await expect(titleInput).not.toBeVisible();
    await expect(page.getByText('Card that will be cancelled')).not.toBeVisible();
  });

  test('should cancel card editing', async ({ page }) => {
    // Initial board data with one card
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
                cards: [
                  {
                    id: 100,
                    title: 'Original Card',
                    description: 'Original description',
                    listId: 10,
                    position: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                ]
              }
            ]
          }
        }
      });
    });

    await page.goto('/board/1');

    // Verify original card is visible
    await expect(page.getByText('Original Card')).toBeVisible();

    // Find card menu button and click it
    const cardElement = page.locator('.bg-white.rounded-md').filter({ hasText: 'Original Card' });
    const menuButton = cardElement.locator('button').last();
    await menuButton.click();

    // Click Edit
    await page.getByText('Edit').first().click();

    // Edit title
    const titleInput = page.getByPlaceholder('Enter title...');
    await titleInput.clear();
    await titleInput.fill('Changed Title');

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).last().click();

    // Verify original card is still visible (not changed)
    await expect(page.getByText('Original Card')).toBeVisible();
    await expect(page.getByText('Changed Title')).not.toBeVisible();
  });

  test('should not create card with empty title', async ({ page }) => {
    await page.goto('/board/1');

    // Wait for board to load
    const toDoHeading = page.getByTestId('list-title').filter({ hasText: 'To Do' });
    await expect(toDoHeading).toBeVisible();

    // Find the list container that contains "To Do" heading
    // The container has class "bg-white rounded-lg w-80" and contains our heading
    const toDoListContainer = page.locator('.bg-white.rounded-lg.w-80').filter({ 
      has: toDoHeading 
    });
    await expect(toDoListContainer).toBeVisible();
    
    // Find "Add card" button inside this specific list container
    const addCardButton = toDoListContainer.getByRole('button', { name: 'Add card' });
    await expect(addCardButton).toBeVisible({ timeout: 5000 });
    await addCardButton.click();

    // Wait for form to appear
    const titleInput = page.getByPlaceholder('Card title');
    await expect(titleInput).toBeVisible({ timeout: 5000 });

    // Try to add card without title (just description)
    const descriptionInput = page.getByPlaceholder('Card description');
    await descriptionInput.fill('Description without title');

    // Click Add button
    const addButton = toDoListContainer.getByRole('button', { name: 'Add' });
    await addButton.click();

    // Verify card is not created - form should remain open because title is empty
    // The title input should still be visible (form didn't close)
    await expect(titleInput).toBeVisible();
    
    // Verify that no card was created - check that "Description without title" 
    // does not appear as a card title (h3) in the list
    // It might still be in the textarea, but should not be a card
    const cardTitles = toDoListContainer.locator('h3.font-medium.text-gray-900');
    const cardWithDescription = cardTitles.filter({ hasText: 'Description without title' });
    await expect(cardWithDescription).not.toBeVisible();
  });
});

