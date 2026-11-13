import { describe, it, expect } from "vitest";
import { canViewPanel, homeForRoles } from "@/lib/roles";

describe("AFCB profiles", () => {
  it("gives the superadministrator access to all profile panels", () => {
    expect(["superadmin", "club_manager", "player"].map((role) => canViewPanel(["superadmin"], role as "superadmin" | "club_manager" | "player"))).toEqual([true, true, true]);
    expect(homeForRoles(["player", "superadmin"])).toBe("/admin");
  });
  it("keeps club managers in their unified club role", () => {
    expect(homeForRoles(["club_manager"])).toBe("/clube");
    expect(canViewPanel(["club_manager"], "superadmin")).toBe(false);
  });
  it("keeps players out of management panels", () => {
    expect(homeForRoles(["player"])).toBe("/jogador");
    expect(canViewPanel(["player"], "club_manager")).toBe(false);
  });
  it("does not assign visitors a private profile", () => {
    expect(homeForRoles([])).toBe("/painel");
    expect(canViewPanel([], "player")).toBe(false);
  });
});