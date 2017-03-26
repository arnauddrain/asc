import { Injectable } from '@angular/core';
import { DbProvider, DbRequest } from './dbProvider';

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
						addictions.push(new Addiction(addiction.id, addiction.name, addiction.activated));
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
					addictions.map((addiction) => day.dayAddictions.push(new DayAddiction(addiction)));
					resolve();
				})
				.catch((err) => reject(err));
		});
	}

	saveDayAddiction(day: Day, resolve, reject) {
		let request = new DbRequest(this.dbProvider).startTransaction();
		day.dayAddictions.map((dayAddiction) => {
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
		request.executeTransaction()
			.then(() => resolve(day))
			.catch((err) => reject(err));
	}

	updateDayAddiction(day: Day, resolve, reject) {
		let request = new DbRequest(this.dbProvider).update('days', [['note', day.note]])
			.where('id', '=', String(day.id))
			.execute()
			.then((data) => {
				console.log(data);
				let request = new DbRequest(this.dbProvider).startTransaction();
				day.dayAddictions.map((dayAddiction) => {
					request.update('dayAddictions', [
						['morning', String(dayAddiction.morning)],
						['afternoon', String(dayAddiction.afternoon)],
						['evening', String(dayAddiction.evening)],
						['night', String(dayAddiction.night)],
						['value', String(dayAddiction.value)]
					]).where('id_day', '=', String(day.id)).and('id_addiction', '=', String(dayAddiction.addiction.id));
				});
				request.executeTransaction()
					.then(() => resolve(day))
					.catch((err) => reject(err));
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
				new DbRequest(this.dbProvider).insert('days', [['date', this.sqlLiteDate(day.date)], ['note', day.note]]).execute()
					.then((data: any) => {
						day.id = data.insertId;
						this.saveDayAddiction(day, resolve, reject);
					})
					.catch((err) => reject(err));
			} else {
				this.updateDayAddiction(day, resolve, reject);
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
						let day = new Day(row.id, new Date(row.date), row.note);
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
								let addiction = new Addiction(row.id_addiction, row.name, row.activated)
								let dayAddiction = new DayAddiction(addiction, row.morning, row.afternoon, row.evening, row.night, row.value);
								indexedDays[row.id_day].dayAddictions.push(dayAddiction);
							}
							resolve(days);
						})
						.catch((err) => reject(err));
				})
				.catch((err) => reject(err));
		});
	}
}