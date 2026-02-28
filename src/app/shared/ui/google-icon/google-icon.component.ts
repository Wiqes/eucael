import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-google-icon',
  templateUrl: './google-icon.component.html',
  styleUrls: ['./google-icon.component.scss'],
  standalone: true,
})
export class GoogleIconComponent implements OnInit {
  @Input() animate = true;

  showAnimation = false;

  ngOnInit(): void {
    if (this.animate) {
      // Small delay so the pop animation plays after the component renders
      requestAnimationFrame(() => {
        this.showAnimation = true;
      });
    }
  }
}
