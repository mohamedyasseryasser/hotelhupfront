import { inject, Injectable } from '@angular/core';
import { Authservice } from './authservice';

export const PERMISSIONS = {
  users: {
    read: 'User.Read',
    create: 'User.Create',
    update: 'User.Update',
    activate: 'User.Activate',
    deactivate: 'User.Deactivate',
    assignRole: 'User.AssignRole',
  },

  roles: {
    read: 'Role.Read',
    create: 'Role.Create',
    update: 'Role.Update',
    deactivate: 'Role.Deactivate',
    assignPermission: 'Role.AssignPermission',
  },

  guests: {
    read: 'Guest.Read',
    create: 'Guest.Create',
    update: 'Guest.Update',
  },

  reservations: {
    read: 'Reservation.Read',
    create: 'Reservation.Create',
    update: 'Reservation.Update',
    cancel: 'Reservation.Cancel',
    modify: 'Reservation.Modify',
  },

  rooms: {
    read: 'Room.Read',
    create: 'Room.Create',
    update: 'Room.Update',
    changeStatus: 'Room.ChangeStatus',
    assign: 'Room.Assign',
  },

  roomTypes: {
    read: 'RoomType.Read',
    create: 'RoomType.Create',
    update: 'RoomType.Update',
    deactivate: 'RoomType.Deactivate',
    activate: 'RoomType.Activate',
  },

  ratePlans: {
    read: 'RatePlan.Read',
    create: 'RatePlan.Create',
    update: 'RatePlan.Update',
    activate: 'RatePlan.Activate',
    deactivate: 'RatePlan.Deactivate',
  },

  rateRules: {
    read: 'RateRule.Read',
    create: 'RateRule.Create',
    update: 'RateRule.Update',
    delete: 'RateRule.Delete',
  },

  folios: {
    read: 'Folio.Read',
    create: 'Folio.Create',
    update: 'Folio.Update',
    addCharge: 'Folio.AddCharge',
    transfer: 'Folio.Transfer',
    close: 'Folio.Close',
    reopen: 'Folio.Reopen',
  },

  payments: {
    read: 'Payment.Read',
    create: 'Payment.Create',
    void: 'Payment.Void',
  },

  refunds: {
    read: 'Refund.Read',
    create: 'Refund.Create',
    approve: 'Refund.Approve',
  },

  services: {
    read: 'Service.Read',
    create: 'Service.Create',
    update: 'Service.Update',
    deactivate: 'Service.Deactivate',
    addToFolio: 'Service.AddToFolio',
  },

  housekeeping: {
    read: 'Housekeeping.Read',
    assign: 'Housekeeping.Assign',
    start: 'Housekeeping.Start',
    complete: 'Housekeeping.Complete',
    reportIssue: 'Housekeeping.ReportIssue',
  },

  expenses: {
    read: 'Expense.Read',
    create: 'Expense.Create',
    update: 'Expense.Update',
    void: 'Expense.Void',
  },

  reports: {
    read: 'Report.Read',
    export: 'Report.Export',
  },

  auditLogs: {
    read: 'AuditLog.Read',
  },

  properties: {
    read: 'Property.Read',
    create: 'Property.Create',
    update: 'Property.Update',
    activate: 'Property.Activate',
    deactivate: 'Property.Deactivate',
  },
} as const;

@Injectable({
  providedIn: 'root',
})
export class Permissionservice {
  private readonly auth = inject(Authservice);

  hasPermission(permission: string): boolean {
    const normalizedPermission = permission.trim().toLowerCase();

    return this.auth.permissions().some(
      currentPermission =>
        currentPermission.trim().toLowerCase() ===
        normalizedPermission,
    );
  }

  hasAnyPermission(...permissions: string[]): boolean {
    return permissions.some(permission =>
      this.hasPermission(permission),
    );
  }

  hasAllPermissions(...permissions: string[]): boolean {
    return permissions.every(permission =>
      this.hasPermission(permission),
    );
  }

  // =========================
  // Users
  // =========================

  canViewUsers(): boolean {
    return this.hasPermission(PERMISSIONS.users.read);
  }

  canCreateUser(): boolean {
    return this.hasPermission(PERMISSIONS.users.create);
  }

  canUpdateUser(): boolean {
    return this.hasPermission(PERMISSIONS.users.update);
  }

  canEditUser(): boolean {
    return this.canUpdateUser();
  }

  canActivateUser(): boolean {
    return this.hasPermission(PERMISSIONS.users.activate);
  }

  canDeactivateUser(): boolean {
    return this.hasPermission(PERMISSIONS.users.deactivate);
  }

  canAssignRole(): boolean {
    return this.hasPermission(PERMISSIONS.users.assignRole);
  }

  // =========================
  // Roles
  // =========================

