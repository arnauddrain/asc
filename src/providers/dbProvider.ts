import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Platform } from 'ionic-angular';

import { MigrationProvider } from './migrationProvider';

@Injectable()
export class DbProvider {
  db: SQLiteObject;
  dbOpened = false;
  readyCallbacks: ((db: SQLiteObject) => void)[] = [];

  constructor(private sqlite: SQLite, private migrationProvider: MigrationProvider, public platform: Platform) {
    this.platform.ready().then(() => {
      console.log('Opening database..');
      this.sqlite.create({
        name: 'mylan.db',
        location: 'default',
      }).then((db: SQLiteObject) => {
        console.log('The database is open');
        this.db = db;
        migrationProvider.migrate(this.db).then(() => {
          this.dbOpened = true;
          this.readyCallbacks.map(cb => cb(this.db));
        }, err => console.log('Error during migrations', err));

      }, err => {
        console.log('Error while opening the database : ', err);
      });
    });
  }

  getDb() {
    return new Promise((resolve, reject) => {
      if (this.dbOpened) {
        resolve(this.db);
      } else {
        this.readyCallbacks.push(resolve);
      }
    });
  }

  dumpAll() {
    return this.getDb()
      .then((db: SQLiteObject) => {
        return db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS addictions');
          tx.executeSql('DROP TABLE IF EXISTS days');
          tx.executeSql('DROP TABLE IF EXISTS dayAddictions');
          tx.executeSql('DROP TABLE IF EXISTS nightBreaks');
        }).then(() => {
          return this.migrationProvider.reset(db);
        });
      });
  }
}

@Injectable()
export class DbRequest {
  currentRequest: string = undefined;
  params: string[] = undefined;

  isInTransaction = false;
  transactionRequests: string[] = [];
  transactionParams: string[][] = [];

  constructor(private dbProvider: DbProvider) {}

  private addRequest(request: string, params: string[] = []) {
    if (this.isInTransaction) {
      this.transactionRequests.push(request);
      this.transactionParams.push(params);
    } else {
      this.currentRequest = request;
      this.params = params;
    }
  }

  private completeRequest(request: string, params?: string[]) {
    if (this.isInTransaction) {
      this.transactionRequests[this.transactionParams.length - 1] += request;
      if (params && params.length > 0) {
        this.transactionParams[this.transactionParams.length - 1] = this.transactionParams[this.transactionParams.length - 1].concat(params);
      }
    } else {
      this.currentRequest += request;
      if (params && params.length > 0) {
        this.params = this.params.concat(params);
      }
    }
  }

  get(tableName: string, params?: string[]) {
    let request = 'SELECT ';
    if (params) {
      request += params.join(',');
    } else {
      request += '*';
    }
    request += ' FROM ' + tableName;
    this.addRequest(request, []);
    return this;
  }

  getFirst(tableName: string, selector: [string, string]) {
    const request = 'SELECT * FROM ' + tableName + ' WHERE ' + selector[0] + ' = ?';
    this.addRequest(request, [String(selector[1])]);
    return this;
  }

  delete(tableName: string) {
    this.addRequest('DELETE FROM ' + tableName);
    return this;
  }

  insert(tableName: string, data: [string, string][]) {
    const keys = [];
    const values = [];
    const interogations = [];
    data.map(elem => {
      keys.push(elem[0]);
      values.push(elem[1]);
      interogations.push('?');
    });
    const request = 'INSERT INTO ' + tableName + ' (' + keys.join(',') + ') VALUES (' + interogations.join(',') + ')';
    this.addRequest(request, values);
    return this;
  }

  update(tableName: string, data: [string, string][]) {
    let request = 'UPDATE ' + tableName + ' SET';
    const requestSets = [];
    const values = [];
    data.map(elem => {
      requestSets.push(' ' + elem[0] + ' = ?');
      values.push(elem[1]);
    });
    request += requestSets.join(',');
    this.addRequest(request, values);
    return this;
  }

  orderBy(field: string, direction = 'ASC') {
    let request = ' ORDER BY ' + field;
    if (direction === 'DESC') {
      request += ' DESC';
    }
    this.completeRequest(request);
    return this;
  }

  whereIn(field: string, values: string[]) {
    let request = ' WHERE ' + field + ' IN ';
    const interogations = [];
    for (const i of values) {
      interogations.push('?');
    }
    request += '(' + interogations.join(',') + ')';
    this.completeRequest(request, values);
    return this;
  }

  where(field: string, operator: string, value: string) {
    const request = ' WHERE ' + field + ' ' + operator + ' ?';
    this.completeRequest(request, [value]);
    return this;
  }

  and(field: string, operator: string, value: string) {
    const request = ' AND ' + field + ' ' + operator + ' ?';
    this.completeRequest(request, [value]);
    return this;
  }

  join(table: string, field1: string, field2: string) {
    const request = ' INNER JOIN ' + table + ' ON ' + field1 + ' = ' + field2;
    this.completeRequest(request);
    return this;
  }

  groupBy(field: string) {
    this.completeRequest(' GROUP BY ' + field);
    return this;
  }

  private resetTransaction() {
    this.isInTransaction = false;
    this.transactionRequests = [];
    this.transactionParams = [];
  }

  startTransaction() {
    this.isInTransaction = true;
    return this;
  }

  executeTransaction() {
    return new Promise((resolve, reject) => {
      this.dbProvider.getDb().then((db: SQLiteObject) => {
        db.transaction(tx => {
          for (const i of Object.keys(this.transactionRequests)) {
            tx.executeSql(this.transactionRequests[i], this.transactionParams[i]);
          }
        }).then(() => {
          this.resetTransaction();
          resolve();
        }, err => {
          this.resetTransaction();
          reject(err);
        });
      });
    });
  }

  private resetRequest() {
    this.currentRequest = undefined;
    this.params = undefined;
  }

  execute() {
    return new Promise((resolve, reject) => {
      if (this.currentRequest === undefined || this.params === undefined) {
        return reject('No request prepared');
      }
      this.dbProvider.getDb().then((db: SQLiteObject) => {
        db.executeSql(this.currentRequest, this.params).then(data => {
          this.resetRequest();
          resolve(data);
        }, err => {
          this.resetRequest();
          reject(err);
        });
      });
    });
  }
}
