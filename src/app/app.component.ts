import { Component, ViewChild } from '@angular/core';
import { EmailComposer } from '@ionic-native/email-composer';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Storage } from '@ionic/storage';
import { AlertController, Events, ModalController, Nav, Platform } from 'ionic-angular';

import { Addiction } from '../entities/addiction';
import { DayAddiction } from '../entities/dayAddiction';
import { About } from '../pages/about/about';
import { Agenda } from '../pages/agenda/agenda';
import { Home } from '../pages/home/home';
import { Settings } from '../pages/settings/settings';
import { DataProvider } from '../providers/dataProvider';
import { NotificationsProvider } from '../providers/notificationsProvider';

@Component({
  templateUrl: 'app.html',
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = Home;

  sleep = true;
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
    private ga: GoogleAnalytics,
    private email: EmailComposer,
    private alertCtrl: AlertController
  ) {
      this.platform.ready().then(() => {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        this.configureNotifications();
        this.dataProvider.getAddictions()
          .then(addictions => this.addictions = addictions)
          .catch(err => console.log(err));
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
        .then(sleep => {
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
        .then(notifications => {
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

  async export() {
    const days = await this.dataProvider.getDays();
    let fields = [
      'date',
      'sommeil rempli',
      'nuit blanche',
      'heure de coucher',
      'durée d\'endormissement',
      'heure de réveil',
      'durée avant lever',
      'hypnotique',
    ];

    const addictions = await this.dataProvider.getAddictions();
    const addictionsName = [];
    addictions.forEach((addiction: Addiction) => {
      if (addiction.activated) {
        addictionsName.push(addiction.name);
        addictionsName.push('matin');
        addictionsName.push('après-midi');
        addictionsName.push('soirée');
        addictionsName.push('nuit');
      }
    });
    fields = fields.concat(addictionsName);

    let csv = fields.join(';') + '\r\n';

    days.forEach(day => {
      csv += '"' + day.date.getDate() + ' ' + (day.date.getMonth() + 1) + ' ' + day.date.getFullYear() + '";';
      if (day.sleepFilled) {
        csv += 'oui;';
        if (day.sleepless) {
          csv += 'oui;;;;;;';
        } else {
          csv += 'non;';
          csv += day.bedtime + ';';
          csv += day.bedtimeDuration + ';';
          csv += day.waking + ';';
          csv += day.wakingDuration + ';';
          csv += (day.withHypnotic) ? day.hypnotic + ';' : 'non;';
        }
      } else {
        csv += 'non;;;;;;;';
      }
      addictions.forEach((addiction: Addiction) => {
        if (addiction.activated) {
          let result = '-;-;-;-;-;';
          day.dayAddictions.forEach((dayAddiction: DayAddiction) => {
            if (dayAddiction.addiction.name === addiction.name) {
              result = dayAddiction.value + ';';
              result += (dayAddiction.morning) ? 'oui;' : 'non;';
              result += (dayAddiction.afternoon) ? 'oui;' : 'non;';
              result += (dayAddiction.evening) ? 'oui;' : 'non;';
              result += (dayAddiction.night) ? 'oui;' : 'non;';
            }
          });
          csv += result;
        }
      });
      csv += '\r\n';
    });

    const email = {
      attachments: [
        'base64:export.csv//' + btoa(csv),
      ],
      subject: 'Export ASC',
      body: 'Voici un export des données de l\'application ASC.',
      isHtml: true,
    };

    // Send a text message using default options
    this.email.open(email);
  }

  dumpAll() {
    const alert = this.alertCtrl.create({
      title: 'Confirmation',
      message: 'Etes vous sur de vouloir tout supprimer ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            // just cancel the alert
          },
        },
        {
          text: 'Oui, tout supprimer',
          handler: () => {
            this.storage.set('startDate', undefined)
              .then(() => {
                return this.dataProvider.dumpAll();
              })
              .then(() => {
                this.events.publish('addictions:updated');
              });
          },
        },
      ],
    });
    alert.present();
  }

  addDay() {
    this.storage.get('startDate')
      .then(startDate => {
        startDate = (!startDate) ? new Date().toDateString() : new Date(startDate);
        startDate.setDate(Number(startDate.getDate()) - 1);
        return this.storage.set('startDate', startDate);
      })
      .then(() => {
        this.events.publish('addictions:updated');
      });
  }
}
