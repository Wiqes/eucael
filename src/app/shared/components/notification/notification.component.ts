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
    <div class="notification-container">
      <!-- Notification Bell Button -->
      <p-button
        icon="pi pi-bell"
        [badge]="unreadCount() > 0 ? unreadCount().toString() : ''"
        badgeClass="p-badge-danger"
        severity="secondary"
        [text]="true"
        (onClick)="toggleNotificationPanel($event)"
        [pTooltip]="getTooltipText()"
        tooltipPosition="bottom"
      ></p-button>

      <!-- Notification Panel -->
      <p-overlayPanel
        #notificationPanel
        [showCloseIcon]="true"
        [style]="{ width: '400px', maxHeight: '500px' }"
      >
        <ng-template pTemplate="content">
          <div class="notification-panel">
            <!-- Header -->
            <div class="notification-header">
              <h6 class="notification-title">Notifications</h6>
              <div class="notification-actions">
                <p-button
                  icon="pi pi-refresh"
                  size="small"
                  [text]="true"
                  (onClick)="refreshNotifications()"
                  pTooltip="Refresh"
                ></p-button>
                <p-button
                  icon="pi pi-check-circle"
                  size="small"
                  [text]="true"
                  (onClick)="markAllAsRead()"
                  [disabled]="unreadCount() === 0"
                  pTooltip="Mark all as read"
                ></p-button>
              </div>
            </div>

            <!-- Notification List -->
            <div class="notification-list" *ngIf="notifications().length > 0; else noNotifications">
              <p-scrollPanel [style]="{ width: '100%', height: '350px' }">
                <div
                  *ngFor="let notification of notifications(); trackBy: trackByNotificationId"
                  class="notification-item"
                  [class.unread]="!notification.isRead"
                  (click)="handleNotificationClick(notification)"
                >
                  <div class="notification-icon">
                    <i [class]="getNotificationIcon(notification.type)"></i>
                  </div>

                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-message">{{ notification.message }}</div>
                    <div class="notification-time">{{ getTimeAgo(notification.createdAt) }}</div>
                  </div>

                  <div class="notification-actions">
                    <p-button
                      *ngIf="!notification.isRead"
                      icon="pi pi-circle-fill"
                      size="small"
                      [text]="true"
                      severity="info"
                      class="unread-indicator"
                    ></p-button>
                    <p-button
                      icon="pi pi-times"
                      size="small"
                      [text]="true"
                      severity="danger"
                      (onClick)="deleteNotification(notification.id, $event)"
                      pTooltip="Delete"
                    ></p-button>
                  </div>
                </div>
              </p-scrollPanel>
            </div>

            <!-- No Notifications State -->
            <ng-template #noNotifications>
              <div class="no-notifications">
                <i
                  class="pi pi-bell-slash"
                  style="font-size: 2rem; color: var(--text-color-secondary);"
                ></i>
                <p>No notifications yet</p>
              </div>
            </ng-template>
          </div>
        </ng-template>
      </p-overlayPanel>
    </div>
  `,
  styles: [
    `
      .notification-container {
        position: relative;
      }

      .notification-panel {
        padding: 0;
      }

      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid var(--surface-border);
        background: var(--surface-0);
      }

      .notification-title {
        margin: 0;
        font-weight: 600;
        color: var(--text-color);
      }

      .notification-actions {
        display: flex;
        gap: 0.5rem;
      }

      .notification-list {
        max-height: 350px;
        overflow-y: auto;
      }

      .notification-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        border-bottom: 1px solid var(--surface-border);
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .notification-item:hover {
        background: var(--surface-hover);
      }

      .notification-item.unread {
        background: var(--primary-50);
        border-left: 3px solid var(--primary-color);
      }

      .notification-icon {
        flex-shrink: 0;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: var(--primary-100);
        color: var(--primary-color);
      }

      .notification-content {
        flex: 1;
        min-width: 0;
      }

      .notification-title {
        font-weight: 600;
        color: var(--text-color);
        margin-bottom: 0.25rem;
        font-size: 0.875rem;
      }

      .notification-message {
        color: var(--text-color-secondary);
        font-size: 0.8rem;
        line-height: 1.4;
        margin-bottom: 0.25rem;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .notification-time {
        color: var(--text-color-secondary);
        font-size: 0.75rem;
      }

      .notification-actions {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .unread-indicator {
        color: var(--primary-color) !important;
      }

      .no-notifications {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        color: var(--text-color-secondary);
        text-align: center;
      }

      .no-notifications p {
        margin: 0.5rem 0 0 0;
        font-size: 0.875rem;
      }

      /* Custom scrollbar for notification list */
      :host ::ng-deep .p-scrollpanel .p-scrollpanel-bar {
        background-color: var(--surface-300);
        border-radius: 6px;
        width: 6px;
      }

      :host ::ng-deep .p-scrollpanel .p-scrollpanel-bar:hover {
        background-color: var(--surface-400);
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
      return 'No new notifications';
    } else if (count === 1) {
      return '1 new notification';
    } else {
      return `${count} new notifications`;
    }
  }

  /**
   * TrackBy function for notifications
   */
  trackByNotificationId(index: number, notification: INotification): number {
    return notification.id;
  }
}
