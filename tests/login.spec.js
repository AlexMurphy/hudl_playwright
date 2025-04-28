const { test, expect } = require('@playwright/test');

// Selectors organized by functional area
const SELECTORS = {
  navigation: {
    loginButton: '[data-qa-id="login-select"]',
    hudlLoginLink: '[data-qa-id="login-hudl"]',
    subNavMenu: '.mainnav__sub > .subnav__inner > .subnav__group > .subnav__items',
  },
  loginForm: {
    continueButton: '[data-action-button-primary="true"]',
    emailError: '#error-element-username',
    emailField: '#username',
    emailLabel: '[data-dynamic-label-for="username"]',
    errorIcon: '.ulp-input-error-icon',
    passwordError: '#error-element-password',
    passwordField: '#password',
  },
  dashboard: '#koMain',
};

// Test data
const TEST_DATA = {
  credentials: {
    validEmail: process.env.HUDL_EMAIL,
    validPassword: process.env.HUDL_PASSWORD,
  },
  invalidInputs: {
    invalidEmail: 'unregistered_email_address',
    validUnregisteredEmail: 'valid_unregistered_email_address@gmail.com',
    genericEmail: 'valid_email_address@gmail.com',
    invalidPassword: 'invalid_password',
  },
};

// Helper functions (replacing Cypress custom commands)
async function openLoginSubNav(page) {
  await page.click(SELECTORS.navigation.loginButton);
}

async function navigateToLoginPage(page) {
  await openLoginSubNav(page);
  await page.click(SELECTORS.navigation.hudlLoginLink);
}

/**
 * Submit email in the login form
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} email - Email to submit
 */
async function submitEmail(page, email) {
  await page.fill(SELECTORS.loginForm.emailField, email);
  await page.click(SELECTORS.loginForm.continueButton);
}

/**
 * Submit password in the login form
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} password - Password to submit
 */
async function submitPassword(page, password) {
  await page.fill(SELECTORS.loginForm.passwordField, password);
  await page.click(SELECTORS.loginForm.continueButton);
}

/**
 * Login with provided credentials
 * @param {import('@playwright/test').Page} page - Playwright page
 * @param {string} email - Login email
 * @param {string} password - Login password
 */
async function login(page, email, password) {
  await page.goto(
    'https://identity.hudl.com/u/login/identifier?state=hKFo2SBuQ25Dc1I4NEVtdFctcVhoMWdwb0lhZG95MWszLWpmOKFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIGljaFV1YWJiMzZuSXVUMTIxLW82c2tPaVVPYUpRVkYzo2NpZNkgbjEzUmZrSHpLb3phTnhXQzVkWlFvYmVXR2Y0V2pTbjU'
  );
  await submitEmail(page, email);
  await submitPassword(page, password);
}

// Viewport configurations for responsive testing
const viewportConfigs = [
  { name: 'Desktop', width: 1280, height: 800 },
  { name: 'Mobile', width: 375, height: 812 },
];

