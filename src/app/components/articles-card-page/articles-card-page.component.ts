import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';
import {NotificationService} from '../../services/notification.service';
import { io, Socket } from "socket.io-client";
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-articles-card-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './articles-card-page.component.html',
  styleUrls: ['./articles-card-page.component.scss']
})
export class ArticlesCardPageComponent implements OnInit {
  articles: any[] = [];
  newComment: { [key: string]: string } = {};
  replyText: { [key: string]: string } = {};
  currentUser: any;
  socket!: Socket;
  unreadCount: number = 0;
  constructor(private articleService: ArticleService, private authService: AuthService,  private snackBar: MatSnackBar , private notificationService: NotificationService) {}

  ngOnInit() {

    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      console.error("No current user found!");
      return;
    }

    this.loadArticles();


    this.socket = io("http://localhost:4000");

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected!");
    });


    this.socket.on("newComment", (comment: any) => {
      console.log("Received new comment:", comment);

      const articleId = typeof comment.article === 'object' ? comment.article._id : comment.article;
      const article = this.articles.find(a => a._id === articleId);

      if (article) {
        if (!comment.parent) {
          article.comments.push({ ...comment, children: [] });
        } else {
          this.addReplyToParent(article.comments, comment);
        }


        this.notificationService.incrementUnreadCount();


        this.snackBar.open('Nouveau commentaire !', 'Fermer', {
          duration: 3000
        });
      }
    });
  }


  loadArticles() {
    this.articleService.getAll().subscribe(res => {
      this.articles = res.map(a => ({
        ...a,
        showComments: false,
        comments: []
      }));
    });
  }

  toggleComments(articleId: string) {
    const article = this.articles.find(a => a._id === articleId);
    article.showComments = !article.showComments;

    if (article.showComments) {
      this.loadComments(articleId);
      this.socket.emit("joinArticle", articleId);
      console.log("Joined room for article:", articleId);
    } else {
      this.socket.emit("leaveArticle", articleId);
      console.log("Left room for article:", articleId);
    }
  }

  loadComments(articleId: string) {
    this.articleService.getComments(articleId).subscribe(res => {
      const article = this.articles.find(a => a._id === articleId);
      article.comments = res.map(c => ({ ...c, children: c.children || [] }));
    });
  }

  addComment(articleId: string, parentId?: string) {
    const text = parentId ? this.replyText[parentId] : this.newComment[articleId];
    if (!text || text.trim() === "") return;

    const payload = { text, parent: parentId || null };

    this.articleService.addComment(articleId, payload).subscribe(() => {
      if (parentId) this.replyText[parentId] = "";
      else this.newComment[articleId] = "";
      console.log("Comment added, waiting for socket update...");
    });
  }

  private addReplyToParent(comments: any[], reply: any): boolean {
    for (const c of comments) {
      if (c._id === reply.parent) {
        if (!c.children) c.children = [];
        c.children.push(reply);
        return true;
      }
      if (c.children?.length) {
        if (this.addReplyToParent(c.children, reply)) return true;
      }
    }
    return false;
  }
}
