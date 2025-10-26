import { NgIf } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-owl-icon',
  imports: [NgIf],
  templateUrl: './owl-icon.component.html',
  styleUrl: './owl-icon.component.scss',
})
export class OwlIconComponent {
  dark = input<boolean>(false);
}
