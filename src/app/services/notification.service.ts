import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { io } from 'socket.io-client';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private socket: any;
  private newNotification$ = new Subject<any>();


  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:4000');

    const userId = localStorage.getItem('userId');
    if (userId) this.socket.emit('joinUser', userId);

    this.socket.on('newNotification', (data: any) => {
      this.newNotification$.next(data);

      this.incrementUnreadCount();
    });
    this.loadUnreadCount();
  }


  getNotifications(): Observable<any> {
    return this.http.get('http://localhost:4000/api/notifications');
  }

  onNewNotification(): Observable<any> {
    return this.newNotification$.asObservable();
  }


  private loadUnreadCount() {
    this.getNotifications().subscribe((res: any[]) => {
      const count = res.filter(n => !n.read).length;
      this.unreadCountSubject.next(count);
    });
  }
  incrementUnreadCount() {
    const current = this.unreadCountSubject.value;
    this.unreadCountSubject.next(current + 1);
  }
}
