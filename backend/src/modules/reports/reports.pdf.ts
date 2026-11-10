import PDFDocument from 'pdfkit';
import type { Report } from './types/reports.types.js';

const labels = {
    energy: { name: 'Energia estimada', column: 'Energia', unit: 'kWh' },
    carbon: { name: 'Emissões estimadas', column: 'Emissões', unit: 'g CO2e' },
    cpu: { name: 'CPU média', column: 'CPU', unit: '%' },
    memory: { name: 'Memória média', column: 'Memória', unit: 'GB' },
    power: { name: 'Potência média', column: 'Potência', unit: 'W' },
} as const;

type Metric = keyof typeof labels;
const colors = {
    ink: '#142720',
    muted: '#4a6259',
    hero: '#103d30',
    mint: '#b5efd6',
    green: '#117758',
    border: '#d5e3dd',
    tint: '#edf6f1',
    alternate: '#f6faf8',
    white: '#ffffff',
};
const margin = 44;
const format = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 });
const compact = new Intl.NumberFormat('pt-BR', {
    notation: 'scientific',
    maximumFractionDigits: 1,
});
const date = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'UTC',
});
const axisDate = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
});
const cleanText = (value: string) => value.replaceAll('₂', '2').replace(/\s+/g, ' ').trim();
const contentWidth = (pdf: PDFKit.PDFDocument) => pdf.page.width - 2 * margin;
const contentBottom = (pdf: PDFKit.PDFDocument) => pdf.page.height - 68;

export function createReportPdf(report: Report): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const pdf = new PDFDocument({
            size: 'A4',
            margin,
            bufferPages: true,
            info: { Title: report.title, Author: 'GreenER' },
        });
        const chunks: Buffer[] = [];
        pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
        pdf.on('error', reject);
        pdf.on('end', () => resolve(Buffer.concat(chunks)));

        let y = drawSummary(pdf, report);
        if (report.visualization === 'line') {
            for (const metric of report.metrics) {
                const hasData = report.points.some((point) => point[metric] !== null);
                const height = hasData ? 150 : 65;
                if (y + height > contentBottom(pdf)) y = nextPage(pdf, report.title);
                drawTimeline(pdf, report, metric, y, height, hasData);
                y += height + 12;
            }
        }
        if (report.visualization === 'bars') y = drawBarCharts(pdf, report, y);
        drawServiceTable(pdf, report, y);
        drawFooters(pdf);
        pdf.end();
    });
}

function drawSummary(pdf: PDFKit.PDFDocument, report: Report) {
    const width = contentWidth(pdf);
    const title = cleanText(report.title);
    pdf.font('Helvetica-Bold').fontSize(25);
    const titleHeight = pdf.heightOfString(title, { width: width - 44 });
    const heroHeight = 92 + titleHeight;

    pdf.roundedRect(margin, margin, width, heroHeight, 12).fill(colors.hero);
    pdf.font('Helvetica-Bold')
        .fontSize(15)
        .fillColor(colors.white)
        .text('GreenER', margin + 22, margin + 19, { lineBreak: false });
    pdf.font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(colors.mint)
        .text('RELATÓRIO DE MONITORAMENTO', margin + 22, margin + 19, {
            width: width - 44,
            align: 'right',
            lineBreak: false,
        });
    pdf.font('Helvetica-Bold')
        .fontSize(25)
        .fillColor(colors.white)
        .text(title, margin + 22, margin + 49, { width: width - 44 });
    pdf.font('Helvetica')
        .fontSize(10)
        .fillColor(colors.mint)
        .text(
            `${date.format(report.start)} a ${date.format(report.end)} (UTC)`,
            margin + 22,
            margin + 61 + titleHeight,
            {
                width: width - 44,
                lineBreak: false,
            },
        );

    const samples = report.services.reduce((total, service) => total + service.samples, 0);
    const cards = [
        ['Serviços selecionados', report.services.length],
        ['Amostras no período', samples],
        ['Métricas incluídas', report.metrics.length],
    ] as const;
    const gap = 10;
    const cardWidth = (width - 2 * gap) / cards.length;
    const cardTop = margin + heroHeight + 15;
    cards.forEach(([label, value], index) => {
        const x = margin + index * (cardWidth + gap);
        pdf.roundedRect(x, cardTop, cardWidth, 60, 8).fillAndStroke(colors.tint, colors.border);
        pdf.font('Helvetica-Bold')
            .fontSize(20)
            .fillColor(colors.hero)
            .text(format.format(value), x + 12, cardTop + 10, { lineBreak: false });
        pdf.font('Helvetica')
            .fontSize(9)
            .fillColor(colors.muted)
            .text(label, x + 12, cardTop + 36, { lineBreak: false });
    });

    pdf.font('Helvetica')
        .fontSize(9)
        .fillColor(colors.muted)
        .text(
            'Energia e emissões são estimadas a partir das métricas disponíveis. Valores marcados como sem dados indicam ausência de amostras para aquela métrica.',
            margin,
            cardTop + 74,
            { width, lineGap: 2 },
        );
    return pdf.y + 15;
}

