import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

import { DataProvider } from '../../providers/dataProvider';
import { Day } from '../../entities/day';
import { NightBreak } from '../../entities/nightBreak';

@Component({
	selector: 'page-form',
	templateUrl: 'form.html'
})
export class Form {
	day: Day;

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

	constructor(public viewCtrl: ViewController, public navParams: NavParams, private dataProvider: DataProvider) {
		this.day = navParams.get('day');
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
}
