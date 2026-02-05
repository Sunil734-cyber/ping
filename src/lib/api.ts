const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
  };
  pagination?: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    const authData = localStorage.getItem('pingdaily_auth');
    if (authData) {
      try {
        const { token } = JSON.parse(authData);
        return token;
      } catch {
        return null;
      }
    }
    return null;
  }

  private getUserId(): string {
    const authData = localStorage.getItem('pingdaily_auth');
    if (authData) {
      try {
        const { user } = JSON.parse(authData);
        return user?.id || 'demo-user';
      } catch {
        return 'demo-user';
      }
    }
    return 'demo-user';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Notification Settings
  async getNotificationSettings() {
    const userId = this.getUserId();
    return this.request<any>(`/notifications/settings?userId=${userId}`);
  }

  async updateNotificationSettings(settings: {
    enabled: boolean;
    interval: number;
    startTime?: string;
    endTime?: string;
    daysOfWeek?: number[];
  }) {
    const userId = this.getUserId();
    return this.request<any>('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify({ ...settings, userId }),
    });
  }

  // Notifications
  async getNotifications(params?: {
    limit?: number;
    skip?: number;
    unreadOnly?: boolean;
  }) {
    const userId = this.getUserId();
    const queryParams = new URLSearchParams({
      userId,
      ...(params?.limit && { limit: params.limit.toString() }),
      ...(params?.skip && { skip: params.skip.toString() }),
      ...(params?.unreadOnly && { unreadOnly: 'true' }),
    });

    return this.request<any[]>(`/notifications?${queryParams}`);
  }

  async createNotification(notification: {
    message: string;
    category?: string;
    scheduledFor?: Date;
    metadata?: any;
  }) {
    const userId = this.getUserId();
    return this.request<any>('/notifications', {
      method: 'POST',
      body: JSON.stringify({ ...notification, userId }),
    });
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request<any>(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markNotificationAsLogged(
    notificationId: string,
    data: {
      category?: string;
      customText?: string;
    }
  ) {
    return this.request<any>(`/notifications/${notificationId}/logged`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async markAllNotificationsAsRead() {
    const userId = this.getUserId();
    return this.request<any>('/notifications/mark-all-read', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getNotificationStats() {
    const userId = this.getUserId();
    return this.request<any>(`/notifications/stats/summary?userId=${userId}`);
  }

  // Time Entries
  async getTimeEntries(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const userId = this.getUserId();
    const queryParams = new URLSearchParams({
      userId,
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
    });

    return this.request<any[]>(`/time-entries?${queryParams}`);
  }

  async getTimeEntriesForDate(date: string) {
    const userId = this.getUserId();
    return this.request<any[]>(`/time-entries/date/${date}?userId=${userId}`);
  }

  async createTimeEntry(entry: {
    hour: number;
    date: string;
    categoryId?: string | null;
    customText?: string;
    notificationId?: string;
  }) {
    const userId = this.getUserId();
    return this.request<any>('/time-entries', {
      method: 'POST',
      body: JSON.stringify({ ...entry, userId }),
    });
  }

  async updateTimeEntry(
    entryId: string,
    data: {
      categoryId?: string | null;
      customText?: string;
    }
  ) {
    return this.request<any>(`/time-entries/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTimeEntry(entryId: string) {
    return this.request<any>(`/time-entries/${entryId}`, {
      method: 'DELETE',
    });
  }

  async getTimeEntryStats(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const userId = this.getUserId();
    const queryParams = new URLSearchParams({
      userId,
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
    });

    return this.request<any>(`/time-entries/stats/summary?${queryParams}`);
  }
}

export const apiClient = new ApiClient();
