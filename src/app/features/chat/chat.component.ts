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
import { IChat, IChatMessages, IChatMessage, IParticipant } from '../../core/models/chat.model';
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

  @ViewChild('messagesContainer', { static: false }) private messagesContainer!: ElementRef;

  @Input() receiverId = '';

  messages: IChatMessage[] = [];
  newMessageContent: string = '';
  private messageSubscription!: Subscription;
  private previousMessagesSubscription!: Subscription;
  private shouldScrollToBottom = true;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.receiverId = params.get('receiverId') || '';
      if (this.currentUserId() && this.receiverId) {
        this.chatService.connect();
        this.joinChatRoom();
        this.subscribeToMessages();
      }
      console.log('ChatComponent initialized with receiverId:', this.receiverId);
    });
  }
  /**
   * Subscribes to incoming messages using ChatService and updates the messages array.
   */
  subscribeToMessages(): void {
    this.messageSubscription = this.chatService.onReceiveMessage().subscribe((message: any) => {
      // Optionally, you can map/transform the message to Message type if needed
      this.messages.push(message);
      this.shouldScrollToBottom = true;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.previousMessagesSubscription) {
      this.previousMessagesSubscription.unsubscribe();
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
        this.shouldScrollToBottom = true;
      });
  }

  sendMessage(): void {
    if (this.newMessageContent.trim() && this.currentUserId() && this.receiverId) {
      this.chatService.sendMessage({
        content: this.newMessageContent,
        senderId: Number(this.currentUserId()),
        receiverId: Number(this.receiverId),
      });
      this.newMessageContent = '';
      this.shouldScrollToBottom = true;
    }
  }
}
