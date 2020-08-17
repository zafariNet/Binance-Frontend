import { Component, Injector, ViewChild } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { OrganizationTreeComponent } from './organization-tree.component';
import { OrganizationUnitMembersComponent } from './organization-unit-members.component';
import { OrganizationUnitRolesComponent } from './organization-unit-roles.component';
import { IBasicOrganizationUnitInfo } from './basic-organization-unit-info';
import { PageTitleService } from '@app/shared/layout/nav/pageTitleService';

@Component({
    templateUrl: './organization-units.component.html',
    animations: [appModuleAnimation()]
})
export class OrganizationUnitsComponent extends AppComponentBase {

    @ViewChild('ouMembers', {static: true}) ouMembers: OrganizationUnitMembersComponent;
    @ViewChild('ouRoles', {static: true}) ouRoles: OrganizationUnitRolesComponent;
    @ViewChild('ouTree', {static: true}) ouTree: OrganizationTreeComponent;
    organizationUnit: IBasicOrganizationUnitInfo = null;

    constructor(
        injector: Injector,
        private _pageTitleService: PageTitleService
    ) {
        super(injector);
        this._pageTitleService.pageTitle = 'OrganizationUnits';
        this._pageTitleService.pageDescription = 'OrganizationUnitsHeaderInfo';
    }

    ouSelected(event: any): void {
        this.organizationUnit = event;
        this.ouMembers.organizationUnit = event;
        this.ouRoles.organizationUnit = event;
    }
}
