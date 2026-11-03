/**
 * Real SyncEstate phone screens, rebuilt for the landing page from the app's
 * own layouts (mobile/app/**) with sample data. Each screen fills a 390×844
 * frame; the element marked data-phone-scroll is the part that scrolls.
 */
import type { ReactNode } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Building2,
  Calculator,
  Calendar,
  Camera,
  CheckSquare,
  CircleUser,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  Gauge,
  Image as ImageIcon,
  Library,
  Lock,
  Mail,
  Menu,
  MessageCircle,
  Move,
  PenLine,
  Phone,
  Plus,
  PlusCircle,
  Receipt,
  Send,
  Settings,
  Share,
  Trash2,
  TriangleAlert,
  User,
  Users,
  Waypoints,
  Wrench,
} from "lucide-react";
import {
  Badge,
  BarRow,
  Body,
  Button,
  c,
  Card,
  Chips,
  Facts,
  Field,
  Header,
  IconTile,
  List,
  ListItem,
  Photo,
  Section,
  Stat,
  StatGrid,
  StatusBar,
  TabBar,
  Text,
  Title,
} from "./ui";
import type { ScreenId } from "../content";

export const SCREEN_W = 390;
export const SCREEN_H = 844;

function Frame({
  header,
  footer,
  overlay,
  children,
  dark = false,
}: {
  header?: ReactNode;
  footer?: ReactNode;
  overlay?: ReactNode;
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: SCREEN_W,
        height: SCREEN_H,
        display: "flex",
        flexDirection: "column",
        background: dark ? c.ink : c.background,
        color: c.text,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', var(--font-geist), system-ui, sans-serif",
        overflow: "hidden",
        textAlign: "left",
      }}
    >
      <StatusBar dark={dark} />
      {header}
      <div data-phone-scroll className="l-phone-scroll" style={{ flex: 1, minHeight: 0 }}>
        {children}
      </div>
      {footer}
      {overlay}
    </div>
  );
}

const crmTabs = [
  { label: "Dashboard", icon: Gauge },
  { label: "Leads", icon: Waypoints },
  { label: "Contacts", icon: Users },
  { label: "Properties", icon: Building2 },
  { label: "More", icon: Menu },
];
const stayTabs = [
  { label: "Dashboard", icon: Gauge },
  { label: "Properties", icon: Building2 },
  { label: "Leases", icon: FileText },
  { label: "Arrears", icon: AlertCircle },
  { label: "More", icon: Menu },
];
const worthTabs = [
  { label: "Dashboard", icon: Gauge },
  { label: "Jobs", icon: ClipboardList },
  { label: "Comparables", icon: Library },
  { label: "More", icon: Menu },
];
const financeTabs = [
  { label: "Dashboard", icon: Gauge },
  { label: "Money", icon: ArrowUpDown },
  { label: "Landlords", icon: Users },
  { label: "Instalments", icon: Calendar },
  { label: "Payouts", icon: Send },
];

/* ---------- Hub ----------------------------------------------------- */

function Figure({ value, label, warn }: { value: string; label: string; warn?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 20, fontWeight: 300, letterSpacing: -0.4, color: warn ? c.warning : c.text }}>{value}</div>
      <div style={{ fontSize: 11, color: c.muted }}>{label}</div>
    </div>
  );
}

function ModuleTile({ product, name, figures }: { product: Parameters<typeof IconTile>[0]["product"]; name: string; figures?: [string, string, boolean?][]; }) {
  return (
    <Card gap={12} style={{ flexBasis: "47%", flexGrow: 1 }}>
      <IconTile product={product} />
      <div style={{ fontSize: 15, fontWeight: 600 }}>{name}</div>
      {figures ? (
        <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {figures.map(([v, l, w]) => (
            <Figure key={l} value={v} label={l} warn={w} />
          ))}
        </div>
      ) : (
        <Text small muted>
          Posts and flyers from listings
        </Text>
      )}
    </Card>
  );
}

