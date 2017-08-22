import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ViewController, NavParams, Platform, Events } from 'ionic-angular';

import { DataProvider } from '../../providers/dataProvider';
import { Day } from '../../entities/day';
import { NightBreak } from '../../entities/nightBreak';

@Component({
	selector: 'page-form',
	templateUrl: 'form.html'
})
export class Form {
	day: Day;
	sleep: boolean;

	Math = Math;

	incrementValues = [0, 5, 10, 15, 20, 25, 30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240];

	monthNames: string[] = [
 		'Janvier',
 		'Février',
 		'Mars',
 		'Avril',
 		'Mai',
 		'Juin',
 		'Juillet',
 		'Août',
 		'Septembre',
 		'Octobre',
 		'Novembre',
 		'Décembre'
 	];

 	formatDate(date: Date) {
 		return date.getDate() + ' ' + this.monthNames[date.getMonth()] + ' ' + date.getFullYear();
 	}

	constructor(
		public viewCtrl: ViewController,
		public navParams: NavParams,
		private dataProvider: DataProvider,
		private storage: Storage,
		private platform: Platform,
		public events: Events
	) {
		this.day = navParams.get('day');
		this.storage.get('sleep').then((sleep) => {this.sleep = sleep});
		this.platform.registerBackButtonAction(() => {this.cancel()});
	}

	addNightBreak(type: number) {
		this.day.nightBreaks.push(new NightBreak(type, "00:00", 0));
	}

	deleteNightBreak(index: number) {
		this.day.nightBreaks.splice(index, 1);
	}

	done() {
		this.dataProvider.saveDay(this.day)
			.then((day) => {
				this.viewCtrl.dismiss();
			})
			.catch((err) => console.log(err));
	}

	cancel() {
		this.events.publish('addictions:updated');
		this.viewCtrl.dismiss();
	}
}
