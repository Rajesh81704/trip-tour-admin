import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AxiosError } from 'axios';

class ApiClient {
    private client: AxiosInstance;
    private static instance: ApiClient;

    private constructor() {
        // Use local proxy routes for all environments
        const url = '/api';

        if (process.env.NODE_ENV === 'development') {
            console.log(`[ApiClient] Initializing with proxy API URL: ${url}`);
        }

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
            const proxyUrl = url.startsWith('/proxy/') ? url : `/proxy${url}`;
            if (process.env.NODE_ENV === 'development') {
                console.log('[ApiClient] GET request to:', proxyUrl);
            }
            const response: AxiosResponse<T> = await this.client.get(proxyUrl, { params });
            return { data: response.data, status: response.status };
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async post<T>(url: string, data: Record<string, any> | FormData, isFormData: boolean = false): Promise<{ data: T; status: number }> {
        try {
            const proxyUrl = url.startsWith('/proxy/') || url.startsWith('/auth/') ? url : `/proxy${url}`;
            if (process.env.NODE_ENV === 'development') {
                console.log('[ApiClient] POST request to:', proxyUrl, 'isFormData:', isFormData);
            }
            // Let axios handle FormData automatically - it will set the correct Content-Type with boundary
            const config = isFormData ? {} : { headers: { 'Content-Type': 'application/json' } };
            const response: AxiosResponse<T> = await this.client.post(proxyUrl, data, config);
            return { data: response.data, status: response.status };
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async put<T>(url: string, data: Record<string, any> | FormData, isFormData: boolean = false): Promise<{ data: T; status: number }> {
        try {
            const proxyUrl = url.startsWith('/proxy/') ? url : `/proxy${url}`;
            if (process.env.NODE_ENV === 'development') {
                console.log('[ApiClient] PUT request to:', proxyUrl, 'isFormData:', isFormData);
            }
            // Let axios handle FormData automatically - it will set the correct Content-Type with boundary
            const config = isFormData ? {} : { headers: { 'Content-Type': 'application/json' } };
            const response: AxiosResponse<T> = await this.client.put(proxyUrl, data, config);
            return { data: response.data, status: response.status };
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async delete<T>(url: string): Promise<{ data: T; status: number }> {
        try {
            const proxyUrl = url.startsWith('/proxy/') || url.startsWith('/upload') ? url : `/proxy${url}`;
            const response: AxiosResponse<T> = await this.client.delete(proxyUrl);
            return { data: response.data, status: response.status };
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async patch<T>(url: string, data: Record<string, any> | FormData, isFormData: boolean = false): Promise<{ data: T; status: number }> {
        try {
            const proxyUrl = url.startsWith('/proxy/') ? url : `/proxy${url}`;
            if (process.env.NODE_ENV === 'development') {
                console.log('[ApiClient] PATCH request to:', proxyUrl, 'isFormData:', isFormData);
            }
            // Let axios handle FormData automatically - it will set the correct Content-Type with boundary
            const config = isFormData ? {} : { headers: { 'Content-Type': 'application/json' } };
            const response: AxiosResponse<T> = await this.client.patch(proxyUrl, data, config);
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