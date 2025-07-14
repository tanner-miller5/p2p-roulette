import { render, screen } from '@testing-library/react';
import { Home } from './Home';

describe('Home', () => {
  it('renders correctly', () => {
    render(<Home />);
  });
});
