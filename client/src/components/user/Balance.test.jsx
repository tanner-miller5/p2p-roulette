import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Balance } from './Balance';

describe('Balance Component', () => {
  it('renders without crashing', () => {
    render(<Balance />);
  });

  it('renders children correctly', () => {
    render(<Balance>Test Content</Balance>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