function nextPage(pdf: PDFKit.PDFDocument, title: string) {
    pdf.addPage();
    pdf.font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(colors.hero)
        .text('GreenER', margin, margin, { lineBreak: false });
    pdf.font('Helvetica')
        .fontSize(9)
        .fillColor(colors.muted)
        .text(cleanText(title), margin + 82, margin + 3, {
            width: contentWidth(pdf) - 82,
            align: 'right',
            height: 12,
            ellipsis: true,
        });
    pdf.moveTo(margin, margin + 23)
        .lineTo(pdf.page.width - margin, margin + 23)
        .lineWidth(0.7)
        .strokeColor(colors.border)
        .stroke();
    return margin + 36;
}

function drawTimeline(
    pdf: PDFKit.PDFDocument,
    report: Report,
    metric: Metric,
    y: number,
    height: number,
    hasData: boolean,
) {
    const width = contentWidth(pdf);
    const { name, unit } = labels[metric];
    pdf.roundedRect(margin, y, width, height, 8)
        .lineWidth(0.7)
        .fillAndStroke(colors.white, colors.border);
    pdf.font('Helvetica-Bold')
        .fontSize(13)
        .fillColor(colors.ink)
        .text(name, margin + 14, y + 12, { lineBreak: false });
    pdf.font('Helvetica')
        .fontSize(9)
        .fillColor(colors.muted)
        .text(unit, margin + 14, y + 14, { width: width - 28, align: 'right', lineBreak: false });
    if (!hasData) {
        pdf.text('Sem amostras no período.', margin + 14, y + 34, { lineBreak: false });
        return;
    }

    const left = margin + 72;
    const right = margin + width - 20;
    const top = y + 38;
    const bottom = y + height - 29;
    const intervals = 4;
    const max = Math.max(...report.points.map((point) => point[metric] ?? 0)) || 1;
    const target = max / intervals;
    const magnitude = 10 ** Math.floor(Math.log10(target));
    const step =
        ([1, 2, 2.5, 5, 10].find((value) => value >= target / magnitude) ?? 10) * magnitude;
    const scale = step * intervals;
    pdf.fontSize(8);
    for (let tick = 0; tick <= intervals; tick++) {
        const value = step * tick;
        const row = bottom - ((bottom - top) * tick) / intervals;
        pdf.moveTo(left, row).lineTo(right, row).lineWidth(0.6).strokeColor(colors.border).stroke();
        const tickLabel =
            value !== 0 && (value < 0.001 || value >= 1e6)
                ? compact.format(value)
                : format.format(value);
        pdf.fillColor(colors.muted).text(tickLabel, margin + 9, row - 4, {
            width: 55,
            align: 'right',
            lineBreak: false,
        });
    }

    const start = report.start.getTime();
    const duration = report.end.getTime() - start;
    const axisLabels = [
        { time: start, x: left, align: 'left' },
        { time: start + duration / 2, x: (left + right - 80) / 2, align: 'center' },
        { time: start + duration, x: right - 80, align: 'right' },
    ] as const;
    for (const { time, x, align } of axisLabels) {
        pdf.fillColor(colors.muted).text(axisDate.format(time), x, bottom + 10, {
            width: 80,
            align,
            lineBreak: false,
        });
    }
    pdf.lineWidth(1.6).strokeColor(colors.green).fillColor(colors.green);
    let previous: { x: number; y: number } | undefined;
    for (const point of report.points) {
        const value = point[metric];
        if (value === null) {
            previous = undefined;
            continue;
        }
        const x = left + ((right - left) * (point.time.getTime() - start)) / duration;
        const position = bottom - ((bottom - top) * value) / scale;
        if (previous) pdf.moveTo(previous.x, previous.y).lineTo(x, position).stroke();
        pdf.circle(x, position, 2).fill();
        previous = { x, y: position };
    }
}

