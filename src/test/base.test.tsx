import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "../App";
it("inicia a aplicação e apresenta seu conteúdo principal", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  expect(
    screen.getByRole("heading", { level: 1 }).textContent?.trim().length,
  ).toBeGreaterThan(0);
  expect(screen.getByRole("main")).toBeTruthy();
});