import { Injectable } from '@angular/core';
import { SQLite } from 'ionic-native';
import { MigrationProvider } from './migrationProvider';

@Injectable()
export class DbProvider {
	db: SQLite;
	dbOpened: boolean = false;
	readyCallbacks: { (db: SQLite): void }[] = [];
	
	currentRequest: string = null;
	params: string[] = null;

	isInTransaction: boolean = false;
	transactionRequests: string[] = [];
	transactionParams: string[][] = [];

	constructor(migrationProvider: MigrationProvider) {
		this.db = new SQLite();

		console.log("Opening database..");
		this.db.openDatabase({
			name: 'mylan.db',
			location: 'default'
		}).then(() => {
			console.log("The database is open");
			migrationProvider.migrate(this.db).then(() => {
				this.dbOpened = true;
				this.readyCallbacks.map((cb) => cb(this.db));
			}, (err) => console.log("Error during migrations", err));

		}, (err) => {
			console.log("Error while opening the databse : ", err);
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

	private addRequest(request: string, params: string[]) {
		if (this.isInTransaction) {
			this.transactionRequests.push(request);
			this.transactionParams.push(params);
		} else {
			this.currentRequest = request;
			this.params = params;
		}
	}

	private completeRequest(request: string, params: string[] = null) {
		if (this.isInTransaction) {
			this.transactionRequests[this.transactionParams.length - 1] += request;
			if (params && params.length > 0) {
				this.transactionParams[this.params.length - 1] = this.transactionParams[this.params.length - 1].concat(params);
			}
		} else {
			this.currentRequest += request;
			if (params && params.length > 0) {
				this.params = this.params.concat(params);
			}
		}
	}

	get(tableName: string, params: string[] = null) {
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
		let request = 'SELECT * FROM ' + tableName + ' WHERE ' + selector[0] + ' = ?';
		this.addRequest(request, [String(selector[1])]);
		return this;
	}

	insert(tableName: string, data: [string, string][]) {
		let keys = [];
		let values = [];
		let interogations = [];
		data.map((elem) => {
			keys.push(elem[0]);				
			values.push(elem[1]);
			interogations.push('?');
		});
		let request = 'INSERT INTO ' + tableName + ' (' + keys.join(',') + ') VALUES (' + interogations.join(',') + ')';
		this.addRequest(request, values);
		return this;
	}

	update(tableName: string, data: [string, string][]) {
		let request = 'UPDATE ' + tableName + ' SET';
		let requestSets = [];
		let values = [];
		data.map((elem) => {
			requestSets.push(' ' + elem[0] + ' = ?');
			values.push(elem[1]);
		});
		request += requestSets.join(',');
		this.addRequest(request, values);
		return this;
	}

	orderBy(field: string, direction: string = 'ASC') {
		let request = ' ORDER BY ' + field;
		if (direction === 'DESC')
			request += ' DESC';
		this.completeRequest(request);
		return this;
	}

	whereIn(field: string, values: string[]) {
		let request = ' WHERE ' + field + ' IN ';
		let interogations = [];
		for (var i = 0; i < values.length; i++) {
			interogations.push('?');
		}
		request += '(' + interogations.join(',') + ')';
		this.completeRequest(request, values);
		return this;
	}

	where(field: string, operator: string, value: string) {
		let request = ' WHERE ' + field + ' ' + operator + ' ?';
		this.completeRequest(request, [value]);
		return this;
	}

	join(table: string, field1: string, field2: string) {
		let request = ' INNER JOIN ' + table + ' ON ' + field1 + ' = ' + field2;
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
	}

	executeTransaction() {
		return new Promise((resolve, reject) => {
			this.getDb().then((db: SQLite) => {
				db.transaction((tx) => {
					for (let i in this.transactionRequests) {
						tx.executeSql(this.transactionRequests[i], this.transactionParams[i]);
					}
				}).then(() => {
					this.resetTransaction();
					resolve();
				}, (err) => {
					this.resetTransaction();
					reject(err);
				});
			});
		});
	}

	private resetRequest() {

		this.currentRequest = null;
		this.params = null;
	}

	execute() {
		return new Promise((resolve, reject) => {
			if (this.currentRequest === null || this.params === null) {
				return reject("No request prepared");
			}
			this.getDb().then((db: SQLite) => {
				db.executeSql(this.currentRequest, this.params).then((data) => {
					this.resetRequest();
					resolve(data);
				}, (err) => {
					this.resetRequest();
					reject(err)
				});
			});
		});
	}
}