export function HubScreen() {
  return (
    <Frame header={<Header title="Msasa Properties" left={<CircleUser size={26} strokeWidth={1.6} />} right={<BellIcon unread={5} />} />}>
      <Body>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: c.muted, textTransform: "uppercase", letterSpacing: 1.2 }}>Tuesday, 3 November</span>
          <Title>Good morning, Tendai</Title>
          <Text muted>Here is Msasa Properties at a glance, and 5 things need your attention.</Text>
        </div>
        <Section title="Needs attention">
          <List>
            <ListItem title="Open maintenance" subtitle="SyncStay · 2 new repair requests" right={<Badge tone="warning">4</Badge>} />
            <ListItem title="Arrears" subtitle="SyncStay · 3 tenants owing" right={<Badge tone="warning">USD 4,280</Badge>} />
            <ListItem title="Inspections due" subtitle="SyncStay · within 7 days" right={<Badge tone="warning">2</Badge>} />
            <ListItem title="Overdue valuations" subtitle="SyncWorth · 1 job" right={<Badge tone="warning">1</Badge>} />
            <ListItem title="Payouts awaiting approval" subtitle="SyncFinance · 2 landlords" right={<Badge tone="warning">USD 3,150</Badge>} />
          </List>
        </Section>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <ModuleTile product="crm" name="SynCRM" figures={[["38", "New leads this month"], ["26", "Deals in pipeline"]]} />
          <ModuleTile product="stay" name="SyncStay" figures={[["94%", "Occupancy"], ["USD 18,450", "Rent collected this month"]]} />
          <ModuleTile product="worth" name="SyncWorth" figures={[["12", "Open valuations"], ["1", "Overdue valuations", true]]} />
          <ModuleTile product="finance" name="SyncFinance" figures={[["USD 42,180", "Money in this month"], ["USD 27,960", "Money out this month"]]} />
          <ModuleTile product="dev" name="SyncDev" figures={[["40", "Stands available"], ["USD 31,500", "Owed by buyers"]]} />
          <ModuleTile product="media" name="SyncMedia" />
        </div>
        <ListItem icon={Settings} title="Hub admin" subtitle="Users, roles, agency settings and logs" />
        <Section title="Recent activity" link="See all">
          <List>
            <ListItem title="Viewing form signed" subtitle="Rudo Chikwanha · 14 Lomagundi Rd" meta="5 min ago" chevron={false} />
            <ListItem title="Payment received" subtitle="RCT-0142 · Chipo Dube · USD 650" meta="1 h ago" chevron={false} />
          </List>
        </Section>
      </Body>
    </Frame>
  );
}

function BellIcon({ unread }: { unread: number }) {
  // Re-exported for the Hub's own header, which has no module buttons.
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      <span style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, background: c.danger, color: "#fff", fontSize: 10, fontWeight: 700, display: "grid", placeItems: "center", padding: "0 4px" }}>
        {unread}
      </span>
    </span>
  );
}

/* ---------- SynCRM -------------------------------------------------- */

function ScoreBadge({ band, score }: { band: "Hot" | "Warm" | "Cold"; score: number }) {
  return <Badge tone={band === "Hot" ? "hot" : band === "Warm" ? "warning" : "info"}>{`${band} ${score}`}</Badge>;
}

