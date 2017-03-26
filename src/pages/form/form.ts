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
