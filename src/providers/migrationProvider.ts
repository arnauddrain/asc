import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class MigrationProvider {

  migrations: string[][] = [
    [
      'CREATE TABLE `addictions` (id INTEGER PRIMARY KEY, name VARCHAR(255) NOT NULL, activated BOOLEAN DEFAULT 0, maximum INTEGER, step INTEGER DEFAULT 1)',
      'CREATE TABLE `days` (id INTEGER PRIMARY KEY, date DATE, note TEXT, sleepless BOOLEAN, bedtime TEXT, bedtime_duration INTEGER, waking TEXT, waking_duration INTEGER, with_hypnotic BOOLEAN, hypnotic TEXT)',
      'CREATE TABLE `dayAddictions` (id_addiction INTEGER, id_day INTEGER, morning BOOLEAN, afternoon BOOLEAN, evening BOOLEAN, night BOOLEAN, value FLOAT)',
      'CREATE TABLE `nightBreaks` (id INTEGER PRIMARY KEY, id_day INTEGER, type VARCHAR(50), time TEXT, duration INTEGER)'
    ],
    [
      'INSERT INTO `addictions` (name, activated, maximum, step) VALUES \
        ("Ecrans", 1, 24, 1), \
        ("Jeux", 0, 20, 1), \
        ("Nourriture", 0, 15, 1), \
        ("Achats", 0, 500, 10), \
        ("Tabac", 0, 40, 1), \
        ("Alcool", 1, 40, 1), \
        ("Cannabis", 0, 20, 1), \
        ("Cocaine", 0, 5, 0.25), \
        ("Hors Prescription", 0, 10, 0.5)'
    ],
    [
      'UPDATE `addictions` SET name = "Depenses" WHERE name = "Achats"'
    ],
    [
      'ALTER TABLE `days` ADD sleep_filled BOOLEAN',
      'UPDATE `days` SET sleep_filled = true'
    ]
  ];

  constructor(public storage: Storage) {}

  subExecuteMigration(resolve, reject, db: SQLiteObject, id: number, index: number = 0) {
    if (index >= this.migrations[id].length) {
      resolve();
    } else {
      db.executeSql(this.migrations[id][index], [])
        .then(() => this.subExecuteMigration(resolve, reject, db, id, index + 1), (err) => reject(err));
    }
  }

  executeMigration(db: SQLiteObject, id: number) {
    return new Promise<void>((resolve, reject) => {
      this.subExecuteMigration(resolve, reject, db, id);
    });
  }

  subMigrate(resolve, reject, db: SQLiteObject) {
    this.storage.get('version').then((version) => {
      version = version || 0;
      if (version < this.migrations.length) {
        console.log('Executing migration n°' + version);
        this.executeMigration(db, version).then(() => {
          this.storage.set('version', version + 1).then(() => this.subMigrate(resolve, reject, db));
        }, (err) => reject(err));
      } else {
        console.log('Migrations completed!');
        resolve();
      }
    });
  }

  migrate(db: SQLiteObject) {
    return new Promise<void>((resolve, reject) => {
      return this.subMigrate(resolve, reject, db);
    });
  }

  reset(db: SQLiteObject) {
    return this.storage.set('version', 0)
      .then(() => this.migrate(db));
  }
}
