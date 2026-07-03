import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';

const renderWithUrl = (search: string) => {
    window.history.replaceState(null, '', `/${search}`);
    return render(<Dashboard />);
};

describe('Dashboard', () => {
    it('renders all chart sections including the new ones', () => {
        renderWithUrl('');
        expect(screen.getByText('Principais Indicadores')).toBeInTheDocument();
        expect(screen.getByText('Desenvolvimento Humano')).toBeInTheDocument();
        expect(screen.getByText('Desigualdade e Pobreza')).toBeInTheDocument();
        expect(screen.getByText('Gênero')).toBeInTheDocument();
        expect(screen.getByText('Meio Ambiente')).toBeInTheDocument();
        expect(screen.getByText('Comparativo por Governo')).toBeInTheDocument();
    });

    it('shows dormant indicators as toggles', () => {
        renderWithUrl('');
        // Titles also appear inside the comparison dropdown, hence getAllByText
        expect(screen.getAllByText(/energia renovável/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/mortalidade materna/i).length).toBeGreaterThan(0);
    });

    it('restores year range from URL params', () => {
        renderWithUrl('?inicio=2005&fim=2015');
        expect(screen.getAllByText(/Filtrado: 2005-2015/).length).toBeGreaterThan(0);
    });

    it('survives malformed URL params (failure mode)', () => {
        renderWithUrl('?inicio=banana&fim=&g0=unknown.keys&g99=x');
        expect(screen.getByText('Principais Indicadores')).toBeInTheDocument();
    });

    it('writes the current state back to the URL', () => {
        renderWithUrl('');
        expect(window.location.search).toContain('inicio=2000');
        expect(window.location.search).toContain('g0=');
    });

    it('updates URL when a toggle changes', () => {
        renderWithUrl('');
        // selic_rate is disabled by default in the first (multiple) chart;
        // the first match is the toggle chip (the dropdown option comes later in the DOM)
        const selicToggle = screen.getAllByText(/Taxa Básica de Juros/)[0];
        fireEvent.click(selicToggle);
        expect(window.location.search).toContain('selic_rate');
    });

    it('renders the presidency comparison with an indicator selector', () => {
        renderWithUrl('');
        expect(screen.getByLabelText('Selecionar indicador')).toBeInTheDocument();
        expect(screen.getByText('Média anual')).toBeInTheDocument();
        expect(screen.getByText('Variação no período')).toBeInTheDocument();
    });
});
