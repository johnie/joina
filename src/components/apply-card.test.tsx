import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ApplyCard } from './apply-card';

const defaultProps = {
  deadline: '27 mars 2026',
  email: 'jobb@johnie.se',
  formEnabled: false,
  status: 'open' as const,
  title: 'Personlig Assistent',
};

describe('ApplyCard', () => {
  describe('when applications are open', () => {
    it('renders the open state heading', () => {
      render(<ApplyCard {...defaultProps} />);

      expect(screen.getByText('Så här ansöker du')).toBeInTheDocument();
    });

    it('displays the application instructions', () => {
      render(<ApplyCard {...defaultProps} />);

      expect(
        screen.getByText(
          'Är du intresserad av tjänsten? Skicka din ansökan via e-post!'
        )
      ).toBeInTheDocument();
    });

    it('shows contact email for applications', () => {
      render(<ApplyCard {...defaultProps} />);

      expect(screen.getByText('Skicka din ansökan till:')).toBeInTheDocument();
      expect(screen.getByText('jobb@johnie.se')).toBeInTheDocument();
    });

    it('displays application deadline banner', () => {
      render(<ApplyCard {...defaultProps} />);

      expect(screen.getByText('Sista ansökningsdag')).toBeInTheDocument();
      expect(screen.getByText(defaultProps.deadline)).toBeInTheDocument();
    });
  });
});
