const base = "/api";
const resourceById = (resource: string) => (id: string) =>
  `${base}/${resource}/${id}`;

export const API_ROUTES = {
  dashboard: {
    exports: {
      table: `${base}/dashboard/exports/table`,
    },
    settings: {
      securitySessions: `${base}/dashboard/settings/security/sessions`,
      securitySessionById: (sessionId: string) =>
        `${base}/dashboard/settings/security/sessions/${sessionId}`,
      securitySessionsRevokeOthers:
        `${base}/dashboard/settings/security/sessions/revoke-others`,
    },
  },
  auth: {
    login: `${base}/auth/login`,
    register: `${base}/auth/register`,
    logout: `${base}/auth/logout`,
    me: `${base}/auth/me`,
    onboard: `${base}/auth/onboard`,
    sidebarProfile: `${base}/auth/sidebar-profile`,
    workspaceCreate: `${base}/auth/workspaces`,
    workspaceSwitch: `${base}/auth/workspaces/switch`,
    workspaceUpgrade: `${base}/auth/workspaces/upgrade`,
    passwordPolicyConfig: `${base}/auth/password-policy/config`,
    passwordlessConfig: `${base}/auth/passwordless/config`,
    passwordlessRequest: `${base}/auth/passwordless/request`,
    passwordlessRevoke: `${base}/auth/passwordless/revoke`,
    passwordlessVerify: `${base}/auth/passwordless/verify`,
    sessionKeepAlive: `${base}/auth/session/keep-alive`,
    forgotPassword: `${base}/auth/forgotPassword`,
    resetPassword: `${base}/auth/resetPassword`,
    updatePassword: `${base}/auth/updatePassword`,
  },
  workspaces: {
    get_all: `${base}/workspaces`,
    byId: (id: string) => `${base}/workspaces/${id}`,
    bulkActions: `${base}/workspaces/bulk/actions`,
  },
  appSettings: {
    root: `${base}/dashboard/settings/app`,
    security: `${base}/dashboard/settings/app/security`,
    categories: `${base}/dashboard/settings/app/categories`,
    categoryById: (id: string) =>
      `${base}/dashboard/settings/app/categories/${id}`,
    ticketTypes: `${base}/dashboard/settings/app/ticket-types`,
    ticketTypeById: (id: string) =>
      `${base}/dashboard/settings/app/ticket-types/${id}`,
    emailTest: `${base}/dashboard/settings/app/email/test`,
  },
  userManagement: {
    get_users: `${base}/users`,
    get_user: `${base}/users/me`,
    invite_user: `${base}/users/invite-user`,
    userById: (id: string) => resourceById("users")(id),
    switch_currentBusiness: `${base}/users/switch-business`,
    notification_preferences: `${base}/user/notification-preferences`,
    change_password: `${base}/user/change-password`,
  },
  settings: {
    email: `${base}/dashboard/settings/email`,
    security: `${base}/dashboard/settings/security`,
  },

  team: {
    list: `${base}/team`,
    byId: (id: string) => `${base}/team/${id}`,
    resend: (id: string) => `${base}/team/${id}/resend`,
    permissionsById: (id: string) => `${base}/team/${id}/permissions`,
    roles: `${base}/team/roles`,
  },

  ticketManagement: {
    get_tickets: `${base}/tickets`,
    ticketById: (id: string) => resourceById("tickets")(id),
    get_categories: `${base}/tickets/categories`,
    get_request_types: `${base}/tickets/types`,
    actionedBy_ticket: (id: string) =>
      `${resourceById("tickets")(id)}/actioned-by`,
    create_ticket: `${base}/tickets`,
    update_status: (id: string) => resourceById("tickets/update-status")(id),
    assign_technician: (id: string) => resourceById("tickets/assign")(id),
    fetch_technician_requestDetails: `${base}/tickets/respond`,
    process_technician_response: (id: string) =>
      resourceById("tickets/respond")(id),
    send_technician_request: (id: string) =>
      resourceById("tickets/technician-request")(id),
    get_technician_requests: `${base}/tickets/technician-request`,
    bulk_actions: `${base}/tickets/bulk-actions`,
  },
  chat: {
    get_rooms: `${base}/chat/rooms`,
    send_message: (id: string) => `${base}/chat/rooms/${id}/messages`,
    edit_message: (roomId: string, id: string) =>
      `${base}/chat/rooms/${roomId}/messages/${id}`,
    delete_message: (roomId: string, id: string) =>
      `${base}/chat/rooms/${roomId}/messages/${id}`,
    get_room_messages: (id: string) => `${base}/chat/rooms/${id}/messages`,
    message_delivered: (roomId: string, messageId: string) =>
      `/api/chat/rooms/${roomId}/messages/${messageId}/delivered`,
    message_read: (roomId: string) => `/api/chat/rooms/${roomId}/read`,
  },
  propertyManagement: {
    get_properties: `${base}/properties`,
    propertyById: (id: string) => resourceById("properties")(id),
    get_units: `${base}/units`,
    unitById: (id: string) => resourceById("units")(id),
  },
};
