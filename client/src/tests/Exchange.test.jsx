import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Exchange from '../components/Exchange';
import '@testing-library/jest-dom';

jest.mock('../components/CurrencyInput', () => (props) => {
  return (
    <div data-testid={`mock-currency-input-${props.currency}`}>
      <input
        type="text"
        value={props.amount}
        onChange={(e) => props.onAmountChange(Number(e.target.value))}
      />
      <select
        value={props.currency}
        onChange={(e) => props.onCurrencyChange(e.target.value)}
      >
        {props.currencies.map((curr) => (
          <option key={curr} value={curr}>{curr}</option>
        ))}
      </select>
    </div>
  );
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        rates: {
          EUR: 1,
          USD: 1.2,
        },
      }),
  })
);

describe('Exchange Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('input change updates the second amount correctly', async () => {
    render(<Exchange />);

    // Wait until the component finishes initial fetch and calculation
    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBe(2);
      expect(inputs[1].value).toBe('1.2000'); // initial 1 EUR → USD
    });

    const [input1, input2] = screen.getAllByRole('textbox');

    fireEvent.change(input1, { target: { value: '10' } });

    await waitFor(() => {
      expect(input2.value).toBe('12.0000'); // 10 EUR → 12 USD
    });
  });
});
