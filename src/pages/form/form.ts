import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

import { DataProvider } from '../../providers/dataProvider';
import { Day } from '../../entities/day';

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
		// If we navigated to this page, we will have an item available as a nav param
		this.day = navParams.get('day');
		console.log(this.day);
	}

	done() {
		this.dataProvider.saveDay(this.day)
			.then((day) => {
				this.viewCtrl.dismiss();
			})
			.catch((err) => console.log(err));
	}
}
