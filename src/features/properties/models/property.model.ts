import { Property } from "../services/property-service";

export interface PropertyRowProps {
  data?: Property[];
}

export interface PropertyRowActionsProps {
  property: Property;
}
