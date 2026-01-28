import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BoardCard from './BoardCard';

// Wrapper component for Router context
const renderWithRouter = (ui: React.ReactElement) => {
    return render(
        <BrowserRouter>{ui}</BrowserRouter>
    );
};

describe('BoardCard', () => {
    const defaultProps = {
        id: 1,
        title: 'Test Board',
        updatedAt: 'Jan 15, 2026',
        onEdit: vi.fn(),
        onDelete: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render board title', () => {
            renderWithRouter(<BoardCard {...defaultProps} />);

            expect(screen.getByText('Test Board')).toBeInTheDocument();
        });

        it('should render updated date', () => {
            renderWithRouter(<BoardCard {...defaultProps} />);

            expect(screen.getByText('Updated Jan 15, 2026')).toBeInTheDocument();
        });

        it('should render menu button', () => {
            renderWithRouter(<BoardCard {...defaultProps} />);

            const menuButton = screen.getByRole('button');
            expect(menuButton).toBeInTheDocument();
        });
    });

    describe('Menu Interaction', () => {
        it('should show menu when menu button is clicked', () => {
            renderWithRouter(<BoardCard {...defaultProps} />);

            // Menu should not be visible initially
            expect(screen.queryByText('Edit')).not.toBeInTheDocument();

            // Click menu button
            const menuButton = screen.getByRole('button');
            fireEvent.click(menuButton);

            // Menu items should be visible
            expect(screen.getByText('Edit')).toBeInTheDocument();
            expect(screen.getByText('Delete')).toBeInTheDocument();
        });

        it('should hide menu when clicked again', () => {
            renderWithRouter(<BoardCard {...defaultProps} />);

            const menuButton = screen.getByRole('button');

            // Open menu
            fireEvent.click(menuButton);
            expect(screen.getByText('Edit')).toBeInTheDocument();

            // Close menu
            fireEvent.click(menuButton);
            expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        });

        it('should call onEdit when Edit is clicked', () => {
            renderWithRouter(<BoardCard {...defaultProps} />);

            // Open menu
            fireEvent.click(screen.getByRole('button'));

            // Click Edit
            fireEvent.click(screen.getByText('Edit'));

            expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
        });

        it('should call onDelete when Delete is clicked', () => {
            renderWithRouter(<BoardCard {...defaultProps} />);

            // Open menu
            fireEvent.click(screen.getByRole('button'));

            // Click Delete
            fireEvent.click(screen.getByText('Delete'));

            expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
        });

        it('should close menu after menu item is clicked', () => {
            renderWithRouter(<BoardCard {...defaultProps} />);

            // Open menu
            fireEvent.click(screen.getByRole('button'));
            expect(screen.getByText('Edit')).toBeInTheDocument();

            // Click Edit
            fireEvent.click(screen.getByText('Edit'));

            // Menu should be closed
            expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        });
    });
});
