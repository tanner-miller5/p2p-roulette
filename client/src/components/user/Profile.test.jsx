import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profile } from './Profile';

describe('Profile Component', () => {
  it('renders without crashing', () => {
    render(<Profile />);
  });

  it('renders children correctly', () => {
    render(<Profile>Test Content</Profile>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
