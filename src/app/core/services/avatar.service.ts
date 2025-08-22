import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AvatarService {
  selectedFile = signal<File | null>(null);
}
