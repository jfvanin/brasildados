import '@testing-library/jest-dom';

// Recharts' ResponsiveContainer requires ResizeObserver, which jsdom doesn't provide
class ResizeObserverStub {
    observe() { }
    unobserve() { }
    disconnect() { }
}

if (typeof window !== 'undefined' && !window.ResizeObserver) {
    window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
