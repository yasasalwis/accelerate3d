import {render, screen} from '@testing-library/react';
import AnalyticsClient from '../analytics-client';

// Mock Recharts because it relies on ResizeObserver and DOM APIs not fully supported in JSDOM
jest.mock('recharts', () => ({
    ResponsiveContainer: ({children}: { children: any }) => <div>{children}</div>,
    AreaChart: () => <div>AreaChart</div>,
    PieChart: () => <div>PieChart</div>,
    BarChart: () => <div>BarChart</div>,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Pie: () => null,
    Cell: () => null,
    Bar: () => null,
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Activity: () => <svg data-testid="icon-activity"/>,
    TrendingUp: () => <svg data-testid="icon-trending"/>,
    Layers: () => <svg data-testid="icon-layers"/>,
    Zap: () => <svg data-testid="icon-zap"/>,
}));

describe('AnalyticsClient', () => {
    const mockProps = {
        usageData: [{date: '2023-01-01', grams: 100, hours: 5}],
        materialStats: [{type: 'PLA', currentStockGrams: 1000}],
        stats: {
            successRate: '95%',
            avgPrintTime: '2h 30m',
            totalMaterial: '5.2kg',
            activeNodes: '3/4'
        }
    };

    it('renders the header and stats correctly', () => {
        render(<AnalyticsClient {...mockProps} />);

        // Header
        expect(screen.getByText(/fleet analytics/i)).toBeInTheDocument();

        // Top Stats
        expect(screen.getByText('95%')).toBeInTheDocument();
        expect(screen.getByText('Fleet Success Rate')).toBeInTheDocument();

        expect(screen.getByText('2h 30m')).toBeInTheDocument();
        expect(screen.getByText('Avg. Print Time')).toBeInTheDocument();

        expect(screen.getByText('5.2kg')).toBeInTheDocument();
        expect(screen.getByText('Total Material')).toBeInTheDocument();

        expect(screen.getByText('3/4')).toBeInTheDocument();
        expect(screen.getByText('Active Nodes')).toBeInTheDocument();
    });

    it('renders the charts placeholders', () => {
        render(<AnalyticsClient {...mockProps} />);

        expect(screen.getByText('AreaChart')).toBeInTheDocument();
        expect(screen.getByText('PieChart')).toBeInTheDocument();
        expect(screen.getByText('BarChart')).toBeInTheDocument();
    });

    it('renders material stats in legend/list', () => {
        render(<AnalyticsClient {...mockProps} />);

        expect(screen.getByText('PLA')).toBeInTheDocument();
        expect(screen.getByText('1.0kg')).toBeInTheDocument();
    });
});
