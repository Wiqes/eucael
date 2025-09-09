import { Component, computed, inject, input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { IProfile } from '../../../core/models/entities/profile.model';
import { NgForOf, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-avatar',
  imports: [AvatarModule, NgIf],
  templateUrl: './chat-avatar.component.html',
  styleUrl: './chat-avatar.component.scss',
})
export class ChatAvatarComponent {
  private router = inject(Router);
  profile = input<IProfile | null>(null);
  avatarUrl = computed(() => this.profile()?.avatarUrl || '');
  isSmall = input<boolean>(false);

  onAvatarClick(event: MouseEvent): void {
    event?.stopPropagation();
    const userId = this.profile()?.userId || 'Unknown';
    this.router.navigate(['profile', userId]);
  }

  getInitials(): string {
    const name = this.profile()?.name || '';
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  getAvatarColor(): string {
    const name = this.profile()?.name || 'Unknown';
    const colors = [
      '#FF6B6B',
      '#FFEAA7',
      '#DDA0DD',
      '#F7DC6F',
      '#BB8FCE',
      '#6C5CE7',
      '#FD79A8',
      '#636E72',
      '#FAB1A0',
      '#74B9FF',
      '#A29BFE',
      '#E17055',
      '#00BFFF',
      '#FFD700',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}
