import {
    Component,
    Injector,
    ViewChild,
    ViewEncapsulation,
    AfterViewInit,
    Input,
    OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    EntityDtoOfInt64,
    UserListDto,
    UserServiceProxy,
    PermissionServiceProxy,
    FlatPermissionDto,
} from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { LazyLoadEvent } from 'primeng/public_api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { CreateOrEditUserModalComponent } from './create-or-edit-user-modal.component';
import { EditUserPermissionsModalComponent } from './edit-user-permissions-modal.component';
import { ImpersonationService } from './impersonation.service';
import { HttpClient } from '@angular/common/http';
import { FileUpload } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';
import { PermissionTreeModalComponent } from '../shared/permission-tree-modal.component';
import { ManageEntityDynamicParameterValuesModalComponent } from '@app/admin/dynamic-entity-parameters/entity-dynamic-parameter/entity-dynamic-parameter-value/manage-entity-dynamic-parameter-values-modal.component';
import { UtilsService } from 'abp-ng2-module';
import { LocalStorageService } from '@shared/utils/local-storage.service';
import { PageTitleService } from '@app/shared/layout/nav/pageTitleService';
import { ColumnService } from '../shared/column.service';
import { UserColumns } from './user.model';

@Component({
    templateUrl: './users.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./users.component.less'],
    animations: [appModuleAnimation()],
})
export class UsersComponent extends AppComponentBase
    implements OnInit, AfterViewInit {
    @ViewChild('createOrEditUserModal', { static: true })
    createOrEditUserModal: CreateOrEditUserModalComponent;
    @ViewChild('editUserPermissionsModal', { static: true })
    editUserPermissionsModal: EditUserPermissionsModalComponent;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('ExcelFileUpload', { static: false })
    excelFileUpload: FileUpload;
    @ViewChild('permissionFilterTreeModal', { static: true })
    permissionFilterTreeModal: PermissionTreeModalComponent;
    @ViewChild('dynamicParametersModal', { static: true })
    dynamicParametersModal: ManageEntityDynamicParameterValuesModalComponent;
    _selectedColumns: any[];
    uploadUrl: string;
    items: UserListDto[] = [];
    f:any;
columns = new UserColumns();
    //Filters
    advancedFiltersAreShown = false;
    filterText = '';
    role = '';
    onlyLockedUsers = false;
    loadData = false;
    constructor(
        injector: Injector,
        public _impersonationService: ImpersonationService,
        private _userServiceProxy: UserServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _activatedRoute: ActivatedRoute,
        private _httpClient: HttpClient,
        private _localStorageService: LocalStorageService,
        private _pageTitleService: PageTitleService,
        private _columnService: ColumnService
    ) {
        super(injector);
        this.filterText =
            this._activatedRoute.snapshot.queryParams['filterText'] || '';
        this.uploadUrl =
            AppConsts.remoteServiceBaseUrl + '/Users/ImportFromExcel';

        this._pageTitleService.pageTitle = 'Users';
        this._pageTitleService.pageDescription = 'UsersHeaderInfo';


    }
    ngAfterViewInit(): void {}
    ngOnInit(): void {
        this.getUsers();
    }
    pageChanged(event, methodName) {
        this.paginationConfig.currentPage = event;
        this.getUsers();
    }
    itemPerPageChanged(item) {
        this.paginationConfig.itemsPerPage = item;
        this.getUsers();
    }

    getUsers(event?: LazyLoadEvent) {
        this.loadData = true;
        this._userServiceProxy
            .getUsers(
                this.filterText,
                this.permissionFilterTreeModal.getSelectedPermissions(),
                this.role !== '' ? parseInt(this.role) : undefined,
                this.onlyLockedUsers,
                '',
                this.paginationConfig.itemsPerPage,
                this.paginationConfig.skip()
            )
            .pipe(finalize(() => (this.loadData = false)))
            .subscribe((result) => {
                this.items = result.items;
                this.setUsersProfilePictureUrl(result.items);
                this.primengTableHelper.hideLoadingIndicator();
                this.paginationConfig.totalItems = result.totalCount;

            });
    }

    unlockUser(record): void {
        this._userServiceProxy
            .unlockUser(new EntityDtoOfInt64({ id: record.id }))
            .subscribe(() => {
                this.notify.success(this.l('UnlockedTheUser', record.userName));
            });
    }

    getRolesAsString(roles): string {
        let roleNames = '';

        for (let j = 0; j < roles.length; j++) {
            if (roleNames.length) {
                roleNames = roleNames + ', ';
            }

            roleNames = roleNames + roles[j].roleName;
        }

        return roleNames;
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    exportToExcel(): void {
        this._userServiceProxy
            .getUsersToExcel(
                this.filterText,
                this.permissionFilterTreeModal.getSelectedPermissions(),
                this.role !== '' ? parseInt(this.role) : undefined,
                this.onlyLockedUsers,
                ''
            )
            .subscribe((result) => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }

    createUser(): void {
        this.createOrEditUserModal.show();
    }

    uploadExcel(data: { files: File }): void {
        const formData: FormData = new FormData();
        const file = data.files[0];
        formData.append('file', file, file.name);

        this._httpClient
            .post<any>(this.uploadUrl, formData)
            .pipe(finalize(() => this.excelFileUpload.clear()))
            .subscribe((response) => {
                if (response.success) {
                    this.notify.success(this.l('ImportUsersProcessStart'));
                } else if (response.error != null) {
                    this.notify.error(this.l('ImportUsersUploadFailed'));
                }
            });
    }

    onUploadExcelError(): void {
        this.notify.error(this.l('ImportUsersUploadFailed'));
    }

    deleteUser(user: UserListDto): void {
        if (user.userName === AppConsts.userManagement.defaultAdminUserName) {
            this.message.warn(
                this.l(
                    '{0}UserCannotBeDeleted',
                    AppConsts.userManagement.defaultAdminUserName
                )
            );
            return;
        }

        this.message.confirm(
            this.l('UserDeleteWarningMessage', user.userName),
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._userServiceProxy.deleteUser(user.id).subscribe(() => {
                        this.reloadPage();
                        this.notify.success(this.l('SuccessfullyDeleted'));
                    });
                }
            }
        );
    }

    showDynamicParameters(user: UserListDto): void {
        this.dynamicParametersModal.show(
            'MyCompanyName.AbpZeroTemplate.Authorization.Users.User',
            user.id.toString()
        );
    }

    setUsersProfilePictureUrl(users: UserListDto[]): void {
        for (let i = 0; i < users.length; i++) {
            let user = users[i];
            this._localStorageService.getItem(
                AppConsts.authorization.encrptedAuthTokenName,
                function (err, value) {
                    let profilePictureUrl =
                        AppConsts.remoteServiceBaseUrl +
                        '/Profile/GetProfilePictureByUser?userId=' +
                        user.id +
                        '&' +
                        AppConsts.authorization.encrptedAuthTokenName +
                        '=' +
                        encodeURIComponent(value.token);
                    (user as any).profilePictureUrl = profilePictureUrl;
                }
            );
        }
    }

     isHammer(row) {
        // defining these to perform checks later, if required any
        const close = parseFloat(row.close);
        const open = parseFloat(row.open);
        const high = parseFloat(row.high);
        const low = parseFloat(row.low);
    
        //no body 
        if (open == close) {
            return false;
        }
    
        // has a upper wick
        if (high != open && high != close) {
            return false;
        }
        let value = (Math.abs(close-open) / (high-low));
        // body shouldn't be more than 30 % and should atleast have a 10 % of the candle
        if (0.3 >= value && value >= 0.1) { 
                return true;
                /**
                  * need not check the lowerwick because we match high to either close/open  
                  * "1.0 > ((Math.min(close,open) - low) / (high-low)) >= 0.7"
                  * */
    
        } 
    
        /**
         * Alternate formula to check for hammer with below listed constraints
         * 1. Body shouldn't be more than 30 % and should atleast be 10 % of the candle
         * 2. Upper wick shouldn't be more than 25% of the body
         * 3. Lower wick should be atleast double the size of the body 
         * */
        //  if(0.3 >= (Math.abs(close - open) / (high - low)) >= 0.1 && 
        //         (high - Math.max(close, open)) <= (0.25 * Math.abs(close - open)) && 
        //             (Math.min(close, open)) - low >= (2 *  Math.abs(close - open)) 
        // ) {
    
        //     return true
        //  } 
        
        return false;
    }

}
