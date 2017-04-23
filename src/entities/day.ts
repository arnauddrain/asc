import { DayAddiction } from './dayAddiction';

export class Day {
	constructor(
		public id: number,
		public date: Date,
		public note: string,
		public sleepless: any,
		public bedtime: string,
		public bedtimeDuration: number,
		public waking: string,
		public wakingDuration: number,
		public hypnotic: Date,
		public dayAddictions: DayAddiction[] = []) {
		if (sleepless === "false")
			this.sleepless = false;
		else
			this.sleepless = sleepless;
	}
}