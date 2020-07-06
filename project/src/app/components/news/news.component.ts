import { Component, OnInit } from '@angular/core';
import { NewsDataService } from 'src/app/services/news-data.service';
import { News } from 'src/app/models/news';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  public news: any = [];
  public newsList: News[] = [];
  public isLoading: boolean = true;
  public oneSecond: number = 1000;
  constructor(public newsDataService: NewsDataService) {
  this.newsDataService.loadNewslist()
  .pipe(
	delay(this.oneSecond)
  )
  .subscribe((newsList: News[]) => {
  this.initNewsList(newsList);
  this.isLoading = false;
  });
  }

  private initNewsList(newsList: News[]): void {
  this.newsList = newsList;
  }

  // tslint:disable-next-line: no-empty
  public ngOnInit(): void {}
}
