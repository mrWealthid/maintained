import { Property } from "../service/property-service";

export interface PropertyRowProps {
  data?: Property[];
}

export interface PropertyRowActionsProps {
  property: Property;
}
