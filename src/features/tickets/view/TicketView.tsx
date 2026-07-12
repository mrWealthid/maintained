"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useFetchTicketDetails,
  useReTriageTicket,
} from "@/features/tickets/hooks/ticketHooks";
import type { UIError } from "@/utils/apiError";
import TicketDetailSkeleton from "./TicketDetailSkeleton";
import TicketDetailNotFoundState from "./TicketDetailNotFoundState";
import TicketDetailErrorState from "./TicketDetailErrorState";
import TicketTechnicianResponsesPanel from "./TicketTechnicianResponsesPanel";
import AdminRepairQuotesPanel from "@/features/repair-quotes/components/AdminRepairQuotesPanel";
import { TicketActions } from "@/features/tickets/components/TicketActions";
import type { Ticket } from "@/shared/model/model";
import {
  ArrowLeft,
  Bath,
  Bed,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Flag,
  Hash,
  Image as ImageIcon,
  Link2,
  MapPin,
  Mail,
  Phone,
  Ruler,
  Tag,
  User as UserIcon,
  UserCheck,
  Video,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AI_TRIAGE_STATUS,
  ROLES,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "@/shared/enums/enums";
import type { TicketAiTriage } from "@/shared/model/model";
import { useAppContext } from "@/shared/contexts/AppContext";
import { getTicketTypeLabel } from "@/shared/tickets/ticket-types";
import TicketAiTriagePanel from "./TicketAiTriagePanel";
import {
  TICKET_PRIORITY_META,
  TICKET_STATUS_META,
} from "@/features/tickets/data/list-data";
import TicketActivityTimeline from "./TicketActivityTimeline";

type Address = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

type RichUser = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  photo?: string;
  contact?: string;
};

type RichTicket = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: TICKET_STATUS;
  priority: TICKET_PRIORITY;
  area: string;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string | null;
  completedAt?: string | null;
  closedAt?: string | null;
  images?: string[];
  videos?: string[];
  documents?: string[];
  category?: { id?: string; name?: string; description?: string } | string;
  type?: { id?: string; name?: string; description?: string } | string;
  user?: RichUser;
  assignedTo?: RichUser | null;
  actionedBy?: RichUser | null;
  property?: {
    id?: string;
    name?: string;
    type?: string;
    code?: string;
    address?: Address;
  } | null;
  unit?: {
    id?: string;
    label?: string;
    floor?: string;
    bedrooms?: number;
    bathrooms?: number;
    sizeSqft?: number;
  } | null;
  propertyName?: string;
  unitLabel?: string;
  locationSnapshot?: {
    propertyName?: string;
    unitLabel?: string;
    address?: Address;
  };
  relatedTo?: {
    id?: string;
    slug?: string;
    title?: string;
    status?: TICKET_STATUS;
    priority?: TICKET_PRIORITY;
    propertyName?: string;
    unitLabel?: string;
    createdAt?: string;
  } | null;
  requests?: unknown[];
  aiTriageStatus?: AI_TRIAGE_STATUS;
  aiTriageError?: string;
  aiTriageStartedAt?: string;
  aiTriageCompletedAt?: string;
  aiTriageFailedAt?: string;
  aiTriageSource?: string;
  aiTriage?: TicketAiTriage;
};

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAddress(addr?: Address) {
  if (!addr) return null;
  const lines = [
    addr.line1,
    addr.line2,
    [addr.city, addr.state, addr.postalCode].filter(Boolean).join(", "),
    addr.country,
  ].filter((line) => line && line.toString().trim().length > 0);
  return lines;
}

function StatusPill({ status }: { status?: TICKET_STATUS }) {
  if (!status) return null;
  const meta = (TICKET_STATUS_META as Record<string, { label: string; className: string } | undefined>)[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta?.className ?? "bg-muted text-muted-foreground"}`}
    >
      {meta?.label ?? status}
    </span>
  );
}

function PriorityPill({ priority }: { priority?: TICKET_PRIORITY }) {
  if (!priority) return null;
  const meta = (TICKET_PRIORITY_META as Record<string, { label: string; className: string } | undefined>)[priority];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${meta?.className ?? "bg-muted text-muted-foreground"}`}
    >
      <Flag className="h-3 w-3" aria-hidden="true" />
      {meta?.label ?? priority}
    </span>
  );
}

function isRenderableImageSrc(value?: string | null): value is string {
  if (!value) return false;
  if (value === "default.jpg") return false;
  return value.startsWith("/") || /^https?:\/\//i.test(value);
}

