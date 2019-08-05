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
    .then((timeString: string) => {
      const time = timeString.split(':').map(t => parseInt(t, 0));
      this.localNotifications.schedule({
        title: 'ASC',
        text: 'Pensez à remplir votre carnet.',
        trigger: { every: { hour: time[0], minute: time[1] } },
      });
    });
  }

  cancelAll() {
    this.localNotifications.cancelAll();
  }
}
