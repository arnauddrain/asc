import { Addiction } from '../entities/addiction';

export class DataProviderMock {
  getAddictions() {
    return new Promise<Addiction[]>((resolve, reject) => {
      const addictions: Addiction[] = [
        new Addiction(1, 'Ecrans', true, 24, 1),
      ];
      resolve(addictions);
    });
  }
}
