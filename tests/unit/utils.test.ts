import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, getCurrentMonth, getMonthLabel } from "@/lib/utils";

describe("formatCurrency", () => {
  it("formata valor positivo em BRL", () => {
    expect(formatCurrency(1000)).toBe("R$\u00a01.000,00");
  });

  it("formata zero", () => {
    expect(formatCurrency(0)).toBe("R$\u00a00,00");
  });

  it("formata valores com centavos", () => {
    expect(formatCurrency(99.9)).toBe("R$\u00a099,90");
  });
});

describe("formatDate", () => {
  it("formata data no padrão brasileiro", () => {
    const date = new Date(2024, 0, 15);
    const formatted = formatDate(date);
    expect(formatted).toBe("15/01/2024");
  });
});

describe("getCurrentMonth", () => {
  it("retorna string no formato YYYY-MM", () => {
    const result = getCurrentMonth();
    expect(result).toMatch(/^\d{4}-\d{2}$/);
  });
});

describe("getMonthLabel", () => {
  it("retorna nome do mês em português", () => {
    const label = getMonthLabel("2024-01");
    expect(label.toLowerCase()).toContain("janeiro");
  });
});
