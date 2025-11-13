import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ApplyCard } from './apply-card';

describe('ApplyCard', () => {
  it('renders the component with application information', () => {
    render(<ApplyCard />);

    // Check for heading
    expect(screen.getByText('Så här ansöker du')).toBeInTheDocument();

    // Check for email link
    expect(screen.getByText('jobb@johnie.se')).toBeInTheDocument();
  });

  it('displays application deadline', () => {
    render(<ApplyCard />);

    expect(screen.getByText('Sista ansökningsdag')).toBeInTheDocument();
    // Application deadline should be visible
    expect(screen.getByText(/31 januari 2026/i)).toBeInTheDocument();
  });

  it('includes both application methods', () => {
    render(<ApplyCard />);

    // Modal button
    expect(screen.getByText('Ansök om tjänsten')).toBeInTheDocument();

    // Email button
    expect(screen.getByText('Skicka via e-post')).toBeInTheDocument();
  });

  it('displays required application materials', () => {
    render(<ApplyCard />);

    expect(screen.getByText(/Ett personligt brev/i)).toBeInTheDocument();
    expect(screen.getByText('Ditt CV')).toBeInTheDocument();
  });
});
