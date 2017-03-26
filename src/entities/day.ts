import { DayAddiction } from './dayAddiction';

export class Day {
	constructor(public id: number, public date: Date, public note: string, public dayAddictions: DayAddiction[] = []) {}
}