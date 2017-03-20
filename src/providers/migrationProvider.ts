import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { SQLite } from 'ionic-native';

@Injectable()
export class MigrationProvider {

	migrations: string[][] = [
		[
			'CREATE TABLE `addictions` (id INTEGER PRIMARY KEY, name VARCHAR(255) NOT NULL, activated BOOLEAN DEFAULT 0)',
			'CREATE TABLE `days` (id INTEGER PRIMARY KEY, date DATE, note TEXT)',
			'CREATE TABLE `dayAddictions` (id_addiction INTEGER, id_day INTERGER, morning BOOLEAN, afternoon BOOLEAN, evening BOOLEAN, night BOOLEAN)'
		],
		[
			'INSERT INTO `addictions` (name) VALUES ("Ecrans"), ("Tabac"), ("Alcool")'
		]
	];

	constructor(public storage: Storage) {}

	subExecuteMigration(resolve, reject, db: SQLite, id: number, index: number = 0) {
		if (index >= this.migrations[id].length) {
			resolve();
		} else {
			db.executeSql(this.migrations[id][index], [])
				.then(() => this.subExecuteMigration(resolve, reject, db, id, index + 1), (err) => reject(err));
		}
	}

	executeMigration(db: SQLite, id: number) {
		return new Promise<void>((resolve, reject) => {
			this.subExecuteMigration(resolve, reject, db, id);
		});
	}

	subMigrate(resolve, reject, db: SQLite) {
		this.storage.get('version').then((version) => {
			version = version || 0;
			if (version < this.migrations.length) {
				console.log('Executing migration n°' + version);
				this.executeMigration(db, version).then(() => {
					this.storage.set('version', version + 1).then(() => this.subMigrate(resolve, reject, db));
				}, (err) => reject(err))
			} else {
				console.log('Migrations completed!');
				resolve();
			}
		});
	}

	migrate(db: SQLite) {
		return new Promise<void>((resolve, reject) => {
			this.subMigrate(resolve, reject, db);
		});
	}
}