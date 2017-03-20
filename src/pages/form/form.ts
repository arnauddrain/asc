import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

@Component({
	selector: 'page-form',
	templateUrl: 'form.html'
})
export class Form {
	day: any;

	constructor(public navCtrl: NavController, public navParams: NavParams) {
		// If we navigated to this page, we will have an item available as a nav param
		this.day = navParams.get('day');
	}
}