function drawBarCharts(pdf: PDFKit.PDFDocument, report: Report, startY: number) {
    const width = contentWidth(pdf);
    const headerHeight = 41;
    const rowHeight = 22;
    const padding = 12;
    const nameWidth = 170;
    const valueWidth = 73;
    const barLeft = margin + padding + nameWidth;
    const barWidth = width - nameWidth - valueWidth - 3 * padding;
    pdf.font('Helvetica-Bold')
        .fontSize(15)
        .fillColor(colors.ink)
        .text('Gráficos de barras', margin, startY, { lineBreak: false });
    pdf.font('Helvetica')
        .fontSize(9)
        .fillColor(colors.muted)
        .text('Comparação entre os serviços com dados no período.', margin, startY + 21, {
            lineBreak: false,
        });
    let y = startY + 39;

    for (const metric of report.metrics) {
        const { name, unit } = labels[metric];
        const rows = report.services.flatMap((service) => {
            const value = service[metric];
            return value === null ? [] : [{ name: service.name, value }];
        });
        const max = Math.max(0, ...rows.map((row) => row.value));
        let offset = 0;
        do {
            const minRows = Math.max(1, Math.min(4, rows.length - offset));
            if (y + headerHeight + minRows * rowHeight + padding > contentBottom(pdf)) {
                y = nextPage(pdf, report.title);
            }
            const capacity = Math.floor(
                (contentBottom(pdf) - y - headerHeight - padding) / rowHeight,
            );
            const visible = rows.slice(offset, offset + capacity);
            const height = headerHeight + Math.max(1, visible.length) * rowHeight + padding;
            pdf.roundedRect(margin, y, width, height, 8)
                .lineWidth(0.7)
                .fillAndStroke(colors.white, colors.border);
            pdf.font('Helvetica-Bold')
                .fontSize(13)
                .fillColor(colors.ink)
                .text(offset ? `${name} (continuação)` : name, margin + padding, y + 12, {
                    lineBreak: false,
                });
            pdf.font('Helvetica')
                .fontSize(9)
                .fillColor(colors.muted)
                .text(unit, margin + padding, y + 14, {
                    width: width - 2 * padding,
                    align: 'right',
                    lineBreak: false,
                });
            if (!visible.length) {
                pdf.text('Sem amostras no período.', margin + padding, y + headerHeight, {
                    lineBreak: false,
                });
            }
            visible.forEach((row, index) => {
                const top = y + headerHeight + index * rowHeight;
                pdf.fillColor(colors.ink).text(cleanText(row.name), margin + padding, top, {
                    width: nameWidth - padding,
                    height: 13,
                    ellipsis: true,
                });
                pdf.roundedRect(barLeft, top + 1, barWidth, 10, 3).fill(colors.tint);
                if (row.value > 0) {
                    pdf.rect(barLeft, top + 1, (barWidth * row.value) / max, 10).fill(colors.green);
                }
                pdf.fillColor(colors.ink).text(
                    metricValueLabel(pdf, row.value, valueWidth),
                    margin + width - padding - valueWidth,
                    top,
                    {
                        width: valueWidth,
                        align: 'right',
                        lineBreak: false,
                    },
                );
            });
            offset += visible.length;
            y += height + padding;
        } while (offset < rows.length);
    }
    return y;
}

function metricValueLabel(pdf: PDFKit.PDFDocument, value: number, width: number) {
    const label = value > 0 && value < 0.0001 ? '< 0,0001' : format.format(value);
    return pdf.widthOfString(label) > width ? compact.format(value) : label;
}

