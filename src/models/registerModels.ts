import AppConfig from "@/models/appConfigModel";
import AuthSession from "@/models/authSessionModel";
import Business from "@/models/businessModel";
import ChatMessage from "@/models/chatMessage";
import ChatRoom from "@/models/chatRoom";
import Property from "@/models/propertyModel";
import RoleDefinition from "@/models/roleDefinitionModel";
import { TechnicianRequest } from "@/models/technicanRequest";
import { TicketActivity } from "@/models/ticketActivity";
import TicketCategory from "@/models/ticketCategoryModel";
import Ticket from "@/models/ticketModel";
import TicketType from "@/models/ticketTypeModel";
import Unit from "@/models/unitModel";
import User from "@/models/userModel";
import UserPermissionOverride from "@/models/userPermissionOverrideModel";

let registered = false;

export function registerModels() {
  if (registered) return;

  // Touch model exports so Mongoose compiles/registers them once per runtime.
  // Required so .populate() works in routes that only import a single model.
  void AppConfig;
  void AuthSession;
  void Business;
  void ChatMessage;
  void ChatRoom;
  void Property;
  void RoleDefinition;
  void TechnicianRequest;
  void TicketActivity;
  void TicketCategory;
  void Ticket;
  void TicketType;
  void Unit;
  void User;
  void UserPermissionOverride;

  registered = true;
}
