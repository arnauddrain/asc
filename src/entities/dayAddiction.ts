import {Addiction} from './addiction';

export class DayAddiction {
  public morning: boolean;
  public afternoon: boolean;
  public evening: boolean;
  public night: boolean;

  constructor(
    public addiction: Addiction,
    morning: any = false,
    afternoon: any = false,
    evening: any = false,
    night: any = false,
    public value: number = 0
  ) {
    if (morning === 'false')
      this.morning = false;
    else
      this.morning = morning;
    if (afternoon === 'false')
      this.afternoon = false;
    else
      this.afternoon = afternoon;
    if (evening === 'false')
      this.evening = false;
    else
      this.evening = evening;
    if (night === 'false')
      this.night = false;
    else
      this.night = night;
  }
}
