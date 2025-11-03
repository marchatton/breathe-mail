import { render, screen, within } from '@testing-library/react';
import DashboardPage from './page';

describe('DashboardPage accessibility affordances', () => {
  it('connects the skip link to the main dashboard region', () => {
    render(<DashboardPage />);

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    const main = screen.getByRole('main');

    expect(skipLink).toHaveAttribute('href', '#dashboard-main');
    expect(main).toHaveAttribute('id', 'dashboard-main');
    expect(skipLink.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders priority actions as labelled, live-updating buttons', () => {
    render(<DashboardPage />);

    const priorityRegion = screen.getByRole('region', { name: /priority actions/i });
    const buttons = within(priorityRegion).getAllByRole('button');

    expect(priorityRegion.querySelector('[aria-live="polite"]')).not.toBeNull();
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      expect(button).toHaveAccessibleName();
      expect(button.getAttribute('aria-label')).toMatch(/review/i);
    }
  });

  it('marks dashboard statistic values with tabular number styling and associations', () => {
    render(<DashboardPage />);

    const definitions = screen.getAllByRole('definition');

    expect(definitions.length).toBeGreaterThan(0);
    for (const definition of definitions) {
      expect(definition).toHaveAttribute('aria-describedby');
      expect(definition).toHaveClass('tabular-nums');
    }
  });

  it('wraps follow-up lists and awaiting replies in polite live regions', () => {
    render(<DashboardPage />);

    const followUpsRegion = screen.getByRole('region', { name: /follow ups/i });
    const awaitingRegion = screen.getByRole('region', { name: /threads on hold/i });

    expect(followUpsRegion).toHaveAttribute('aria-live', 'polite');
    expect(awaitingRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('provides an assertive channel for undo announcements', () => {
    render(<DashboardPage />);

    expect(document.querySelector('[data-dashboard-undo-announcement]')).toHaveAttribute('aria-live', 'assertive');
  });
});
