import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavController } from 'ionic-angular';

import { DataProvider } from '../../providers/dataProvider';
import { Form } from '../form/form';
import { Day } from '../../entities/day';

// Declare Cordova to use filesystem
declare var cordova: any;

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class Home {

	startDate: string;
	days: Day[] = [];

	/*
	** Go through all the days and look if they exists in database
	*/
	checkDays() {
		this.dataProvider.getDays()
			.then((days) => {

				let now = new Date();
				let date = new Date(this.startDate);
				while (date.getTime() <= now.getTime()) {
					let currentDate = new Date(date.getTime());
					//if we find the day in database (normalement avec le tri, ça devrait le [0] du tableau)
					if (false) {
						//
					}
					else {
						this.days.push(new Day(0, currentDate, false));
					}
					//increment the day
					date.setDate(Number(date.getDate()) + 1);
				}
			})
			.catch((err) => console.log(err));
	}

	/*
	** Get the initial day in storage and set it if it does not exists
	*/
	initializeDate() {
	  	this.storage.get("startDate")
	  		.then((startDate) => {
	  			if (!startDate) {
	  				startDate = new Date().toDateString();
	  				this.storage.set("startDate", startDate);
	  			}
	  			this.startDate = startDate;
	  			this.checkDays();
	  		})
	  		.catch((err) => console.log(err));
  	}

  	goToForm(event, day) {
	    this.navCtrl.push(Form, {
    		day: day
    	});
  	}

	constructor(public storage: Storage, public navCtrl: NavController, public dataProvider: DataProvider) {
		storage.ready().then(() => {
			this.initializeDate(); 
		});
 	}

}
