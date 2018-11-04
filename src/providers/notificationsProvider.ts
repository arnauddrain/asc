import { Injectable } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Storage } from '@ionic/storage';

@Injectable()
export class NotificationsProvider {
  constructor(
    public localNotifications: LocalNotifications,
    public storage: Storage
  ) {}

  launch() {
    this.localNotifications.cancelAll().then(() => {
      return this.storage.get('notificationstime');
    })
    .then(timeString => {
      const time = timeString.split(':');
      const date = new Date();
      if (date.getHours() > time[0] || (date.getHours() === time[0] && date.getMinutes() > time[1])) {
        date.setDate(Number(date.getDate()) + 1);
      }
      date.setHours(time[0]);
      date.setMinutes(time[1]);
      date.setSeconds(0);
      this.localNotifications.schedule({
        title: 'ASC',
        text: 'Pensez à remplir votre carnet.',
        trigger: { at: date },
        every: 'day',
      });
    });
  }

  cancelAll() {
    this.localNotifications.cancelAll();
  }
}
