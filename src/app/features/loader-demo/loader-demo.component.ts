import { Component } from '@angular/core';
import { FantasyLoaderComponent } from '../../shared/ui/fantasy-loader/fantasy-loader.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader-demo',
  standalone: true,
  imports: [CommonModule, FantasyLoaderComponent],
  template: `
    <div class="demo-container">
      <h1>Fantasy Loader Demo</h1>

      <div class="demo-section">
        <h2>Small Loader</h2>
        <div class="loader-showcase">
          <app-fantasy-loader size="small" text="Loading..." [showText]="true"></app-fantasy-loader>
        </div>
      </div>

      <div class="demo-section">
        <h2>Medium Loader</h2>
        <div class="loader-showcase">
          <app-fantasy-loader
            size="medium"
            text="Entering the realm..."
            [showText]="true"
          ></app-fantasy-loader>
        </div>
      </div>

      <div class="demo-section">
        <h2>Large Loader</h2>
        <div class="loader-showcase">
          <app-fantasy-loader
            size="large"
            text="Awakening the realm..."
            [showText]="true"
          ></app-fantasy-loader>
        </div>
      </div>

      <div class="demo-section">
        <h2>Without Text</h2>
        <div class="loader-showcase">
          <app-fantasy-loader size="medium" [showText]="false"></app-fantasy-loader>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .demo-container {
        padding: 40px;
        background: linear-gradient(135deg, #18181b 0%, #1f1f23 100%);
        min-height: 100vh;
        color: white;
      }

      h1 {
        text-align: center;
        margin-bottom: 40px;
        color: #34d399;
        font-size: 2.5rem;
      }

      .demo-section {
        margin-bottom: 60px;
        text-align: center;
      }

      h2 {
        color: #34d399;
        margin-bottom: 20px;
      }

      .loader-showcase {
        padding: 40px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 12px;
        border: 1px solid rgba(52, 211, 153, 0.2);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
      }
    `,
  ],
})
export class LoaderDemoComponent {}
