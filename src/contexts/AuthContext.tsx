import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api.config';
import type { User, LoginRequest, RegisterRequest, AuthResponse, RefreshResponse, ChangePasswordRequest, ChangePasswordResponse } from '../types/api.types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (data: ChangePasswordRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider component that manages user authentication state.
 * Handles login, register, logout, and password change operations.
 * @param children - Child components to wrap with auth context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Try to restore session on app load using refresh token
    const initializeAuth = useCallback(async () => {
        try {
            // Try to refresh the access token using the httpOnly cookie
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies
            });

            if (response.ok) {
                const data: RefreshResponse = await response.json();
                apiClient.setToken(data.accessToken);
                setUser(data.user);
            } else {
                // No valid refresh token, user needs to login
                apiClient.clearToken();
                setUser(null);
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            apiClient.clearToken();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    /**
     * Authenticates a user with email and password.
     * @param data - Login credentials
     * @throws Error if login fails
     */
    const login = async (data: LoginRequest) => {
        const response = await apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, data, false);
        apiClient.setToken(response.accessToken);
        setUser(response.user);
    };

    /**
     * Registers a new user account.
     * @param data - Registration data including name, email, and password
     * @throws Error if registration fails
     */
    const register = async (data: RegisterRequest) => {
        const response = await apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data, false);
        apiClient.setToken(response.accessToken);
        setUser(response.user);
    };

    /**
     * Logs out the current user and clears all tokens.
     */
    const logout = async () => {
        try {
            // Call logout endpoint to clear the refresh token cookie
            await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            // Always clear local state
            apiClient.clearToken();
            setUser(null);
        }
    };

    /**
     * Changes the current user's password and logs them out.
     * @param data - Current and new password
     * @throws Error if password change fails
     */
    const changePassword = async (data: ChangePasswordRequest) => {
        await apiClient.post<ChangePasswordResponse>(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
        // After password change, log out the user (backend invalidates all refresh tokens)
        await logout();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
            changePassword
        }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider.
 * @returns Authentication context with user state and auth methods
 * @throws Error if used outside of AuthProvider
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