export function CrmDashboardScreen() {
  return (
    <Frame header={<Header title="Dashboard" module unread={3} />} footer={<TabBar tabs={crmTabs} active={0} />}>
      <Body>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>Pipeline overview</span>
            <Badge tone="info">All leads</Badge>
          </div>
          <BarRow label="Win rate" value="34%" pct={34} />
        </Card>
        <StatGrid>
          <Stat label="Total leads" value="148" />
          <Stat label="Open leads" value="61" hint="Not yet won or lost" />
          <Stat label="Won" value="41" tone="good" />
          <Stat label="Lost" value="46" tone="danger" />
        </StatGrid>
        <div style={{ display: "flex", gap: 8 }}>
          <Button small icon={Plus}>New lead</Button>
          <Button small variant="secondary" icon={CheckSquare}>New task</Button>
        </div>
        <Section title="Top unworked leads" link="View all">
          <Text small muted>High scores with no activity in the last 7 days.</Text>
          <List>
            <ListItem title="Nyasha Gumbo" subtitle="Owner: Farai Ndlovu" right={<ScoreBadge band="Hot" score={86} />} />
            <ListItem title="Kudzai Marufu" subtitle="Owner: Tendai Moyo" right={<ScoreBadge band="Hot" score={79} />} />
            <ListItem title="Tatenda Banda" subtitle="Owner: Rumbi Zhou" right={<ScoreBadge band="Warm" score={64} />} />
          </List>
        </Section>
        <Section title="Today's agenda" link="All tasks">
          <List>
            <ListItem icon={Clock} title="Call Rudo Chikwanha" subtitle="09:30 · Call · Rudo Chikwanha" />
            <ListItem icon={Clock} title="Viewing: 14 Lomagundi Rd" subtitle="11:00 · Viewing · Rudo Chikwanha" />
            <ListItem icon={Clock} title="Send sale mandate" subtitle="08:00 · Paperwork · T. Mutasa" meta={<span style={{ color: c.danger, fontWeight: 600 }}>Overdue</span>} />
          </List>
        </Section>
        <Section title="Leads by stage">
          <Card>
            <BarRow label="New" value="18" pct={60} />
            <BarRow label="Contacted" value="15" pct={50} />
            <BarRow label="Viewing booked" value="12" pct={40} />
            <BarRow label="Offer made" value="9" pct={30} />
            <BarRow label="Negotiating" value="7" pct={23} />
          </Card>
        </Section>
      </Body>
    </Frame>
  );
}

function ActivityCard({ title, type, status, when }: { title: string; type: string; status: "To do" | "Completed"; when: string }) {
  return (
    <Card pad={12}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
        <Badge tone={status === "Completed" ? "success" : "warning"}>{status}</Badge>
      </div>
      <div>
        <Badge tone="info">{type}</Badge>
      </div>
      <Text small muted>
        {when}
      </Text>
    </Card>
  );
}

export function LeadDetailScreen() {
  return (
    <Frame header={<Header title="Rudo Chikwanha" back right={<Trash2 size={22} color={c.danger} strokeWidth={1.8} />} />}>
      <Body>
        <Card gap={12}>
          <Title>Rudo Chikwanha</Title>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Badge tone="info">Open</Badge>
            <Badge tone="success">Buying</Badge>
            <Badge>PropertyBook</Badge>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Button small variant="secondary" icon={Phone}>Call</Button>
            <Button small variant="secondary" icon={MessageCircle}>WhatsApp</Button>
            <Button small variant="secondary" icon={Mail}>Email</Button>
          </div>
          <Facts
            rows={[
              ["Phone", "+263 77 241 0968"],
              ["Owner", "Tendai Moyo"],
              ["Budget", "USD 180,000 to USD 240,000"],
              ["Created", "28 Oct 2026"],
            ]}
          />
          <div style={{ display: "flex", gap: 6 }}>
            {["Borrowdale", "Mount Pleasant"].map((a) => (
              <span key={a} style={{ borderRadius: 999, background: c.brandLight, color: c.brand, fontSize: 13, padding: "5px 10px" }}>
                {a}
              </span>
            ))}
          </div>
          <BarRow label="Stage progress" value="60%" pct={60} />
          <div style={{ borderRadius: 12, border: `1px solid ${c.borderStrong}`, background: c.surface, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: c.muted }}>Stage</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Viewing booked</div>
            </div>
            <span style={{ color: c.brand, fontWeight: 600, fontSize: 15 }}>Move ›</span>
          </div>
          <BarRow label="Lead score" value="86/100" pct={86} colour={c.success} />
        </Card>
        <Chips items={["Timeline", "Documents", "Viewings", "Properties", "Suggested"]} />
        <Section title="Timeline">
          <List>
            <ActivityCard title="Viewing at 14 Lomagundi Rd" type="Viewing" status="To do" when="Scheduled 3 Nov 2026, 11:00" />
            <ActivityCard title="Sent the brochure" type="WhatsApp" status="Completed" when="Scheduled 30 Oct 2026, 16:15" />
            <ActivityCard title="First call: wants 4 bed, Borrowdale" type="Call" status="Completed" when="Scheduled 28 Oct 2026, 10:00" />
          </List>
        </Section>
      </Body>
    </Frame>
  );
}

