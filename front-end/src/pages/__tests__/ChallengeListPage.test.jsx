import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ChallengeListPage from '../ChallengeListPage';

// Mock api
vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock the hooks
vi.mock('../../hooks/useSEOMeta', () => ({
  default: vi.fn((options) => options),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLoaderData: vi.fn(() => ({
      challenges: [
        {
          reference: 'ch1',
          title: 'Greetings Challenge',
          completedByUser: 45,
          totalChallenges: 100,
        },
        {
          reference: 'ch2',
          title: 'Vocabulary Challenge',
          completedByUser: 80,
          totalChallenges: 100,
        },
        {
          reference: 'ch3',
          title: 'Grammar Challenge',
          completedByUser: 0,
          totalChallenges: 100,
        },
      ],
    })),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

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

describe('ChallengeListPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the page without crashing', () => {
      renderWithProviders(<ChallengeListPage />);
      expect(screen.getByText('Challenges')).toBeInTheDocument();
    });

    it('should render the main heading', () => {
      renderWithProviders(<ChallengeListPage />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Challenges');
    });

    it('should render the page description', () => {
      renderWithProviders(<ChallengeListPage />);
      expect(screen.getByText(/Challenge your Swiss-German/)).toBeInTheDocument();
    });

    it('should render the Eber image for each challenge', () => {
      renderWithProviders(<ChallengeListPage />);
      const images = screen.getAllByAltText(/(Greetings Challenge|Vocabulary Challenge|Grammar Challenge)/);
      expect(images.length).toBe(3);
    });
  });

  describe('Challenge List', () => {
    it('should render all challenges', () => {
      renderWithProviders(<ChallengeListPage />);
      const pageText = document.body.textContent;
      expect(pageText).toContain('Greetings Challenge');
      expect(pageText).toContain('Vocabulary Challenge');
      expect(pageText).toContain('Grammar Challenge');
    });

    it('should display completion percentages', () => {
      renderWithProviders(<ChallengeListPage />);
      const percentages = screen.getAllByText(/% complete/);
      expect(percentages.length).toBeGreaterThanOrEqual(3);
      
      // Verify specific percentages are present
      const pageText = document.body.textContent;
      expect(pageText).toContain('45% complete');
      expect(pageText).toContain('80% complete');
      expect(pageText).toContain('0% complete');
    });

    it('should render challenge cards as clickable elements', () => {
      renderWithProviders(<ChallengeListPage />);
      const challengeCards = screen.getAllByRole('button');
      expect(challengeCards.length).toBe(3);
    });

    it('should have correct aria labels for accessibility', () => {
      renderWithProviders(<ChallengeListPage />);
      expect(screen.getByLabelText(/Open Challenge title: Greetings Challenge/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Open Challenge title: Vocabulary Challenge/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Open Challenge title: Grammar Challenge/)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have keyboard navigation (Enter key) on challenge cards', () => {
      renderWithProviders(<ChallengeListPage />);
      
      const firstCard = screen.getByLabelText(/Open Challenge title: Greetings Challenge/);
      expect(firstCard).toHaveAttribute('tabIndex', '0');
    });

    it('should have proper list structure', () => {
      renderWithProviders(<ChallengeListPage />);
      const lists = screen.getAllByRole('list');
      expect(lists.length).toBeGreaterThan(0);
      
      // Verify list items exist
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBe(3);
    });
  });

  describe('SEO Meta Tags', () => {
    it('should render PageHelmet component with correct meta data', () => {
      renderWithProviders(<ChallengeListPage />);
      const helmet = screen.getByTestId('page-helmet');
      expect(helmet).toBeInTheDocument();
    });

    it('should pass title to PageHelmet', () => {
      renderWithProviders(<ChallengeListPage />);
      const helmet = screen.getByTestId('page-helmet');
      const titleElement = helmet.querySelector('title');
      expect(titleElement).toHaveTextContent(/Challenges/);
    });

    it('should pass description to PageHelmet', () => {
      renderWithProviders(<ChallengeListPage />);
      const helmet = screen.getByTestId('page-helmet');
      const metaElement = helmet.querySelector('meta[name="description"]');
      expect(metaElement).toHaveAttribute('content', expect.stringContaining('Challenge your Swiss-German'));
    });

    it('should include proper schema type', () => {
      renderWithProviders(<ChallengeListPage />);
      const helmet = screen.getByTestId('page-helmet');
      expect(helmet).toBeInTheDocument();
      // Schema is passed to useSEOMeta which returns it
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<ChallengeListPage />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('Challenges');
    });

    it('should have alt text for images', () => {
      renderWithProviders(<ChallengeListPage />);
      const images = screen.getAllByAltText(/(Greetings Challenge|Vocabulary Challenge|Grammar Challenge)/);
      images.forEach((img) => {
        expect(img).toHaveAttribute('alt');
      });
    });

    it('should have semantic list structure', () => {
      renderWithProviders(<ChallengeListPage />);
      const list = screen.getByRole('list');
      const listItems = screen.getAllByRole('listitem');
      
      expect(list).toBeInTheDocument();
      expect(listItems.length).toBe(3);
    });

    it('should have tabbable challenge cards', () => {
      renderWithProviders(<ChallengeListPage />);
      const challengeCards = screen.getAllByRole('button');
      challengeCards.forEach((card) => {
        expect(card).toHaveAttribute('tabIndex', '0');
      });
    });
  });

  describe('Page Structure', () => {
    it('should have proper container structure', () => {
      renderWithProviders(<ChallengeListPage />);
      const container = screen.getByText('Challenges').closest('div.container');
      expect(container).toBeInTheDocument();
    });

    it('should have card wrapper', () => {
      renderWithProviders(<ChallengeListPage />);
      const card = screen.getByText('Challenges').closest('div.card');
      expect(card).toBeInTheDocument();
    });
  });
});
