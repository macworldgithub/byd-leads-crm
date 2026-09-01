import type { ComponentType } from "react";
import {
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  Users,
  Warehouse,
} from "lucide-react";

export const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Leads Pipeline", icon: Users },
  { label: "Conversations", icon: MessageSquare },
  { label: "Inventory", icon: Warehouse },
  { label: "Appointments", icon: CalendarDays },
  { label: "Compliance", icon: ShieldCheck },
  { label: "Settings", icon: Settings },
] as const;

export type SectionName = (typeof navigation)[number]["label"];
export type SectionProps = {
  onModal?: (type: "prospect" | "csv" | "dealer") => void;
  onAdd?: () => void;
  onEdit?: () => void;
};
export type SectionRegistry = Record<SectionName, ComponentType<SectionProps>>;

export function getSection(registry: SectionRegistry, name: string) {
  return registry[name as SectionName] ?? registry.Dashboard;
}
