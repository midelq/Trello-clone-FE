import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiClient } from './apiClient';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
const mockLocation = {
    pathname: '/dashboard',
    href: '',
};
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
});

describe('ApiClient', () => {
    let apiClient: ApiClient;

    beforeEach(() => {
        apiClient = new ApiClient();
        apiClient.clearToken();
        mockFetch.mockReset();
        mockLocation.pathname = '/dashboard';
        mockLocation.href = '';
    });

    describe('Token Management', () => {
        it('should store and retrieve token', () => {
            expect(apiClient.getToken()).toBeNull();

            apiClient.setToken('test-token');
            expect(apiClient.getToken()).toBe('test-token');
        });

        it('should clear token', () => {
            apiClient.setToken('test-token');
            apiClient.clearToken();
            expect(apiClient.getToken()).toBeNull();
        });
    });

    describe('GET requests', () => {
        it('should make GET request with correct headers', async () => {
            apiClient.setToken('test-token');

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: () => Promise.resolve({ data: 'test' }),
            });

            const result = await apiClient.get('/test');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test'),
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-token',
                    }),
                    credentials: 'include',
                })
            );
            expect(result).toEqual({ data: 'test' });
        });

        it('should make GET request without auth header when disabled', async () => {
            apiClient.setToken('test-token');

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: () => Promise.resolve({ data: 'test' }),
            });

            await apiClient.get('/test', false);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test'),
                expect.objectContaining({
                    headers: expect.not.objectContaining({
                        'Authorization': expect.any(String),
                    }),
                })
            );
        });
    });

    describe('POST requests', () => {
        it('should make POST request with body', async () => {
            apiClient.setToken('test-token');

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: () => Promise.resolve({ success: true }),
            });

            const result = await apiClient.post('/test', { name: 'test' });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ name: 'test' }),
                })
            );
            expect(result).toEqual({ success: true });
        });
    });

    describe('Error handling', () => {
        it('should throw error with message from API response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: () => Promise.resolve({ error: 'Validation failed' }),
            });

            await expect(apiClient.get('/test', false)).rejects.toThrow('Validation failed');
        });

        it('should throw error with status for non-JSON responses', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                headers: new Headers({ 'content-type': 'text/html' }),
            });

            await expect(apiClient.get('/test', false)).rejects.toThrow('HTTP error! status: 500');
        });

        it('should handle 204 No Content response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 204,
                headers: new Headers({}),
            });

            const result = await apiClient.delete('/test', false);
            expect(result).toBeUndefined();
        });
    });

    describe('DELETE requests', () => {
        it('should make DELETE request', async () => {
            apiClient.setToken('test-token');

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 204,
                headers: new Headers({}),
            });

            await apiClient.delete('/test/1');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test/1'),
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
        });
    });

    describe('PUT requests', () => {
        it('should make PUT request with body', async () => {
            apiClient.setToken('test-token');

            mockFetch.mockResolvedValueOnce({
                ok: true,
                headers: new Headers({ 'content-type': 'application/json' }),
                json: () => Promise.resolve({ updated: true }),
            });

            const result = await apiClient.put('/test/1', { name: 'updated' });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test/1'),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify({ name: 'updated' }),
                })
            );
            expect(result).toEqual({ updated: true });
        });
    });
});
