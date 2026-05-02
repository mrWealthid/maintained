import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSectionHeader } from "@/features/dashboard/components/DashboardSectionHeader";

export function SettingsSection(props: {
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    icon?: LucideIcon;
    actions?: ReactNode;
    iconClassName?: string;
    iconWrapClassName?: string;
}) {
    return (
        <Card className="border-border/70 bg-muted/20 shadow-none">
            <CardHeader>
                {props.icon && typeof props.title === "string" ? (
                    <DashboardSectionHeader
                        title={props.title}
                        description={
                            typeof props.description === "string" ? props.description : undefined
                        }
                        icon={props.icon}
                        iconClassName={props.iconClassName}
                        iconWrapClassName={props.iconWrapClassName}
                        actions={props.actions}
                    />
                ) : (
                    <>
                        <CardTitle className="flex items-center gap-2">{props.title}</CardTitle>
                        {props.description ? <CardDescription>{props.description}</CardDescription> : null}
                    </>
                )}
            </CardHeader>
            <CardContent className="space-y-6">{props.children}</CardContent>
        </Card>
    );
}
