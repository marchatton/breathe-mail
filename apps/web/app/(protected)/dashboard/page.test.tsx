import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import DashboardPage from './page';

type Node = ReactElement & { props: { children?: unknown } };

const collectElements = (node: unknown): ReactElement[] => {
  if (!node || typeof node !== 'object') return [];
  const element = node as Node;
  const children = element.props?.children;
  const nested = Array.isArray(children)
    ? children.flatMap((child) => collectElements(child))
    : collectElements(children);
  return [element, ...nested];
};

describe('DashboardPage accessibility affordances', () => {
  const render = () => collectElements(DashboardPage());

  it('renders a skip link targeting the main content', () => {
    const nodes = render();
    const skipLink = nodes.find((element) => element.type === 'a' && element.props.href === '#dashboard-main');
    expect(skipLink?.props.children).toContain('Skip to main content');
  });

  it('marks follow ups as a live region for async updates', () => {
    const nodes = render();
    const region = nodes.find((element) => element.props?.id === 'follow-ups');
    expect(region?.props['aria-live']).toBe('polite');
  });

  it('exposes actionable commands as buttons with descriptive labels', () => {
    const nodes = render();
    const commandButton = nodes.find((element) => element.type === 'button' && element.props['aria-label'] === 'Open Q4 Budget Approval Required');
    expect(commandButton).toBeDefined();
  });
});
