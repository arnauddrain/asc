import { Pipe, PipeTransform } from '@angular/core';
import { NightBreak } from '../entities/nightBreak';

@Pipe({
    name: 'onlynapes',
    pure: false
})
export class OnlyNapesPipe implements PipeTransform {
    transform(nightBreaks: NightBreak[]) {
        return nightBreaks.filter(nightBreak => nightBreak.type != 0);
    }
}