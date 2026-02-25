import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Homepage from '../Homepage';

// Mock the hooks
vi.mock('../../hooks/useAppUser', () => ({
  default: vi.fn(() => ({ appUser: null })),
}));

vi.mock('../../hooks/useSEOMeta', () => ({
  default: vi.fn((options) => options),
}));

// Mock the components
vi.mock('../../components/PageHelmet', () => ({
  default: ({ title, description }) => (
    <div data-testid="page-helmet">
      <title>{title}</title>
      <meta name="description" content={description} />
    </div>
  ),
}));

const renderWithProviders = (component) => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </HelmetProvider>
  );
};

describe('Homepage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the homepage without crashing', () => {
      renderWithProviders(<Homepage />);
      expect(screen.getByText('Welcome to the World of Schwiizertüütsch!')).toBeInTheDocument();
    });

    it('should render the main heading', () => {
      renderWithProviders(<Homepage />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Welcome to the World of Schwiizertüütsch!');
    });

    it('should render the Iggy image with correct alt text', () => {
      renderWithProviders(<Homepage />);
      const img = screen.getByAltText('Iggy the Hedgehog mascot');
      expect(img).toBeInTheDocument();
      expect(img).toHaveClass('homepage-img');
    });
  });

  describe('Conditional Rendering - No User', () => {
    it('should show welcome message when not logged in', () => {
      renderWithProviders(<Homepage />);
      expect(screen.getByText(/Welcome to Learn-Swiss\./)).toBeInTheDocument();
    });

    it('should not show Dashboard link when not logged in', () => {
      renderWithProviders(<Homepage />);
      const dashboardLink = screen.queryByText('Dashboard');
      expect(dashboardLink).not.toBeInTheDocument();
    });
  });

  describe('Content Sections', () => {
    it('should render the introduction paragraph', () => {
      renderWithProviders(<Homepage />);
      expect(screen.getByText(/stepped off a train/)).toBeInTheDocument();
    });

    it('should render all section headings', () => {
      renderWithProviders(<Homepage />);
      expect(screen.getByText('Is it different from High German?')).toBeInTheDocument();
      expect(screen.getByText('A Mosaic of Dialects')).toBeInTheDocument();
      expect(screen.getByText('Identity and the Written Word')).toBeInTheDocument();
      expect(screen.getByText('The Golden Rule: Just Add "-li"')).toBeInTheDocument();
      expect(screen.getByText('Some words & phrases to get you started')).toBeInTheDocument();
    });

    it('should render the diglossia list items', () => {
      renderWithProviders(<Homepage />);
      expect(screen.getByText('High German')).toBeInTheDocument();
      expect(screen.getByText('Swiss German')).toBeInTheDocument();
    });

    it('should render dialect examples', () => {
      renderWithProviders(<Homepage />);
      expect(screen.getByText(/Zurich German \(Züritüütsch\)/)).toBeInTheDocument();
      expect(screen.getByText(/Bernese German \(Bärndütsch\)/)).toBeInTheDocument();
      expect(screen.getByText(/Basel German \(Baseldytsch\)/)).toBeInTheDocument();
      expect(screen.getByText(/Wallis German \(Wallisdytsch\)/)).toBeInTheDocument();
    });

    it('should render the diminutive (-li) examples', () => {
      renderWithProviders(<Homepage />);
      const lists = screen.getAllByRole('list');
      // Find the diminutive examples list (contains all three examples)
      const hasExamples = lists.some(list => 
        list.textContent.includes('Hüs') && 
        list.textContent.includes('Guetz') && 
        list.textContent.includes('Chätz')
      );
      expect(hasExamples).toBe(true);
    });
  });

  describe('Vocabulary Table', () => {
    it('should render the vocabulary table', () => {
      renderWithProviders(<Homepage />);
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('should render table headers', () => {
      renderWithProviders(<Homepage />);
      expect(screen.getByText('Swiss-German')).toBeInTheDocument();
      expect(screen.getByText('German')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('should render vocabulary rows', () => {
      renderWithProviders(<Homepage />);
      expect(screen.getByText('Grüezi')).toBeInTheDocument();
      expect(screen.getByText('Wie gaats dir?')).toBeInTheDocument();
      expect(screen.getByText('Merci (vilmal)')).toBeInTheDocument();
      expect(screen.getByText('Tschüss')).toBeInTheDocument();
      expect(screen.getByText('Chuchichäschtli')).toBeInTheDocument();
    });

    it('should render translation cells', () => {
      renderWithProviders(<Homepage />);
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('How are you?')).toBeInTheDocument();
      expect(screen.getByText('Goodbye')).toBeInTheDocument();
      expect(screen.getByText('Kitchen cupboard (The classic test!)')).toBeInTheDocument();
    });
  });

  describe('SEO Meta Tags', () => {
    it('should render PageHelmet component with correct meta data', () => {
      renderWithProviders(<Homepage />);
      const helmet = screen.getByTestId('page-helmet');
      expect(helmet).toBeInTheDocument();
    });

    it('should pass title to PageHelmet', () => {
      renderWithProviders(<Homepage />);
      const helmet = screen.getByTestId('page-helmet');
      const titleElement = helmet.querySelector('title');
      expect(titleElement).toHaveTextContent(/Learn Swiss German/);
    });

    it('should pass description to PageHelmet', () => {
      renderWithProviders(<Homepage />);
      const meta = document.querySelector('meta[name="description"]');
      expect(meta).toHaveAttribute('content', expect.stringContaining('Master Swiss German'));
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<Homepage />);
      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });
      
      expect(h1).toBeInTheDocument();
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have alt text for images', () => {
      renderWithProviders(<Homepage />);
      const img = screen.getByAltText(/Iggy the Hedgehog/);
      expect(img).toHaveAttribute('alt');
    });

    it('should have semantic HTML structure', () => {
      renderWithProviders(<Homepage />);
      const lists = screen.getAllByRole('list');
      expect(lists.length).toBeGreaterThan(0);
    });
  });

  describe('Link Navigation', () => {
    it('should render the main card container', () => {
      renderWithProviders(<Homepage />);
      const container = screen.getByText('Welcome to the World of Schwiizertüütsch!').closest('div.card');
      expect(container).toBeInTheDocument();
    });

    it('should have proper page structure with containers', () => {
      renderWithProviders(<Homepage />);
      expect(screen.getByText('Welcome to the World of Schwiizertüütsch!').closest('div.container')).toBeInTheDocument();
    });
  });
});
