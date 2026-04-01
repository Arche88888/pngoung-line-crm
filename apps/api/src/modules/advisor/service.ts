import type { AdvisorReport, AdvisorSuggestion } from "@pngoung/shared";
import type { AnalysisProvider } from "../analysis/provider.js";
import { crmStore } from "../crm/store.js";

export async function generateAdvisorReport(provider: AnalysisProvider): Promise<AdvisorReport> {
  const rooms = crmStore.listRooms();
  const contacts = crmStore.listContacts();
  const tasks = crmStore.listTasks();

  const llmSuggestions = await provider.generateAdvisorSuggestions({
    rooms,
    contacts,
    tasks
  }).catch(() => null);

  const suggestions = llmSuggestions && llmSuggestions.length > 0
    ? llmSuggestions
    : generateRuleSuggestions();

  const report: AdvisorReport = {
    id: `advisor-${Date.now()}`,
    provider: provider.name,
    generatedAt: new Date().toISOString(),
    suggestions
  };

  crmStore.addAdvisorReport(report);
  return report;
}

function generateRuleSuggestions(): AdvisorSuggestion[] {
  const rooms = crmStore.listRooms();
  const contacts = crmStore.listContacts();
  const tasks = crmStore.listTasks().filter((task) => task.status === "open");
  const suggestions: AdvisorSuggestion[] = [];

  for (const task of tasks.filter((item) => item.priority === "critical").slice(0, 2)) {
    suggestions.push({
      id: `critical-${task.id}`,
      priority: "critical",
      title: task.title,
      detail: task.detail,
      action: task.suggestedAction,
      relatedRoomId: task.roomId,
      source: "rule"
    });
  }

  for (const task of tasks.filter((item) => item.trigger === "hot_lead").slice(0, 2)) {
    suggestions.push({
      id: `opp-${task.id}`,
      priority: "opportunity",
      title: "\u0E21\u0E35 lead \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E04\u0E38\u0E22\u0E15\u0E48\u0E2D",
      detail: task.detail,
      action: task.suggestedAction,
      relatedRoomId: task.roomId,
      source: "rule"
    });
  }

  const engagedContacts = contacts.filter((contact) => contact.purchaseIntent.level === "yellow").slice(0, 2);
  for (const contact of engagedContacts) {
    suggestions.push({
      id: `warn-${contact.id}`,
      priority: "warning",
      title: `\u0E2D\u0E22\u0E48\u0E32\u0E1B\u0E25\u0E48\u0E2D\u0E22\u0E43\u0E2B\u0E49 ${contact.displayName} \u0E40\u0E07\u0E35\u0E22\u0E1A`,
      detail: "\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32\u0E40\u0E23\u0E34\u0E48\u0E21\u0E2A\u0E19\u0E43\u0E08\u0E41\u0E25\u0E49\u0E27 \u0E41\u0E15\u0E48\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E16\u0E36\u0E07\u0E08\u0E38\u0E14\u0E1B\u0E34\u0E14\u0E01\u0E32\u0E23\u0E02\u0E32\u0E22",
      action: "\u0E2A\u0E48\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E2B\u0E23\u0E37\u0E2D\u0E16\u0E32\u0E21\u0E15\u0E48\u0E2D\u0E43\u0E2B\u0E49\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32\u0E02\u0E22\u0E31\u0E1A\u0E44\u0E1B\u0E02\u0E31\u0E49\u0E19\u0E16\u0E31\u0E14\u0E44\u0E1B",
      relatedRoomId: contact.roomIds[0] ?? null,
      source: "rule"
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "info-empty",
      priority: "info",
      title: "\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49\u0E20\u0E32\u0E1E\u0E23\u0E27\u0E21\u0E04\u0E48\u0E2D\u0E19\u0E02\u0E49\u0E32\u0E07\u0E19\u0E34\u0E48\u0E07",
      detail: `\u0E21\u0E35 ${rooms.length} rooms, ${contacts.length} contacts \u0E41\u0E25\u0E30 ${tasks.length} open tasks`,
      action: "\u0E40\u0E23\u0E34\u0E48\u0E21\u0E08\u0E32\u0E01\u0E40\u0E0A\u0E47\u0E01 rooms \u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14\u0E41\u0E25\u0E30\u0E40\u0E15\u0E34\u0E21 use case \u0E08\u0E23\u0E34\u0E07\u0E02\u0E2D\u0E07\u0E17\u0E35\u0E21\u0E02\u0E32\u0E22\u0E15\u0E48\u0E2D\u0E44\u0E14\u0E49\u0E40\u0E25\u0E22",
      relatedRoomId: null,
      source: "rule"
    });
  }

  return suggestions.slice(0, 6);
}
