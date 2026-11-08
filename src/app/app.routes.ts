import { Routes } from '@angular/router';
import { guestGuard } from './guard/guest-guard';
import { authguardGuard } from './guard/authguard-guard';
import { permissionGuard } from './guard/permission-guard';
import { PERMISSIONS } from './Service/permissionservice';
import { adminGuard } from './guard/admin-guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./Components/auth/auth').then(
        (module) => module.Auth,
      ),
  },

  {  
    path: 'dashboard',
    canActivate: [authguardGuard],
    loadComponent: () =>
      import('./Components/dashboard/dashboard').then(
        (module) => module.Dashboard,
      ),
  },

  

  {
    path: 'users',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.users.read,
      ],
    },
    loadComponent: () =>
      import('./Components/users/userslist/userslist').then(
        (module) => module.Userslist,
      ),
  },

  {
    path: 'users/create',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.users.create,
      ],
    },
    loadComponent: () =>
      import('./Components/users/userform/userform').then(
        (module) => module.Userform,
      ),
  },

  {
    path: 'users/:id/edit',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.users.update,
      ],
    },
    loadComponent: () =>
      import('./Components/users/userform/userform').then(
        (module) => module.Userform,
      ),
  },

  {
    path: 'users/:id',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.users.read,
      ],
    },
    loadComponent: () =>
      import('./Components/users/userdetails/userdetails').then(
        (module) => module.Userdetails,
      ),
  },

  /*
   * Properties
   */

  {
    path: 'properties',
    canActivate: [adminGuard],
    loadComponent: () =>
      import(
        './Components/properties/propertieslist/propertieslist/propertieslist'
      ).then(
        (module) => module.Propertieslist,
      ),
  },

  {
    path: 'properties/create',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.create,
      ],
    },
    loadComponent: () =>
      import(
        './Components/properties/propertyform/propertyform/propertyform'
      ).then(
        (module) => module.Propertyform,
      ),
  },

  {
    path: 'properties/:id/edit',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.update,
      ],
    },
    loadComponent: () =>
      import(
        './Components/properties/propertyform/propertyform/propertyform'
      ).then(
        (module) => module.Propertyform,
      ),
  },

  {
    path: 'properties/:id/settings',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.update,
      ],
    },
    loadComponent: () =>
      import(
        './Components/properties/propertyseeting/propertyseeting/propertyseeting'
      ).then(
        (module) => module.Propertyseeting,
      ),
  },

  {
    path: 'properties/:id',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.read,
      ],
    },
    loadComponent: () =>
      import(
        './Components/properties/propertydetails/propertydetails/propertydetails'
      ).then(
        (module) => module.Propertydetailsimplements,
      ),
  },

  /*
   * Property Taxes
   */

  {
    path: 'properties/:id/taxes/create',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.update,
      ],
    },
    loadComponent: () =>
      import(
        './Components/propertytax/taxform/taxform'
      ).then(
        (module) => module.Taxform,
      ),
  },

  {
    path: 'properties/:id/taxes/:taxId/edit',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.update,
      ],
    },
    loadComponent: () =>
      import(
        './Components/propertytax/taxform/taxform'
      ).then(
        (module) => module.Taxform,
      ),
  },

  {
    path: 'properties/:id/taxes/:taxId',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.read,
      ],
    },
    loadComponent: () =>
      import(
        './Components/propertytax/taxdetails/taxdetails'
      ).then(
        (module) => module.Taxdetails,
      ),
  },

  {
    path: 'properties/:id/taxes',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.read,
      ],
    },
    loadComponent: () =>
      import(
        './Components/propertytax/taxlist/taxlist'
      ).then(
        (module) => module.Taxlistimplements,
      ),
  },

  /*
   * Cancellation Policies
   */

  {
    path: 'properties/:id/cancellation-policies/create',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.update,
      ],
    },
    loadComponent: () =>
      import(
        './Components/cancellationpolicy/cancellationpolicyform/cancellationpolicyform'
      ).then(
        (module) => module.Cancellationpolicyform,
      ),
  },

  {
    path: 'properties/:id/cancellation-policies/:policyId/edit',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.update,
      ],
    },
    loadComponent: () =>
      import(
        './Components/cancellationpolicy/cancellationpolicyform/cancellationpolicyform'
      ).then(
        (module) => module.Cancellationpolicyform,
      ),
  },

  {
    path: 'properties/:id/cancellation-policies/:policyId',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.read,
      ],
    },
    loadComponent: () =>
      import(
        './Components/cancellationpolicy/cancellationpolicydetails/cancellationpolicydetails'
      ).then(
        (module) => module.Cancellationpolicydetails,
      ),
  },

  {
    path: 'properties/:id/cancellation-policies',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.read,
      ],
    },
    loadComponent: () =>
      import(
        './Components/cancellationpolicy/cancellationpolicylist/cancellationpolicylist'
      ).then(
        (module) => module.Cancellationpolicylistimplements,
      ),
  },

  /*
   * Deposit Policies
   */

  {
    path: 'properties/:id/deposit-policies/create',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.update,
      ],
    },
    loadComponent: () =>
      import(
        './Components/depositpolicy/depositform/depositform'
      ).then(
        (module) => module.Depositform,
      ),
  },

  {
    path: 'properties/:id/deposit-policies/:policyId/edit',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.update,
      ],
    },
    loadComponent: () =>
      import(
        './Components/depositpolicy/depositform/depositform'
      ).then(
        (module) => module.Depositform,
      ),
  },

  {
    path: 'properties/:id/deposit-policies/:policyId',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.read,
      ],
    },
    loadComponent: () =>
      import(
        './Components/depositpolicy/depositdetails/depositdetails'
      ).then(
        (module) => module.Depositdetails,
      ),
  },

  {
    path: 'properties/:id/deposit-policies',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.properties.read,
      ],
    },
    loadComponent: () =>
      import(
        './Components/depositpolicy/depositlist/depositlist'
      ).then(
        (module) => module.Depositlist,
      ),
  },

  /*
   * Rooms
   */

  {
    path: 'properties/:id/rooms/create',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.rooms.create,
      ],
    },
    loadComponent: () =>
      import(
        './Components/room/roomform/roomform'
      ).then(
        (module) => module.Roomform,
      ),
  },

  {
    path: 'properties/:id/rooms/:roomId/edit',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.rooms.update,
      ],
    },
    loadComponent: () =>
      import(
        './Components/room/roomform/roomform'
      ).then(
        (module) => module.Roomform,
      ),
  },

  {
    path: 'properties/:id/rooms/:roomId',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.rooms.read,
      ],
    },
    loadComponent: () =>
      import(
        './Components/room/roomdetails/roomdetails'
      ).then(
        (module) => module.Roomdetails,
      ),
  },

  {
    path: 'properties/:id/rooms',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.rooms.read,
      ],
    },
    loadComponent: () =>
      import(
        './Components/room/roomlist/roomlist'
      ).then(
        (module) => module.Roomlist,
      ),
  },

  /*
   * Room Types
   */

  {
    path: 'properties/:id/room-types/create',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.roomTypes.create,
      ],
    },
    loadComponent: () =>
      import(
        './Components/roomtype/roomtypeform/roomtypeform'
      ).then(
        (module) => module.Roomtypeform,
      ),
  },

  {
    path: 'properties/:id/room-types/:typeId/edit',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.roomTypes.update,
      ],
    },
    loadComponent: () =>
      import(
        './Components/roomtype/roomtypeform/roomtypeform'
      ).then(
        (module) => module.Roomtypeform,
      ),
  },

  {
    path: 'properties/:id/room-types/:typeId',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.roomTypes.read,
      ],
    },
    loadComponent: () =>
      import(
        './Components/roomtype/roomtypedetails/roomtypedetails'
      ).then(
        (module) => module.Roomtypedetails,
      ),
  },

  {
    path: 'properties/:id/room-types',
    canActivate: [permissionGuard],
    data: {
      permissions: [
        PERMISSIONS.roomTypes.read,
      ],
    },
    loadComponent: () =>
      import(
        './Components/roomtype/roomtypelist/roomtypelist'
      ).then(
        (module) => module.Roomtypelistimplements,
      ),
  },
  // Guests
      {
        path: 'properties/:id/guests/create',
        canActivate:[permissionGuard],
        data: { permissions: [PERMISSIONS.guests.create] },
        loadComponent: () =>
          import('./Components/guest/guestform/guestform').then(
            (module) => module.Guestform,
          ),
      },
      {
        path: 'properties/:id/guests/:guestId/edit',        canActivate:[permissionGuard],

        data: { permissions: [PERMISSIONS.guests.update] },
        loadComponent: () =>
          import('./Components/guest/guestform/guestform').then(
            (module) => module.Guestform,
          ),
      },
      {
        path: 'properties/:id/guests/:guestId',        canActivate:[permissionGuard],

        data: { permissions: [PERMISSIONS.guests.read] },
        loadComponent: () =>
          import('./Components/guest/guestdetails/guestdetails').then(
            (module) => module.Guestdetails,
          ),
      },
      {
        path: 'properties/:id/guests',        canActivate:[permissionGuard],

        data: { permissions: [PERMISSIONS.guests.read] },
        loadComponent: () =>
          import('./Components/guest/guestlist/guestlist').then(
            (module) => module.Guestlist,
          ),
      },

      // Rate plans
      {
        path: 'properties/:id/rate-plans/create',   
        canActivate:[permissionGuard],
        data: { permissions: [PERMISSIONS.ratePlans.create] },
        loadComponent: () =>
          import('./Components/rateplane/rateplaneform/rateplaneform').then(
            (module) => module.Rateplaneform,
          ),
      },
      {
        path: 'properties/:id/rate-plans/:planId/edit',        canActivate:[permissionGuard],

        data: { permissions: [PERMISSIONS.ratePlans.update] },
        loadComponent: () =>
          import('./Components/rateplane/rateplaneform/rateplaneform').then(
            (module) => module.Rateplaneform,
          ),
      },
      {
        path: 'properties/:id/rate-plans/:planId',        canActivate:[permissionGuard],

        data: { permissions: [PERMISSIONS.ratePlans.read] },
        loadComponent: () =>
          import('./Components/rateplane/rateplanedetails/rateplanedetails').then(
            (module) => module.Rateplanedetails,
          ),
      },
      {
        path: 'properties/:id/rate-plans',        canActivate:[permissionGuard],

        data: { permissions: [PERMISSIONS.ratePlans.read] },
        loadComponent: () =>
          import('./Components/rateplane/rateplanelist/rateplanelist').then(
            (module) => module.Rateplanelist,
          ),
      },

  /*
   * Access Denied
   */

  {
    path: 'access-denied',
    canActivate: [authguardGuard],
    loadComponent: () =>
      import(
        './Components/access-denied/access-denied'
      ).then(
        (module) => module.AccessDenied,
      ),
  },
 // Reservations
  // Reservations
      { path: 'reservations',
         canActivate:[permissionGuard],
         data: { permissions: [PERMISSIONS.reservations.read] },
       loadComponent: () => 
        import('./Components/reservation/reservationlist/reservationlist').then((m) => m.Reservationlist) },
      { path: 'reservations/availability',          canActivate:[permissionGuard],
data: { permissions: [PERMISSIONS.reservations.read] }, loadComponent: () => import('./Components/reservation/avaliavility/avaliavility').then((m) => m.Avaliavility) },
      { path: 'reservations/new',     
            canActivate:[permissionGuard],
 data: { permissions: [PERMISSIONS.reservations.create] }, loadComponent: () => import('./Components/reservation/reservationform/reservationform').then((m) => m.Reservationform) },
      { path: 'reservations/:id/edit',          canActivate:[permissionGuard],
data: { permissions: [PERMISSIONS.reservations.update] }, loadComponent: () => import('./Components/reservation/reservationform/reservationform').then((m) => m.Reservationform) },
      { path: 'reservations/:id',         canActivate:[permissionGuard],
 data: { permissions: [PERMISSIONS.reservations.read] }, loadComponent: () => import('./Components/reservation/reservationdetails/reservationdetails').then((m) => m.Reservationdetails) },
   /*
 * Folios
 */

