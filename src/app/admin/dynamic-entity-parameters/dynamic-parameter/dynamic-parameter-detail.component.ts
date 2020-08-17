import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CreateOrEditDynamicParameterModalComponent } from './create-or-edit-dynamic-parameter-modal.component';
import { DynamicParameterDto, DynamicParameterServiceProxy } from '@shared/service-proxies/service-proxies';
import { Router, ActivatedRoute } from '@angular/router';
import { InputTypeConfigurationService } from '@app/shared/common/input-types/input-type-configuration.service';
import { BreadcrumbItem } from '@app/shared/common/sub-header/sub-header.component';

@Component({
    templateUrl: './dynamic-parameter-detail.component.html',
    styleUrls: ['./dynamic-parameter-detail.component.css'],
    animations: [appModuleAnimation()]
})
export class DynamicParameterDetailComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditDynamicParameter') createOrEditDynamicParameterModal: CreateOrEditDynamicParameterModalComponent;

    dynamicParameter: DynamicParameterDto;
    dynamicParameterId: number;
    hasValues = false;

    breadcrumbs: BreadcrumbItem[];

    constructor(
        injector: Injector,
        private _dynamicParameterAppService: DynamicParameterServiceProxy,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _inputTypeConfigurationService: InputTypeConfigurationService
    ) {
        super(injector);
    }

    ngOnInit() {
        this.dynamicParameterId = this._activatedRoute.snapshot.queryParams['id'];
        this.loadData();
    }

    loadData(): void {
        this.showMainSpinner();

        this._dynamicParameterAppService.get(this.dynamicParameterId)
            .subscribe(
                (dynamicParameter) => {
                    this.dynamicParameter = dynamicParameter;
                    this.hasValues = this._inputTypeConfigurationService.getByName(dynamicParameter.inputType).hasValues;
                    this.loadBreadcrumbs();
                    this.hideMainSpinner();
                },
                (err) => {
                    this.hideMainSpinner();
                }
            );
    }

    editDynamicParameter(): void {
        this.createOrEditDynamicParameterModal.show(this.dynamicParameterId);
    }

    deleteDynamicParameter(): void {
        this.message.confirm(
            this.l('DeleteDynamicParameterMessage'),
            this.l('AreYouSure'),
            isConfirmed => {
                if (isConfirmed) {
                    this._dynamicParameterAppService.delete(this.dynamicParameter.id).subscribe(() => {
                        abp.notify.success(this.l('SuccessfullyDeleted'));
                        this._router.navigate(['app/admin/dynamic-parameter']);
                    });
                }
            }
        );
    }

    loadBreadcrumbs(): void {
        this.breadcrumbs = [
            new BreadcrumbItem(this.l('DynamicParameters'), '/app/admin/dynamic-parameter'),
            new BreadcrumbItem(this.l('DynamicParameterDetail')),
            new BreadcrumbItem(this.dynamicParameter.parameterName),
        ];
    }
}
