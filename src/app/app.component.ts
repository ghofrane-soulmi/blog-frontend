import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { NotificationService } from './services/notification.service';
import { AuthService } from './services/auth.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  unreadCount$!: Observable<number>;
  currentUser: any = null;
  userName: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {
    this.unreadCount$ = this.notificationService.unreadCount$;
  }

  ngOnInit() {
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        console.log('App Component - User changed:', user);
        this.currentUser = user;
        if (user) {
          this.userName = user.name || user.username || user.email || 'User';
          console.log('App Component - User name set to:', this.userName);
        } else {
          this.userName = '';
        }
      });


    this.unreadCount$.subscribe(count => {
      console.log('App Component - Unread count changed to:', count);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showNavbar(): boolean {
    return !['/login', '/register'].includes(this.router.url);
  }
}
