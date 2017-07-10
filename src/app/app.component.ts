import { Component, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Nav, Platform, Events, ModalController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { LocalNotifications } from '@ionic-native/local-notifications';

import { Home } from '../pages/home/home';
import { Agenda } from '../pages/agenda/agenda';
import { About } from '../pages/about/about';
import { Settings } from '../pages/settings/settings';
import { DataProvider } from '../providers/dataProvider';
import { Addiction } from '../entities/addiction';

@Component({
	templateUrl: 'app.html'
})
export class MyApp {
	@ViewChild(Nav) nav: Nav;

	rootPage: any = Home;

	addictions: Addiction[] = [];

 	constructor(
 		public platform: Platform,
 		private dataProvider: DataProvider,
 		public events: Events,
 		public storage: Storage,
 		public modalCtrl: ModalController,
 		public localNotifications: LocalNotifications,
 		private statusBar: StatusBar,
 		private splashScreen: SplashScreen
 	) {
	    this.platform.ready().then(() => {
			statusBar.styleDefault();
			splashScreen.hide();
			this.configureNotifications();
			this.dataProvider.getAddictions()
				.then((addictions) => this.addictions = addictions)
				.catch((err) => console.log(err));
    	});
 	}

 	launchNotifications() {
 		this.localNotifications.cancelAll().then(() => {
 			return this.storage.get('notificationstime');
 		})
 		.then((timeString) => {
			let time = timeString.split(':');
			let date = new Date();
			if (date.getHours() > time[0] || (date.getHours() == time[0] && date.getMinutes() > time[1])) {
				date.setDate(Number(date.getDate()) + 1);
			}
			date.setHours(time[0]);
			date.setMinutes(time[1]);
			date.setSeconds(0);
			this.localNotifications.schedule({
				title: 'ASC',
				text: 'Pensez à remplir votre carnet.',
				at: date,
				every: 'day'
			});
		});
 	}

 	configureNotifications() {
 		this.storage.get('notifications')
	  		.then((notifications) => {
	  			if (notifications === null) {
	  				return this.storage.set('notifications', 'true').then(() => {
	  					return this.storage.set('notificationstime', '10:00');
	  				}).then(() => {
	  					this.launchNotifications();
	  				});
	  			} else if (notifications === 'true') {
	  				this.launchNotifications();
	  			}
	  		})
 	}

	infoChange(addiction: Addiction) {
		this.dataProvider.setAddiction(addiction.id, addiction.activated)
			.then(() => {
				this.events.publish('addictions:updated');
			});
  	}

  	goToAgenda() {
  		this.modalCtrl.create(Agenda).present();
  	}

  	goToSettings() {
  		this.modalCtrl.create(Settings).present();
  	}

  	goToAbout() {
  		this.modalCtrl.create(About).present();
  	}

  	dumpAll() {
  		this.storage.set('startDate', null)
	  		.then(() => {
	  			return this.dataProvider.dumpAll()
	  		})
	  		.then(() => {
	  			this.events.publish('addictions:updated');
	  		});
  	}

  	addDay() {
  		this.storage.get('startDate')
  			.then((startDate) => {
  				if (!startDate) {
	  				startDate = new Date().toDateString();
	  			} else {
	  				startDate = new Date(startDate);
	  			}
	  			startDate.setDate(Number(startDate.getDate()) - 1);
	  			return this.storage.set("startDate", startDate);
  			})
  			.then(() => {
  				this.events.publish('addictions:updated');
  			});
  	}
}
