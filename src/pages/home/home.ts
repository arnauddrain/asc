import { Component } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Storage } from '@ionic/storage';
import { Events, ModalController } from 'ionic-angular';

import { Day } from '../../entities/day';
import { DataProvider } from '../../providers/dataProvider';
import { Form } from '../form/form';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class Home {
  startDate: string;
  days: Day[] = [];
  sleep: boolean;

  constructor(public storage: Storage, public modalCtrl: ModalController, public dataProvider: DataProvider, public events: Events, private screenOrientation: ScreenOrientation) {
    /*try {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    } catch (e) {
      console.log('exception', e);
    }*/
    storage.ready().then(() => {
      this.initializeDate();
      this.events.subscribe('addictions:updated', () => {
        this.initializeDate();
      });
    });
  }

  dayNames: string[] = [
    'dimanche',
    'lundi',
    'mardi',
    'mercredi',
    'jeudi',
    'vendredi',
    'samedi',
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
    'Décembre',
  ];

  getSleep(day: Day) {
    const sleep = day.sleepDuration();
    const hour = Math.floor(sleep / 60);
    const minutes = sleep % 60;
    let time = hour + 'h';
    if (minutes > 0) {
      if (minutes < 10) {
        time += '0';
      }
      time += minutes;
    }
    return time;
  }

  formatDate(date: Date) {
    return 'Journée et nuit du ' + date.getDate() + ' ' + this.monthNames[date.getMonth()];
  }

  /*
  ** Go through all the days and look if they exists in database
  */
  checkDays() {
    this.dataProvider.getDays()
      .then(days => {
        this.days = [];
        const now = new Date();
        const date = new Date(this.startDate);
        while (date.getTime() < now.getTime()) {
          const currentDate = new Date(date.getTime());
          // if we find the day in database
          if (days.length > 0 && Math.ceil(days[0].date.getTime() / 86400000) === Math.ceil(currentDate.getTime() / 86400000)) {
            this.days.unshift(days[0]);
            days.shift();
          } else {
            const day = new Day(0, currentDate, '', false, false, '21:00', 0, '07:00', 0, false, '20:00');
            this.dataProvider.createDay(day).catch(err => console.log(err));
            this.days.unshift(day);
          }
          // increment the day
          date.setDate(Number(date.getDate()) + 1);
        }
      })
      .catch(err => console.log(err));
  }

  /*
  ** Get the initial day in storage and set it if it does not exists
  */
  initializeDate() {
    this.days = [];
    this.storage.get('sleep').then(sleep => this.sleep = sleep);
    this.storage.get('startDate')
      .then(startDate => {
        if (!startDate) {
          startDate = new Date().toDateString();
          this.storage.set('startDate', startDate);
        }
        this.startDate = startDate;
        this.checkDays();
      })
      .catch(err => console.log(err));
  }

  goToForm(day) {
    const formModal = this.modalCtrl.create(Form, { day });
    formModal.onDidDismiss(() => {
      this.initializeDate();
    });
    formModal.present();
  }

}
