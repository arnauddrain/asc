import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { DataProvider } from '../../providers/dataProvider';
import { Day } from '../../entities/day';

@Component({
	selector: 'page-agenda',
	templateUrl: 'agenda.html'
})
export class Agenda {
	startDate: string;
	days: Day[] = [];

 	monthNames: string[] = [
 		'Janv',
 		'Fév',
 		'Mars',
 		'Avr',
 		'Mai',
 		'Juin',
 		'Juil',
 		'Août',
 		'Sept',
 		'Oct',
 		'Nov',
 		'Déc'
 	];

	constructor(public viewCtrl: ViewController, public storage: Storage, private dataProvider: DataProvider, private screenOrientation: ScreenOrientation) {
		//FIXME
		//this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
		storage.ready().then(() => {
			this.initializeDate();
		});
	}

	formatDate(date: Date) {
		let tomorrow = new Date(date.getTime());
		tomorrow.setDate(Number(tomorrow.getDate()) + 1);
		return date.getDate() + ' / ' + tomorrow.getDate() + ' ' + this.monthNames[date.getMonth()] + '.';
	}

 	computeSleepWidth(day: Day) {
 		return (day.sleepDuration() / (24 * 60) * 100) + '%'
 	}

 	computeSleepLeft(day: Day) {
 		if (!day.bedtime) {
 			return 0;
 		}
 		let startTime = day.bedtime.split(':');
 		let time = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
 		if (parseInt(startTime[0]) < 20) {
			time += 60 * 24;
		}
		time -= 60 * 20;
		if (day.bedtimeDuration > 0) {
			time += day.bedtimeDuration;
		}
		return (time / (24 * 60) * 100) + '%';
 	}

 	computeBedtimeWidth(day: Day) {
 		return (day.bedtimeDuration / (24 * 60) * 100) + '%'
 	}

 	computeBedtimeLeft(day: Day) {
 		if (!day.bedtime) {
 			return 0;
 		}
 		let startTime = day.bedtime.split(':');
 		let time = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
 		if (parseInt(startTime[0]) < 20) {
			time += 60 * 24;
		}
		time -= 60 * 20;
		return (time / (24 * 60) * 100) + '%';
 	}

 	computeWakingWidth(day: Day) {
 		return (day.wakingDuration / (24 * 60) * 100) + '%'
 	}

 	computeWakingLeft(day: Day) {
 		if (!day.waking) {
 			return 0;
 		}
 		let startTime = day.waking.split(':');
 		let time = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
 		if (parseInt(startTime[0]) < 20) {
			time += 60 * 24;
		}
		time -= 60 * 20;
		return (time / (24 * 60) * 100) + '%';
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
						let day = new Day(0, currentDate, '', false, null, 0, null, 0, false, null);
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

  	back() {
		this.viewCtrl.dismiss();
	}
}