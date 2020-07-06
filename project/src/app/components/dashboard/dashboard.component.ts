import { Component, OnInit, OnDestroy, NgZone, ViewChild } from '@angular/core';
import COUNTRY_CODES from '../../utils/countries';
import { combineLatest } from 'rxjs';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import { GetdataService } from '../../services/getdata.service';
import * as Fuse from 'fuse.js';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { trigger, transition, animate, style, state } from '@angular/animations';

am4core.useTheme(am4themes_animated);

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	animations: [
		trigger('fadeInOutAnimation', [
			state('in', style({ opacity: 1 })),
			transition(':enter', [
				style({ opacity: 0 }),
				// tslint:disable-next-line: no-magic-numbers
				animate(600)
			])
		])
	]
})
export class DashboardComponent implements OnInit, OnDestroy {
	private pieChart: am4charts.PieChart;
	private mapChart: am4maps.MapChart;
	private lineChart: am4charts.XYChart;
	@ViewChild(PerfectScrollbarComponent) public directiveScroll: PerfectScrollbarComponent;
	public translations: any = {};
	public fuse: any;
	public fuseResults: any[];
	public timeLine: any;
	public caseData: any = [];
	public recoveriesData: any = [];
	public deathData: any = [];
	public isLoading: boolean = true;
	public isLoadingMap: boolean = true;
	public isLoadingCountries: boolean = true;
	public totalCases: number;
	public totalDeaths: number;
	public totalRecoveries: number;
	public totalCritical: number;
	public todayCases: number;
	public todayDeaths: number;
	public activeCases: number;
	public casesPer1M: number;
	public finishedCases: number;
	public sortType: string = 'todayCases';
	public countryCodes: any = COUNTRY_CODES;
	public countries: any = [];
	public hover: string = 'click to see these statistics';

	constructor(
		private zone: NgZone,
		private getDataService: GetdataService
	) { }

	public calcSum(index: string, array: [] = this.countries): number {
		let total: number = 0;
		for (let i: number = 0, _len: number = array.length; i < _len; i++) {
			total += array[i][index];
		}
		return total;
	}

	public sortData(data: [], sortBy: string): [] {
		try {
			const sortProp: string = sortBy;
			data.sort((a: number, b: number) => {
				if (a[sortProp] < b[sortProp]) {
					return -1;
				} else if (a[sortProp] > b[sortProp]) {
					return 1;
				}
				return 0;
			});
		} catch (e) {
			console.error('ERROR while sorting', e);
			return data;
		}
		return data;
	}

	public ngOnDestroy(): void {
		this.zone.runOutsideAngular(() => {
			if (this.pieChart) {
				this.pieChart.dispose();
			}
			if (this.mapChart) {
				this.mapChart.dispose();
			}
			if (this.lineChart) {
				this.lineChart.dispose();
			}
		});
	}

	public ngOnInit(): void {
		this.zone.runOutsideAngular(async () => {
			// tslint:disable-next-line: deprecation
			combineLatest(
				this.getDataService.getAll(this.sortType),
				this.getDataService.getTimelineGlobal()
			)
				.subscribe(([getAllData, getTimelineData]: [any, any]) => {
					this.isLoading = false;
					this.isLoadingCountries = false;
					this.isLoadingMap = false;
					this.countries = getAllData;
					this.totalCases = this.calcSum('cases');
					this.totalDeaths = this.calcSum('deaths');
					this.totalRecoveries = this.calcSum('recovered');
					this.totalCritical = this.calcSum('critical');
					this.todayCases = this.calcSum('todayCases');
					this.todayDeaths = this.calcSum('todayDeaths');
					this.activeCases = this.calcSum('active');
					this.casesPer1M = this.calcSum('casesPerOneMillion');
					this.finishedCases = this.totalDeaths + this.totalRecoveries;
					this.fuse = new Fuse(this.countries, {
						shouldSort: true,
						threshold: 0.6,
						location: 0,
						distance: 100,
						minMatchCharLength: 1,
						keys: [
							'country'
						]
					});
					this.timeLine = getTimelineData;
					this.loadLineChart(false);
					this.loadPieChart();

				});
		});
	}

	public searchCountries(key: boolean): void {
		if (key) {
			this.countries = this.fuse.search(key);
			if (this.directiveScroll === undefined) {
				return;
			}
			this.directiveScroll.directiveRef.scrollToTop();
			return;
		}
		this.countries = this.fuse.list;
	}

	public sortCountries(key: string, skey: string): void {
		this.isLoadingCountries = true;
		this.sortType = key;
		this.loadSorted();
	}

	public loadSorted(): void {
		this.getDataService.getAll(this.sortType).subscribe((data: {}) => {
			this.countries = data;
			this.isLoadingCountries = false;
		});
	}

