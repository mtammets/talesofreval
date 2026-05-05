import { fireEvent, render, screen } from '@testing-library/react';

import AdminModalShell from './AdminModalShell';

describe('AdminModalShell', () => {
  test('does not close when the backdrop is clicked by default', () => {
    const onClose = jest.fn();
    const { container } = render(
      <AdminModalShell title="Edit section" onClose={onClose}>
        <div>Modal body</div>
      </AdminModalShell>
    );

    fireEvent.click(container.firstChild);

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).not.toBeNull();
  });

  test('can still close from backdrop clicks when explicitly enabled', () => {
    const onClose = jest.fn();
    const { container } = render(
      <AdminModalShell
        title="Confirm action"
        onClose={onClose}
        closeOnBackdropClick
      >
        <div>Modal body</div>
      </AdminModalShell>
    );

    fireEvent.click(container.firstChild);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('does not close when escape is pressed inside the dialog', () => {
    const onClose = jest.fn();

    render(
      <AdminModalShell title="Edit section" onClose={onClose}>
        <input aria-label="Editor field" type="text" />
      </AdminModalShell>
    );

    fireEvent.keyDown(screen.getByLabelText('Editor field'), { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).not.toBeNull();
  });
});
