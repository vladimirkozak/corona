import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Country } from '../models/country';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetdataService {

  private baseUrl: string = 'https://api.coronastatistics.live';

  constructor(private http: HttpClient) { }

  public getAll(type: any): Observable<Country> {
	return this.http.get<Country>(`${this.baseUrl}/countries?sort=${type}`);
  }

  public getCountry(name: any): Observable<Country> {
	return this.http.get<Country>(`${this.baseUrl}/countries/${name}`);
  }

  public getTimeline(): Observable<{}> {
	return this.http.get(`${this.baseUrl}/timeline`);
  }

  public getTimelineGlobal(): Observable<{}> {
	return this.http.get(`${this.baseUrl}/timeline/global`);
  }

  public getTimelineCountry(country: string): Observable<{}> {
	return this.http.get(`${this.baseUrl}/timeline/${country}`);
  }

}
