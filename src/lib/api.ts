const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

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
  private userId: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.userId = this.getUserId();
  }

  private getUserId(): string {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'demo-user';
      localStorage.setItem('userId', userId);
    }
    return userId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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
    return this.request<any>(`/notifications/settings?userId=${this.userId}`);
  }

  async updateNotificationSettings(settings: {
    enabled: boolean;
    interval: number;
    startTime?: string;
    endTime?: string;
    daysOfWeek?: number[];
  }) {
    return this.request<any>('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify({ ...settings, userId: this.userId }),
    });
  }

  // Notifications
  async getNotifications(params?: {
    limit?: number;
    skip?: number;
    unreadOnly?: boolean;
  }) {
    const queryParams = new URLSearchParams({
      userId: this.userId,
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
    return this.request<any>('/notifications', {
      method: 'POST',
      body: JSON.stringify({ ...notification, userId: this.userId }),
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
    return this.request<any>('/notifications/mark-all-read', {
      method: 'POST',
      body: JSON.stringify({ userId: this.userId }),
    });
  }

  async getNotificationStats() {
    return this.request<any>(`/notifications/stats/summary?userId=${this.userId}`);
  }

  // Time Entries
  async getTimeEntries(params?: {
    startDate?: string;
    endDate?: string;
  }) {
    const queryParams = new URLSearchParams({
      userId: this.userId,
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
    });

    return this.request<any[]>(`/time-entries?${queryParams}`);
  }

  async getTimeEntriesForDate(date: string) {
    return this.request<any[]>(`/time-entries/date/${date}?userId=${this.userId}`);
  }

  async createTimeEntry(entry: {
    hour: number;
    date: string;
    categoryId?: string | null;
    customText?: string;
    notificationId?: string;
  }) {
    return this.request<any>('/time-entries', {
      method: 'POST',
      body: JSON.stringify({ ...entry, userId: this.userId }),
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
    const queryParams = new URLSearchParams({
      userId: this.userId,
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate }),
    });

    return this.request<any>(`/time-entries/stats/summary?${queryParams}`);
  }
}

export const apiClient = new ApiClient();
