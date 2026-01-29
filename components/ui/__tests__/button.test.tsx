import {fireEvent, render, screen} from '@testing-library/react';
import {Button} from '../button';

describe('Button', () => {
    it('renders correctly', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', {name: /click me/i})).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByRole('button', {name: /click me/i}));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders different variants', () => {
        const {rerender} = render(<Button variant="destructive">Destructive</Button>);
        expect(screen.getByRole('button', {name: /destructive/i})).toHaveClass('bg-destructive');

        rerender(<Button variant="outline">Outline</Button>);
        expect(screen.getByRole('button', {name: /outline/i})).toHaveClass('border-input');
    });

    it('renders different sizes', () => {
        const {rerender} = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button', {name: /small/i})).toHaveClass('h-8');

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button', {name: /large/i})).toHaveClass('h-10');
    });

    it('renders as child', () => {
        render(
            <Button asChild>
                <a href="/link">Link Button</a>
            </Button>
        );
        expect(screen.getByRole('link', {name: /link button/i})).toHaveClass('inline-flex');
        expect(screen.getByRole('link', {name: /link button/i})).toHaveAttribute('href', '/link');
    });
});
