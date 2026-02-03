import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { APPLICATION_DEADLINE } from '@/constants/application';
import { ApplyCard } from './apply-card';

describe('ApplyCard', () => {
  describe('when applications are open', () => {
    it('renders the open state heading', () => {
      render(<ApplyCard />);

      expect(screen.getByText('Så här ansöker du')).toBeInTheDocument();
    });

    it('displays the application instructions', () => {
      render(<ApplyCard />);

      expect(
        screen.getByText(
          'Är du intresserad av tjänsten? Skicka din ansökan via e-post!'
        )
      ).toBeInTheDocument();
    });

    it('shows contact email for applications', () => {
      render(<ApplyCard />);

      expect(screen.getByText('Skicka din ansökan till:')).toBeInTheDocument();
      expect(screen.getByText('jobb@johnie.se')).toBeInTheDocument();
    });

    it('displays application deadline banner', () => {
      render(<ApplyCard />);

      expect(screen.getByText('Sista ansökningsdag')).toBeInTheDocument();
      expect(screen.getByText(APPLICATION_DEADLINE)).toBeInTheDocument();
    });
  });
});
