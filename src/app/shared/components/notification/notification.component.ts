import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { ChatService } from '../../../core/services/chat.service';
import { INotification } from '../../../core/models/notification.model';
import { Button } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    CommonModule,
    Button,
    BadgeModule,
    OverlayPanelModule,
    ScrollPanelModule,
    TooltipModule,
  ],
  template: `
    <p-button
      icon="pi pi-bell"
      severity="secondary"
      [label]="unreadCount() > 0 ? unreadCount().toString() : ''"
      [text]="true"
      (onClick)="toggleNotificationPanel($event)"
      [pTooltip]="getTooltipText()"
      tooltipPosition="bottom"
    />
  `,
  styles: [
    `
      :host {
        margin-right: 16px;
      }
      :host ::ng-deep .p-button {
        padding: 6px;
      }
    `,
  ],
})
export class NotificationComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private chatService = inject(ChatService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Reactive signals from service
  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;

  ngOnInit(): void {
    this.loadNotifications();
    this.setupSocketListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Setup socket listeners for real-time updates
   */
  private setupSocketListeners(): void {
    this.chatService
      .onUserChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadNotifications();
      });
  }

  /**
   * Load notifications from server
   */
  loadNotifications(): void {
    this.notificationService.loadNotifications();
    this.notificationService.loadUnreadCount();
  }

  /**
   * Refresh notifications
   */
  refreshNotifications(): void {
    this.loadNotifications();
  }

  /**
   * Toggle notification panel
   */
  toggleNotificationPanel(event: Event): void {
    // The panel toggle is handled by PrimeNG automatically
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notificationService
      .markAllNotificationsAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadNotifications();
        },
        error: (error) => {
          console.error('Error marking all notifications as read:', error);
        },
      });
  }

  /**
   * Handle notification click
   */
  handleNotificationClick(notification: INotification): void {
    // Mark as read if unread
    if (!notification.isRead) {
      this.notificationService
        .markNotificationAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadNotifications();
          },
          error: (error) => {
            console.error('Error marking notification as read:', error);
          },
        });
    }

    // Handle navigation based on notification type
    if (notification.type === 'message' && notification.data?.senderId) {
      this.router.navigate(['/chat', notification.data.senderId]);
    }
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: number, event: Event): void {
    event.stopPropagation(); // Prevent notification click

    this.notificationService
      .deleteNotification(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadNotifications();
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
        },
      });
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'message':
        return 'pi pi-comment';
      case 'user_online':
        return 'pi pi-user';
      default:
        return 'pi pi-bell';
    }
  }

  /**
   * Get time ago text
   */
  getTimeAgo(createdAt: Date): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = now.getTime() - created.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  }

  /**
   * Get tooltip text for notification button
   */
  getTooltipText(): string {
    const count = this.unreadCount();
    if (count === 0) {
      return 'No new messages';
    } else if (count === 1) {
      return '1 new message';
    } else {
      return `${count} new messages`;
    }
  }

  /**
   * TrackBy function for notifications
   */
  trackByNotificationId(index: number, notification: INotification): number {
    return notification.id;
  }
}
