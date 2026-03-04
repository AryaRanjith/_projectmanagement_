import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-admin-plans',
    templateUrl: './admin-plans.component.html',
    styleUrls: ['./admin-plans.component.css']
})
export class AdminPlansComponent implements OnInit {
    plans: any[] = [];
    loading = false;
    showModal = false;
    isEditing = false;
    currentPlanId: number | null = null;
    planForm: FormGroup;
    submitted = false;
    error: string | null = null;

    constructor(
        private adminService: AdminService,
        private fb: FormBuilder
    ) {
        this.planForm = this.fb.group({
            name: ['', Validators.required],
            plan_type: ['PRO', Validators.required],
            duration_months: [12, [Validators.required, Validators.min(1)]],
            max_users: [5, [Validators.required, Validators.min(1)]],
            price: [0, [Validators.required, Validators.min(0)]],
            is_active: [true]
        });
    }

    ngOnInit(): void {
        this.fetchPlans();
    }

    fetchPlans(): void {
        this.loading = true;
        this.adminService.getAllPlans().subscribe({
            next: (data) => {
                this.plans = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error fetching plans:', err);
                this.error = `Failed to load plans. Error ${err.status}: ${err.message}`;
                this.loading = false;
            }
        });
    }

    openCreateModal(): void {
        this.isEditing = false;
        this.currentPlanId = null;
        this.planForm.reset({
            name: '',
            plan_type: 'PRO',
            duration_months: 12,
            max_users: 5,
            price: 0,
            is_active: true
        });
        this.showModal = true;
    }

    openEditModal(plan: any): void {
        this.isEditing = true;
        this.currentPlanId = plan.id;
        this.planForm.patchValue({
            name: plan.name,
            plan_type: plan.plan_type,
            duration_months: plan.duration_months,
            max_users: plan.max_users,
            price: plan.price,
            is_active: plan.is_active
        });
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.submitted = false;
    }

    onSubmit(): void {
        this.submitted = true;
        if (this.planForm.invalid) return;

        const data = this.planForm.value;

        if (this.isEditing && this.currentPlanId) {
            this.adminService.updatePlan(this.currentPlanId, data).subscribe({
                next: () => {
                    this.fetchPlans();
                    this.closeModal();
                },
                error: (err) => alert('Failed to update plan')
            });
        } else {
            this.adminService.createPlan(data).subscribe({
                next: () => {
                    this.fetchPlans();
                    this.closeModal();
                },
                error: (err) => alert('Failed to create plan')
            });
        }
    }

    deletePlan(plan: any): void {
        if (confirm(`Are you sure you want to delete ${plan.name}?`)) {
            this.adminService.deletePlan(plan.id).subscribe({
                next: () => this.fetchPlans(),
                error: (err) => alert('Failed to delete plan')
            });
        }
    }
}
