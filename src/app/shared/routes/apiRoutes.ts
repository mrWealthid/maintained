const base = "/api";
const resourceById = (resource: string) => (id: string) =>
  `${base}/${resource}/${id}`;

export const API_ROUTES = {
  auth: {
    login: `${base}/auth/login`,
    register: `${base}/auth/register`,
    logout: `${base}/auth/logout`,
    onboard: `${base}/auth/onboard`,
    forgot_password: `${base}/auth/forgotPassword`,
    reset_password: `${base}/auth/resetPassword`,
    update_password: `${base}/auth/updatePassword`,
  },
  userManagement: {
    get_users: `${base}/users`,
    get_user: `${base}/users/me`,
    invite_user: `${base}/users/invite-user`,
    userById: (id: string) => resourceById("users")(id),
    switch_currentBusiness: `${base}/users/switch-business`,
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