/* ---------- Viewing form -------------------------------------------- */

function SignedBox({ label, path }: { label: string; path: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>
        {label} <span style={{ color: c.danger }}>*</span>
      </span>
      <div style={{ border: `1px solid ${c.borderStrong}`, borderRadius: 12, background: c.card, padding: 8, minHeight: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <svg viewBox="0 0 220 60" width="200" height="54" aria-hidden>
          <path className="l-sign-path" d={path} fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
        </svg>
        <span style={{ fontSize: 11, fontWeight: 700, color: c.success, alignSelf: "flex-end" }}>Signed</span>
      </div>
    </div>
  );
}

export function ViewingFormScreen() {
  return (
    <Frame header={<Header title="New viewing form" back />}>
      <Body>
        <Card gap={12}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Field label="Viewing date" value="2026-11-03" />
            </div>
            <Button small variant="secondary" style={{ marginBottom: 4 }}>Today</Button>
          </div>
          <Field label="Viewing time" value="11:00" />
          <Field label="Property address *" value="14 Lomagundi Rd, Mount Pleasant, Harare" />
        </Card>
        <Section title="Client details">
          <Card gap={12}>
            <Field label="Client's name *" value="Rudo Chikwanha" />
            <Field label="Client's ID no." value="63-2214907 F 42" />
            <Field label="Client's telephone no." value="+263 77 241 0968" />
          </Card>
        </Section>
        <Section title="Signatures">
          <Card gap={16}>
            <SignedBox label="Client signature" path="M8 40c10-24 18-30 20-20s-6 26 2 18 14-30 22-26-4 28 4 24 10-16 18-14 2 14 10 10 16-18 26-16 6 10 14 8 20-6 34-8" />
            <SignedBox label="Property negotiator signature" path="M10 36c8-18 20-26 22-14s-10 20 0 16 18-24 28-20-6 22 4 18 22-14 30-10 4 8 16 6 26-12 40-10" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Seller / caretaker signature</span>
              <div style={{ display: "flex", gap: 8 }}>
                <Button small variant="secondary" icon={PenLine} style={{ flex: 1 }}>Sign</Button>
                <Button small variant="ghost" icon={ImageIcon}>Upload image</Button>
              </div>
            </div>
          </Card>
        </Section>
        <Button icon={Lock}>Complete and lock</Button>
        <Button variant="secondary">Save draft</Button>
      </Body>
    </Frame>
  );
}

/* ---------- SyncStay ------------------------------------------------ */

export function MaintenanceRequestScreen() {
  return (
    <Frame header={<Header title="Request" back />}>
      <Body>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700 }}>Cracked bedroom window</span>
            <Badge tone="info">In progress</Badge>
          </div>
          <Text small muted>
            12 Lomagundi Rd, Unit 4B. Tenant: Chipo Dube. Logged by Chipo Dube on 2 Nov 2026.
          </Text>
        </div>
        <Section title="Status">
          <Card gap={12}>
            <div style={{ display: "flex", gap: 8 }}>
              <Button small variant="secondary" style={{ flex: 1 }}>New</Button>
              <Button small style={{ flex: 1 }}>In progress</Button>
              <Button small variant="secondary" style={{ flex: 1 }}>Done</Button>
            </div>
            <Text small muted>The tenant is emailed when the status changes.</Text>
            <Field label="Assigned to" value="Blessing Sibanda" />
          </Card>
        </Section>
        <Section title="Details">
          <Card gap={12}>
            <Text>Bottom left pane of the main bedroom window is cracked. Found at the routine inspection.</Text>
            <div style={{ display: "flex", gap: 8 }}>
              <Photo src="/landing/thumb-window.jpg" />
              <Photo src="/landing/thumb-bedroom.jpg" />
              <span style={{ width: 84, height: 84, borderRadius: 12, border: `1.5px dashed ${c.borderStrong}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, color: c.brand, fontSize: 13, fontWeight: 600 }}>
                <Camera size={22} strokeWidth={1.7} />
                Add
              </span>
            </div>
          </Card>
        </Section>
        <Section title="Cost">
          <Card gap={12}>
            <Text small muted>Recorded: USD 340 · Harare Glass & Glazing · 3 Nov 2026</Text>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <CheckSquare size={20} color={c.brand} strokeWidth={1.8} />
              Recharge to the landlord on their statement
            </div>
          </Card>
        </Section>
        <Section title="Landlord approval">
          <Card gap={12}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Farai Ndlovu</span>
              <Badge tone="warning">Pending</Badge>
            </div>
            <Text small muted>{"The cost is above the property's repair threshold, so the landlord approves it first."}</Text>
            <div style={{ display: "flex", gap: 8 }}>
              <Button small style={{ flex: 1 }}>Mark approved</Button>
              <Button small variant="secondary" style={{ flex: 1 }}>Mark declined</Button>
            </div>
          </Card>
        </Section>
      </Body>
    </Frame>
  );
}

function ConditionChips({ selected }: { selected: "Good" | "Fair" | "Poor" | "Damaged" }) {
  const tones = { Good: [c.success, c.successBg], Fair: [c.info, c.infoBg], Poor: [c.warning, c.warningBg], Damaged: [c.danger, c.dangerBg] } as const;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
      {(Object.keys(tones) as (keyof typeof tones)[]).map((k) => {
        const on = k === selected;
        return (
          <span
            key={k}
            style={{
              minHeight: 40,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${on ? tones[k][0] : c.borderStrong}`,
              background: on ? tones[k][1] : c.card,
              color: on ? tones[k][0] : c.muted,
            }}
          >
            {k}
          </span>
        );
      })}
    </div>
  );
}

