import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR').format(d);
}

export function formatNumber(num: number, decimals = 0): string {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

export function calculateMBH(revenue: number, costs: number, hours: number): number {
    if (hours === 0) return 0;
    return (revenue - costs) / hours;
}

export function calculateMargin(revenue: number, costs: number): number {
    if (revenue === 0) return 0;
    return ((revenue - costs) / revenue) * 100;
}

export function getMBHColor(mbh: number, target: number): 'excellent' | 'good' | 'warning' | 'danger' {
    if (mbh >= target) return 'excellent';
    if (mbh >= target * 0.85) return 'warning';
    return 'danger';
}
