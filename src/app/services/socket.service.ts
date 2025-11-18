import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;

  connect(userId: string) {
    this.socket = io(environment.socketUrl);
    this.socket.emit('joinUser', userId);
  }

  on(event: string): Observable<any> {
    return new Observable(observer => {
      if (!this.socket) return;
      this.socket.on(event, (data: any) => observer.next(data));
    });
  }

  emit(event: string, data: any) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }
}