export function InspectionScreen() {
  return (
    <Frame
      header={<Header title="Routine inspection" back />}
      footer={
        <div style={{ flex: "none", background: c.card, borderTop: `1px solid ${c.border}`, padding: "12px 16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: c.muted }}>Draft saved</span>
          <Button small>Complete inspection</Button>
        </div>
      }
    >
      <Body>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Routine inspection</div>
          <Text small muted>12 Lomagundi Rd, Unit 4B. Tenant: Chipo Dube</Text>
        </div>
        <Card>
          <Facts
            rows={[
              ["Date", "3 Nov 2026"],
              ["Inspector", "Blessing Sibanda"],
              ["Water meter", "004812"],
              ["Electricity meter", "17342"],
            ]}
          />
        </Card>
        <Section title="Rooms">
          <Card gap={12}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Main bedroom</span>
            <ConditionChips selected="Damaged" />
            <Text small muted>Window pane cracked, bottom left. Walls and floor fine.</Text>
            <div style={{ display: "flex", gap: 8 }}>
              <Photo src="/landing/thumb-window.jpg" />
              <Photo src="/landing/thumb-bedroom.jpg" />
            </div>
            <Button small variant="secondary" icon={Wrench}>Raise maintenance request</Button>
          </Card>
          <Card gap={12}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Living room</span>
            <ConditionChips selected="Good" />
            <Text small muted>Clean. No marks on walls or floors.</Text>
            <div style={{ display: "flex", gap: 8 }}>
              <Photo src="/landing/thumb-living.jpg" />
            </div>
          </Card>
          <Card gap={12}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Kitchen</span>
            <ConditionChips selected="Fair" />
            <Text small muted>Cupboard hinge loose, under the sink.</Text>
          </Card>
        </Section>
      </Body>
    </Frame>
  );
}

export function StayDashboardScreen() {
  return (
    <Frame header={<Header title="Dashboard" module unread={4} />} footer={<TabBar tabs={stayTabs} active={0} />}>
      <Body>
        <Text muted>Today is 3 Nov 2026.</Text>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Button icon={Receipt}>Record payment</Button>
          <Button variant="secondary" icon={PenLine}>New lease</Button>
        </div>
        <div style={{ background: c.dangerBg, border: "1px solid rgba(217,45,32,0.27)", borderRadius: 12, padding: 12, display: "flex", gap: 8, alignItems: "center", color: c.danger, fontSize: 13 }}>
          <TriangleAlert size={18} strokeWidth={1.8} style={{ flex: "none" }} />3 tenants are behind with rent. Open the arrears list.
        </div>
        <StatGrid>
          <Stat label="Open maintenance" value="4" hint="2 new requests" />
          <Stat label="Inspections due" value="2" hint="Due or overdue within 7 days" />
          <Stat label="Rent due this month" value="USD 21,300" />
          <Stat label="Collected so far" value="USD 18,450" tone="good" />
          <Stat label="Total arrears" value="USD 4,280" tone="danger" hint="3 tenants owing" />
          <Stat label="Vacant units" value="3" tone="warning" hint="94% occupied, 48 units" />
        </StatGrid>
        <Section title="Leases ending soon" link="All">
          <List>
            <ListItem title="Chipo Dube" subtitle="12 Lomagundi Rd, Unit 4B" right="14 Dec 2026" />
            <ListItem title="Tinashe Mhlanga" subtitle="Avondale Court, Unit 2" right="2 Jan 2027" />
          </List>
        </Section>
      </Body>
    </Frame>
  );
}

/* ---------- SyncWorth ----------------------------------------------- */

function JobCard({ ref_, address, sub, status, tone, due, late, valuer }: { ref_: string; address: string; sub: string; status: string; tone: "info" | "warning" | "neutral"; due: string; late?: boolean; valuer: string }) {
  return (
    <Card pad={12} gap={6}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: c.muted }}>{ref_}</span>
        <Badge tone={tone}>{status}</Badge>
      </div>
      <span style={{ fontSize: 15, fontWeight: 600 }}>{address}</span>
      <Text small muted>{sub}</Text>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span>
          {due}
          {late ? <span style={{ color: c.danger }}> (overdue)</span> : null}
        </span>
        <span style={{ color: c.muted }}>{valuer}</span>
      </div>
      <Button small style={{ alignSelf: "flex-start" }}>Start inspection</Button>
    </Card>
  );
}

