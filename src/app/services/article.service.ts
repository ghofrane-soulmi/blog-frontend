import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = 'http://localhost:4000/api/articles';

  constructor(private http: HttpClient) {}


  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  create(article: any) {
    return this.http.post(this.apiUrl, article);
  }
  update(id: string, article: any) {
    return this.http.put(`${this.apiUrl}/${id}`, article);
  }
  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addComment(articleId: string, payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${articleId}/comments`, payload);
  }

  getComments(articleId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${articleId}/comments`);
  }
  getArticleStats(): Observable<{ _id: string, count: number }[]> {
    return this.http.get<{ _id: string, count: number }[]>(`${this.apiUrl}/stats`);
  }


}