  canViewRoles(): boolean {
    return this.hasPermission(PERMISSIONS.roles.read);
  }

  canCreateRole(): boolean {
    return this.hasPermission(PERMISSIONS.roles.create);
  }

  canUpdateRole(): boolean {
    return this.hasPermission(PERMISSIONS.roles.update);
  }

  canDeactivateRole(): boolean {
    return this.hasPermission(PERMISSIONS.roles.deactivate);
  }

  canAssignPermissionToRole(): boolean {
    return this.hasPermission(
      PERMISSIONS.roles.assignPermission,
    );
  }

  // =========================
  // Properties
  // =========================

  canViewProperties(): boolean {
    return this.hasPermission(PERMISSIONS.properties.read);
  }

  canCreateProperty(): boolean {
    return this.hasPermission(PERMISSIONS.properties.create);
  }

  canUpdateProperty(): boolean {
    return this.hasPermission(PERMISSIONS.properties.update);
  }

  canActivateProperty(): boolean {
    return this.hasPermission(
      PERMISSIONS.properties.activate,
    );
  }

  canDeactivateProperty(): boolean {
    return this.hasPermission(
      PERMISSIONS.properties.deactivate,
    );
  }

  // =========================
  // Guests
  // =========================

  canViewGuests(): boolean {
    return this.hasPermission(PERMISSIONS.guests.read);
  }

  canCreateGuest(): boolean {
    return this.hasPermission(PERMISSIONS.guests.create);
  }

  canUpdateGuest(): boolean {
    return this.hasPermission(PERMISSIONS.guests.update);
  }

  // =========================
  // Reservations
  // =========================

  canViewReservations(): boolean {
    return this.hasPermission(
      PERMISSIONS.reservations.read,
    );
  }

  canCreateReservation(): boolean {
    return this.hasPermission(
      PERMISSIONS.reservations.create,
    );
  }

  canCreateReservations(): boolean {
    return this.canCreateReservation();
  }

  canUpdateReservation(): boolean {
    return this.hasPermission(
      PERMISSIONS.reservations.update,
    );
  }

  canEditReservation(): boolean {
    return this.canUpdateReservation();
  }

  canCancelReservation(): boolean {
    return this.hasPermission(
      PERMISSIONS.reservations.cancel,
    );
  }

  canModifyReservation(): boolean {
    return this.hasPermission(
      PERMISSIONS.reservations.modify,
    );
  }

  // =========================
  // Rooms
  // =========================

  canViewRooms(): boolean {
    return this.hasPermission(PERMISSIONS.rooms.read);
  }

  canCreateRoom(): boolean {
    return this.hasPermission(PERMISSIONS.rooms.create);
  }

  canUpdateRoom(): boolean {
    return this.hasPermission(PERMISSIONS.rooms.update);
  }

  canEditRoom(): boolean {
    return this.canUpdateRoom();
  }

  canChangeRoomStatus(): boolean {
    return this.hasPermission(
      PERMISSIONS.rooms.changeStatus,
    );
  }

  canAssignRoom(): boolean {
    return this.hasPermission(PERMISSIONS.rooms.assign);
  }

  // =========================
  // Room Types
  // =========================

  canViewRoomTypes(): boolean {
    return this.hasPermission(
      PERMISSIONS.roomTypes.read,
    );
  }

  canCreateRoomType(): boolean {
    return this.hasPermission(
      PERMISSIONS.roomTypes.create,
    );
  }

  canUpdateRoomType(): boolean {
    return this.hasPermission(
      PERMISSIONS.roomTypes.update,
    );
  }

  canEditRoomType(): boolean {
    return this.canUpdateRoomType();
  }

  canDeactivateRoomType(): boolean {
    return this.hasPermission(
      PERMISSIONS.roomTypes.deactivate,
    );
  }

  canActivateRoomType(): boolean {
    return this.hasPermission(
      PERMISSIONS.roomTypes.activate,
    );
  }

  // =========================
  // Rate Plans
  // =========================

  canViewRatePlans(): boolean {
    return this.hasPermission(
      PERMISSIONS.ratePlans.read,
    );
  }

  canCreateRatePlan(): boolean {
    return this.hasPermission(
      PERMISSIONS.ratePlans.create,
    );
  }

  canUpdateRatePlan(): boolean {
    return this.hasPermission(
      PERMISSIONS.ratePlans.update,
    );
  }

  canEditRatePlan(): boolean {
    return this.canUpdateRatePlan();
  }

  canActivateRatePlan(): boolean {
    return this.hasPermission(
      PERMISSIONS.ratePlans.activate,
    );
  }

  canDeactivateRatePlan(): boolean {
    return this.hasPermission(
      PERMISSIONS.ratePlans.deactivate,
    );
  }

  // =========================
  // Rate Rules
  // =========================