export function WorthDashboardScreen() {
  return (
    <Frame header={<Header title="Dashboard" module unread={1} />} footer={<TabBar tabs={worthTabs} active={0} />}>
      <Body>
        <div style={{ display: "flex", gap: 8 }}>
          <Button small icon={Plus}>Log instruction</Button>
          <Button small variant="secondary" icon={User}>My valuer profile</Button>
        </div>
        <StatGrid>
          <Stat label="Open jobs" value="12" />
          <Stat label="Overdue" value="1" tone="warning" />
          <Stat label="Due this week" value="4" />
          <Stat label="Average turnaround" value="4.5 days" hint="Last 90 days (18 jobs)" />
        </StatGrid>
        <Section title="My jobs by due date">
          <List>
            <JobCard ref_="VAL-2026-0187" address="7 Harare Drive" sub="Borrowdale · CBZ Bank" status="Assigned" tone="info" due="Due 31 Oct 2026" late valuer="P. Mapfumo" />
            <JobCard ref_="VAL-2026-0191" address="22 Jacaranda Lane" sub="Greendale · Private client" status="Inspected" tone="info" due="Due 6 Nov 2026" valuer="P. Mapfumo" />
          </List>
        </Section>
        <Section title="Fees">
          <StatGrid>
            <Stat label="Issued this month" value="9" />
            <Stat label="Unpaid fees" value="US$2,400" tone="warning" hint="3 jobs" />
          </StatGrid>
        </Section>
      </Body>
    </Frame>
  );
}

/* ---------- SyncFinance --------------------------------------------- */

