import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import COUNTRY_CODES from '../../utils/countries';
import { ActivatedRoute } from '@angular/router';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { GetdataService } from '../../services/getdata.service';
import { combineLatest } from 'rxjs';

  @Component({
	selector: 'app-country',
	templateUrl: './country.component.html',
	styleUrls: ['./country.component.scss']
  })
  export class CountryComponent implements OnInit, OnDestroy {
	private pieChart: am4charts.PieChart;
	private lineChart: am4charts.XYChart;
	public isLoading: boolean = true;
	public timeLine: any;
	public totalCases: number = 0;
	public totalDeaths: number = 0;
	public totalRecoveries: number;
	public totalCritical: number = 0;
	public todayCases: number = 0;
	public todayDeaths: number = 0;
	public activeCases: number = 0;
	public casesPer1M: number = 0;
	public finishedCases: number = 0;
	public countryCodes: any = COUNTRY_CODES;
	public country: any;
	public translations: any = {};

	constructor(
		private route: ActivatedRoute,
		private getDataService: GetdataService,
		private zone: NgZone
		) {}

	public ngOnDestroy(): void {
	  this.zone.runOutsideAngular(() => {
		if (this.pieChart) {
		  this.pieChart.dispose();
		}
		if (this.lineChart) {
		  this.lineChart.dispose();
		}
	  });
	}

	public ngOnInit(): void {
	  let nameTimeline: string = this.route.snapshot.paramMap.get('name').toLowerCase();
	  if (nameTimeline === 'usa') {
		nameTimeline = 'us';
	  } else if (nameTimeline === 'taiwan') {
		nameTimeline = 'taiwan*';
	  } else if (nameTimeline === 'isle of man') {
		nameTimeline = 'united kingdom';
	  } else if (nameTimeline === 'aruba') {
		nameTimeline = 'netherlands';
	  } else if (nameTimeline === 'sint maarten') {
		nameTimeline = 'netherlands';
	  } else if (nameTimeline === 'st. vincent grenadines') {
		nameTimeline = 'saint vincent and the grenadines';
	  } else if (nameTimeline === 'timor-leste') {
		nameTimeline = 'East Timor';
	  } else if (nameTimeline === 'montserrat') {
		nameTimeline = 'united kingdom';
	  } else if (nameTimeline === 'gambia') {
		nameTimeline = 'gambia, the';
	  } else if (nameTimeline === 'cayman islands') {
		nameTimeline = 'united kingdom';
	  } else if (nameTimeline === 'bermuda') {
		nameTimeline = 'united kingdom';
	  } else if (nameTimeline === 'greenland') {
		nameTimeline = 'denmark';
	  } else if (nameTimeline === 'st. barth') {
		nameTimeline = 'saint barthelemy';
	  } else if (nameTimeline === 'congo') {
		nameTimeline = 'congo (brazzaville)';
	  } else if (nameTimeline === 'saint martin') {
		nameTimeline = 'france';
	  } else if (nameTimeline === 'gibraltar') {
		nameTimeline = 'united kingdom';
	  } else if (nameTimeline === 'mayotte') {
		nameTimeline = 'france';
	  } else if (nameTimeline === 'bahamas') {
		nameTimeline = 'bahamas, the';
	  } else if (nameTimeline === 'french guiana') {
		nameTimeline = 'france';
	  } else if (nameTimeline === 'u.s. virgin islands') {
		nameTimeline = 'us';
	  } else if (nameTimeline === 'curaçao') {
		nameTimeline = 'netherlands';
	  } else if (nameTimeline === 'puerto rico') {
		nameTimeline = 'us';
	  } else if (nameTimeline === 'french polynesia') {
		nameTimeline = 'france';
	  } else if (nameTimeline === 'ivory coast') {
		nameTimeline = 'Cote d\'Ivoire';
	  } else if (nameTimeline === 'macao') {
		nameTimeline = 'china';
	  } else if (nameTimeline === 'drc') {
		nameTimeline = 'congo (kinshasa)';
	  } else if (nameTimeline === 'channel islands') {
		nameTimeline = 'united kingdom';
	  } else if (nameTimeline === 'réunion') {
		nameTimeline = 'france';
	  } else if (nameTimeline === 'guadeloupe') {
		nameTimeline = 'france';
	  } else if (nameTimeline === 'faeroe islands') {
		nameTimeline = 'Denmark';
	  } else if (nameTimeline === 'uae') {
		nameTimeline = 'United Arab Emirates';
	  } else if (nameTimeline === 'diamond princess') {
		nameTimeline = 'australia';
	  } else if (nameTimeline === 'hong kong') {
		nameTimeline = 'china';
	  } else if (nameTimeline === 'uk') {
		nameTimeline = 'united kingdom';
	  } else if (nameTimeline === 'car') {
		nameTimeline = 'central african republic';
	  }
	  this.zone.runOutsideAngular(() => {
		// tslint:disable-next-line: deprecation
		combineLatest(
		  this.getDataService.getCountry(this.route.snapshot.paramMap.get('name')),
		  this.getDataService.getTimelineCountry(nameTimeline)
		  )
		  .subscribe(([getAllData, getTimelineData]: [any, any]) => {
			this.isLoading = false;
			this.country = getAllData;
			this.totalCases = getAllData['cases'];
			this.totalDeaths = getAllData['deaths'];
			this.totalRecoveries = getAllData['recovered'];
			this.totalCritical = getAllData['critical'];
			this.todayCases = getAllData['todayCases'];
			this.todayDeaths = getAllData['todayDeaths'];
			this.activeCases = getAllData['active'];
			this.casesPer1M = getAllData['casesPerOneMillion'];
			this.finishedCases = this.totalDeaths + this.totalRecoveries;
			this.timeLine = getTimelineData;
			this.loadPieChart();
			this.loadLineChart();
		  });
	  });
	}

	public loadLineChart(): void {
	  let caseData: any = [];
	  if (!this.timeLine.multiple) {
		caseData = this.timeLine.data.timeline;
	  } else {
		const data: {} = {};
		this.timeLine.data.forEach(async (element: any) => {
		  element.timeline.forEach(async (o: any) => {
			if (!data.hasOwnProperty(o.date)) {
			  data[o.date] = {};
			  data[o.date]['cases'] = 0;
			  data[o.date]['deaths'] = 0;
			  data[o.date]['recovered'] = 0;
			}
			data[o.date].cases += parseInt(o.cases, 10);
			data[o.date].deaths += parseInt(o.deaths, 10);
			data[o.date].recovered += parseInt(o.recovered, 10);
		  });
		});
		Object.keys(data).forEach((key: string) => {
		  caseData.push({
			date: new Date(key),
			cases: data[key].cases,
			recovered: data[key].recovered,
			deaths: data[key].deaths
		  });
		});
	  }
	  caseData.push({
		date: new Date().getTime(),
		cases: this.totalCases,
		recovered: this.totalRecoveries,
		deaths: this.totalDeaths
	  });
	  let chart: any = am4core.create('lineChart', am4charts.XYChart);
	  chart.numberFormatter.numberFormat = '#a';
	  chart.numberFormatter.bigNumberPrefixes = [
		{ number: 1e+3, suffix: 'K' },
		{ number: 1e+6, suffix: 'M' },
		{ number: 1e+9, suffix: 'B' }
	  ];

	  // Create axes
	  const minGridDistance: number = 50;
	  const dateAxis: any = chart.xAxes.push(new am4charts.DateAxis());
	  dateAxis.renderer.minGridDistance = minGridDistance;

	  const valueAxis: any = chart.yAxes.push(new am4charts.ValueAxis());

	  valueAxis.renderer.labels.template.fill = am4core.color('#adb5bd');
	  dateAxis.renderer.labels.template.fill = am4core.color('#adb5bd');

	  chart = this.createSeriesLine(chart, '#21AFDD', 'cases');
	  chart = this.createSeriesLine(chart, '#10c469', 'recovered');
	  chart = this.createSeriesLine(chart, '#ff5b5b', 'deaths');

	  chart.data = caseData;

	  chart.legend = new am4charts.Legend();
	  chart.legend.labels.template.fill = am4core.color('#adb5bd');

	  chart.cursor = new am4charts.XYCursor();

	  this.lineChart = chart;
	}
	public loadPieChart(): void {
	  const chart: any = am4core.create('pieChart', am4charts.PieChart);
	  chart.data.push({
		type: 'Recoveries',
		number: this.totalRecoveries,
		color: am4core.color('#10c469')
	  });
	  chart.data.push({
		type: 'Deaths',
		number: this.totalDeaths,
		color: am4core.color('#ff5b5b')
	  });
	  chart.data.push({
		type: 'Critical',
		number: this.totalCritical,
		color: am4core.color('#f9c851')
	  });
	  const pieSeries: any = chart.series.push(new am4charts.PieSeries());
	  pieSeries.dataFields.value = 'number';
	  pieSeries.dataFields.category = 'type';
	  pieSeries.labels.template.disabled = true;
	  pieSeries.ticks.template.disabled = true;
	  pieSeries.slices.template.propertyFields.fill = 'color';
	  pieSeries.slices.template.stroke = am4core.color('#313a46');
	  pieSeries.slices.template.strokeWidth = 1;
	  pieSeries.slices.template.strokeOpacity = 1;
	  this.pieChart = chart;
	}

	public createSeriesLine(chart: any, color: string, type: any): any {
	  let name: null = null;
	  if (type === 'cases') {
		name = this.translations.cases;
	  } else if (type === 'recoveries') {
		name = this.translations.recovered;
	  } else if (type === 'deaths') {
		name = this.translations.deaths;
	  }
	  // tslint:disable-next-line: strict-boolean-expressions
	  if (!name) {
		name = type.charAt(0).toUpperCase() + type.slice(1);
	  }
	  const minBulletDistance: number = 10;
	  const series: any = chart.series.push(new am4charts.LineSeries());
	  series.dataFields.valueY = type;
	  series.fill = am4core.color(color);
	  series.dataFields.dateX = 'date';
	  series.strokeWidth = 2;
	  series.minBulletDistance = minBulletDistance;
	  series.tooltipText = '{valueY} ' + name;
	  series.tooltip.pointerOrientation = 'vertical';
	  const cornerRadius: number = 20;
	  series.tooltip.background.cornerRadius = cornerRadius;
	  const fillOpacity: number = 0.5;
	  series.tooltip.background.fillOpacity = fillOpacity;

	  series.stroke = am4core.color(color);
	  series.legendSettings.labelText = name;
	  series.tooltip.autoTextColor = false;
	  series.tooltip.label.fill = am4core.color('#282e38');
	  return chart;
	}

  }
