import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DropdownMenu from './DropdownMenu';

describe('DropdownMenu', () => {
    const defaultItems = [
        { id: 'edit', label: 'Edit', onClick: vi.fn() },
        { id: 'delete', label: 'Delete', onClick: vi.fn(), danger: true },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render trigger button', () => {
            render(<DropdownMenu items={defaultItems} triggerLabel="Menu" />);

            const button = screen.getByRole('button', { name: /menu/i });
            expect(button).toBeInTheDocument();
        });

        it('should render custom trigger', () => {
            render(
                <DropdownMenu
                    items={defaultItems}
                    trigger={<span data-testid="custom-trigger">Custom</span>}
                />
            );

            expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
        });

        it('should not show menu items initially', () => {
            render(<DropdownMenu items={defaultItems} triggerLabel="Menu" />);

            expect(screen.queryByText('Edit')).not.toBeInTheDocument();
            expect(screen.queryByText('Delete')).not.toBeInTheDocument();
        });
    });

    describe('Menu Interaction', () => {
        it('should show menu when trigger is clicked', () => {
            render(<DropdownMenu items={defaultItems} triggerLabel="Menu" />);

            fireEvent.click(screen.getByRole('button', { name: /menu/i }));

            expect(screen.getByText('Edit')).toBeInTheDocument();
            expect(screen.getByText('Delete')).toBeInTheDocument();
        });

        it('should call onClick when menu item is clicked', () => {
            render(<DropdownMenu items={defaultItems} triggerLabel="Menu" />);

            // Open menu
            fireEvent.click(screen.getByRole('button', { name: /menu/i }));

            // Click Edit
            fireEvent.click(screen.getByText('Edit'));

            expect(defaultItems[0].onClick).toHaveBeenCalledTimes(1);
        });

        it('should close menu after item click', () => {
            render(<DropdownMenu items={defaultItems} triggerLabel="Menu" />);

            // Open menu
            fireEvent.click(screen.getByRole('button', { name: /menu/i }));
            expect(screen.getByText('Edit')).toBeInTheDocument();

            // Click item
            fireEvent.click(screen.getByText('Edit'));

            // Menu should close
            expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        });

        it('should render danger items with danger styling class', () => {
            render(<DropdownMenu items={defaultItems} triggerLabel="Menu" />);

            // Open menu
            fireEvent.click(screen.getByRole('button', { name: /menu/i }));

            // Delete button should have danger class
            const deleteButton = screen.getByText('Delete').closest('button');
            expect(deleteButton).toHaveClass('text-red-600');
        });
    });

    describe('Separator', () => {
        it('should render separator between items', () => {
            const itemsWithSeparator = [
                { id: 'edit', label: 'Edit', onClick: vi.fn() },
                { id: 'delete', label: 'Delete', onClick: vi.fn(), dividerBefore: true },
            ];

            render(<DropdownMenu items={itemsWithSeparator} triggerLabel="Menu" />);

            // Open menu
            fireEvent.click(screen.getByRole('button', { name: /menu/i }));

            // Should have separator (div with bg-gray-200 class)
            const separator = document.querySelector('.bg-gray-200');
            expect(separator).toBeInTheDocument();
        });
    });

    describe('Positioning', () => {
        it('should apply right position class by default', () => {
            render(<DropdownMenu items={defaultItems} triggerLabel="Menu" />);

            fireEvent.click(screen.getByRole('button', { name: /menu/i }));

            const menu = screen.getByRole('menu');
            expect(menu).toHaveClass('right-0');
        });

        it('should apply left position class when specified', () => {
            render(<DropdownMenu items={defaultItems} triggerLabel="Menu" position="left" />);

            fireEvent.click(screen.getByRole('button', { name: /menu/i }));

            const menu = screen.getByRole('menu');
            expect(menu).toHaveClass('left-0');
        });
    });
});