export function FinanceDashboardScreen() {
  return (
    <Frame header={<Header title="Dashboard" module unread={2} />} footer={<TabBar tabs={financeTabs} active={0} />}>
      <Body>
        <div style={{ display: "flex", gap: 8 }}>
          <Button small icon={PlusCircle}>Money in</Button>
          <Button small variant="secondary" icon={Calculator}>Cash-up</Button>
        </div>
        <Chips items={["This week", "This month"]} active={1} />
        <Text small muted>From 1 Nov 2026 to 30 Nov 2026. USD and ZiG are shown separately.</Text>
        <StatGrid>
          <Stat label="Held in trust" value="USD 64,210" hint="For landlords, tenants, buyers and developers" />
          <Stat label="Payouts due" value="USD 3,150" hint="2 awaiting approval" />
          <Stat label="Money in" value="USD 42,180" tone="good" hint="Excluding transfers" />
          <Stat label="Money out" value="USD 27,960" />
          <Stat label="Commission earned" value="USD 6,840" tone="good" />
          <Stat label="Tenant arrears" value="USD 4,280" tone="danger" />
        </StatGrid>
        <Section title="Balance per account">
          <List>
            <ListItem title="Trust account" subtitle="In USD 42,180, out USD 24,600" right="USD 64,210" />
            <ListItem title="Trust account (ZiG)" subtitle="In ZiG 96,000, out ZiG 41,500" right="ZiG 182,400" />
            <ListItem title="Business account" subtitle="In USD 6,840, out USD 3,360" right="USD 21,930" />
          </List>
        </Section>
      </Body>
    </Frame>
  );
}

/* ---------- SyncDev ------------------------------------------------- */

type StandStatus = "available" | "reserved" | "sold" | "overdue";
const STANDS: StandStatus[] = Array.from({ length: 60 }, (_, i) => {
  const n = i + 1;
  if ([7, 23, 41].includes(n)) return "overdue";
  if ([3, 9, 15, 28, 34, 52].includes(n)) return "reserved";
  if (n <= 20 && n % 2 === 0) return "sold";
  return "available";
});

function standStyle(s: StandStatus) {
  if (s === "available") return { color: c.brand, background: c.brandLight, border: `1px solid ${c.brand}` };
  if (s === "reserved") return { color: c.warning, background: c.warningBg, border: `1px solid ${c.warning}` };
  if (s === "sold") return { color: "#fff", background: c.brand, border: `1px solid ${c.brand}` };
  return { color: "#fff", background: c.brand, border: `2px solid ${c.danger}` };
}

