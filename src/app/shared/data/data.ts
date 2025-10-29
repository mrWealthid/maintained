import { ROLES } from "../enums/enums";
import { CrumbLabelMap, Routes } from "../model/model";
import { adminRoutes, routes, technicianRoutes } from "../routes/routes";

export const crumbLabelMap: CrumbLabelMap = {
  dashboard: { label: "Dashboard" },
  "ticket-management": { label: "Ticket Management" },
  settings: { label: "Settings" },
};

export const adminCrumbLabelMap: CrumbLabelMap = {
  admin: { label: "", hide: true },
  dashboard: { label: "Dashboard" },
  "ticket-management": { label: "Ticket Management" },
  users: { label: "Users" },
  settings: { label: "Settings" },
};
export const technicianCrumbLabelMap: CrumbLabelMap = {
  technician: { label: "", hide: true },
  dashboard: { label: "Dashboard" },
  "ticket-management": { label: "Ticket Management" },
  settings: { label: "Settings" },
};

export const layoutConfig: Record<
  ROLES.user | ROLES.admin | ROLES.technician,
  { routes: Routes[]; crumbLabelMap: CrumbLabelMap }
> = Object.freeze({
  [ROLES.user]: Object.freeze({
    routes: routes,
    crumbLabelMap: crumbLabelMap,
  }),
  [ROLES.admin]: Object.freeze({
    routes: adminRoutes,
    crumbLabelMap: adminCrumbLabelMap,
  }),

  [ROLES.technician]: Object.freeze({
    routes: technicianRoutes,
    crumbLabelMap: technicianCrumbLabelMap,
  }),
});
