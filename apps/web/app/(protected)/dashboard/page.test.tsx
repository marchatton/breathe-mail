import { render, screen, within } from '@testing-library/react';
import DashboardPage from './page';

describe('Dashboard dashboard', () => {
  it('exposes a skip link that targets the main dashboard content', () => {
    render(<DashboardPage />);

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    const main = screen.getByRole('main');

    expect(skipLink).toHaveAttribute('href', '#dashboard-content');
    expect(main).toHaveAttribute('id', 'dashboard-content');
    expect(skipLink.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders actionable priority items as labelled buttons with urgency and deadlines', () => {
    render(<DashboardPage />);

    const priorityRegion = screen.getByRole('region', { name: /priority actions/i });
    const buttons = within(priorityRegion).getAllByRole('button');

    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      expect(button).toHaveAttribute('aria-label');
      expect(button.getAttribute('aria-label')).not.toHaveLength(0);
      expect(within(button).getByText(/due/i)).toBeInTheDocument();
    }
  });

  it('marks dashboard statistic values with tabular number styling and associations', () => {
    render(<DashboardPage />);

    const todayRegion = screen.getByRole('region', { name: /today/i });
    const statValues = todayRegion.querySelectorAll('dd.tabular-nums');

    expect(statValues.length).toBeGreaterThan(0);
    statValues.forEach((value) => {
      expect(value.getAttribute('aria-describedby')).toBeTruthy();
    });
  });

  it('wraps follow-up lists with aria-live polite regions', () => {
    render(<DashboardPage />);

    const followUpsRegion = screen.getByRole('region', { name: /follow ups/i });
    const awaitingRegion = screen.getByRole('region', { name: /awaiting replies/i });

    expect(followUpsRegion.querySelector('[aria-live="polite"]')).not.toBeNull();
    expect(awaitingRegion.querySelector('[aria-live="polite"]')).not.toBeNull();
  });
});
