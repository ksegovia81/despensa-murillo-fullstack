import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Despensa Murillo header', () => {
  render(<App />);
  const heading = screen.getByText(/Despensa Murillo/i);
  expect(heading).toBeInTheDocument();
});
