import { ROLES } from "../enums/enums";
import { Routes } from "../model/model";
import { adminRoutes, routes, technicianRoutes } from "../routes/appRoutes";

export const layoutConfig: Record<
  ROLES.user | ROLES.admin | ROLES.technician,
  { routes: Routes[] }
> = Object.freeze({
  [ROLES.user]: Object.freeze({
    routes: routes,
  }),
  [ROLES.admin]: Object.freeze({
    routes: adminRoutes,
  }),

  [ROLES.technician]: Object.freeze({
    routes: technicianRoutes,
  }),
});
