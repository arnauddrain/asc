import { Injectable } from '@angular/core';

import { Addiction } from '../entities/addiction';
import { Day } from '../entities/day';
import { DayAddiction } from '../entities/dayAddiction';
import { NightBreak } from '../entities/nightBreak';

import { DbProvider, DbRequest } from './dbProvider';

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
          const addictions: Addiction[] = [];
          for (let i = 0; i < data.rows.length; i++) {
            const addiction = data.rows.item(i);
            addictions.push(new Addiction(addiction.id, addiction.name, addiction.activated, addiction.maximum, addiction.step));
          }
          resolve(addictions);
        })
        .catch(err => reject(err));
    });
  }

  setAddiction(id: number, value: boolean) {
    return new Promise<Addiction[]>((resolve, reject) => {
      new DbRequest(this.dbProvider).update('addictions', [['activated', String(value)]]).where('id', '=', String(id)).execute()
        .then((data: any) => {
          resolve(data);
        })
        .catch(err => reject(err));
    });
  }

  createDay(day: Day) {
    return new Promise<DayAddiction[]>((resolve, reject) => {
      this.getAddictions()
        .then(addictions => {
          addictions.forEach(addiction => day.dayAddictions.push(new DayAddiction(addiction)));
          resolve();
        })
        .catch(err => reject(err));
    });
  }

  saveDayAddiction(day: Day) {
    const request = new DbRequest(this.dbProvider).startTransaction();
    day.dayAddictions.forEach(dayAddiction => {
      request.insert('dayAddictions', [
        ['id_addiction', String(dayAddiction.addiction.id)],
        ['id_day', String(day.id)],
        ['morning', String(dayAddiction.morning)],
        ['afternoon', String(dayAddiction.afternoon)],
        ['evening', String(dayAddiction.evening)],
        ['night', String(dayAddiction.night)],
        ['value', String(dayAddiction.value)],
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
        ['hypnotic', day.hypnotic],
      ])
      .where('id', '=', String(day.id))
      .execute()
      .then(data => {
        const transaction = new DbRequest(this.dbProvider).startTransaction();
        day.dayAddictions.forEach(dayAddiction => {
          transaction.update('dayAddictions', [
            ['morning', String(dayAddiction.morning)],
            ['afternoon', String(dayAddiction.afternoon)],
            ['evening', String(dayAddiction.evening)],
            ['night', String(dayAddiction.night)],
            ['value', String(dayAddiction.value)],
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
        const transaction = new DbRequest(this.dbProvider).startTransaction();
        day.nightBreaks.forEach(nightBreak => {
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
    if (date.getMonth() + 1 < 10) {
      formatedDate += '0';
    }
    formatedDate += (date.getMonth() + 1) + '-';
    if (date.getDate() < 10) {
      formatedDate += '0';
    }
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
            ['hypnotic', day.hypnotic],
          ]).execute()
          .then((data: any) => {
            day.id = data.insertId;
            return this.saveDayAddiction(day);
          })
          .then(() => this.saveNightBreaks(day))
          .then(() => resolve())
          .catch(err => reject(err));
      } else {
        this.updateDayAddiction(day)
          .then(() => this.saveNightBreaks(day))
          .then(() => resolve())
          .catch(err => reject(err));
      }
    });
  }

  /**************
  ** Days
  ***************/

  getDays() {
    return new Promise<Day[]>((resolve, reject) => {
      new DbRequest(this.dbProvider).get('days').orderBy('date(days.date)').execute()
        .then((dataDays: any) => {
          const days: Day[] = [];
          const indexedDays: Day[] = [];
          for (let i = 0; i < dataDays.rows.length; i++) {
            const row = dataDays.rows.item(i);
            const day = new Day(row.id, new Date(row.date), row.note, row.sleepless, row.sleep_filled2, row.bedtime, row.bedtime_duration, row.waking, row.waking_duration, row.with_hypnotic, row.hypnotic);
            days.push(day);
            indexedDays[day.id] = day;
          }
          new DbRequest(this.dbProvider).get('dayAddictions')
            .join('addictions', 'dayAddictions.id_addiction', 'addictions.id')
            .orderBy('id_addiction')
            .execute()
            .then((data: any) => {
              for (let i = 0; i < data.rows.length; i++) {
                const row = data.rows.item(i);
                const addiction = new Addiction(row.id_addiction, row.name, row.activated, row.maximum, row.step);
                const dayAddiction = new DayAddiction(addiction, row.morning, row.afternoon, row.evening, row.night, row.value);
                indexedDays[row.id_day].dayAddictions.push(dayAddiction);
              }
              return new DbRequest(this.dbProvider).get('nightBreaks').execute();
            })
            .then((data: any) => {
              for (let i = 0; i < data.rows.length; i++) {
                const row = data.rows.item(i);
                const nightBreak = new NightBreak(parseInt(row.type, 10), row.time, parseInt(row.duration, 10));
                indexedDays[row.id_day].nightBreaks.push(nightBreak);
              }
              resolve(days);
            })
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
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
