import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ApplyCard } from './apply-card';

describe('ApplyCard', () => {
  describe('when applications are paused', () => {
    it('renders the paused state heading', () => {
      render(<ApplyCard />);

      expect(screen.getByText('Ansökningar pausade')).toBeInTheDocument();
    });

    it('displays the paused message', () => {
      render(<ApplyCard />);

      expect(
        screen.getByText(
          'Vi tar en paus med ansökningar just nu. Håll utkik för uppdateringar!'
        )
      ).toBeInTheDocument();
    });

    it('shows contact email for questions', () => {
      render(<ApplyCard />);

      expect(
        screen.getByText('Har du frågor? Kontakta oss:')
      ).toBeInTheDocument();
      expect(screen.getByText('jobb@johnie.se')).toBeInTheDocument();
    });

    it('displays paused status banner', () => {
      render(<ApplyCard />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Pausad')).toBeInTheDocument();
    });
  });
});
