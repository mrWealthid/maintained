import type { AppSettingsFormValues } from "./app-settings-form.model";

export interface AppSettingsPayload {
  settings: AppSettingsFormValues["settings"];
}
