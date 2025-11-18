import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { provideRouter } from '@angular/router';



import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { ArticlesComponent } from './components/articles/articles.component';
import { ArticlesCardPageComponent } from './components/articles-card-page/articles-card-page.component';
import {NotificationsComponent} from './components/notifications/notifications.component';


import { AuthGuard } from './guards/auth.guards';
import { LoginGuard } from './guards/guest.guard';



export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(FormsModule),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideRouter([
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent, },
      { path: 'register', component: RegisterComponent, },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'admin/users', component: AdminUsersComponent },
      { path: 'articles', component: ArticlesComponent, canActivate: [AuthGuard] },
      { path: 'blog', component: ArticlesCardPageComponent, canActivate: [AuthGuard] },
      { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
    ])
  ]
};
