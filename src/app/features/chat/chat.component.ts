// src/app/chat/chat.component.ts
import { Component, OnInit, OnDestroy, Input, inject, computed } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // Needed for *ngFor, *ngIf etc.
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule here
import { ChatService } from '../../core/services/chat.service';
import { StateService } from '../../core/services/state/state.service';
import { Button } from 'primeng/button';

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: { id: string; username: string };
  receiver: { id: string; username: string };
}

@Component({
  selector: 'app-chat',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, // Required for common Angular directives like *ngFor, *ngIf
    FormsModule, // Required for ngModel
    Button,
    // If ChatComponent is directly used in routing, RouterLink, RouterOutlet might be needed
    // or if you use ActivatedRoute, but these are typically provided by `provideRouter`
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);
  private stateService = inject(StateService);
  currentUserId = computed(() => this.stateService.user()?.id || '');

  @Input() receiverId = '';

  messages: Message[] = [];
  newMessageContent: string = '';
  private messageSubscription!: Subscription;
  private previousMessagesSubscription!: Subscription;

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
    });
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
      .subscribe((prevMessages: Message[]) => {
        this.messages = prevMessages;
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
    }
  }
}
