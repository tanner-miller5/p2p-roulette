import { render, screen } from '@testing-library/react';
import { Profile } from './Profile';

describe('Profile', () => {
  it('renders correctly', () => {
    render(<Profile />);
  });
});
