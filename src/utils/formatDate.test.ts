import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
    // Fixed reference date: January 15, 2026, 12:00:00
    const now = new Date('2026-01-15T12:00:00.000Z');

    describe('relative time formatting', () => {
        it('should return "Just now" for dates less than 1 minute ago', () => {
            const dateString = new Date(now.getTime() - 30 * 1000).toISOString(); // 30 seconds ago
            expect(formatDate(dateString, now)).toBe('Just now');
        });

        it('should return "1 min ago" for dates 1 minute ago', () => {
            const dateString = new Date(now.getTime() - 60 * 1000).toISOString(); // 1 minute ago
            expect(formatDate(dateString, now)).toBe('1 min ago');
        });

        it('should return "X min ago" for dates less than 60 minutes ago', () => {
            const dateString = new Date(now.getTime() - 30 * 60 * 1000).toISOString(); // 30 minutes ago
            expect(formatDate(dateString, now)).toBe('30 min ago');
        });

        it('should return "1 hour ago" for dates 1 hour ago', () => {
            const dateString = new Date(now.getTime() - 60 * 60 * 1000).toISOString(); // 1 hour ago
            expect(formatDate(dateString, now)).toBe('1 hour ago');
        });

        it('should return "X hours ago" for dates less than 24 hours ago', () => {
            const dateString = new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(); // 5 hours ago
            expect(formatDate(dateString, now)).toBe('5 hours ago');
        });

        it('should return "1 day ago" for dates 1 day ago', () => {
            const dateString = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
            expect(formatDate(dateString, now)).toBe('1 day ago');
        });

        it('should return "X days ago" for dates less than 7 days ago', () => {
            const dateString = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days ago
            expect(formatDate(dateString, now)).toBe('3 days ago');
        });
    });

    describe('absolute date formatting', () => {
        it('should return formatted date for dates 7+ days ago in same year', () => {
            const dateString = new Date('2026-01-01T12:00:00.000Z').toISOString(); // 14 days ago
            const result = formatDate(dateString, now);
            expect(result).toBe('Jan 1');
        });

        it('should include year for dates from previous year', () => {
            const dateString = new Date('2025-12-25T12:00:00.000Z').toISOString(); // Previous year
            const result = formatDate(dateString, now);
            expect(result).toBe('Dec 25, 2025');
        });
    });

    describe('edge cases', () => {
        it('should handle exact boundary at 60 minutes', () => {
            const dateString = new Date(now.getTime() - 59 * 60 * 1000).toISOString(); // 59 minutes
            expect(formatDate(dateString, now)).toBe('59 min ago');
        });

        it('should handle exact boundary at 24 hours', () => {
            const dateString = new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(); // 23 hours
            expect(formatDate(dateString, now)).toBe('23 hours ago');
        });

        it('should handle exact boundary at 7 days', () => {
            const dateString = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(); // 6 days
            expect(formatDate(dateString, now)).toBe('6 days ago');
        });
    });
});
