import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {HotToastService} from "@ngxpert/hot-toast";
import {CompaniesService} from "../../../_services/companies.service";
import {Company} from "../../../models/Company/Company";
import {UserCompany} from "../../../models/Company/UserCompany";
import {isMessage} from "../../../models/Exceptions/ExceptionMessage";

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatSelect,
    MatProgressSpinner
  ],
  templateUrl: './companies-list.component.html',
  styleUrl: './companies-list.component.css'
})
export class CompaniesListComponent implements OnInit {
  readonly companies: WritableSignal<Company[]> = signal([]);
  readonly users: WritableSignal<UserCompany[]> = signal([]);
  readonly nameControl = new FormControl('', [Validators.required]);
  loading = true;
  usersLoading = true;
  saving = false;
  updatingId: number | null = null;
  linkingUserId: number | null = null;

  constructor(private companiesService: CompaniesService, private toast: HotToastService) {
  }

  ngOnInit(): void {
    this.loadCompanies();
    this.loadUsers();
  }

  createCompany(): void {
    const name = this.nameControl.value?.trim();
    if (!name) {
      this.nameControl.markAsTouched();
      return;
    }

    this.saving = true;
    this.companiesService.create(name).subscribe({
      next: response => {
        this.saving = false;
        if (isMessage(response)) {
          this.toast.error((response as any).message);
          return;
        }

        this.companies.update(items => [...items, response as Company]);
        this.nameControl.reset('');
        this.toast.success("Компанію створено");
      },
      error: error => {
        this.saving = false;
        this.toast.error(error.message);
      }
    });
  }

  setPublicCompany(company: Company): void {
    if (company.defaultForPublic || this.updatingId !== null) {
      return;
    }

    this.updatingId = company.id;
    this.companiesService.setDefaultForPublic(company.id).subscribe({
      next: response => {
        this.updatingId = null;
        if (isMessage(response)) {
          this.toast.error((response as any).message);
          return;
        }

        const updated = response as Company;
        this.companies.update(items => items.map(item => ({
          ...item,
          defaultForPublic: item.id === updated.id
        })));
        this.toast.success("Компанію вибрано для меню");
      },
      error: error => {
        this.updatingId = null;
        this.toast.error(error.message);
      }
    });
  }

  trackByCompany(index: number, company: Company): number {
    return company.id;
  }

  linkUser(user: UserCompany, companyId: number | null): void {
    if (this.linkingUserId !== null) {
      return;
    }

    this.linkingUserId = user.id;
    this.companiesService.linkUser(user.id, companyId).subscribe({
      next: response => {
        this.linkingUserId = null;
        if (isMessage(response)) {
          this.toast.error((response as any).message);
          return;
        }

        const company = this.companies().find(item => item.id === companyId);
        this.users.update(items => items.map(item => item.id === user.id
          ? {...item, companyId, companyName: company?.name ?? null}
          : item));
        this.toast.success("Компанію користувача оновлено");
      },
      error: error => {
        this.linkingUserId = null;
        this.toast.error(error.message);
      }
    });
  }

  trackByUser(index: number, user: UserCompany): number {
    return user.id;
  }

  private loadCompanies(): void {
    this.loading = true;
    this.companiesService.getAll().subscribe({
      next: response => {
        this.loading = false;
        if (isMessage(response)) {
          this.toast.error((response as any).message);
          return;
        }
        this.companies.set(response as Company[]);
      },
      error: error => {
        this.loading = false;
        this.toast.error(error.message);
      }
    });
  }

  private loadUsers(): void {
    this.usersLoading = true;
    this.companiesService.getUsers().subscribe({
      next: response => {
        this.usersLoading = false;
        if (isMessage(response)) {
          this.toast.error((response as any).message);
          return;
        }
        this.users.set(response as UserCompany[]);
      },
      error: error => {
        this.usersLoading = false;
        this.toast.error(error.message);
      }
    });
  }
}
