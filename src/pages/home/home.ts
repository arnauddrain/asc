import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ModalController } from 'ionic-angular';

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

	constructor(public storage: Storage, public modalCtrl: ModalController, public dataProvider: DataProvider) {
		storage.ready().then(() => {
			this.initializeDate(); 
		});
 	}

 	dayNames: string[] = [
 		'Dimanche',
 		'Lundi',
 		'Mardi',
 		'Mercredi',
 		'Jeudi',
 		'Vendredi',
 		'Samedi'
 	];

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
 		return this.dayNames[date.getDay()] + ' ' + date.getDate() + ' ' + this.monthNames[date.getMonth()] + ' ' + date.getFullYear();
 	}

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
					//if we find the day in database
					if (days.length > 0 && Math.round(days[0].date.getTime() / 86400000) == Math.round(currentDate.getTime() / 86400000)) {
						this.days.unshift(days[0]);
						console.log(days[0]);
						days.shift();
					}
					else {
						let day = new Day(0, currentDate, '');
						this.dataProvider.createDay(day).catch((err) => console.log(err));
						this.days.unshift(day);
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
  		let formModal = this.modalCtrl.create(Form, {
    		day: day
    	});
    	formModal.present();
  	}

}
