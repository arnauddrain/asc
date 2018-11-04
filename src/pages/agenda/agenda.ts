import { Component } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Storage } from '@ionic/storage';
import { ViewController } from 'ionic-angular';

import { Day } from '../../entities/day';
import { DataProvider } from '../../providers/dataProvider';

@Component({
  selector: 'page-agenda',
  templateUrl: 'agenda.html',
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
    'Déc',
  ];
  constructor(public viewCtrl: ViewController, public storage: Storage, private dataProvider: DataProvider, private screenOrientation: ScreenOrientation) {
    try {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
    } catch (e) {
      console.log('exception', e);
    }
    storage.ready().then(() => {
      this.initializeDate();
    });
  }

  formatDate(date: Date) {
    const tomorrow = new Date(date.getTime());
    tomorrow.setDate(Number(tomorrow.getDate()) + 1);
    return date.getDate() + ' / ' + tomorrow.getDate() + ' ' + this.monthNames[date.getMonth()] + '.';
  }

  getLastDate() {
    const date = new Date(this.days[this.days.length - 1].date.getTime());
    date.setDate(Number(date.getDate()) - 1);
    return date;
  }

  computeSleepWidth(day: Day) {
    if (day.sleepless || !day.sleepFilled) {
      return 0;
    }
    return (day.sleepDuration(false) / (24 * 60) * 100) + '%';
  }

  computeSleepLeft(day: Day) {
    if (day.bedtime === '') {
      return 0;
    }
    const startTime = day.bedtime.split(':');
    const endTime = day.waking.split(':');
    let time = parseInt(startTime[0], 10) * 60 + parseInt(startTime[1], 10);
    if (startTime[0] < endTime[0] || (startTime[0] === endTime[0] && startTime[1] < endTime[1])) {
      time += 60 * 24;
    }
    time -= 60 * 20;
    if (day.bedtimeDuration > 0) {
      time += day.bedtimeDuration;
    }
    return (time / (24 * 60) * 100) + '%';
  }

  computeWidth(duration: number) {
    return (duration / (24 * 60) * 100) + '%';
  }

  computeLeft(timeStart: string) {
    if (timeStart === '') {
      return 0;
    }
    const startTime = timeStart.split(':');
    let time = parseInt(startTime[0], 10) * 60 + parseInt(startTime[1], 10);
    if (parseInt(startTime[0], 10) < 20) {
      time += 60 * 24;
    }
    time -= 60 * 20;
    return (time / (24 * 60) * 100) + '%';
  }

  getPreviousDaysNightBreaks(index) {
    if (index === 0) {
      return [];
    }
    return this.days[index - 1].nightBreaks;
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
            const day = new Day(0, currentDate, '', false, false, '', 0, '', 0, false, '');
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

  back() {
    try {
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    } catch (e) {
      console.log('exception', e);
    }
    this.viewCtrl.dismiss();
  }
}
