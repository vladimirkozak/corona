import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { CountryComponent } from './components/country/country.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NewsComponent } from './components/news/news.component';

const routes: Routes = [
  {
  path: '',
  component: DashboardComponent
  },
  {
  path: 'country/:name',
  component : CountryComponent
  },
  {
  path: 'news',
  component : NewsComponent
  },
  {
  path: '**',
  component : NotFoundComponent
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
