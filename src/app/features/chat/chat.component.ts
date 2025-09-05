// src/app/chat/chat.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  inject,
  computed,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // Needed for *ngFor, *ngIf etc.
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule here
import { ChatService } from '../../core/services/chat.service';
import { StateService } from '../../core/services/state/state.service';
import { Button } from 'primeng/button';
import { IChatMessages, IChatMessage, IParticipant } from '../../core/models/chat.model';
import { ChatAvatarComponent } from '../../shared/ui/chat-avatar/chat-avatar.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';

@Component({
  selector: 'app-chat',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, // Required for common Angular directives like *ngFor, *ngIf
    FormsModule, // Required for ngModel
    Button,
    ChatAvatarComponent,
    LoaderComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);
  private stateService = inject(StateService);
  currentUserId = computed(() => this.stateService.user()?.id || '');
  interlocutor = signal<IParticipant | null>(null);
  interlocutorProfile = computed(() => this.interlocutor()?.profile || null);
  interlocutorName = computed(
    () => this.interlocutorProfile()?.name || this.interlocutorProfile()?.email || 'Unknown',
  );

  @Input() receiverId = '';
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  messages: IChatMessage[] = [];
  newMessageContent: string = '';
  isLoading = signal(false);
  isTyping = signal(false);
  showScrollToBottom = signal(false);
  private messageSubscription!: Subscription;
  private previousMessagesSubscription!: Subscription;
  private shouldScrollToBottom = false;
  private typingTimeout: any;
  private scrollTimeout: any;
  private isUserScrolling = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.receiverId = params.get('receiverId') || '';
      if (this.currentUserId() && this.receiverId) {
        this.isLoading.set(true);
        this.chatService.connect();
        this.joinChatRoom();
        this.subscribeToMessages();
      }
      console.log('ChatComponent initialized with receiverId:', this.receiverId);
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && !this.isUserScrolling) {
      this.scrollToBottomSmooth();
      this.shouldScrollToBottom = false;
    }
  }

  /**
   * Scrolls the messages container to the bottom smoothly
   */
  private scrollToBottomSmooth(): void {
    try {
      if (this.messagesContainer?.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth',
        });
      }
    } catch (err) {
      console.warn('Could not scroll to bottom:', err);
    }
  }

  /**
   * Scrolls the messages container to the bottom instantly
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer?.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.warn('Could not scroll to bottom:', err);
    }
  }

  /**
   * Checks if the user is near the bottom of the scroll area
   */
  private isNearBottom(): boolean {
    if (!this.messagesContainer?.nativeElement) return false;

    const element = this.messagesContainer.nativeElement;
    const threshold = 100; // pixels from bottom
    return element.scrollTop + element.clientHeight >= element.scrollHeight - threshold;
  }

  /**
   * Handles scroll events to determine if auto-scroll should be enabled
   */
  onScroll(): void {
    // Mark that user is actively scrolling
    this.isUserScrolling = true;

    // Clear any existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Check if user is near bottom
    const nearBottom = this.isNearBottom();

    // Update scroll to bottom button visibility
    this.showScrollToBottom.set(!nearBottom);

    // Set timeout to detect when user stops scrolling
    this.scrollTimeout = setTimeout(() => {
      this.isUserScrolling = false;
      // Only enable auto-scroll if user is near bottom when they stop scrolling
      if (nearBottom) {
        this.shouldScrollToBottom = true;
      }
    }, 150); // 150ms delay after user stops scrolling
  }

  /**
   * Handles input changes for typing indicators
   */
  onInputChange(): void {
    if (!this.isTyping()) {
      this.isTyping.set(true);
      // Here you could emit typing status to other users via socket
    }

    // Clear existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Set timeout to stop typing indicator
    this.typingTimeout = setTimeout(() => {
      this.isTyping.set(false);
    }, 1000);
  }
  /**
   * Subscribes to incoming messages using ChatService and updates the messages array.
   */
  subscribeToMessages(): void {
    this.messageSubscription = this.chatService.onReceiveMessage().subscribe((message: any) => {
      // Check if user was near bottom before adding message
      const wasNearBottom = this.isNearBottom();

      // Add the new message to the array
      this.messages.push(message);

      // Only auto-scroll if user was near bottom or if it's their own message
      if (wasNearBottom || message.sender.id === this.currentUserId()) {
        this.shouldScrollToBottom = true;
      }

      // Play notification sound or show notification if window is not focused
      this.handleNewMessageNotification(message);
    });
  }

  /**
   * Handles notifications for new messages
   */
  private handleNewMessageNotification(message: IChatMessage): void {
    // Only show notification if the message is from the other user
    if (message.sender.id !== this.currentUserId()) {
      // You can add sound notification or browser notification here
      if (!document.hasFocus()) {
        // Browser notification when window is not focused
        if (Notification.permission === 'granted') {
          new Notification(`New message from ${message.sender.username}`, {
            body: message.content,
            icon: '/assets/icons/icon-192x192.png',
          });
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.previousMessagesSubscription) {
      this.previousMessagesSubscription.unsubscribe();
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    this.chatService.disconnect();
  }

  joinChatRoom(): void {
    this.chatService
      .joinChat(Number(this.currentUserId()), Number(this.receiverId))
      .subscribe((chatId) => {
        console.log(`Joined chat with ID: ${chatId}`);
      });

    this.previousMessagesSubscription = this.chatService
      .onPreviousMessages()
      .subscribe(({ messages, chat }: IChatMessages) => {
        const participant =
          chat.participant1?.id === this.currentUserId() ? chat.participant2 : chat.participant1;
        if (participant) {
          this.interlocutor.set(participant);
        }
        console.log('Joined chat room:', chat);
        this.messages = messages;
        this.isLoading.set(false);

        // Scroll to bottom after loading messages (use instant scroll for initial load)
        setTimeout(() => {
          this.scrollToBottom();
          // Hide the scroll to bottom button initially
          this.showScrollToBottom.set(false);
        }, 100);

        // Request notification permission
        this.requestNotificationPermission();
      });
  }

  /**
   * Requests notification permission from the user
   */
  private requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  sendMessage(): void {
    if (this.newMessageContent.trim() && this.currentUserId() && this.receiverId) {
      const messageContent = this.newMessageContent.trim();

      // Clear the input immediately for better UX
      this.newMessageContent = '';

      // Stop typing indicator
      this.isTyping.set(false);
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }

      // Send the message
      this.chatService.sendMessage({
        content: messageContent,
        senderId: Number(this.currentUserId()),
        receiverId: Number(this.receiverId),
      });

      // Always auto-scroll for sent messages
      this.shouldScrollToBottom = true;

      // Focus back to input for continuous typing
      setTimeout(() => {
        if (this.messageInput?.nativeElement) {
          this.messageInput.nativeElement.focus();
        }
      }, 0);
    }
  }

  /**
   * Handles Enter key press with Shift+Enter for new lines
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Formats timestamp for display
   */
  formatMessageTime(timestamp: string | Date): string {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  /**
   * TrackBy function for message list optimization
   */
  trackByMessageId(index: number, message: IChatMessage): any {
    return message.id || index;
  }

  /**
   * Manual scroll to bottom method (can be called from template if needed)
   */
  scrollToBottomManual(): void {
    this.isUserScrolling = false;
    this.shouldScrollToBottom = true;
    this.showScrollToBottom.set(false);
    this.scrollToBottomSmooth();
  }
}
