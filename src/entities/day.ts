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

	sleepDuration(withBreaks: boolean = true): number {
		if (!this.bedtime || !this.waking) {
			return 0;
		}
 		let startTime = this.bedtime.split(':');
 		let endTime = this.waking.split(':');
 		if (endTime[0] < startTime[0] || (endTime[0] == startTime[0] && endTime[1] < startTime[1])) {
 			endTime[0] = String(parseInt(endTime[0]) + 24);
 		}
 		let time = parseInt(endTime[1]) - parseInt(startTime[1]);
 		time += parseInt(endTime[0]) * 60 - parseInt(startTime[0]) * 60;
 		if (withBreaks) {	
	 		this.nightBreaks.forEach((nightBreak) => {
	 			if (nightBreak.type == 0) {
	 				time -= nightBreak.duration;
	 			} else {
	 				time += nightBreak.duration;
	 			}
	 		});
 		}
 		if (this.bedtimeDuration > 0) {
			time -= this.bedtimeDuration;
		}
 		return time;
	}
}