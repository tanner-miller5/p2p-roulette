import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BettingButtons from './BettingButtons';

describe('BettingButtons', () => {
  const defaultProps = {
    onBet: jest.fn(),
    betAmount: 100,
    onBetAmountChange: jest.fn(),
    balance: 1000,
    currentBets: { red: 0, black: 0 }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders betting controls correctly', () => {
    render(<BettingButtons {...defaultProps} />);
    expect(screen.getByTestId('betting-controls')).toBeInTheDocument();
    expect(screen.getByTestId('bet-red-button')).toBeInTheDocument();
    expect(screen.getByTestId('bet-black-button')).toBeInTheDocument();
  });

  it('handles bet amount changes', () => {
    render(<BettingButtons {...defaultProps} />);
    const input = screen.getByTestId('bet-amount-input');
    
    fireEvent.change(input, { target: { value: '200' } });
    expect(defaultProps.onBetAmountChange).toHaveBeenCalledWith(200);
  });

  it('prevents betting when disabled', () => {
    render(<BettingButtons {...defaultProps} disabled={true} />);
    
    const redButton = screen.getByTestId('bet-red-button');
    const blackButton = screen.getByTestId('bet-black-button');
    
    expect(redButton).toBeDisabled();
    expect(blackButton).toBeDisabled();
  });

  it('prevents betting when balance is insufficient', () => {
    render(<BettingButtons {...defaultProps} balance={5} />);
    
    const redButton = screen.getByTestId('bet-red-button');
    const blackButton = screen.getByTestId('bet-black-button');
    
    expect(redButton).toBeDisabled();
    expect(blackButton).toBeDisabled();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Insufficient balance';
    render(<BettingButtons {...defaultProps} errorMessage={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('handles bet button clicks', () => {
    render(<BettingButtons {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('bet-red-button'));
    expect(defaultProps.onBet).toHaveBeenCalledWith('red');
    
    fireEvent.click(screen.getByTestId('bet-black-button'));
    expect(defaultProps.onBet).toHaveBeenCalledWith('black');
  });

  it('enforces bet amount limits', () => {
    render(<BettingButtons {...defaultProps} />);
    const input = screen.getByTestId('bet-amount-input');
    
    fireEvent.change(input, { target: { value: '5000' } });
    expect(defaultProps.onBetAmountChange).toHaveBeenCalledWith(1000);
    
    fireEvent.change(input, { target: { value: '5' } });
    expect(defaultProps.onBetAmountChange).toHaveBeenCalledWith(10);
  });
});