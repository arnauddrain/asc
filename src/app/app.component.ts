import { Component, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events, ModalController, Nav, Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { GoogleAnalytics } from '@ionic-native/google-analytics';

import { Home } from '../pages/home/home';
import { Agenda } from '../pages/agenda/agenda';
import { About } from '../pages/about/about';
import { Settings } from '../pages/settings/settings';
import { DataProvider } from '../providers/dataProvider';
import { NotificationsProvider } from '../providers/notificationsProvider';
import { Addiction } from '../entities/addiction';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = Home;

  sleep: boolean = true;
  addictions: Addiction[] = [];

  constructor(
    public platform: Platform,
    private dataProvider: DataProvider,
    public events: Events,
    public storage: Storage,
    public modalCtrl: ModalController,
    private notifications: NotificationsProvider,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private ga: GoogleAnalytics
  ) {
      this.platform.ready().then(() => {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        this.configureNotifications();
        this.dataProvider.getAddictions()
          .then((addictions) => this.addictions = addictions)
          .catch((err) => console.log(err));
        this.configureSleep();
        this.startGa();
    });
  }

  startGa() {
    this.ga.startTrackerWithId('UA-107393916-1')
      .then(() => {
        console.log('Google analytics is ready now');
          this.ga.trackView('app');
      })
      .catch(e => console.log('Error starting GoogleAnalytics', e));
  }

  configureSleep() {
    this.storage.get('sleep')
        .then((sleep) => {
          if (sleep === null) {
            return this.storage.set('sleep', 'true').then(() => {
              this.sleep = true;
            });
          } else if (sleep === 'true' || sleep === true) {
            this.sleep = true;
          } else {
            this.sleep = false;
          }
        });
  }

  toggleSleep() {
    this.storage.set('sleep', this.sleep).then(() => {
      this.events.publish('addictions:updated');
    });
    }

  configureNotifications() {
    this.storage.get('notifications')
        .then((notifications) => {
          if (notifications === null) {
            return this.storage.set('notifications', 'true').then(() => {
              return this.storage.set('notificationstime', '10:00');
            }).then(() => {
              this.notifications.launch();
            });
          } else if (notifications === 'true') {
            this.notifications.launch();
          }
        });
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
          return this.dataProvider.dumpAll();
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
          return this.storage.set('startDate', startDate);
        })
        .then(() => {
          this.events.publish('addictions:updated');
        });
    }
}
