import { DayAddiction } from './dayAddiction';
import { NightBreak } from './nightBreak';

export class Day {
  convertBoolean(value) {
    return value === 'false' ? false : value;
  }

  constructor(
    public id: number,
    public date: Date,
    public note: string,
    public sleepless: any,
    public sleepFilled: any,
    public bedtime: string,
    public bedtimeDuration: number,
    public waking: string,
    public wakingDuration: number,
    public withHypnotic: any,
    public hypnotic: string,
    public dayAddictions: DayAddiction[] = [],
    public nightBreaks: NightBreak[] = []) {
    this.sleepless = this.convertBoolean(sleepless);
    this.sleepFilled = this.convertBoolean(sleepFilled);
    this.withHypnotic = this.convertBoolean(withHypnotic);
  }

  sleepDuration(withBreaks = true): number {
    if (this.bedtime === '' || this.waking === '') {
      return 0;
    }
    const startTime = this.bedtime.split(':');
    const endTime = this.waking.split(':');
    if (endTime[0] < startTime[0] || (endTime[0] === startTime[0] && endTime[1] < startTime[1])) {
      endTime[0] = String(parseInt(endTime[0], 10) + 24);
    }
    let time = parseInt(endTime[1], 10) - parseInt(startTime[1], 10);
    time += parseInt(endTime[0], 10) * 60 - parseInt(startTime[0], 10) * 60;
    if (withBreaks) {
      this.nightBreaks.forEach(nightBreak => {
        if (nightBreak.type === 0) {
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
