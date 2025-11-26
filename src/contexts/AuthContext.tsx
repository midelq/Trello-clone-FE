import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../utils/apiClient';
import { API_CONFIG } from '../config/api.config';
import type { User, LoginRequest, RegisterRequest, AuthResponse, MeResponse } from '../types/api.types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN);
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await apiClient.get<MeResponse>(API_CONFIG.ENDPOINTS.AUTH.ME);
            setUser(response.user);
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (data: LoginRequest) => {
        const response = await apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, data, false);
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN, response.token);
        setUser(response.user);
    };

    const register = async (data: RegisterRequest) => {
        const response = await apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data, false);
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN, response.token);
        setUser(response.user);
    };

    const logout = () => {
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
