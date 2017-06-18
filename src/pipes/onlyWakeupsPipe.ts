import { Pipe, PipeTransform } from '@angular/core';
import { NightBreak } from '../entities/nightBreak';

@Pipe({
    name: 'onlywakeups',
    pure: false
})
export class OnlyWakeupsPipe implements PipeTransform {
    transform(nightBreaks: NightBreak[]) {
        return nightBreaks.filter(nightBreak => nightBreak.type != 1);
    }
}