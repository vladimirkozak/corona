import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { LayoutComponent } from './components/layout/layout.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TopbarComponent } from './components/topbar/topbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { TimerComponent } from './components/timer/timer.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CountryComponent } from './components/country/country.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NewsComponent } from './components/news/news.component';
import { NewsDataService } from './services/news-data.service';

@NgModule({
	declarations: [
		LayoutComponent,
		TopbarComponent,
		FooterComponent,
		AppComponent,
		CountryComponent,
		NotFoundComponent,
		DashboardComponent,
		TimerComponent,
		NewsComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		HttpClientModule,
		AppRoutingModule,
		CommonModule,
		RouterModule,
		PerfectScrollbarModule
	],
	providers: [
		NewsDataService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
