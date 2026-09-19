---
title: "How Frontend Testing Is Actually Done"
date: "2026-07-21"
excerpt: "Test Driven Developing (is dead?)"
sections: ["tech"]
---

## What to test

You might have the same question I did: how do you actually test the frontend? Does it mean making sure the UI never breaks under any circumstance? That can't possibly be finished — there are so many different devices and resolutions out there, how could you possibly cover every case?

The simple answer is: of course you can't, and no one's testing goal is to make every single pixel of the UI flawless. Though a rough screenshot test with Playwright / Cypress can get you close enough. So what should frontend testing actually cover?

I think the way into this question is understanding what frontend testing "is / isn't" and what it "should / shouldn't" do.

## Principles

### Is/Isn't/Do/Don't

**Frontend testing "is"**

- **The foundation for maintenance and refactoring**: the highest value of testing is giving engineers the confidence to refactor and maintain code boldly, without living in fear that changing this or that will break everything
- **A spec for components and functions**: through test cases, define what output or behavior a component or function should have for various inputs
- **A line of defense for logic and behavior**: making sure business logic, state transitions, API calls, and data processing stay correct across iterations

**Frontend testing "isn't"**

- **A silver bullet for zero bugs**: a test can only prove "the scenario you tested is fine" — it can't fully rule out unexpected edge cases or entirely new bugs
- **A reviewer of visuals and layout**: unit/integration tests can't see the real screen, they don't care about CSS pixel values or a broken layout, and there's no way to cover every visual case anyway

**Frontend testing "should"**

- **Focus on "behavior and state"**: test what the user clicked, what state changed, what correct data got produced (e.g. does the counter increase by 1 after clicking a button)
- **Prioritize high-risk and core logic**: put your energy into business logic, complex data-processing functions, shared hooks, and forms/state machines that are prone to bugs
- **Embrace the 80/20 rule**: write tests for the most critical, most failure-prone paths (the happy path and common error paths) to get the highest return on investment

**Frontend testing "shouldn't"**

- **Lock in CSS values and styling details**: don't test "is this component's width exactly 300px", "is the color a specific hex value", "did this layout break"
- **Write junk tests**: don't test static UI with no logic, or write tests padded out for the sake of a number with no real assertions

You can never finish writing tests, so you need to scope it. So who should decide that?

Ideally the team discusses it together, or you judge which tests and edge cases matter based on the requirements the PM gave you.

