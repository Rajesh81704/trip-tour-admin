import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AxiosError } from 'axios';

class ApiClient {
    private client: AxiosInstance;
    private static instance: ApiClient;

    private constructor() {
        const url = process.env.NODE_ENV === 'production'
            ? process.env.NEXT_PUBLIC_PROD_BACKEND_URL
            : process.env.NEXT_PUBLIC_DEV_BACKEND_URL;

        this.client = axios.create({
            baseURL: url,
            withCredentials: true
        });
    }

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    async get<T>(url: string, params?: Record<string, string>): Promise<{ data: T; status: number }> {
        try {
            const response: AxiosResponse<T> = await this.client.get(url, { params });
            return { data: response.data, status: response.status };
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async post<T>(url: string, data: Record<string, any>, isFormData: boolean = false): Promise<{ data: T; status: number }> {
        try {
            const response: AxiosResponse<T> = await this.client.post(url, data, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
            });
            return { data: response.data, status: response.status };
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async put<T>(url: string, data: Record<string, any>, isFormData: boolean = false): Promise<{ data: T; status: number }> {
        try {
            const response: AxiosResponse<T> = await this.client.put(url, data, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
            });
            return { data: response.data, status: response.status };
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async delete<T>(url: string): Promise<{ data: T; status: number }> {
        try {
            const response: AxiosResponse<T> = await this.client.delete(url);
            return { data: response.data, status: response.status };
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async patch<T>(url: string, data: Record<string, any>, isFormData: boolean = false): Promise<{ data: T; status: number }> {
        try {
            const response: AxiosResponse<T> = await this.client.patch(url, data, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
            });
            return { data: response.data, status: response.status };
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    private handleError(error: unknown): void {
        if (error instanceof AxiosError) {
            console.error(`Request failed with status: ${error.response?.status}`);
        } else if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('Unknown error:', error);
        }
    }
}

const api = ApiClient.getInstance();
export default api;