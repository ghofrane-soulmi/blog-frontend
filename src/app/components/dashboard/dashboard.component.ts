import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Chart, registerables } from 'chart.js';
import { NotificationService } from '../../services/notification.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import {ArticleService} from '../../services/article.service';
Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  chart: any;
  unreadCount: number = 0;
  currentUser: any;

  constructor(
    private notificationService: NotificationService,
    private socketService: SocketService,
    private authService: AuthService,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser || !this.currentUser._id) {
      console.warn("No current user found, skipping socket connection.");
      return;
    }

    this.loadChartData();
    this.loadUnreadNotifications();

    this.socketService.connect(this.currentUser._id);

    this.listenRealtimeNotifications();
  }

  loadChartData() {
    this.articleService.getArticleStats().subscribe(stats => {
      const labels = stats.map(s => s._id);
      const data = stats.map(s => s.count);
      this.initChart(labels, data);
    });
  }
  initChart(labels: string[], data: number[]) {
    const ctx = document.getElementById('articlesChart') as HTMLCanvasElement;
    if (this.chart) this.chart.destroy(); // destroy previous chart if exists

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Articles Created',
            data,
            backgroundColor: '#3f51b5'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
  }

  loadUnreadNotifications() {
    this.notificationService.getNotifications().subscribe((res: any[]) => {
      this.unreadCount = res.filter(n => !n.read).length;
    });
  }

  listenRealtimeNotifications() {
    this.socketService.on('newNotification').subscribe((notification: any) => {
      this.unreadCount++;
      console.log('New notification received:', notification);

    });
  }
}
