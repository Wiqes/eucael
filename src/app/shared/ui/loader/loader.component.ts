import { Component, computed, inject } from '@angular/core';
import { FantasyLoaderComponent } from './fantasy-loader/fantasy-loader.component';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports: [FantasyLoaderComponent, NgIf],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class LoaderComponent {
  private readonly router = inject(Router);
  isVisiable = computed(() => this.router.url !== '/');
}
