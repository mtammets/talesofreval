import { fireEvent, render, screen } from '@testing-library/react';
import BookNow from './BookNow';

describe('BookNow', () => {
  test('renders a custom label and toggles the pigeon icon on click', () => {
    const handleClick = jest.fn();
    const { container } = render(<BookNow label="Reserve now" onClick={handleClick} />);
    const button = screen.getByRole('button', { name: 'Reserve now' });
    const icon = container.querySelector('.button-icon');

    expect(icon?.getAttribute('data-icon-state')).toBe('resting-pigeon');

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(icon?.getAttribute('data-icon-state')).toBe('mail-pigeon');

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(2);
    expect(icon?.getAttribute('data-icon-state')).toBe('resting-pigeon');
  });
});
