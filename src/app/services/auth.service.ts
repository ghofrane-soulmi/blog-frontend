import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/users';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('user');
    if (user) this.currentUserSubject.next(JSON.parse(user));
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap((res: any) => {
        this.storeUser(res);
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        this.storeUser(res);
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    this.currentUserSubject.next(null);
  }

  private storeUser(res: any) {
    localStorage.setItem('user', JSON.stringify(res.user));
    localStorage.setItem('accessToken', res.tokens.accessToken);
    localStorage.setItem('refreshToken', res.tokens.refreshToken);
    this.currentUserSubject.next(res.user);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }
  setCurrentUser(user: any) {
    this.currentUserSubject.next(user);
  }
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post(`${this.apiUrl}/refresh-token`, { refreshToken }).pipe(
      tap((res: any) => {
        localStorage.setItem('accessToken', res.tokens.accessToken);
      })
    );
  }
}
