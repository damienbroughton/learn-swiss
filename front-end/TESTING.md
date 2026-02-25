# React Testing Setup Guide

This document describes the testing setup for the Learn-Swiss frontend.

## Overview

The project uses:
- **Vitest** - Fast unit test framework (Vite-native)
- **React Testing Library** - For testing React components
- **jsdom** - For simulating DOM environment in tests

## Project Structure

```
front-end/
├── vitest.config.js              # Vitest configuration
├── src/
│   ├── test-setup.js             # Test environment setup & globals
│   ├── test-utils.js             # Custom testing utilities
│   ├── pages/
│   │   └── __tests__/
│   │       └── Homepage.test.jsx  # Homepage component tests
│   └── ...
└── package.json
```

## Installation

First, install the testing dependencies:

```bash
cd front-end
npm install
```

The following packages are already in `package.json`:
- `vitest` - Unit testing framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers
- `jsdom` - DOM implementation for Node.js

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run tests with UI dashboard
```bash
npm run test:ui
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- Homepage.test.jsx
```

## Writing Tests

### Basic Test Structure

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Using renderWithProviders

The `renderWithProviders` utility automatically wraps your component with required providers:
- `HelmetProvider` - For react-helmet-async
- `BrowserRouter` - For react-router-dom

```jsx
import { renderWithProviders, screen } from '../test-utils';

renderWithProviders(<Homepage />);
expect(screen.getByText('Welcome')).toBeInTheDocument();
```

### Mocking Hooks

```jsx
import { vi } from 'vitest';

vi.mock('../../hooks/useAppUser', () => ({
  default: vi.fn(() => ({ appUser: null })),
}));
```

### Common Testing Patterns

#### Testing Conditional Rendering
```jsx
it('should show login link when user is not logged in', () => {
  renderWithProviders(<Homepage />);
  expect(screen.queryByText('Login')).toBeInTheDocument();
});
```

#### Testing User Interactions
```jsx
import { fireEvent, waitFor } from '@testing-library/react';

it('should handle button click', async () => {
  renderWithProviders(<MyComponent />);
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => {
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

#### Testing Async Operations
```jsx
import { waitFor } from '@testing-library/react';

it('should load data', async () => {
  renderWithProviders(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

## Test Coverage

The current test suite for `Homepage.jsx` covers:

✅ **Rendering**
- Component renders without crashing
- Main heading displays correctly
- Images render with proper alt text

✅ **Conditional Rendering**
- Welcome message for non-logged-in users
- Dashboard link visibility based on auth state

✅ **Content Sections**
- All major sections render
- Text content is present
- Lists and descriptions display correctly

✅ **Vocabulary Table**
- Table structure is correct
- All headers are present
- Example vocabulary rows render
- Translations display properly

✅ **SEO Meta Tags**
- PageHelmet component renders
- Title and description pass through
- Meta tags are properly set

✅ **Accessibility**
- Heading hierarchy is correct (H1, H2s)
- Images have alt text
- Semantic HTML is used

## Homepage.test.jsx Overview

The test file includes 6 main test suites:

1. **Rendering** - Basic component rendering
2. **Conditional Rendering - No User** - Tests for unauthenticated users
3. **Content Sections** - All content sections and text
4. **Vocabulary Table** - Table structure and data
5. **SEO Meta Tags** - Helmet configuration
6. **Accessibility** - WCAG compliance

## Tips & Best Practices

✏️ **Always use semantic queries**: `getByRole()`, `getByLabelText()`, `getByText()` (in order of preference)

✏️ **Mock external dependencies**: Mock API calls, router, and hooks

✏️ **Use data-testid sparingly**: Only when semantic queries aren't feasible

✏️ **Test user behavior, not implementation**: Test what users see and do, not internal state

✏️ **Keep tests focused**: One concept per test

✏️ **Use beforeEach/afterEach**: For common setup and teardown

## Common Issues & Solutions

### Issue: "Not wrapped in a BrowserRouter"
**Solution**: Use `renderWithProviders()` which includes BrowserRouter:
```jsx
renderWithProviders(<Component />);
```

### Issue: "Provider not found" (for HelmetProvider)
**Solution**: Again, use `renderWithProviders()`:
```jsx
renderWithProviders(<Component />);
```

### Issue: "Cannot find module" when importing
**Solution**: Check file paths are relative and correct
```jsx
import { renderWithProviders } from '../test-utils';  // ✅ Correct
import { renderWithProviders } from 'test-utils';     // ❌ Wrong
```

### Issue: Mock isn't working
**Solution**: Clear mocks in beforeEach:
```jsx
beforeEach(() => {
  vi.clearAllMocks();
});
```

## Resources

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library Docs](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)

## Next Steps

1. ✅ Run `npm install` to install testing dependencies
2. ✅ Run `npm test` to verify setup works
3. ✅ Create tests for other pages following the Homepage pattern
4. ✅ Add tests to CI/CD pipeline
5. ✅ Aim for >80% code coverage
