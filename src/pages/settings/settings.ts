import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LocalNotifications } from '@ionic-native/local-notifications';

@Component({
	selector: 'page-settings',
	templateUrl: 'settings.html'
})
export class Settings {

	public notifications = false;
	public notificationstime = "10:00";

	constructor(public viewCtrl: ViewController, public storage: Storage, public localNotifications: LocalNotifications) {
		this.configureNotifications();
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
 		this.storage.get('notifications').then((notifications) => {
 			if (notifications === 'true') {
 				this.notifications = true;
 			} else {
 				this.notifications = false;
 			}
 		});
 		this.storage.get('notificationstime').then((notificationstime) => this.notificationstime = notificationstime);
 	}

 	toggleNotifications() {
 		if (this.notifications) {
			this.storage.set('notifications', 'true');
			this.launchNotifications();
		} else {
			this.storage.set('notifications', 'false');
			this.localNotifications.cancelAll();
		}
 	}

 	updateNotificationsTime() {
 		this.storage.set('notificationstime', this.notificationstime)
 		this.launchNotifications();
 	}

  	back() {
		this.viewCtrl.dismiss();
	}
}