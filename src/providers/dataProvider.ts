import { Injectable } from '@angular/core';
import { DbProvider } from './dbProvider';

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
			this.dbProvider.get('addictions').execute()
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
			this.dbProvider.update('addictions', [['activated', String(value)]]).where('id', '=', String(id)).execute()
				.then((data: any) => {
					resolve(data);
				})
				.catch((err) => reject(err));
		});
	}

	/**************
	** Days
	***************/

	getDays() {
		return new Promise<Day[]>((resolve, reject) => {
			this.dbProvider.get('days').orderBy('date', 'desc').execute()
				.then((data: any) => {
					let days: Day[] = [];
					for (var i = 0; i < data.rows.length; i++) {
						let day = data.rows.item(i);
						days.push(new Day(day.id, day.date, true));
					}
					resolve(days);
				})
				.catch((err) => reject(err));
		});
	}
}