function PersonRow({
  label,
  user,
  emptyText,
  icon: Icon = UserIcon,
}: {
  label: string;
  user?: RichUser | null;
  emptyText: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const photo = isRenderableImageSrc(user?.photo) ? user!.photo! : null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {user ? (
        <div className="mt-2 flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary"
            aria-hidden="true"
          >
            {photo ? (
              <Image
                src={photo}
                alt=""
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <Icon className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {user.name ?? "Unknown user"}
            </p>
            {user.email ? (
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Mail className="h-3 w-3" aria-hidden="true" />
                {user.email}
              </p>
            ) : null}
            {user.contact ? (
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <Phone className="h-3 w-3" aria-hidden="true" />
                {user.contact}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{emptyText}</p>
      )}
    </div>
  );
}

function MetaRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
        {label}
      </span>
      <span className="min-w-0 wrap-break-word text-right text-sm">{value}</span>
    </div>
  );
}

export default function TicketView({ slug }: { slug: string }) {
  const { data, isLoading, error, refetch } = useFetchTicketDetails(slug);
  const { user } = useAppContext();
  const { isReTriaging, handleReTriage } = useReTriageTicket();
  const isStaff =
    user.role !== ROLES.user && user.role !== ROLES.tenant;
  const ticket = (data as { data?: RichTicket } | undefined)?.data;

  if (isLoading) {
    return <TicketDetailSkeleton />;
  }

  if (!ticket) {
    const status = (error as UIError | null | undefined)?.status;
    if (status === 404 || !error) {
      return <TicketDetailNotFoundState />;
    }
    return (
      <TicketDetailErrorState error={error} onRetry={() => void refetch()} />
    );
  }

  const categoryName =
    typeof ticket.category === "object" ? ticket.category?.name : undefined;
  const typeName =
    typeof ticket.type === "object"
      ? ticket.type?.name
      : getTicketTypeLabel(ticket.type);
  const propertyName =
    ticket.property?.name ?? ticket.propertyName ?? ticket.locationSnapshot?.propertyName;
  const unitLabel =
    ticket.unit?.label ?? ticket.unitLabel ?? ticket.locationSnapshot?.unitLabel;
  const address =
    ticket.property?.address ?? ticket.locationSnapshot?.address ?? undefined;
  const addressLines = formatAddress(address);

  const hasImages = Boolean(ticket.images?.length);
  const hasVideos = Boolean(ticket.videos?.length);
  const hasDocs = Boolean(ticket.documents?.length);
  const hasAttachments = hasImages || hasVideos || hasDocs;

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tickets
        </Link>
      </nav>

      {/* Hero header */}
      <Card className="border-primary/30 bg-linear-to-br from-primary/15 via-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={ticket.status} />
                <PriorityPill priority={ticket.priority} />
                {ticket.assignedTo ? (
                  <Badge variant="outline" className="gap-1">
                    <UserCheck className="h-3 w-3" aria-hidden="true" />
                    Assigned
                  </Badge>
                ) : null}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {ticket.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  <span className="font-mono">
                    {ticket.slug}
                  </span>
                  {" · "}Opened {formatDateTime(ticket.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-1 text-xs text-muted-foreground">
                {propertyName ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    {[propertyName, unitLabel].filter(Boolean).join(" · ")}
                  </span>
                ) : null}
                {ticket.user?.name ? (
                  <span className="inline-flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5" />
                    {ticket.user.name}
                  </span>
                ) : null}
                {ticket.area ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {ticket.area}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="shrink-0 self-start">
              <TicketActions ticket={ticket as unknown as Ticket} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          <TicketAiTriagePanel
            status={ticket.aiTriageStatus}
            triage={ticket.aiTriage}
            error={ticket.aiTriageError}
            completedAt={ticket.aiTriageCompletedAt}
            source={ticket.aiTriageSource}
            isStaff={isStaff}
            canReTriage={
              isStaff &&
              (ticket.aiTriageStatus === AI_TRIAGE_STATUS.completed ||
                ticket.aiTriageStatus === AI_TRIAGE_STATUS.failed)
            }
            isReTriaging={isReTriaging}
            onReTriage={() => handleReTriage(ticket.slug)}
          />

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {ticket.description}
              </p>
              {ticket.area ? (
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {ticket.area}
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {!hasAttachments ? (
                <div className="rounded-xl border border-dashed bg-muted/30 px-6 py-10 text-center">
                  <ImageIcon
                    className="mx-auto h-7 w-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="mt-3 text-sm font-medium">
                    No attachments yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Photos, videos, or documents added to this ticket will
                    appear here.
                  </p>
                </div>
              ) : null}
              {hasImages ? (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Images ({ticket.images!.length})
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {ticket.images!.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative aspect-4/3 overflow-hidden rounded-lg border bg-muted"
                      >
                        <Image
                          src={url}
                          alt="Ticket attachment"
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition group-hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
              {hasVideos ? (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Videos ({ticket.videos!.length})
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {ticket.videos!.map((url) => (
                      <video
                        key={url}
                        src={url}
                        controls
                        className="aspect-video w-full rounded-lg border bg-black"
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              {hasDocs ? (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Documents ({ticket.documents!.length})
                  </p>
                  <ul className="space-y-2">
                    {ticket.documents!.map((url) => {
                      const filename = url.split("/").pop() ?? url;
                      return (
                        <li key={url}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm hover:border-primary/40"
                          >
                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{filename}</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Related ticket */}
          {ticket.relatedTo ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Link2 className="h-4 w-4" aria-hidden="true" />
                  Related ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/dashboard/tickets/${ticket.relatedTo.slug}`}
                  className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3 hover:border-primary/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {ticket.relatedTo.title ?? "Untitled"}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {[
                        ticket.relatedTo.propertyName,
                        ticket.relatedTo.unitLabel,
                        ticket.relatedTo.createdAt
                          ? formatDate(ticket.relatedTo.createdAt)
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusPill status={ticket.relatedTo.status} />
                    <PriorityPill priority={ticket.relatedTo.priority} />
                  </div>
                </Link>
              </CardContent>
            </Card>
          ) : null}

          {/* Activity — fills remaining column height, content scrolls */}
          <Card className="flex min-h-[20rem] flex-1 flex-col overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" aria-hidden="true" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col p-0">
              <ScrollArea className="h-full px-6 pb-6">
                <TicketActivityTimeline ticketSlug={ticket.slug} />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">People</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <PersonRow
                label="Reporter"
                user={ticket.user}
                emptyText="Unknown reporter"
                icon={UserIcon}
              />
              <Separator />
              <PersonRow
                label="Assigned to"
                user={ticket.assignedTo}
                emptyText="Unassigned"
                icon={Wrench}
              />
              {ticket.actionedBy ? (
                <>
                  <Separator />
                  <PersonRow
                    label="Last actioned by"
                    user={ticket.actionedBy}
                    emptyText="—"
                    icon={UserCheck}
                  />
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <MetaRow
                icon={Building2}
                label="Property"
                value={
                  ticket.property?.id ? (
                    <Link
                      href={`/dashboard/properties/${ticket.property.id}`}
                      className="font-medium hover:underline"
                    >
                      {propertyName}
                    </Link>
                  ) : (
                    propertyName ?? "—"
                  )
                }
              />
              <MetaRow icon={Hash} label="Unit" value={unitLabel ?? "—"} />
              {ticket.unit?.floor ? (
                <MetaRow label="Floor" value={ticket.unit.floor} />
              ) : null}
              {ticket.unit?.bedrooms !== undefined ? (
                <MetaRow
                  icon={Bed}
                  label="Bedrooms"
                  value={ticket.unit.bedrooms}
                />
              ) : null}
              {ticket.unit?.bathrooms !== undefined ? (
                <MetaRow
                  icon={Bath}
                  label="Bathrooms"
                  value={ticket.unit.bathrooms}
                />
              ) : null}
              {ticket.unit?.sizeSqft !== undefined ? (
                <MetaRow
                  icon={Ruler}
                  label="Size"
                  value={`${ticket.unit.sizeSqft} sqft`}
                />
              ) : null}
              {addressLines?.length ? (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Address
                    </p>
                    <address className="mt-1 not-italic text-sm leading-relaxed text-foreground">
                      {addressLines.map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </address>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" aria-hidden="true" />
                Classification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <MetaRow
                icon={ClipboardList}
                label="Category"
                value={categoryName ?? "—"}
              />
              <MetaRow icon={Wrench} label="Type" value={typeName ?? "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <MetaRow
                icon={CalendarDays}
                label="Created"
                value={formatDateTime(ticket.createdAt)}
              />
              {ticket.dueDate ? (
                <MetaRow
                  icon={CalendarClock}
                  label="Due"
                  value={formatDate(ticket.dueDate)}
                />
              ) : null}
              {ticket.completedAt ? (
                <MetaRow
                  icon={CheckCircle2}
                  label="Completed"
                  value={formatDateTime(ticket.completedAt)}
                />
              ) : null}
              {ticket.closedAt ? (
                <MetaRow
                  label="Closed"
                  value={formatDateTime(ticket.closedAt)}
                />
              ) : null}
              {ticket.updatedAt ? (
                <MetaRow
                  label="Last updated"
                  value={formatDateTime(ticket.updatedAt)}
                />
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>

      <TicketTechnicianResponsesPanel
        ticket={{
          slug: ticket.slug,
          status: ticket.status,
          requests: (ticket.requests as never) ?? [],
        }}
      />

      <AdminRepairQuotesPanel
        ticketSlug={ticket.slug}
        ticket={{
          slug: ticket.slug,
          title: ticket.title,
          area: ticket.area,
          priority: ticket.priority,
          propertyName: ticket.propertyName,
          unitLabel: ticket.unitLabel,
          diagnosis: ticket.aiTriage?.technicianDiagnosis
            ? {
                probableIssue: ticket.aiTriage.technicianDiagnosis.probableIssue,
                inspectionPoints:
                  ticket.aiTriage.technicianDiagnosis.inspectionPoints,
                recommendedTools:
                  ticket.aiTriage.technicianDiagnosis.recommendedTools,
                safetyNotes: ticket.aiTriage.technicianDiagnosis.safetyNotes,
              }
            : undefined,
        }}
      />
    </main>
  );
}
