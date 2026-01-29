import {cn} from '../utils';

describe('cn utility', () => {
    it('merges class names correctly', () => {
        expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
        expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
    });

    it('merges tailwind classes using tailwind-merge', () => {
        expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
        expect(cn('p-4', 'p-2')).toBe('p-2');
    });

    it('handles array inputs', () => {
        expect(cn(['class1', 'class2'])).toBe('class1 class2');
    });

    it('handles undefined and null inputs', () => {
        expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
    });
});
