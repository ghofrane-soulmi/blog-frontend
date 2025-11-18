import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {
  displayedColumns: string[] = ['title', 'content', 'tags', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  roles = ['Admin', 'Editor', 'Writer', 'Reader'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('articleModal') articleModal!: TemplateRef<any>;
  @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;

  articleForm!: FormGroup;
  isEdit = false;
  editingArticleId: string | null = null;

  socket!: Socket;
  newComment: { [articleId: string]: string } = {};

  constructor(
    private articleService: ArticleService,
    private auth: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}


  ngOnInit() {
    this.loadArticles();


    this.socket = io('http://localhost:4000');
    this.socket.on('new-comment', (data: any) => {
      const article = this.dataSource.data.find(a => a._id === data.articleId);
      if (article) {
        article.comments = article.comments || [];
        article.comments.push(data.comment);
      }
    });
  }

  loadArticles() {
    this.articleService.getAll().subscribe({
      next: (articles) => {
        this.dataSource.data = articles;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => console.error(err)
    });
  }

  openDeleteDialog(article: any) {
    const dialogRef: MatDialogRef<any> = this.dialog.open(this.deleteDialog, {
      width: '400px',
      data: { title: article.title }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.articleService.delete(article._id).subscribe({
          next: () => {
            this.loadArticles();
            this.snackBar.open('Article deleted successfully', 'Close', { duration: 3000 });
          },
          error: (err) => console.error(err)
        });
      }
    });
  }

  canEdit(article: any): boolean {
    const role = article.author?.role?.toLowerCase();
    switch (role) {
      case 'admin':
      case 'editor':
        return true;
      case 'writer':
        return article.author?._id === this.auth.getCurrentUser()?._id;
      default:
        return false;
    }
  }

  canDelete(article: any): boolean {
    const user = this.auth.getCurrentUser();
    if (!user) return false;

    const role = user.role?.toLowerCase();
    return role === 'admin';
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  openModal(article?: any) {
    this.isEdit = !!article;
    this.editingArticleId = article?._id || null;

    this.articleForm = this.fb.group({
      title: [article?.title || '', Validators.required],
      content: [article?.content || '', Validators.required],
      image: [article?.image || ''],
      tags: [article?.tags?.join(', ') || '']
    });

    this.dialog.open(this.articleModal, { width: '500px' });
  }

  saveArticle() {
    if (!this.articleForm.valid) return;

    const formValue = this.articleForm.value;
    formValue.tags = formValue.tags.split(',').map((t: string) => t.trim());

    const currentUser = this.auth.getCurrentUser();
    if (currentUser) {
      formValue.author = currentUser._id;
    }

    if (this.isEdit && this.editingArticleId) {
      this.articleService.update(this.editingArticleId, formValue).subscribe({
        next: () => {
          this.loadArticles();
          this.snackBar.open('Article updated successfully', 'Close', { duration: 3000 });
        },
        error: (err) => console.error(err)
      });
    } else {
      this.articleService.create(formValue).subscribe({
        next: () => {
          this.loadArticles();
          this.snackBar.open('Article added successfully', 'Close', { duration: 3000 });
        },
        error: (err) => console.error(err)
      });
    }

    this.dialog.closeAll();
  }

  addComment(articleId: string) {
    const commentText = this.newComment[articleId];
    if (!commentText) return;

    const user = this.auth.getCurrentUser();
    const comment = {
      author: user,
      text: commentText,
      createdAt: new Date()
    };


    this.articleService.addComment(articleId, comment).subscribe(() => {
      this.newComment[articleId] = '';
    });

    this.socket.emit('add-comment', { articleId, comment });
  }
}
