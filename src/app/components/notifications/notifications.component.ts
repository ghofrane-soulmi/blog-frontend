import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  displayedColumns: string[] = ['message', 'article', 'date'];
  notifications: any[] = [];
  unreadCount: number = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();

    // Listen to real-time notifications
    this.notificationService.onNewNotification().subscribe((notif: any) => {
      this.notifications.unshift(notif);
      this.unreadCount++;
    });
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe((res: any) => {
      this.notifications = res;
      this.unreadCount = res.filter((n: any) => !n.read).length;
    });
  }

}
