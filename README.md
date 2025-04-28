# Hudl Playwright Testing Project

This project contains end-to-end tests for the Hudl website login functionality using Playwright.

## Overview

The test suite validates the login functionality of Hudl's website, focusing on:

- Navigation to the login page
- Form validation
- Error handling
- Successful authentication

Tests are implemented for both desktop and mobile viewports to ensure responsive design functionality.

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- A Hudl account for testing (credentials to be provided via environment variables)

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

## Configuration

The tests require valid Hudl credentials. Set the following environment variables:

```bash
export HUDL_EMAIL="your_email@example.com"
export HUDL_PASSWORD="your_password"
```

## Running Tests

Run all tests:

```bash
npx playwright test
```

### Linting and Formatting

- Lint the code:

  ```bash
  npm run lint
  ```

- Fix linting issues:

  ```bash
  npm run lint:fix
  ```

- Format the code:
  ```bash
  npm run prettier
  ```

## Test Structure

- **Navigation Tests**: Verify the login navigation flow on both desktop and mobile viewports
- **Form Validation Tests**: Validate the form fields and error messages
- **Authentication Tests**: Test login flows with different credential combinations

## Project Structure

```
└── hudl_playwright/
    ├── package.json         # Project dependencies
    ├── playwright.config.js # Playwright configuration
    ├── tests/
    │   └── login.spec.js    # Login test suite
    └── playwright-report/   # HTML test reports (generated after test runs)
```

## Test Reports

After running tests, HTML reports are generated in the `playwright-report` directory. Open `playwright-report/index.html` in a browser to view detailed test results.

```bash
npx playwright show-report
```