If your boss or manager just tells you "this needs a test" without telling you what to test (I've had this happen — he even handed me a JUnit book, like who has time to read a whole book), then you get to define the scope yourself and figure out what matters. Of course, if they didn't say anything, there's also a chance this isn't actually important, and you're just doing unpaid extra work.

A few directions to start from:

- Write out the happy path and the common error paths
- Look at commits, bugs, Jira, or meeting notes to see what tends to be a landmine
- Give your boss or manager a rough plan to confirm (communication at work matters!!)

## The three pillars

### Unit Test

Tests simple, standalone functions, or functions in a `utils/` directory — they don't touch the network, the DOM, or a database, so they run fast. Examples: a string formatter, password rule validation, a simple React hook.

Unit tests usually live alongside components, since the React ecosystem often keeps the test file right next to the component:

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx        # your component
│       ├── Button.styles.ts  # styles
│       └── Button.test.tsx   # 👈 the test file, sitting right next to it
├── utils/
│   ├── formatPrice.js        # a utility function
│   └── formatPrice.test.js   # 👈 its test file
```

You usually don't need to write something like "a disabled button shouldn't be clickable" yourself, since that DOM/UI-component behavior is already handled by the browser or by whatever library you're using — Radix, Material UI, Ant Design, etc. But if you wrap something on top of those, or clicking the button triggers some logic specific to your own app, that's on you to test.

### Integration Test

Frontend integration tests stitch components together to make sure a larger component or page works as a whole. For a login form, we'd need to:

1. Render the form along with all its components
2. Fill in data and submit it (user interaction)
3. Check the resulting screen and behavior

Note that integration tests don't talk to anything external, so if you need to test the login form's loading state or what happens when a response comes back, you'll need MSW to intercept the request and mock the response.

Written with [Vitest](https://vitest.dev/) (the test library) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (for rendering and interacting with React components), it looks roughly like this:

```js
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm integration test', () => {
  it('shows an error message when the user enters an invalid email and submits', async () => {
    // 1. Set up the mock function
    const mockLogin = vi.fn();

    // 2. Render the component
    render(<LoginForm onLogin={mockLogin} />);

    // 3. Simulate user interaction (typing in the input, clicking the button)
    const input = screen.getByTestId('email-input');
    const submitBtn = screen.getByRole('button', { name: 'Log in' });

    await userEvent.type(input, 'invalid-email'); // deliberately missing the @
    await userEvent.click(submitBtn);

    // 4. Assert (check the error shows up as expected, and login was never called)
    const errorMsg = screen.getByTestId('error-msg');
    expect(errorMsg).toHaveTextContent('Invalid email format');
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
```

### e2e test

You can think of e2e as opening a real browser and actually walking through the flow a user would take, usually done with a tool like [PlayWright](https://playwright.dev/) or [Cypress](https://www.cypress.io/#create). Since it's the most expensive and slowest to run, this is where you especially need to pick the flows that matter.

It's worth noting that at this stage you'll run into a lot of external dependencies:

**Backend and database**

Use a test machine or a docker container, resetting and cleaning up state on every test run, so production data never gets polluted. Example test cases:

- Unauthenticated user -> browse the product list -> add a product to the cart -> go to checkout -> fill in shipping info -> submit the order -> check that "order placed" and an order number show up on screen
- While logged out, force-navigate directly to `https://example.com/admin` via the address bar -> check that the frontend router successfully intercepts it and redirects back to the login page

**Third-party services**

A few common categories:

- Auth (Google login, Apple login, Auth0, Firebase Auth)
- Payments (Stripe, 2Checkout, Paypal, Apple Pay)
- Cloud storage and CDN
- Third-party notifications and messaging (SendGrid, Twilio, Google Analytics)

For third-party services, e2e tests don't actually hammer them for real — instead, two strategies are used:

1. Bypass or inject state: create a session or cookie and drop it into the browser to skip the login flow
2. Use the sandbox environment the provider offers, e.g. Stripe and 2Checkout give developers test credit card numbers to use

**Client-side Storage**

Test whether data was written correctly to localStorage, sessionStorage, Cookies, or IndexedDB, and whether the features relying on them work. Example:

```js
import { test, expect } from '@playwright/test';

test('after a successful login, the token should be correctly stored in localStorage', async ({ page }) => {
  await page.goto('/login');

  // 1. Simulate the user filling in and submitting credentials
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'correct_password');
  await page.click('button[type="submit"]');

  // 2. Wait for the screen to navigate to the dashboard
  await expect(page).toHaveURL('/dashboard');

  // ==========================================
  // 3. Check the browser's storage (this is the actual verification)
  // ==========================================
  // Use Playwright's evaluate to check localStorage
  const token = await page.evaluate(() => localStorage.getItem('access_token'));

  // Assert: the token must not be empty, and must exist
  expect(token).toBeTruthy();
  expect(typeof token).toBe('string');
});
```

**Network, CDN & Routing**

This covers anything network-related, and since it gets fairly complex, here are a few examples directly:

- Entering a deep URL directly or refreshing the page shouldn't produce a 404
- When the network is offline, clicking submit should show a disconnected notice
- All critical CSS and JS static assets on the homepage must load successfully
- The frontend calling backend APIs shouldn't run into CORS blocking errors

**Browser APIs & Device Emulation**

Tests targeting [Web APIs](https://developer.mozilla.org/en-US/docs/Web/API) or device-specific features:

- Whether the system time or currency correctly converts when the user is in Tokyo, Japan
- The browser's "allow camera/microphone access" and "allow push notifications" prompts

## Lint

Lint tools automate fixing coding style, with ESLint and Prettier being the common ones. Their main functions:

- Catching [code smells](https://gelis-dotnet.blogspot.com/2023/02/code-smell-or-bad-smell.html)
- Unifying the team's coding style (naming conventions, indentation, etc.)

ESLint and Prettier can be installed via npm, and VS Code also has extensions that color-highlight issues as you write code.

## Type Check

Using TypeScript's static type checking to catch runtime errors ahead of time, during compilation and development.

## Putting testing into the dev workflow and automating it

### Linting on commit

[Husky](https://typicode.github.io/husky/) is a tool that helps a project hook into [Git Hooks](https://hackmd.io/@s716134/githook01). With it, you can **automatically run eslint and prettier on commit**, making sure every commit keeps the code from getting too ugly.

### Running tests with GitHub Actions

This happens when you open a PR to merge code into another branch. [GitHub Actions](https://github.com/features/actions) is GitHub's CI/CD tool, and you can use it to define a test workflow that runs when a PR is opened, so the project only merges once all tests pass.

Two things need to be done:

1. Set up a yaml file in the project defining the trigger conditions and the jobs to test
2. Set up branch protection rules on GitHub, so merging is blocked until tests pass

Every time the workflow triggers, GitHub Actions spins up a new VM and installs the code and dependencies it needs. Thanks to caching, you don't need to worry about it being slow every time from a full reinstall.

```yaml
name: Frontend CI

# Trigger conditions: run when someone opens a Pull Request against main, or pushes directly to main
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      # 1. Pull the project's code into the VM
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. Set up the Node.js and pnpm environment
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: latest

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      # 3. Install dependencies
      - name: Install dependencies
        run: pnpm install

      # 4. Run Lint, Type Check, and the tests
      - name: Run Lint and TypeCheck
        run: |
          pnpm lint
          pnpm check

      - name: Run Tests
        run: pnpm test --run
```

## Getting AI to write good tests

With AI's help, tests can obviously be written faster and more thoroughly. To keep AI from writing redundant tests, or tests that get in the way of development and become technical debt, you should give it some clear rules to follow, for example:

- Explicitly specify the test level, tools, and boundaries
- Give it existing test examples from the project
- Give it a standard for what a test is "worth" writing
- Have it ask for confirmation before adding new tests

Example rules:

```markdown
## Testing Guidelines

Co-locate Vitest/React Testing Library tests as `src/**/*.test.ts` or `*.test.tsx`; test public
contracts and accessible behavior (roles, names, keyboard interaction), not styling details. Put
Playwright specs in `tests/e2e/*.spec.ts`. Run `pnpm test` while iterating and `pnpm check` before
submission. Run `pnpm test:e2e` for routing, locale, responsive, or interaction changes. Visual
changes require desktop and mobile review and screenshots in the pull request. Install Chromium
once with `pnpm exec playwright install chromium`.
```

## Summary

Good tests make code reliable and easy to maintain. Weighing the cost of testing against the reliability of the code depends on understanding the product's key flows, and on a testing approach and scope the team has agreed on and communicated together. Now that AI can help write tests, it's even more important to clearly define the test spec and set rules for the AI's behavior.

## Reference

- [Web API](https://developer.mozilla.org/en-US/docs/Web/API)
- [Husky tutorial](https://emtech.cc/p/husky/)
- [Stop learning testing with 1+1=2! Let's start learning unit testing with Vitest](https://israynotarray.com/vitest/20230420/4055762937/)
