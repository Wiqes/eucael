import { Component, inject, OnInit } from '@angular/core';
import { FantasyLoaderComponent } from './fantasy-loader/fantasy-loader.component';
import { AuthTokenStateService } from '../../../core/services/state/auth-token-state.service';
import { StateService } from '../../../core/services/state/state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loader',
  imports: [FantasyLoaderComponent],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class LoaderComponent implements OnInit {
  private readonly authTokenStateService = inject(AuthTokenStateService);
  private readonly stateService = inject(StateService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const currentRoute = this.router.url;
    if (currentRoute === '/') {
      this.authTokenStateService.isRefreshing.set(false);
      this.stateService.isDataLoading.set(false);
    }
  }
}
