import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ViewController } from 'ionic-angular';

import { NotificationsProvider } from '../../providers/notificationsProvider';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class Settings {
  notifications = false;
  notificationstime = '10:00';

  constructor(public viewCtrl: ViewController, public storage: Storage, private notificationsProvider: NotificationsProvider) {
    this.configureNotifications();
  }

  convertBoolean(value) {
    return value === 'false' ? false : value;
  }

  configureNotifications() {
    this.storage.get('notifications').then(notifications => {
      this.notifications = this.convertBoolean(notifications);
    });
    this.storage.get('notificationstime').then(notificationstime => this.notificationstime = notificationstime);
  }

  toggleNotifications() {
    if (this.notifications) {
      this.storage.set('notifications', 'true');
      this.notificationsProvider.launch();
    } else {
      this.storage.set('notifications', 'false');
      this.notificationsProvider.cancelAll();
    }
  }

  updateNotificationsTime() {
    this.storage.set('notificationstime', this.notificationstime);
    this.notificationsProvider.launch();
  }

  back() {
    this.viewCtrl.dismiss();
  }
}
