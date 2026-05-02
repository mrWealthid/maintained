import { Unit } from "../services/unit-service";

export interface UnitRowProps {
  data?: Unit[];
}

export interface UnitRowActionsProps {
  unit: Unit;
}
