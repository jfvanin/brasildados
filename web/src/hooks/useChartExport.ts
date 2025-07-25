import { useCallback, useState } from 'react';
import html2canvas from 'html2canvas';
import { ChartDataExport } from '../types';

interface ExportOptions {
    watermarkText?: string;
    watermarkUrl?: string;
    fileName?: string;
}

export const useChartExport = () => {
    const [isExporting, setIsExporting] = useState(false); const addWatermark = useCallback((canvas: HTMLCanvasElement, options: ExportOptions, chartData?: ChartDataExport) => {
        // Define dimensions and layout constants
        const borderWidth = 1;
        const topPadding = 25;
        const titleHeight = chartData?.title ? 40 : 0;
        const titleMarginBottom = chartData?.title ? 15 : 0;
        const footerHeight = 50;
        const footerPadding = 10;
        const lineSpacing = 8;

        // Create a new canvas with border and padding
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width + (borderWidth * 2);
        newCanvas.height = canvas.height + topPadding + borderWidth + titleHeight + titleMarginBottom + footerHeight;
        const ctx = newCanvas.getContext('2d')!;

        // Fill the entire canvas with black (creates the border)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);

        // Fill the inner area with white background (excluding footer)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(borderWidth, borderWidth, canvas.width, canvas.height + topPadding - borderWidth + titleHeight + titleMarginBottom);

        // Draw the title if provided
        if (chartData?.title) {
            ctx.save();
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const titleY = borderWidth + topPadding + (titleHeight / 2);
            ctx.fillText(chartData.title, newCanvas.width / 2, titleY);
            ctx.restore();
        }

        // Draw the original canvas onto the new canvas with padding
        ctx.drawImage(canvas, borderWidth, topPadding + titleHeight + titleMarginBottom);

        // Draw footer section
        const footerY = topPadding + titleHeight + titleMarginBottom + canvas.height;
        ctx.fillStyle = '#002147';
        ctx.fillRect(borderWidth, footerY, canvas.width, footerHeight);

        // Add footer text with intelligent line breaking
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const footerMessage = 'Explore dados interativos do Brasil em https://brasildados.online - dezenas de indicadores e gráficos dinâmicos!';

        const maxWidth = canvas.width - (footerPadding * 2);
        const textWidth = ctx.measureText(footerMessage).width;

        if (textWidth <= maxWidth) {
            // Single line
            ctx.fillText(footerMessage, newCanvas.width / 2, footerY + (footerHeight / 2));
        } else {
            // Split into two lines at word boundaries
            const words = footerMessage.split(' ');
            let line1 = '';
            let line2 = '';

            for (let i = 0; i < words.length; i++) {
                const testLine = line1 + (line1 ? ' ' : '') + words[i];
                const testWidth = ctx.measureText(testLine).width;

                if (testWidth > maxWidth && line1 !== '') {
                    line2 = words.slice(i).join(' ');
                    break;
                } else {
                    line1 = testLine;
                }
            }

            // Fallback to force split if no natural break found
            if (!line2) {
                const midPoint = Math.floor(words.length / 2);
                line1 = words.slice(0, midPoint).join(' ');
                line2 = words.slice(midPoint).join(' ');
            }

            // Draw two lines
            const centerY = footerY + (footerHeight / 2);
            ctx.fillText(line1, newCanvas.width / 2, centerY - lineSpacing);
            ctx.fillText(line2, newCanvas.width / 2, centerY + lineSpacing);
        }
        ctx.restore();

        // Add watermark elements
        const { watermarkText = 'BrasilDados', watermarkUrl = 'https://brasildados.online' } = options;
        ctx.save();

        // Calculate center positions for watermark
        const centerX = newCanvas.width / 2;
        const centerY = topPadding + titleHeight + titleMarginBottom + (canvas.height / 2);

        // Main watermark text
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(watermarkText, centerX, centerY);

        // URL watermark
        ctx.font = '24px Arial';
        ctx.globalAlpha = 0.1;
        ctx.fillText(watermarkUrl, centerX, centerY + 35);

        ctx.restore();
        return newCanvas;
    }, []);

    const convertToDataUrl = useCallback(async (blob: Blob): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result as string);
            };
            reader.readAsDataURL(blob);
        });
    }, []);

    const exportChart = useCallback(async (
        chartElementId: string,
        chartData: ChartDataExport,
        options: ExportOptions = {}
    ): Promise<string> => {
        setIsExporting(true);

        try {
            const element = document.getElementById(chartElementId);
            if (!element) {
                throw new Error(`Chart element with ID "${chartElementId}" not found`);
            }            // Hide all export buttons before capturing
            const exportButtons = element.querySelectorAll('[data-export-button]');
            const originalDisplays: string[] = [];

            exportButtons.forEach((button, index) => {
                const htmlButton = button as HTMLElement;
                originalDisplays[index] = htmlButton.style.display;
                htmlButton.style.display = 'none';
            });

            // Change colors for export (white background compatibility)
            const allAxisLines = element.querySelectorAll('.recharts-cartesian-axis-line');
            const gridLines = element.querySelectorAll('.recharts-cartesian-grid-horizontal line, .recharts-cartesian-grid-vertical line');
            const allAxisTickText = element.querySelectorAll('.recharts-cartesian-axis-tick text');
            const presidencyTexts = element.querySelectorAll('.absolute.top-0.h-3 span');
            const originalStyles: { element: Element; attribute: string; value: string | null }[] = [];

            // Store and modify axis lines (both X and Y)
            Array.from(allAxisLines).forEach(line => {
                ['stroke', 'stroke-width'].forEach(attr => {
                    originalStyles.push({
                        element: line,
                        attribute: attr,
                        value: line.getAttribute(attr)
                    });
                });
                line.setAttribute('stroke', '#000000');
                line.setAttribute('stroke-width', '2');
            });

            // Store and modify grid lines
            Array.from(gridLines).forEach(line => {
                const originalStroke = line.getAttribute('stroke');
                if (originalStroke) {
                    originalStyles.push({ element: line, attribute: 'stroke', value: originalStroke });
                }
                line.setAttribute('stroke', '#cccccc');
            });

            // Store and modify all axis tick text
            Array.from(allAxisTickText).forEach(text => {
                ['fill', 'fontWeight', 'textShadow'].forEach(attr => {
                    const value = attr === 'fill' ? text.getAttribute(attr) : (text as any).style[attr] || '';
                    originalStyles.push({ element: text, attribute: attr, value });
                });

                text.setAttribute('fill', '#000000');
                (text as any).style.fontWeight = 'normal';
                (text as any).style.textShadow = 'none';
            });

            // Store and modify presidency text positioning
            Array.from(presidencyTexts).forEach(span => {
                const originalTransform = (span as HTMLElement).style.transform;
                originalStyles.push({ element: span, attribute: 'transform', value: originalTransform || '' });
                (span as HTMLElement).style.transform = 'translateY(-5px)';
            });

            try {
                // Generate canvas from chart
                const canvas = await html2canvas(element, {
                    backgroundColor: '#FFF',
                    scale: 1, // Standard resolution
                    useCORS: true,
                    allowTaint: true,
                    width: element.offsetWidth,
                    height: element.offsetHeight,
                });

                // Add watermark
                const watermarkedCanvas = addWatermark(canvas, options, chartData);

                // Convert to blob
                const blob = await new Promise<Blob>((resolve) => {
                    watermarkedCanvas.toBlob((blob) => {
                        resolve(blob!);
                    }, 'image/jpeg', 0.9);
                });

                // Convert blob to data URL
                const imageUrl = await convertToDataUrl(blob);
                return imageUrl;

            } finally {
                // Restore export buttons visibility
                exportButtons.forEach((button, index) => {
                    const htmlButton = button as HTMLElement;
                    htmlButton.style.display = originalDisplays[index] || '';
                });

                // Restore all original styles
                originalStyles.forEach(({ element, attribute, value }) => {
                    if (attribute === 'fontWeight' || attribute === 'transform' || attribute === 'textShadow') {
                        (element as any).style[attribute] = value || '';
                    } else if (value !== null) {
                        element.setAttribute(attribute, value);
                    } else {
                        element.removeAttribute(attribute);
                    }
                });

                // Force restore chart-specific colors
                const allAxisLines = element.querySelectorAll('.recharts-cartesian-axis-line');
                const allYAxisTickText = element.querySelectorAll('.recharts-cartesian-axis.yAxis .recharts-cartesian-axis-tick text');

                Array.from(allAxisLines).forEach(line => {
                    line.setAttribute('stroke', '#ffffff');
                    line.setAttribute('stroke-width', '2');
                });

                Array.from(allYAxisTickText).forEach(text => {
                    text.setAttribute('fill', '#ffffff');
                });
            }

        } catch (error) {
            console.error('Failed to export chart:', error);
            throw error;
        } finally {
            setIsExporting(false);
        }
    }, [addWatermark, convertToDataUrl]);

    const copyUrlToClipboard = useCallback(async (url: string): Promise<void> => {
        try {
            await navigator.clipboard.writeText(url);
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }, []);

    const downloadImage = useCallback((dataUrl: string, fileName: string): void => {
        const link = document.createElement('a');
        link.download = `${fileName}.jpg`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    return {
        exportChart,
        copyUrlToClipboard,
        downloadImage,
        isExporting,
    };
};
