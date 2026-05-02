import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

export function SettingsField(props: { label: string; htmlFor?: string; children: ReactNode }) {
    return (
        <div className="space-y-3">
            <Label htmlFor={props.htmlFor} className="text-sm font-medium text-foreground">
                {props.label}
            </Label>
            {props.children}
        </div>
    );
}
