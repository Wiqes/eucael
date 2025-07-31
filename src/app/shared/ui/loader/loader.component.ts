import { Component } from '@angular/core';
import { FantasyLoaderComponent } from '../fantasy-loader/fantasy-loader.component';

@Component({
  selector: 'app-loader',
  imports: [FantasyLoaderComponent],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class LoaderComponent {}
