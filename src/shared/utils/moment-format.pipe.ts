import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'momentFormat' })
export class MomentFormatPipe implements PipeTransform {
    transform(
        value: moment.MomentInput,
        format: string,
        reverse: boolean = true
    ) {
        if (!value) {
            return '';
        }

        let result = moment(value).format(format);
        if (reverse) {
            let temp = result.split('/');
            result = temp.reverse().join('/');
        }
        return result;
    }
}
