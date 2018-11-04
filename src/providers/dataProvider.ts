import { Injectable } from '@angular/core';
import { DbProvider, DbRequest } from './dbProvider';

import { NightBreak } from '../entities/nightBreak';
import { DayAddiction } from '../entities/dayAddiction';
import { Addiction } from '../entities/addiction';
import { Day } from '../entities/day';

@Injectable()
export class DataProvider {
  constructor(public dbProvider: DbProvider) {}

  /**************
  ** Addictions
  ***************/

  getAddictions() {
    return new Promise<Addiction[]>((resolve, reject) => {
      new DbRequest(this.dbProvider).get('addictions').orderBy('id').execute()
        .then((data: any) => {
          let addictions: Addiction[] = [];
          for (var i = 0; i < data.rows.length; i++) {
            let addiction = data.rows.item(i);
            addictions.push(new Addiction(addiction.id, addiction.name, addiction.activated, addiction.maximum, addiction.step));
          }
          resolve(addictions);
        })
        .catch((err) => reject(err));
    });
  }

  setAddiction(id: number, value: boolean) {
    return new Promise<Addiction[]>((resolve, reject) => {
      new DbRequest(this.dbProvider).update('addictions', [['activated', String(value)]]).where('id', '=', String(id)).execute()
        .then((data: any) => {
          resolve(data);
        })
        .catch((err) => reject(err));
    });
  }

  createDay(day: Day) {
    return new Promise<DayAddiction[]>((resolve, reject) => {
      this.getAddictions()
        .then((addictions) => {
          addictions.forEach((addiction) => day.dayAddictions.push(new DayAddiction(addiction)));
          resolve();
        })
        .catch((err) => reject(err));
    });
  }

  saveDayAddiction(day: Day) {
    let request = new DbRequest(this.dbProvider).startTransaction();
    day.dayAddictions.forEach((dayAddiction) => {
      request.insert('dayAddictions', [
        ['id_addiction', String(dayAddiction.addiction.id)],
        ['id_day', String(day.id)],
        ['morning', String(dayAddiction.morning)],
        ['afternoon', String(dayAddiction.afternoon)],
        ['evening', String(dayAddiction.evening)],
        ['night', String(dayAddiction.night)],
        ['value', String(dayAddiction.value)]
      ]);
    });
    return request.executeTransaction();
  }

  updateDayAddiction(day: Day) {
    return new DbRequest(this.dbProvider).update('days', [
        ['note', day.note],
        ['sleepless', day.sleepless],
        ['sleep_filled2', day.sleepFilled],
        ['bedtime', day.bedtime],
        ['bedtime_duration', String(day.bedtimeDuration)],
        ['waking', day.waking],
        ['waking_duration', String(day.wakingDuration)],
        ['with_hypnotic', day.withHypnotic],
        ['hypnotic', day.hypnotic]
      ])
      .where('id', '=', String(day.id))
      .execute()
      .then((data) => {
        let transaction = new DbRequest(this.dbProvider).startTransaction();
        day.dayAddictions.forEach((dayAddiction) => {
          transaction.update('dayAddictions', [
            ['morning', String(dayAddiction.morning)],
            ['afternoon', String(dayAddiction.afternoon)],
            ['evening', String(dayAddiction.evening)],
            ['night', String(dayAddiction.night)],
            ['value', String(dayAddiction.value)]
          ]).where('id_day', '=', String(day.id)).and('id_addiction', '=', String(dayAddiction.addiction.id));
        });
        return transaction.executeTransaction();
      });
  }

  private saveNightBreaks(day: Day) {
    return new DbRequest(this.dbProvider)
      .delete('nightBreaks')
      .where('id_day', '=', String(day.id))
      .execute()
      .then(() => {
        let transaction = new DbRequest(this.dbProvider).startTransaction();
        day.nightBreaks.forEach((nightBreak) => {
          transaction.insert('nightBreaks', [
            ['id_day', String(day.id)],
            ['type', String(nightBreak.type)],
            ['time', String(nightBreak.time)],
            ['duration', String(nightBreak.duration)],
          ]);
        });
        return transaction.executeTransaction();
      });
  }

  private sqlLiteDate(date: Date): string {
    let formatedDate = date.getFullYear() + '-';
    if (date.getMonth() + 1 < 10)
      formatedDate += '0';
    formatedDate += (date.getMonth() + 1) + '-';
    if (date.getDate() < 10)
      formatedDate += '0';
    formatedDate += date.getDate();
    return formatedDate;
  }

  saveDay(day: Day) {
    return new Promise((resolve, reject) => {
      if (day.id === 0) {
        new DbRequest(this.dbProvider).insert('days', [
            ['date', this.sqlLiteDate(day.date)],
            ['note', day.note],
            ['sleepless', day.sleepless],
            ['sleep_filled2', day.sleepFilled],
            ['bedtime', day.bedtime],
            ['bedtime_duration', String(day.bedtimeDuration)],
            ['waking', day.waking],
            ['waking_duration', String(day.wakingDuration)],
            ['with_hypnotic', day.withHypnotic],
            ['hypnotic', day.hypnotic]
          ]).execute()
          .then((data: any) => {
            day.id = data.insertId;
            return this.saveDayAddiction(day);
          })
          .then(() => this.saveNightBreaks(day))
          .then(() => resolve())
          .catch((err) => reject(err));
      } else {
        this.updateDayAddiction(day)
          .then(() => this.saveNightBreaks(day))
          .then(() => resolve())
          .catch((err) => reject(err));
      }
    });
  }

  /**************
  ** Days
  ***************/

  getDays() {
    return new Promise<Day[]>((resolve, reject) => {
      new DbRequest(this.dbProvider).get('days').orderBy('date(days.date)').execute()
        .then((data: any) => {
          let days: Day[] = [];
          let indexedDays: Day[] = [];
          for (var i = 0; i < data.rows.length; i++) {
            let row = data.rows.item(i);
            let day = new Day(row.id, new Date(row.date), row.note, row.sleepless, row.sleep_filled2, row.bedtime, row.bedtime_duration, row.waking, row.waking_duration, row.with_hypnotic, row.hypnotic);
            days.push(day);
            indexedDays[day.id] = day;
          }
          new DbRequest(this.dbProvider).get('dayAddictions')
            .join('addictions', 'dayAddictions.id_addiction', 'addictions.id')
            .orderBy('id_addiction')
            .execute()
            .then((data: any) => {
              for (var i = 0; i < data.rows.length; i++) {
                let row = data.rows.item(i);
                let addiction = new Addiction(row.id_addiction, row.name, row.activated, row.maximum, row.step);
                let dayAddiction = new DayAddiction(addiction, row.morning, row.afternoon, row.evening, row.night, row.value);
                indexedDays[row.id_day].dayAddictions.push(dayAddiction);
              }
              return new DbRequest(this.dbProvider).get('nightBreaks').execute();
            })
            .then((data: any) => {
              for (var i = 0; i < data.rows.length; i++) {
                let row = data.rows.item(i);
                let nightBreak = new NightBreak(row.type, row.time, row.duration);
                indexedDays[row.id_day].nightBreaks.push(nightBreak);
              }
              resolve(days);
            })
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  /*****
  ** Remove all
  ********/

  dumpAll() {
    return new Promise((resolve, reject) => {
      return this.dbProvider.dumpAll()
        .then(() => resolve());
    });
  }
}
