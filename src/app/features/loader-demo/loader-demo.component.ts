import { Component } from '@angular/core';
import { FantasyLoaderComponent } from '../../shared/ui/fantasy-loader/fantasy-loader.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader-demo',
  standalone: true,
  imports: [CommonModule, FantasyLoaderComponent],
  template: `
    <div class="demo-container">
      <h1>Epic Fantasy Loader Showcase</h1>

      <div class="demo-section">
        <h2>📏 Size Variants - Compact Design</h2>
        <div class="demo-grid size-grid">
          <div class="loader-showcase compact">
            <h3>Extra Small</h3>
            <app-fantasy-loader
              size="extra-small"
              theme="emerald"
              intensity="high"
              text="Loading..."
              [showText]="true"
            ></app-fantasy-loader>
          </div>
          <div class="loader-showcase compact">
            <h3>Small</h3>
            <app-fantasy-loader
              size="small"
              theme="sapphire"
              intensity="high"
              text="Loading..."
              [showText]="true"
            ></app-fantasy-loader>
          </div>
          <div class="loader-showcase compact">
            <h3>Medium</h3>
            <app-fantasy-loader
              size="medium"
              theme="ruby"
              intensity="high"
              text="Loading..."
              [showText]="true"
            ></app-fantasy-loader>
          </div>
          <div class="loader-showcase compact">
            <h3>Large</h3>
            <app-fantasy-loader
              size="large"
              theme="amethyst"
              intensity="high"
              text="Loading..."
              [showText]="true"
            ></app-fantasy-loader>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h2>🔥 Intensity Levels - Space Efficient</h2>
        <div class="demo-grid intensity-grid">
          <div class="loader-showcase compact">
            <h3>Low Intensity</h3>
            <app-fantasy-loader
              size="medium"
              theme="emerald"
              intensity="low"
              text="Gentle loading..."
              [showText]="true"
            ></app-fantasy-loader>
          </div>
          <div class="loader-showcase compact">
            <h3>Medium Intensity</h3>
            <app-fantasy-loader
              size="medium"
              theme="emerald"
              intensity="medium"
              text="Moderate loading..."
              [showText]="true"
            ></app-fantasy-loader>
          </div>
          <div class="loader-showcase compact">
            <h3>High Intensity</h3>
            <app-fantasy-loader
              size="medium"
              theme="emerald"
              intensity="high"
              text="Intense loading..."
              [showText]="true"
            ></app-fantasy-loader>
          </div>
          <div class="loader-showcase compact">
            <h3>Epic Intensity</h3>
            <app-fantasy-loader
              size="medium"
              theme="emerald"
              intensity="epic"
              text="Epic loading..."
              [showText]="true"
            ></app-fantasy-loader>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h2>🌟 Epic Mode - Emerald Theme</h2>
        <div class="loader-showcase epic">
          <app-fantasy-loader
            size="large"
            theme="emerald"
            intensity="epic"
            text="Loading..."
            [showText]="true"
          ></app-fantasy-loader>
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
        font-size: 3rem;
        text-shadow: 0 0 20px rgba(52, 211, 153, 0.5);
        font-weight: 700;
      }

      .demo-section {
        margin-bottom: 60px;
        text-align: center;
      }

      .demo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 40px;
      }

      .size-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }

      .intensity-grid {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 18px;
      }

      h2 {
        color: #34d399;
        margin-bottom: 30px;
        font-size: 2rem;
        text-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
      }

      h3 {
        color: #34d399;
        margin-bottom: 20px;
        font-size: 1.3rem;
      }

      .loader-showcase {
        padding: 30px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 12px;
        border: 1px solid rgba(52, 211, 153, 0.2);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 180px;
        position: relative;
        overflow: hidden;
      }

      .loader-showcase.compact {
        padding: 20px;
        min-height: 140px;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(52, 211, 153, 0.15);
      }

      .loader-showcase.epic {
        min-height: 400px;
        background: radial-gradient(
          circle at center,
          rgba(52, 211, 153, 0.1) 0%,
          rgba(0, 0, 0, 0.4) 50%,
          rgba(0, 0, 0, 0.6) 100%
        );
        border: 2px solid rgba(52, 211, 153, 0.4);
        box-shadow: 0 0 30px rgba(52, 211, 153, 0.3), inset 0 0 50px rgba(52, 211, 153, 0.1);
        flex-direction: row;
      }

      .loader-showcase::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(
          from 0deg,
          transparent 0deg,
          rgba(52, 211, 153, 0.1) 90deg,
          transparent 180deg,
          rgba(52, 211, 153, 0.1) 270deg,
          transparent 360deg
        );
        animation: showcaseRotate 20s linear infinite;
        opacity: 0.5;
      }

      @keyframes showcaseRotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class LoaderDemoComponent {}
