import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { News } from '../models/news';
import { Observable, of } from 'rxjs';

@Injectable()
export class NewsDataService {

  private baseUrl: string = 'assets';
  public news: News[] = [];

  constructor(private http: HttpClient) {
  }

  public loadNewslist(): Observable<News[]> {
	  return this.http.get<News[]>(`${this.baseUrl}/news-list.json`);

  }
}
