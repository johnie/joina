import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ApplyCard } from './apply-card';

const APPLICATION_DEADLINE_REGEX = /28 februari 2026/i;
const PERSONAL_LETTER_REGEX = /Ett personligt brev/i;

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
    expect(screen.getByText(APPLICATION_DEADLINE_REGEX)).toBeInTheDocument();
  });

  it('includes email application method', () => {
    render(<ApplyCard />);

    // Email button (form is currently disabled)
    expect(screen.getByText('Skicka via e-post')).toBeInTheDocument();
  });

  it('displays required application materials', () => {
    render(<ApplyCard />);

    expect(screen.getByText(PERSONAL_LETTER_REGEX)).toBeInTheDocument();
    expect(screen.getByText('Ditt CV')).toBeInTheDocument();
  });
});
