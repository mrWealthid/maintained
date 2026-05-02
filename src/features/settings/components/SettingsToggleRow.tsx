import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function SettingsToggleRow(props: {
    label: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="space-y-0.5">
                <Label>{props.label}</Label>
                {props.description ? (
                    <p className="text-sm text-muted-foreground">{props.description}</p>
                ) : null}
            </div>
            <Switch checked={props.checked} onCheckedChange={props.onCheckedChange} disabled={props.disabled} />
        </div>
    );
}
