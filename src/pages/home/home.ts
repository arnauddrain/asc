import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ModalController, Events } from 'ionic-angular';

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

	constructor(public storage: Storage, public modalCtrl: ModalController, public dataProvider: DataProvider, public events: Events) {
		storage.ready().then(() => {
			this.initializeDate();
			this.events.subscribe('addictions:updated', () => {
				this.initializeDate();
			});
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

 	calculateSleep(day: Day) {
 		let startTime = day.bedtime.split(':');
 		let endTime = day.waking.split(':');
 		if (endTime[0] < startTime[0] || (endTime[0] == startTime[0] && endTime[1] < startTime[1]))
 			endTime[0] = String(parseInt(endTime[0]) + 24);
 		let minutes = parseInt(endTime[1]) - parseInt(startTime[1]);
 		let retenue = (minutes < 0) ? 1 : 0;
 		minutes = Math.abs(minutes);
 		let hour = parseInt(endTime[0]) - parseInt(startTime[0]) + retenue;
 		let time = hour + "h";
 		if (minutes)
 			time += minutes;
 		return time;
 	}

 	calculateSleepTime(day: Day) {
 		let startTime = day.bedtime.split(':');
 		let endTime = day.waking.split(':');
 		if (endTime[0] < startTime[0] || (endTime[0] == startTime[0] && endTime[1] < startTime[1]))
 			endTime[0] = String(parseInt(endTime[0]) + 24);
 		let minutes = parseInt(endTime[1]) - parseInt(startTime[1]);
 		let retenue = (minutes < 0) ? 1 : 0;
 		minutes = Math.abs(minutes);
 		let hour = parseInt(endTime[0]) - parseInt(startTime[0]) + retenue;
 		return hour * 60 + minutes;
 	}

 	formatDate(date: Date) {
 		return this.dayNames[date.getDay()] + ' ' + date.getDate() + ' ' + this.monthNames[date.getMonth()] + ' ' + date.getFullYear();
 	}

	/*
	** Go through all the days and look if they exists in database
	*/
	checkDays() {
		this.dataProvider.getDays()
			.then((days) => {
				this.days = [];
				let now = new Date();
				let date = new Date(this.startDate);
				while (date.getTime() < now.getTime()) {
					let currentDate = new Date(date.getTime());
					//if we find the day in database
					if (days.length > 0 && Math.ceil(days[0].date.getTime() / 86400000) == Math.ceil(currentDate.getTime() / 86400000)) {
						this.days.unshift(days[0]);
						days.shift();
					}
					else {
						let day = new Day(0, currentDate, '', false, "21:00", 0, "07:00", 0, false, "20:00");
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
