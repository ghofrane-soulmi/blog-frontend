import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';

import { UserService } from '../../services/user.service';

import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements AfterViewInit {
  displayedColumns: string[] = ['name', 'email', 'role', 'createdAt','changeRole'];

  dataSource = new MatTableDataSource<any>([]);
  roles = ['Admin', 'Editor', 'Reader', 'Writer'];
  isForbidden = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private userService: UserService , private authService:AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users: any[]) => {
        this.isForbidden = false;
        this.dataSource.data = users;
      },
      error: (err) => {
        if (err.status === 403) {
          this.isForbidden = true;
        } else {
          console.error(err);
        }
      }
    });
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }

  updateRole(user: any, newRole: string) {
    this.userService.updateUserRole(user._id, newRole).subscribe({
      next: (updatedUser: any) => {

        // 1️⃣ Mettre à jour l'utilisateur dans ta liste d'utilisateurs si besoin
        user.role = newRole;

        // 2️⃣ Mettre à jour currentUser si c'est toi
        const currentUser = this.authService.getCurrentUser();
        if (currentUser._id === user._id) {
          currentUser.role = newRole;
          this.authService.setCurrentUser(currentUser);
        }

        // 3️⃣ Mettre à jour le rôle dans tous les articles de dataSource
        this.dataSource.data.forEach(article => {
          if (article.author?._id === user._id) {
            article.author.role = newRole;
          }
        });

        // 4️⃣ Réassigner dataSource.data pour déclencher la détection Angular Material
        this.dataSource.data = [...this.dataSource.data];
      },
      error: (err) => console.error(err)
    });
  }

}