  canViewRateRules(): boolean {
    return this.hasPermission(
      PERMISSIONS.rateRules.read,
    );
  }

  canCreateRateRule(): boolean {
    return this.hasPermission(
      PERMISSIONS.rateRules.create,
    );
  }

  canUpdateRateRule(): boolean {
    return this.hasPermission(
      PERMISSIONS.rateRules.update,
    );
  }

  canDeleteRateRule(): boolean {
    return this.hasPermission(
      PERMISSIONS.rateRules.delete,
    );
  }

  // =========================
  // Folios
  // =========================

  canViewFolios(): boolean {
    return this.hasPermission(PERMISSIONS.folios.read);
  }

  canCreateFolio(): boolean {
    return this.hasPermission(
      PERMISSIONS.folios.create,
    );
  }

  canUpdateFolio(): boolean {
    return this.hasPermission(
      PERMISSIONS.folios.update,
    );
  }

  canAddFolioCharge(): boolean {
    return this.hasPermission(
      PERMISSIONS.folios.addCharge,
    );
  }

  canTransferFolio(): boolean {
    return this.hasPermission(
      PERMISSIONS.folios.transfer,
    );
  }

  canCloseFolio(): boolean {
    return this.hasPermission(
      PERMISSIONS.folios.close,
    );
  }

  canReopenFolio(): boolean {
    return this.hasPermission(
      PERMISSIONS.folios.reopen,
    );
  }

  // =========================
  // Payments
  // =========================

  canViewPayments(): boolean {
    return this.hasPermission(
      PERMISSIONS.payments.read,
    );
  }

  canCreatePayment(): boolean {
    return this.hasPermission(
      PERMISSIONS.payments.create,
    );
  }

  canVoidPayment(): boolean {
    return this.hasPermission(
      PERMISSIONS.payments.void,
    );
  }

  // =========================
  // Refunds
  // =========================

  canViewRefunds(): boolean {
    return this.hasPermission(
      PERMISSIONS.refunds.read,
    );
  }

  canCreateRefund(): boolean {
    return this.hasPermission(
      PERMISSIONS.refunds.create,
    );
  }

  canApproveRefund(): boolean {
    return this.hasPermission(
      PERMISSIONS.refunds.approve,
    );
  }

  // =========================
  // Services
  // =========================

  canViewServices(): boolean {
    return this.hasPermission(
      PERMISSIONS.services.read,
    );
  }

  canCreateService(): boolean {
    return this.hasPermission(
      PERMISSIONS.services.create,
    );
  }

  canUpdateService(): boolean {
    return this.hasPermission(
      PERMISSIONS.services.update,
    );
  }

  canEditService(): boolean {
    return this.canUpdateService();
  }

  canDeactivateService(): boolean {
    return this.hasPermission(
      PERMISSIONS.services.deactivate,
    );
  }

  canAddServiceToFolio(): boolean {
    return this.hasPermission(
      PERMISSIONS.services.addToFolio,
    );
  }

  // =========================
  // Housekeeping
  // =========================

  canViewHousekeeping(): boolean {
    return this.hasPermission(
      PERMISSIONS.housekeeping.read,
    );
  }

  canAssignHousekeeping(): boolean {
    return this.hasPermission(
      PERMISSIONS.housekeeping.assign,
    );
  }

  canStartHousekeeping(): boolean {
    return this.hasPermission(
      PERMISSIONS.housekeeping.start,
    );
  }

  canCompleteHousekeeping(): boolean {
    return this.hasPermission(
      PERMISSIONS.housekeeping.complete,
    );
  }

  canReportHousekeepingIssue(): boolean {
    return this.hasPermission(
      PERMISSIONS.housekeeping.reportIssue,
    );
  }

  // =========================
  // Expenses
  // =========================

  canViewExpenses(): boolean {
    return this.hasPermission(
      PERMISSIONS.expenses.read,
    );
  }

  canCreateExpense(): boolean {
    return this.hasPermission(
      PERMISSIONS.expenses.create,
    );
  }

  canUpdateExpense(): boolean {
    return this.hasPermission(
      PERMISSIONS.expenses.update,
    );
  }

  canEditExpense(): boolean {
    return this.canUpdateExpense();
  }

  canVoidExpense(): boolean {
    return this.hasPermission(
      PERMISSIONS.expenses.void,
    );
  }

  // =========================
  // Reports
  // =========================

  canViewReports(): boolean {
    return this.hasPermission(
      PERMISSIONS.reports.read,
    );
  }

  canExportReports(): boolean {
    return this.hasPermission(
      PERMISSIONS.reports.export,
    );
  }

  // =========================
  // Audit Logs
  // =========================

  canViewAuditLogs(): boolean {
    return this.hasPermission(
      PERMISSIONS.auditLogs.read,
    );
  }
}