{
  path: 'folios/:folioId/items/create',
  canActivate: [permissionGuard],
  data: {
    permissions: [
      PERMISSIONS.folios.addCharge,
    ],
  },
  loadComponent: () =>
    import(
      './Components/folio/folioform/folioform'
    ).then(
      (module) => module.Folioform,
    ),
},

{
  path: 'folios/:folioId/payments/create',
  canActivate: [permissionGuard],
  data: {
    permissions: [
      PERMISSIONS.payments.create,
    ],
  },
  loadComponent: () =>
    import(
      './Components/payment/paymentform/paymentform'
    ).then(
      (module) => module.Paymentform,
    ),
},

{
  path: 'folios/:folioId/payments',
  canActivate: [permissionGuard],
  data: {
    permissions: [
      PERMISSIONS.payments.read,
    ],
  },
  loadComponent: () =>
    import(
      './Components/payment/paymentlist/paymentlist'
    ).then(
      (module) => module.Paymentlist,
    ),
},

{
  path: 'folios/:folioId',
  canActivate: [permissionGuard],
  data: {
    permissions: [
      PERMISSIONS.folios.read,
    ],
  },
  loadComponent: () =>
    import(
      './Components/folio/foliodetails/foliodetails'
    ).then(
      (module) => module.Foliodetails,
    ),
},

