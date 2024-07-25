import { describe, it, expect } from "vitest";

describe("Auth validation", () => {
  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(password: string) {
    return password.length >= 6;
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  it("valida e-mails corretamente", () => {
    expect(validateEmail("ana@demo.com")).toBe(true);
    expect(validateEmail("carlos@empresa.com.br")).toBe(true);
    expect(validateEmail("invalido")).toBe(false);
    expect(validateEmail("sem@dominio")).toBe(false);
  });

  it("rejeita senhas curtas", () => {
    expect(validatePassword("12345")).toBe(false);
    expect(validatePassword("123456")).toBe(true);
    expect(validatePassword("minha_senha_segura")).toBe(true);
  });

  it("gera iniciais corretas do nome", () => {
    expect(getInitials("Ana Silva")).toBe("AS");
    expect(getInitials("Carlos")).toBe("C");
    expect(getInitials("Maria da Silva")).toBe("MD");
  });
});
