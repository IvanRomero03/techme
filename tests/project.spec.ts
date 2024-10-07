import { test, expect, Page } from '@playwright/test';

const login = async (page: Page) => {
    await page.goto(`/`);
    await page.getByText('Username').click();
    await page.fill('input[name="username"]', '342e41c4-6ed3-48b4-aa74-6fae060bca5a');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForTimeout(5000);
};

test('create project', async ({ page }) => {
    await login(page);

    await page.goto(`/projects`);
    await page.getByText('Add Project').click();
    await page.fill('input[name="project_name"]', 'Test Project');
    await page.fill('textarea[name="project_description"]', 'This is a test project');
    await page.fill('input[name="project_category"]', 'Test Category');
    await page.waitForTimeout(5000);
    await page.getByText('Add Members').click();
    await page.getByText('Ivan Alberto Romero Wells').click();
    await page.getByText('Create Project').click();
});

test('create task in project', async ({ page }) => {
    await login(page);

    await page.goto(`/projects`);
    await page.waitForTimeout(10000);
    await page.getByText('Test Project').click();
    await page.waitForTimeout(3000);

    await page.getByText('New Task').click();
    await page.fill('input[name="title"]', 'Test Task');
    await page.fill('textarea[name="description"]', 'This is a test task');
    await page.getByText('Create Task').click();
    await page.getByText('Requirements').click();
    await page.waitForTimeout(5000);
    await page.getByText('Add New Requirement').click();
    await page.fill('input[name="requirements.0.title"]', 'Test Requirement');
    await page.fill('textarea[name="requirements.0.description"]', 'This is a test requirement');
    await page.getByText('Submit Requirements').click();
    await page.waitForLoadState('load');
});

test('view clients', async ({ page }) => {
    await login(page);

    await page.goto(`/dashboard/comercial`);
    await page.waitForTimeout(5000);
    await page.click('button:has-text("View Clients")');
    await page.waitForURL('/clients');
});

test('view members', async ({ page }) => {
    await login(page);

    await page.goto(`/members`);
    await page.waitForTimeout(10000);
});

test('view calendar', async ({ page }) => {
    await login(page);

    await page.goto(`/calendar`);
    await page.waitForTimeout(5000);
});