function drawServiceTable(pdf: PDFKit.PDFDocument, report: Report, startY: number) {
    const width = contentWidth(pdf);
    const nameWidth = report.metrics.length >= 4 ? 158 : 215;
    const samplesWidth = 55;
    const metricWidth = (width - nameWidth - samplesWidth) / report.metrics.length;
    const headerHeight = 32;
    const metricLeft = (index: number) => margin + nameWidth + samplesWidth + index * metricWidth;

    function header(y: number, continued = false) {
        pdf.font('Helvetica-Bold')
            .fontSize(15)
            .fillColor(colors.ink)
            .text(
                continued ? 'Resultados por serviço (continuação)' : 'Resultados por serviço',
                margin,
                y,
                { lineBreak: false },
            );
        y += 24;
        pdf.roundedRect(margin, y, width, headerHeight, 5).fill(colors.hero);
        pdf.font('Helvetica-Bold').fontSize(9).fillColor(colors.white);
        pdf.text('Serviço', margin + 9, y + 11, { lineBreak: false });
        pdf.text('Amostras', margin + nameWidth, y + 11, {
            width: samplesWidth - 7,
            align: 'right',
            lineBreak: false,
        });
        report.metrics.forEach((metric, index) => {
            const { column, unit } = labels[metric];
            const x = metricLeft(index);
            const options = { width: metricWidth - 8, align: 'right' as const, lineBreak: false };
            pdf.font('Helvetica-Bold')
                .fontSize(9)
                .fillColor(colors.white)
                .text(column, x, y + 6, options);
            pdf.font('Helvetica')
                .fontSize(8)
                .fillColor(colors.mint)
                .text(unit, x, y + 17, options);
        });
        return y + headerHeight;
    }

    const measureRow = (name: string) => {
        pdf.font('Helvetica').fontSize(9);
        const nameHeight = pdf.heightOfString(name, { width: nameWidth - 18 });
        return Math.max(29, Math.min(nameHeight, 54) + 16);
    };
    const firstName = cleanText(report.services[0]?.name ?? '');
    const firstBlock = 24 + headerHeight + measureRow(firstName);
    let y = header(startY + firstBlock > contentBottom(pdf) ? nextPage(pdf, report.title) : startY);
    report.services.forEach((service, index) => {
        const name = cleanText(service.name);
        const height = measureRow(name);
        if (y + height > contentBottom(pdf)) y = header(nextPage(pdf, report.title), true);

        pdf.rect(margin, y, width, height).fill(index % 2 ? colors.alternate : colors.white);
        pdf.moveTo(margin, y + height)
            .lineTo(margin + width, y + height)
            .lineWidth(0.55)
            .strokeColor(colors.border)
            .stroke();
        pdf.font('Helvetica')
            .fontSize(9)
            .fillColor(colors.ink)
            .text(name, margin + 9, y + 8, {
                width: nameWidth - 18,
                height: height - 12,
                ellipsis: true,
            });
        pdf.text(format.format(service.samples), margin + nameWidth, y + 8, {
            width: samplesWidth - 7,
            align: 'right',
            lineBreak: false,
        });

        report.metrics.forEach((metric, column) => {
            const value = service[metric];
            const x = metricLeft(column);
            const valueLabel =
                value === null ? 'Sem dados' : metricValueLabel(pdf, value, metricWidth - 8);
            pdf.fillColor(value === null ? colors.muted : colors.ink).text(valueLabel, x, y + 8, {
                width: metricWidth - 8,
                align: 'right',
                lineBreak: false,
            });
        });
        y += height;
    });
}

function drawFooters(pdf: PDFKit.PDFDocument) {
    const { start, count } = pdf.bufferedPageRange();
    for (let index = 0; index < count; index++) {
        pdf.switchToPage(start + index);
        const y = pdf.page.height - 51;
        pdf.moveTo(margin, y)
            .lineTo(pdf.page.width - margin, y)
            .lineWidth(0.7)
            .strokeColor(colors.border)
            .stroke();
        pdf.font('Helvetica')
            .fontSize(8)
            .fillColor(colors.muted)
            .text('GreenER  |  Monitoramento ambiental', margin, y + 11, { lineBreak: false });
        const label = `Página ${index + 1} de ${count}`;
        pdf.text(label, pdf.page.width - margin - pdf.widthOfString(label), y + 11, {
            lineBreak: false,
        });
    }
}