	public loadPieChart(): void {
		let tempData: any = this.fuse.list.slice();
		this.sortData(tempData, 'cases');
		tempData = tempData.reverse();
		const chart: any = am4core.create('pieChart', am4charts.PieChart);
		const tempDataSlice: number = 10;
		chart.data = tempData.slice(0, tempDataSlice);
		const otherCases: [] = tempData.slice(tempDataSlice, tempData.length);
		chart.data.push({
			country: 'Other',
			cases: this.calcSum('cases', otherCases)
		});
		const pieSeries: any = chart.series.push(new am4charts.PieSeries());
		pieSeries.dataFields.value = 'cases';
		pieSeries.dataFields.category = 'country';
		pieSeries.labels.template.disabled = true;
		pieSeries.ticks.template.disabled = true;
		pieSeries.slices.template.stroke = am4core.color('#313a46');
		pieSeries.slices.template.strokeWidth = 1;
		pieSeries.slices.template.strokeOpacity = 1;
		this.pieChart = chart;
		this.loadMap('cases');
	}

	public loadLineChart(chartType: boolean): void {
		this.caseData = [];
		if (this.lineChart) {
			this.lineChart.dispose();
		}
		Object.keys(this.timeLine).forEach((key: string) => {
			this.caseData.push({
				date: new Date(key),
				cases: this.timeLine[key].cases,
				recoveries: this.timeLine[key].recovered,
				deaths: this.timeLine[key].deaths
			});
		});
		this.caseData.push({
			date: new Date().getTime(),
			cases: this.totalCases,
			recoveries: this.totalRecoveries,
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
		valueAxis.logarithmic = chartType;
		valueAxis.renderer.labels.template.fill = am4core.color('#adb5bd');
		dateAxis.renderer.labels.template.fill = am4core.color('#adb5bd');

		chart = this.createSeriesLine(chart, '#21AFDD', 'cases');
		chart = this.createSeriesLine(chart, '#10c469', 'recoveries');
		chart = this.createSeriesLine(chart, '#ff5b5b', 'deaths');

		chart.data = this.caseData;

		chart.legend = new am4charts.Legend();
		chart.legend.labels.template.fill = am4core.color('#adb5bd');

		chart.cursor = new am4charts.XYCursor();
		this.lineChart = chart;
	}

	public loadMap(option: string): void {
		this.isLoadingMap = true;
		if (this.mapChart) {
			this.mapChart.dispose();
		}
		let color: string = '#21AFDD';
		if (option === 'recovered') {
			color = '#10c469';
		} else if (option === 'critical') {
			color = '#f9c851';
		} else if (option === 'deaths') {
			color = '#ff5b5b';
		}
		const mapData: any = [];
		this.fuse.list.forEach((element: any) => {
			if (element[option] !== 0) {
				mapData.push({
					id: this.countryCodes[element.country],
					name: element.country,
					value: element[option],
					color: am4core.color(color)
				});
			}
		});

		const chartMap: any = am4core.create('worldChart', am4maps.MapChart);
		// Set map definition
		chartMap.geodata = am4geodata_worldLow;

		// Set projection
		chartMap.projection = new am4maps.projections.Miller();

		// Create map polygon series
		const strokeWidth: number = 0.5;
		const polygonSeries: any = chartMap.series.push(new am4maps.MapPolygonSeries());
		polygonSeries.exclude = ['AQ'];
		polygonSeries.useGeodata = true;
		polygonSeries.nonScalingStroke = true;
		polygonSeries.strokeWidth = strokeWidth;
		polygonSeries.calculateVisualCenter = true;

		const imageSeries: any = chartMap.series.push(new am4maps.MapImageSeries());
		imageSeries.data = mapData;
		imageSeries.dataFields.value = 'value';

		const imageTemplate: any = imageSeries.mapImages.template;
		imageTemplate.nonScaling = true;

		const circle: any = imageTemplate.createChild(am4core.Circle);
		const circleOpacity: number = 0.7;
		circle.fillOpacity = circleOpacity;
		circle.propertyFields.fill = 'color';
		circle.tooltipText = '{name}: [bold]{value}[/]';

		chartMap.events.on('ready', () => {
			this.isLoadingMap = false;
		});

		imageSeries.heatRules.push({
			target: circle,
			property: 'radius',
			min: 4,
			max: 30,
			dataField: 'value'
		});

		imageTemplate.adapter.add('latitude', (latitude: any, target: any) => {
			const polygon: any = polygonSeries.getPolygonById(target.dataItem.dataContext['id']);
			if (polygon) {
				return polygon.visualLatitude;
			}
			return latitude;
		});

		imageTemplate.adapter.add('longitude', (longitude: number, target: any) => {
			const polygon: any = polygonSeries.getPolygonById(target.dataItem.dataContext['id']);
			if (polygon) {
				return polygon.visualLongitude;
			}
			return longitude;
		});

		const polygonTemplate: any = polygonSeries.mapPolygons.template;
		polygonTemplate.tooltipText = '{name}';
		polygonTemplate.fill = am4core.color('#325a5b');
		polygonTemplate.stroke = am4core.color('#313a46');
		this.mapChart = chartMap;
	}

	public createSeriesLine(chart: any, color: any, type: any): any {
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
		const series: any = chart.series.push(new am4charts.LineSeries());
		series.dataFields.valueY = type;
		series.fill = am4core.color(color);
		series.dataFields.dateX = 'date';
		series.strokeWidth = 2;
		const minBulletDistance: number = 10;
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