// Navigation to login page tests
for (const viewport of viewportConfigs) {
  test.describe(`Navigation to Login Page - ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('should display the login sub nav when clicking the login button', async ({ page }) => {
      await openLoginSubNav(page);
      await expect(page.locator(SELECTORS.navigation.subNavMenu)).toBeVisible();
    });

    test('should display the Hudl login link in the sub nav', async ({ page }) => {
      await openLoginSubNav(page);
      await expect(page.locator(SELECTORS.navigation.hudlLoginLink)).toBeVisible();
    });

    test('should navigate to the login page when clicking the Hudl login link', async ({ page }) => {
      await navigateToLoginPage(page);
      // Playwright automatically waits for navigation
      await expect(page).toHaveURL(/.*\/login/);
      await expect(page.locator('h1')).toHaveText('Log In');
    });
  });
}

// Login page verification and error handling tests
test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      'https://identity.hudl.com/u/login/identifier?state=hKFo2SBuQ25Dc1I4NEVtdFctcVhoMWdwb0lhZG95MWszLWpmOKFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIGljaFV1YWJiMzZuSXVUMTIxLW82c2tPaVVPYUpRVkYzo2NpZNkgbjEzUmZrSHpLb3phTnhXQzVkWlFvYmVXR2Y0V2pTbjU'
    );
  });

  test('should have an email field with proper label', async ({ page }) => {
    await expect(page.locator(SELECTORS.loginForm.emailField)).toBeVisible();
    await expect(page.locator(SELECTORS.loginForm.emailField)).toBeEnabled();
    await expect(page.locator(SELECTORS.loginForm.emailLabel)).toContainText('Email*');
  });

  test('should have a continue button', async ({ page }) => {
    await expect(page.locator(SELECTORS.loginForm.continueButton)).toBeVisible();
  });

  test('should validate required email field', async ({ page, browserName }) => {
    // Click continue without entering email
    await page.click(SELECTORS.loginForm.continueButton);

    const emailField = page.locator(SELECTORS.loginForm.emailField);

    // Check validation message
    const validationMessage = await emailField.evaluate((el) => el.validationMessage);
    if (browserName === 'webkit') {
      expect(validationMessage).toBe('Fill out this field');
    } else if (browserName === 'chromium') {
      expect(validationMessage).toBe('Please fill out this field.');
    }
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.fill(SELECTORS.loginForm.emailField, TEST_DATA.invalidInputs.invalidEmail);
    await page.click(SELECTORS.loginForm.continueButton);

    const emailError = page.locator(SELECTORS.loginForm.emailError);
    await expect(emailError).toBeVisible();
    await expect(emailError).toContainText('Enter a valid email');
    await expect(emailError).toHaveCSS('color', 'rgb(232, 28, 0)');

    await expect(page.locator(SELECTORS.loginForm.errorIcon)).toBeVisible();
    await expect(page.locator(SELECTORS.loginForm.errorIcon)).toHaveCSS('color', 'rgb(232, 28, 0)');
  });

  test('should display password field after submitting valid email', async ({ page }) => {
    await submitEmail(page, TEST_DATA.invalidInputs.genericEmail);

    await expect(page.locator(SELECTORS.loginForm.passwordField)).toBeVisible();

    // Check that email field is readonly
    const emailReadonly = await page
      .locator(`[value="${TEST_DATA.invalidInputs.genericEmail}"]`)
      .evaluate((el) => el.getAttribute('readonly'));
    expect(emailReadonly).not.toBeNull();
  });

  test('should show error for invalid credentials (registered email)', async ({ page }) => {
    await submitEmail(page, TEST_DATA.credentials.validEmail);
    await submitPassword(page, TEST_DATA.invalidInputs.invalidPassword);

    const passwordError = page.locator(SELECTORS.loginForm.passwordError);
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toHaveCSS('color', 'rgb(232, 28, 0)');
    await expect(passwordError).toContainText('Your email or password is incorrect. Try again.');

    await expect(page.locator(SELECTORS.loginForm.errorIcon)).toBeVisible();
    await expect(page.locator(SELECTORS.loginForm.errorIcon)).toHaveCSS('color', 'rgb(232, 28, 0)');
  });

  test('should show error for invalid credentials (unregistered email)', async ({ page }) => {
    await submitEmail(page, TEST_DATA.invalidInputs.validUnregisteredEmail);
    await submitPassword(page, TEST_DATA.invalidInputs.invalidPassword);

    const passwordError = page.locator(SELECTORS.loginForm.passwordError);
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toHaveCSS('color', 'rgb(232, 28, 0)');
    await expect(passwordError).toContainText('Incorrect username or password.');

    await expect(page.locator(SELECTORS.loginForm.errorIcon)).toBeVisible();
    await expect(page.locator(SELECTORS.loginForm.errorIcon)).toHaveCSS('color', 'rgb(232, 28, 0)');
  });

  test('should show error for invalid credentials (no password)', async ({ page, browserName }) => {
    await submitEmail(page, TEST_DATA.invalidInputs.validUnregisteredEmail);
    await page.click(SELECTORS.loginForm.continueButton);

    const passwordField = page.locator(SELECTORS.loginForm.passwordField);

    // Check validation message
    const validationMessage = await passwordField.evaluate((el) => el.validationMessage);
    if (browserName === 'webkit') {
      expect(validationMessage).toBe('Fill out this field');
    } else if (browserName === 'chromium') {
      expect(validationMessage).toBe('Please fill out this field.');
    }
  });
});

// Successful login test
test.describe('Successful Login', () => {
  test('should navigate to dashboard with valid credentials', async ({ page }) => {
    await login(page, TEST_DATA.credentials.validEmail, TEST_DATA.credentials.validPassword);
    await expect(page.locator(SELECTORS.dashboard)).toBeVisible();
  });
});
