import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from './store/auth/auth.state';
import { Logout, CheckAuth } from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly isAuthenticated = this.store.selectSignal(AuthState.isAuthenticated);
  readonly user = this.store.selectSignal(AuthState.user);

  ngOnInit(): void {
    // Verifier l'authentification au demarrage
    this.store.dispatch(new CheckAuth());
  }

  logout(): void {
    this.store.dispatch(new Logout()).subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }
}