{
  path: 'folios',
  canActivate: [permissionGuard],
  data: {
    permissions: [
      PERMISSIONS.folios.read,
    ],
  },
  loadComponent: () =>
    import(
      './Components/folio/foliolist/foliolist'
    ).then(
      (module) => module.Foliolist,
    ),
},

/*
 * Payments
 */

{
  path: 'payments/:id',
  canActivate: [permissionGuard],
  data: {
    permissions: [
      PERMISSIONS.payments.read,
    ],
  },
  loadComponent: () =>
    import(
      './Components/payment/paymentdetails/paymentdetails'
    ).then(
      (module) => module.Paymentdetails,
    ),
},
/*
   * Expenses
   */
  {
    path: 'expenses/create',
    canActivate: [permissionGuard],
    data: { permissions: [PERMISSIONS.expenses.create] },
    loadComponent: () =>
      import('./Components/expenses/expenseform/expenseform').then(
        (module) => module.Expenseform,
      ),
  },
  {
    path: 'expenses/:id/edit',
    canActivate: [permissionGuard],
    data: { permissions: [PERMISSIONS.expenses.update] },
    loadComponent: () =>
      import('./Components/expenses/expenseform/expenseform').then(
        (module) => module.Expenseform,
      ),
  },
  {
    path: 'expenses/:id',
    canActivate: [permissionGuard],
    data: { permissions: [PERMISSIONS.expenses.read] },
    loadComponent: () =>
      import('./Components/expenses/expensedetails/expensedetails').then(
        (module) => module.Expensedetails,
      ),
  },
  {
    path: 'expenses',
    canActivate: [permissionGuard],
    data: { permissions: [PERMISSIONS.expenses.read] },
    loadComponent: () =>
      import('./Components/expenses/expenselist/expenselist').then(
        (module) => module.Expenselist,
      ),
  },
  {
    path: 'reports',
    canActivate: [permissionGuard],
    data: { permissions: [PERMISSIONS.reports.read] },
    loadComponent: () =>
      import('./Components/reports/reports/reports').then(
        (module) => module.Reports,
      ),
  },
/*
 * Services
 */

{
  path: 'services/create',
  canActivate: [permissionGuard],
  data: {
    permissions: [
      PERMISSIONS.services.create,
    ],
  },
  loadComponent: () =>
    import(
      './Components/services/serviceform/serviceform'
    ).then(
      (module) => module.Serviceform,
    ),
},

{
  path: 'services/:id/edit',
  canActivate: [permissionGuard],
  data: {
    permissions: [
      PERMISSIONS.services.update,
    ],
  },
  loadComponent: () =>
    import(
      './Components/services/serviceform/serviceform'
    ).then(
      (module) => module.Serviceform,
    ),
},

{
  path: 'services/:id',
  canActivate: [permissionGuard],
  data: {
    permissions: [
      PERMISSIONS.services.read,
    ],
  },
  loadComponent: () =>
    import(
      './Components/services/servicedetails/servicedetails'
    ).then(
      (module) => module.Servicedetails,
    ),
},

{
  path: 'services',
  canActivate: [permissionGuard],
  data: {
    permissions: [
      PERMISSIONS.services.read,
    ],
  },
  loadComponent: () =>
    import(
      './Components/services/servicelist/servicelist'
    ).then(
      (module) => module.Servicelist,
    ),
},

       
 
 {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },

  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
