import { Unit } from "../service/unit-service";

export interface UnitRowProps {
  data?: Unit[];
}

export interface UnitRowActionsProps {
  unit: Unit;
}
