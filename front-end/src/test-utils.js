import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

/**
 * Custom render function that wraps components with necessary providers
 * @param {React.ReactElement} component - The component to render
 * @param {Object} options - Additional render options
 * @returns {Object} Render result with queries and utilities
 */
export function renderWithProviders(component, options = {}) {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </HelmetProvider>,
    options
  );
}

export * from '@testing-library/react';
