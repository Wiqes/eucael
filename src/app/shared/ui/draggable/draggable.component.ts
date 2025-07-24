import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-draggable',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './draggable.component.html',
  styleUrls: ['./draggable.component.scss'],
})
export class DraggableComponent implements OnInit, OnDestroy {
  @ViewChild('draggableContainer', { static: true }) draggableContainer!: ElementRef;

  @Input() disabled = false;
  @Input() dragHandle: string = ''; // CSS selector for drag handle
  @Input() zIndex = 1000;

  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private initialX = 0;
  private initialY = 0;
  private dragElement!: HTMLElement;

  // Store bound function references for proper cleanup
  private boundMouseMove!: (event: MouseEvent) => void;
  private boundMouseUp!: () => void;
  private boundTouchMove!: (event: TouchEvent) => void;
  private boundTouchEnd!: () => void;

  // Store bound function references for initial event listeners
  private boundMouseDown!: (event: MouseEvent) => void;
  private boundTouchStart!: (event: TouchEvent) => void;

  ngOnInit(): void {
    this.dragElement = this.draggableContainer.nativeElement;

    // Bind event handlers once for proper cleanup
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
    this.boundTouchMove = this.onTouchMove.bind(this);
    this.boundTouchEnd = this.onTouchEnd.bind(this);

    // Bind initial event handlers
    this.boundMouseDown = this.onMouseDown.bind(this);
    this.boundTouchStart = this.onTouchStart.bind(this);

    this.setupDraggable();
  }

  ngOnDestroy(): void {
    // Clean up any remaining event listeners
    if (this.isDragging) {
      this.endDrag();
    }

    // Clean up initial event listeners
    if (this.dragHandle) {
      const handleElement = this.dragElement?.querySelector(this.dragHandle) as HTMLElement;
      if (handleElement) {
        handleElement.removeEventListener('mousedown', this.boundMouseDown);
        handleElement.removeEventListener('touchstart', this.boundTouchStart);
      }
    } else if (this.dragElement) {
      this.dragElement.removeEventListener('mousedown', this.boundMouseDown);
      this.dragElement.removeEventListener('touchstart', this.boundTouchStart);
    }
  }

  private setupDraggable(): void {
    if (this.disabled) return;

    // Set initial styles
    this.dragElement.style.position = 'absolute';
    this.dragElement.style.cursor = this.dragHandle ? 'default' : 'move';
    this.dragElement.style.zIndex = this.zIndex.toString();

    // If drag handle is specified, only that element should be draggable
    if (this.dragHandle) {
      const handleElement = this.dragElement.querySelector(this.dragHandle) as HTMLElement;
      if (handleElement) {
        handleElement.style.cursor = 'move';
        handleElement.addEventListener('mousedown', this.boundMouseDown);
        handleElement.addEventListener('touchstart', this.boundTouchStart, {
          passive: false,
        });
      }
    } else {
      // Entire element is draggable
      this.dragElement.addEventListener('mousedown', this.boundMouseDown);
      this.dragElement.addEventListener('touchstart', this.boundTouchStart, {
        passive: false,
      });
    }
  }

  private onMouseDown(event: MouseEvent): void {
    if (this.disabled) return;

    event.preventDefault();
    this.startDrag(event.clientX, event.clientY);
  }

  private onTouchStart(event: TouchEvent): void {
    if (this.disabled) return;

    event.preventDefault();
    const touch = event.touches[0];
    this.startDrag(touch.clientX, touch.clientY);
  }

  private startDrag(clientX: number, clientY: number): void {
    this.isDragging = true;
    this.startX = clientX;
    this.startY = clientY;

    const rect = this.dragElement.getBoundingClientRect();
    this.initialX = rect.left;
    this.initialY = rect.top;

    // Add global event listeners using bound functions
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    document.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    document.addEventListener('touchend', this.boundTouchEnd);

    // Increase z-index while dragging
    this.dragElement.style.zIndex = (this.zIndex + 1000).toString();
    this.dragElement.classList.add('dragging');
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.updatePosition(event.clientX, event.clientY);
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();
    const touch = event.touches[0];
    this.updatePosition(touch.clientX, touch.clientY);
  }

  private updatePosition(clientX: number, clientY: number): void {
    const deltaX = clientX - this.startX;
    const deltaY = clientY - this.startY;

    let newX = this.initialX + deltaX;
    let newY = this.initialY + deltaY;

    // No constraints - element can move freely anywhere
    this.dragElement.style.left = `${newX}px`;
    this.dragElement.style.top = `${newY}px`;
  }

  private onMouseUp(): void {
    this.endDrag();
  }

  private onTouchEnd(): void {
    this.endDrag();
  }

  private endDrag(): void {
    if (!this.isDragging) return;

    this.isDragging = false;

    // Remove global event listeners using the same bound function references
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('touchmove', this.boundTouchMove);
    document.removeEventListener('touchend', this.boundTouchEnd);

    // Reset z-index
    this.dragElement.style.zIndex = this.zIndex.toString();
    this.dragElement.classList.remove('dragging');
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    // No constraints applied on resize - element stays where it is
  }
}
