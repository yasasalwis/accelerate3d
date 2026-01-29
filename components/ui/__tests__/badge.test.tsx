import {render, screen} from '@testing-library/react';
import {Badge} from '../badge';

describe('Badge', () => {
    it('renders correctly', () => {
        render(<Badge>Status</Badge>);
        expect(screen.getByText(/status/i)).toBeInTheDocument();
    });

    it('renders different variants', () => {
        const {rerender} = render(<Badge variant="default">Default</Badge>);
        expect(screen.getByText(/default/i)).toHaveClass('bg-primary');

        rerender(<Badge variant="secondary">Secondary</Badge>);
        expect(screen.getByText(/secondary/i)).toHaveClass('bg-secondary');

        rerender(<Badge variant="destructive">Destructive</Badge>);
        expect(screen.getByText(/destructive/i)).toHaveClass('bg-destructive');

        rerender(<Badge variant="premium">Premium</Badge>);
        expect(screen.getByText(/premium/i)).toHaveClass('text-emerald-500');
    });
});
