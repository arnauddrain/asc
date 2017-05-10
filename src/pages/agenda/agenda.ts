import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

import { DataProvider } from '../../providers/dataProvider';

@Component({
	selector: 'page-agenda',
	templateUrl: 'agenda.html'
})
export class Agenda {
	constructor(private dataProvider: DataProvider) {
	}
}