export function DevStandsScreen() {
  const sold = STANDS.filter((s) => s === "sold" || s === "overdue").length;
  const reserved = STANDS.filter((s) => s === "reserved").length;
  const available = STANDS.length - sold - reserved;
  return (
    <Frame header={<Header title="Msasa Gardens Phase 2" back />}>
      <Body>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Text small muted>Ruwa, Harare East</Text>
          <div style={{ height: 10, borderRadius: 999, overflow: "hidden", display: "flex", background: c.border }}>
            <span style={{ width: `${(sold / 60) * 100}%`, background: c.brand }} />
            <span style={{ width: `${(reserved / 60) * 100}%`, background: c.warning }} />
            <span style={{ width: `${(available / 60) * 100}%`, background: c.primary }} />
          </div>
          <Text small>
            {available} available, {reserved} reserved, {sold} sold. Prices in USD.
          </Text>
        </div>
        <Chips items={[`All ${STANDS.length}`, `Available ${available}`, `Reserved ${reserved}`, `Sold ${sold}`]} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {STANDS.map((s, i) => (
            <span key={i} style={{ ...standStyle(s), height: 56, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{i + 1}</span>
              <span style={{ fontSize: 10, opacity: 0.85 }}>{s === "overdue" ? "Overdue" : s[0].toUpperCase() + s.slice(1)}</span>
            </span>
          ))}
        </div>
      </Body>
    </Frame>
  );
}

/* ---------- SyncMedia ----------------------------------------------- */

export function MediaStudioScreen() {
  const accent = "#2c4f0d";
  return (
    <Frame header={<Header title="Brochure" back />}>
      <Body style={{ alignItems: "stretch" }}>
        <div style={{ alignSelf: "center", border: `1px solid ${c.borderStrong}`, width: 270, height: 480, background: "#fbfaf6", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ alignSelf: "center", background: accent, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: "6px 14px", borderRadius: "0 0 8px 8px" }}>MSASA PROPERTIES</div>
          <div style={{ textAlign: "center", padding: "12px 14px 8px" }}>
            <div style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontWeight: 700, fontSize: 24, lineHeight: 1.05, color: accent }}>Modern family home</div>
            <div style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontStyle: "italic", fontSize: 11, color: c.muted, marginTop: 4 }}>FOR SALE in Borrowdale</div>
          </div>
          <div style={{ margin: "0 14px", borderRadius: 16, overflow: "hidden", height: 210 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/landing/thumb-house.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ marginTop: "auto", background: accent, color: "#fff", padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["/landing/thumb-living.jpg", "/landing/thumb-bedroom.jpg", "/landing/thumb-house-detail.jpg"].map((s) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={s} src={s} alt="" style={{ width: 74, height: 46, objectFit: "cover", border: "2px solid #fff", borderRadius: 4 }} />
              ))}
            </div>
            <div style={{ fontSize: 10, opacity: 0.9 }}>4 bed · 3 bath · Pool · 2,000 m² stand</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 8, letterSpacing: 1.5, opacity: 0.8 }}>ASKING PRICE</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>USD 385,000</div>
              </div>
              <div style={{ fontSize: 9, textAlign: "right", opacity: 0.9 }}>
                Tendai Moyo
                <br />
                +263 77 241 0968
              </div>
            </div>
          </div>
        </div>
        <Text small muted style={{ textAlign: "center" }}>1080 x 1920 px · Saved</Text>
        <Button icon={Share}>Export image</Button>
        <Button variant="secondary" icon={Move}>Adjust layout</Button>
        <Chips items={["Property", "Photos", "Text", "Design"]} active={3} />
      </Body>
    </Frame>
  );
}

/* ---------- Sign-in ------------------------------------------------- */

export function SignInScreen() {
  return (
    <Frame dark>
      <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "stretch", gap: 16, padding: "40px 20px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark.svg" alt="" width={56} height={65} style={{ alignSelf: "center" }} />
        <div style={{ textAlign: "center", fontSize: 28, fontWeight: 600, color: "#fff", letterSpacing: -0.6 }}>SyncEstate</div>
        <div style={{ textAlign: "center", fontSize: 15, color: "rgba(238,242,243,0.7)" }}>One sign-in for every product your agency uses</div>
        <Card gap={12} style={{ marginTop: 8 }}>
          <Field label="Email" value="tendai@msasaproperties.co.zw" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Password</span>
            <span style={{ border: `1px solid ${c.borderStrong}`, borderRadius: 12, padding: 12, fontSize: 15, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              ••••••••••
              <Eye size={20} color={c.muted} strokeWidth={1.7} />
            </span>
          </div>
          <Button>Sign in</Button>
          <Button variant="ghost">Forgot your password?</Button>
        </Card>
      </div>
    </Frame>
  );
}

export const SCREENS: Record<string, () => ReactNode> = {
  hub: HubScreen,
  crm: CrmDashboardScreen,
  lead: LeadDetailScreen,
  viewing: ViewingFormScreen,
  maintenance: MaintenanceRequestScreen,
  inspection: InspectionScreen,
  stay: StayDashboardScreen,
  worth: WorthDashboardScreen,
  finance: FinanceDashboardScreen,
  dev: DevStandsScreen,
  media: MediaStudioScreen,
  signin: SignInScreen,
};

/** Which screens each showcase chapter cycles through. */
export const CHAPTER_SCREENS: Record<string, string[]> = {
  crm: ["crm", "lead"],
  viewings: ["viewing"],
  stay: ["maintenance", "inspection", "stay"],
  worth: ["worth"],
  finance: ["finance"],
  dev: ["dev"],
  media: ["media"],
};

export type { ScreenId };
