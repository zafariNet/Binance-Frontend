import { Injectable } from '@angular/core';
@Injectable()
export class ColumnService {
    getUserColumns() {
        let column = {
            creationTime: [true, false, 'CreationTime'],
            name: [true, false, 'Name'],
            userName: [true, false, 'UserName'],
            surname: [true, false, 'Surname'],
            roles: [true, false, 'Roles'],
            isEmailConfirmed: [true, false, 'EmailConfirm'],
            emailAddress: [true, false, 'EmailAddress'],
            isActive: [true, false, 'IsActive'],
            phoneNumber: [false , false, 'PhoneNumber']
        };
        let result = Object.keys(column).map(function (key) {
            return [key, column[key]];
        });
        return result;

    }
}
