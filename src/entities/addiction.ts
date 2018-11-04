export class Addiction {
  activated: boolean;

  convertBoolean(value) {
    return value === 'false' ? false : value;
  }

  constructor(public id: number, public name: string, activated: any, public maximum: number, public step: number) {
    this.activated = this.convertBoolean(activated);
  }
}
