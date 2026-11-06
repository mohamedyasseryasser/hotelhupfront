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

  properties: {
    read: 'Property.Read',
    create: 'Property.Create',
    update: 'Property.Update',
    activate: 'Property.Activate',
    deactivate: 'Property.Deactivate',
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
} as const;

@Injectable({
  providedIn: 'root',
})
export class Permissionservice {
  private readonly auth = inject(Authservice);

  hasPermission(permission: string): boolean {
    return this.auth.permissions().some(
      (currentPermission) =>
        currentPermission.toLowerCase() ===
        permission.toLowerCase(),
    );
  }

  hasAnyPermission(...permissions: string[]): boolean {
    return permissions.some((permission) =>
      this.hasPermission(permission),
    );
  }

  hasAllPermissions(...permissions: string[]): boolean {
    return permissions.every((permission) =>
      this.hasPermission(permission),
    );
  }

  canViewUsers(): boolean {
    return this.hasPermission(PERMISSIONS.users.read);
  }

  canCreateUser(): boolean {
    return this.hasPermission(PERMISSIONS.users.create);
  }

  canEditUser(): boolean {
    return this.hasPermission(PERMISSIONS.users.update);
  }

  canActivateUser(): boolean {
    return this.hasPermission(PERMISSIONS.users.activate);
  }

  canDeactivateUser(): boolean {
    return this.hasPermission(PERMISSIONS.users.deactivate);
  }

  canAssignRole(): boolean {
    return this.hasPermission(
      PERMISSIONS.users.assignRole,
    );
  }

  canViewProperties(): boolean {
    return this.hasPermission(
      PERMISSIONS.properties.read,
    );
  }

  canCreateProperty(): boolean {
    return this.hasPermission(
      PERMISSIONS.properties.create,
    );
  }

  canUpdateProperty(): boolean {
    return this.hasPermission(
      PERMISSIONS.properties.update,
    );
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

  canViewRooms(): boolean {
    return this.hasPermission(
      PERMISSIONS.rooms.read,
    );
  }

  canCreateRoom(): boolean {
    return this.hasPermission(
      PERMISSIONS.rooms.create,
    );
  }

  canUpdateRoom(): boolean {
    return this.hasPermission(
      PERMISSIONS.rooms.update,
    );
  }

  canChangeRoomStatus(): boolean {
    return this.hasPermission(
      PERMISSIONS.rooms.changeStatus,
    );
  }

  canAssignRoom(): boolean {
    return this.hasPermission(
      PERMISSIONS.rooms.assign,
    );
  }

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

  canDeactivateRoomType(): boolean {
    return this.hasPermission(
      PERMISSIONS.roomTypes.deactivate,
    );
  }
canViewGuests() { return this.hasPermission(PERMISSIONS.guests.read); }
  canCreateGuest() { return this.hasPermission(PERMISSIONS.guests.create); }
  canUpdateGuest() { return this.hasPermission(PERMISSIONS.guests.update); }
  canViewRatePlans() { return this.hasPermission(PERMISSIONS.ratePlans.read); }
  canCreateRatePlan() { return this.hasPermission(PERMISSIONS.ratePlans.create); }
  canUpdateRatePlan() { return this.hasPermission(PERMISSIONS.ratePlans.update); }
  canDeactivateRatePlan() { return this.hasPermission(PERMISSIONS.ratePlans.deactivate); }
    canActivateRatePlan() { return this.hasPermission(PERMISSIONS.ratePlans.activate); }

  canViewHousekeeping(): boolean {
    return this.hasPermission(
      PERMISSIONS.housekeeping.read,
    );
  }
  canViewReservations(): boolean {
    return this.hasPermission(PERMISSIONS.reservations.read);
  }
  canCreateReservations():boolean
  {
    return this.hasPermission(PERMISSIONS.reservations.create);
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
  canviewservices(){
    return this.hasPermission(PERMISSIONS.services.read);
  }
}
