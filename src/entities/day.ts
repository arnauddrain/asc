import { DayAddiction } from './dayAddiction';
import { NightBreak } from './nightBreak';

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
		public withHypnotic: any,
		public hypnotic: string,
		public dayAddictions: DayAddiction[] = [],
		public nightBreaks: NightBreak[] = []) {
		if (sleepless === "false")
			this.sleepless = false;
		else
			this.sleepless = sleepless;
		if (withHypnotic === "false")
			this.withHypnotic = false;
		else
			this.withHypnotic = withHypnotic;
	}
}