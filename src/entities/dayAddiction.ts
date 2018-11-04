import { Addiction } from './addiction';

export class DayAddiction {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;

  convertBoolean(value) {
    return value === 'false' ? false : value;
  }

  constructor(
    public addiction: Addiction,
    morning: any = false,
    afternoon: any = false,
    evening: any = false,
    night: any = false,
    public value = 0
  ) {
    this.morning = this.convertBoolean(morning);
    this.afternoon = this.convertBoolean(afternoon);
    this.evening = this.convertBoolean(evening);
    this.night = this.convertBoolean(night);
  }
}
