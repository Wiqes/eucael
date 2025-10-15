import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { v4 as uuidv4 } from 'uuid';
import { ChatService } from '../../../core/services/chat/chat.service';
import { IUser } from '../../../core/models/entities/user.model';
import { StateService } from '../../../core/services/state/state.service';
import { InterlocutorService } from '../../../core/services/chat/interlocutor.service';
import { IChatMessage } from '../../../core/models/chat.model';
import { ChatStateService } from '../../../core/services/state/chat-state.service';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, TranslateModule, Button, FormsModule],
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss'],
})
export class MessageInputComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private chatStateService = inject(ChatStateService);
  private stateService = inject(StateService);
  private interlocutorService = inject(InterlocutorService);

  myProfile = computed(() => this.stateService.profile() || null);
  currentUserId = computed(() => this.myProfile()?.userId || '');
  interlocutor = computed(() => this.interlocutorService.interlocutor() || null);
  interlocutorProfile = computed(() => this.interlocutor()?.profile || null);
  activeChatId = input<string>('');
  receiverId = input<string>('');
  messageSent = output<IChatMessage>();
  isTyping = signal(false);
  newMessageContent = '';
  typingTimeout?: ReturnType<typeof setTimeout>;
  previousMessageContent = '';

  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  ngOnInit(): void {
    // Initialize draft message from state
    this.newMessageContent = this.chatStateService.draftMessage();
    this.previousMessageContent = this.newMessageContent;
  }

  onSendButtonMouseDown(event: Event): void {
    // Prevent the button from taking focus
    event.preventDefault();
  }

  /**
   * Handles Enter key press with Shift+Enter for new lines
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    console.log('Attempting to send message:', this.newMessageContent);
    if (this.newMessageContent.trim() && this.currentUserId() && this.receiverId()) {
      const messageContent = this.newMessageContent.trim();
      const messageId = uuidv4();
      console.log('Sending message:', messageContent);

      // Stop typing indicator when sending
      if (this.isTyping()) {
        this.isTyping.set(false);
        this.chatService.sendTypingIndicator(this.activeChatId(), false);
        if (this.typingTimeout) {
          clearTimeout(this.typingTimeout);
        }
      }

      // Clear the input immediately for better UX
      this.newMessageContent = '';
      this.previousMessageContent = '';
      this.chatStateService.clearDraftMessage();
      this.messageSent.emit({
        id: '',
        muid: messageId,
        content: messageContent,
        timestamp: new Date(),
        sender: {
          id: this.currentUserId(),
          profile: this.myProfile()!,
        } as IUser,
        receiver: {
          id: this.receiverId(),
          profile: this.interlocutorProfile(),
        } as IUser,
      });

      // Send the message
      this.chatService.sendMessage({
        content: messageContent,
        muid: messageId,
        senderId: Number(this.currentUserId()),
        receiverId: Number(this.receiverId()),
      });
    }
  }

  /**
   * Handle model change and prevent typing if it would cause scroll
   */
  onModelChange(newValue: string): void {
    // Temporarily set the new value to check if it causes overflow
    this.newMessageContent = newValue;

    // Wait for the DOM to update
    setTimeout(() => {
      const textarea = this.messageInput.nativeElement;

      // Check if content would cause scrolling
      if (textarea.scrollHeight > textarea.clientHeight) {
        // Revert to previous value
        this.newMessageContent = this.previousMessageContent;
      } else {
        // Store the current value as previous for next check
        this.previousMessageContent = this.newMessageContent;
        this.typingHandler();
      }
    }, 0);
  }

  /**
   * Handle typing input
   */
  typingHandler(): void {
    // Save draft message to state
    this.chatStateService.updateDraftMessage(this.newMessageContent);

    if (this.activeChatId()) {
      // Clear existing timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }

      // Send typing indicator
      if (!this.isTyping()) {
        this.isTyping.set(true);
        this.chatService.sendTypingIndicator(this.activeChatId(), true);
      }

      // Set timeout to stop typing indicator
      this.typingTimeout = setTimeout(() => {
        this.isTyping.set(false);
        this.chatService.sendTypingIndicator(this.activeChatId(), false);
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    // Clear timeouts
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Stop typing indicator if active
    if (this.isTyping()) {
      this.chatService.sendTypingIndicator(this.activeChatId(), false);
    }
  }
}
