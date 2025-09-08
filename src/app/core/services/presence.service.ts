import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IUserPresence } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  // Map of user IDs to their online status
  private userPresenceMap = new Map<string, IUserPresence>();

  // Observable stream of presence updates
  private presenceUpdatesSubject = new BehaviorSubject<IUserPresence | null>(null);
  presenceUpdates$ = this.presenceUpdatesSubject.asObservable();

  // Reactive signals for UI
  onlineUsers = signal<Set<string>>(new Set());

  constructor() {
    this.initializePresenceTracking();
  }

  /**
   * Initialize presence tracking
   */
  private initializePresenceTracking(): void {
    // Track when user becomes visible/hidden
    document.addEventListener('visibilitychange', () => {
      // This will be handled by the chat service when it emits presence updates
    });

    // Track when user is active/inactive
    this.setupActivityTracking();
  }

  /**
   * Setup activity tracking (mouse, keyboard, touch events)
   */
  private setupActivityTracking(): void {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    let lastActivity = Date.now();

    const updateActivity = () => {
      lastActivity = Date.now();
    };

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check for inactivity every 30 seconds
    setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;

      // If inactive for more than 5 minutes, consider user as away
      if (inactiveTime > 5 * 60 * 1000) {
        // This would trigger an "away" status if we implement it
        // For now, we'll just track the activity
      }
    }, 30000);
  }

  /**
   * Update user presence status
   */
  updateUserPresence(presence: IUserPresence): void {
    this.userPresenceMap.set(presence.userId, presence);

    // Update online users set
    const currentOnlineUsers = new Set(this.onlineUsers());

    if (presence.isOnline) {
      currentOnlineUsers.add(presence.userId);
    } else {
      currentOnlineUsers.delete(presence.userId);
    }

    this.onlineUsers.set(currentOnlineUsers);

    // Emit the update
    this.presenceUpdatesSubject.next(presence);
  }

  /**
   * Get presence status for a specific user
   */
  getUserPresence(userId: string): IUserPresence | null {
    return this.userPresenceMap.get(userId) || null;
  }

  /**
   * Check if a user is online
   */
  isUserOnline(userId: string): boolean {
    const presence = this.getUserPresence(userId);
    return presence?.isOnline || false;
  }

  /**
   * Get last seen time for a user
   */
  getUserLastSeen(userId: string): Date | null {
    const presence = this.getUserPresence(userId);
    return presence?.timestamp || null;
  }

  /**
   * Get formatted last seen text
   */
  getLastSeenText(userId: string): string {
    if (this.isUserOnline(userId)) {
      return 'Online';
    }

    const lastSeen = this.getUserLastSeen(userId);
    if (!lastSeen) {
      return 'Last seen unknown';
    }

    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();

    // Convert to minutes
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (minutes < 1440) {
      // Less than 24 hours
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }
  }

  /**
   * Get all online users
   */
  getAllOnlineUsers(): string[] {
    return Array.from(this.onlineUsers());
  }

  /**
   * Clear all presence data
   */
  clearPresenceData(): void {
    this.userPresenceMap.clear();
    this.onlineUsers.set(new Set());
  }

  /**
   * Get presence status as a color indicator
   */
  getPresenceColor(userId: string): string {
    if (this.isUserOnline(userId)) {
      return '#4ade80'; // green-400
    }

    const lastSeen = this.getUserLastSeen(userId);
    if (!lastSeen) {
      return '#6b7280'; // gray-500
    }

    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 5) {
      return '#fbbf24'; // amber-400 (recently online)
    } else {
      return '#6b7280'; // gray-500 (offline)
    }
  }

  /**
   * Get presence status text
   */
  getPresenceStatus(userId: string): 'online' | 'away' | 'offline' {
    if (this.isUserOnline(userId)) {
      return 'online';
    }

    const lastSeen = this.getUserLastSeen(userId);
    if (!lastSeen) {
      return 'offline';
    }

    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 5) {
      return 'away';
    } else {
      return 'offline';
    }
  }
}
