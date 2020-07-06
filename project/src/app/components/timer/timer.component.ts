import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {

  public timer: any;
  public oldDate: Date = new Date('2019-12-01');
  public oneSecond: number = 1000;
  // tslint:disable-next-line: no-empty
  constructor() {}

  public ngOnInit(): void {
	setInterval(() => {
		this.timer = this.dhms(Math.floor((new Date().getTime() - this.oldDate.getTime())));
	}, this.oneSecond);
  }

  public dhms(difference: number): {} {
  let days: number;
  let hours: number;
  let mins: number;
  let secs: number;
	// tslint:disable-next-line: no-magic-numbers
	days = Math.floor(difference / (60 * 60 * 1000 * 24) * 1);
	// tslint:disable-next-line: no-magic-numbers
	hours = Math.floor((difference % (60 * 60 * 1000 * 24)) / (60 * 60 * 1000) * 1);
	// tslint:disable-next-line: no-magic-numbers
	mins = Math.floor(((difference % (60 * 60 * 1000 * 24)) % (60 * 60 * 1000)) / (60 * 1000) * 1);
	// tslint:disable-next-line: no-magic-numbers
	secs = Math.floor((((difference % (60 * 60 * 1000 * 24)) % (60 * 60 * 1000)) % (60 * 1000)) / 1000 * 1);

	return {
		days,
		hours,
		minutes: mins,
		seconds: secs
	};
  }

}
