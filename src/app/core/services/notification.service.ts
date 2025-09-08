import { Injectable, signal, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  INotification,
  INotificationCount,
  INewMessageNotification,
} from '../models/notification.model';
import { environment } from '../../../environments/environment';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);

  // Reactive state
  unreadCount = signal<number>(0);
  notifications = signal<INotification[]>([]);
  hasPermission = signal<boolean>(false);

  // Audio for notification sound
  private notificationAudio?: HTMLAudioElement;

  constructor() {
    this.initializeNotificationPermission();
    this.loadNotificationAudio();
  }

  /**
   * Initialize browser notification permission
   */
  private initializeNotificationPermission(): void {
    if ('Notification' in window) {
      this.hasPermission.set(Notification.permission === 'granted');

      // Request permission if not already granted or denied
      if (Notification.permission === 'default') {
        this.requestNotificationPermission();
      }
    }
  }

  /**
   * Request notification permission from user
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      this.hasPermission.set(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Load notification sound audio file
   */
  private loadNotificationAudio(): void {
    try {
      this.notificationAudio = new Audio();
      this.notificationAudio.src = '/assets/sounds/notification.mp3'; // You'll need to add this file
      this.notificationAudio.preload = 'auto';
      this.notificationAudio.volume = 0.7;
    } catch (error) {
      console.warn('Could not load notification audio:', error);
    }
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(notification: INewMessageNotification): void {
    if (!this.hasPermission() || document.visibilityState === 'visible') {
      // Don't show notifications if no permission or if app is in focus
      return;
    }

    try {
      const browserNotification = new Notification(notification.senderUsername, {
        body: notification.message,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        tag: `chat-${notification.chatId}`,
        requireInteraction: false,
        silent: false,
        data: {
          chatId: notification.chatId,
          senderId: notification.senderUserId,
          url: `/chat/${notification.senderUserId}`,
        },
      });

      // Handle notification click
      browserNotification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        // Navigate to chat
        if (notification.chatId) {
          window.location.href = `/chat/${notification.senderUserId}`;
        }

        browserNotification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    } catch (error) {
      console.error('Error showing browser notification:', error);
    }
  }

  /**
   * Play notification sound
   */
  playNotificationSound(): void {
    if (this.notificationAudio && document.visibilityState !== 'visible') {
      try {
        this.notificationAudio.currentTime = 0;
        this.notificationAudio.play().catch((error) => {
          console.warn('Could not play notification sound:', error);
        });
      } catch (error) {
        console.warn('Error playing notification sound:', error);
      }
    }
  }

  /**
   * Handle new message notification
   */
  handleNewMessageNotification(notification: INewMessageNotification): void {
    this.showBrowserNotification(notification);
    this.playNotificationSound();
    this.updateUnreadCount(this.unreadCount() + 1);

    // Show toast notification if app is visible
    if (document.visibilityState === 'visible') {
      this.messageService.sendMessage({
        severity: 'info',
        summary: `New message from ${notification.senderUsername}`,
        detail: notification.message,
        life: 3000,
      });
    }
  }

  /**
   * Update unread notification count
   */
  updateUnreadCount(count: number): void {
    this.unreadCount.set(count);
    this.updatePageTitle(count);
    this.updateFavicon(count);
  }

  /**
   * Update page title with unread count
   */
  private updatePageTitle(count: number): void {
    const baseTitle = 'Alseids';
    document.title = count > 0 ? `(${count}) ${baseTitle}` : baseTitle;
  }

  /**
   * Update favicon with notification badge (optional advanced feature)
   */
  private updateFavicon(count: number): void {
    // This is a simplified version - you could create a more sophisticated favicon badge
    try {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link && count > 0) {
        // You could implement a canvas-based favicon badge here
        // For now, we'll just use the existing favicon
      }
    } catch (error) {
      console.warn('Could not update favicon:', error);
    }
  }

  /**
   * Get user notifications from API
   */
  getNotifications(unreadOnly: boolean = false): Observable<INotification[]> {
    const params = unreadOnly ? '?unreadOnly=true' : '';
    return this.http.get<INotification[]>(`${environment.API_URL}/notifications${params}`);
  }

  /**
   * Get unread notification count from API
   */
  getUnreadNotificationCount(): Observable<INotificationCount> {
    return this.http.get<INotificationCount>(`${environment.API_URL}/notifications/count`);
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: number): Observable<void> {
    return this.http.post<void>(`${environment.API_URL}/notifications/${notificationId}/read`, {});
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(): Observable<void> {
    return this.http.post<void>(`${environment.API_URL}/notifications/read-all`, {});
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${environment.API_URL}/notifications/${notificationId}`);
  }

  /**
   * Load notifications and update state
   */
  loadNotifications(): void {
    this.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      },
    });
  }

  /**
   * Load unread count and update state
   */
  loadUnreadCount(): void {
    this.getUnreadNotificationCount().subscribe({
      next: (result) => {
        this.updateUnreadCount(result.count);
      },
      error: (error) => {
        console.error('Error loading unread count:', error);
      },
    });
  }

  /**
   * Clear all notifications from state
   */
  clearNotifications(): void {
    this.notifications.set([]);
    this.updateUnreadCount(0);
  }
}
