import { render } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Theme } from "../themes/theme";
import { themeManager } from "../themes/theme-manager";
import ThemeProvider from "./ThemeProvider.svelte";

const theme = { css: ".dashboard-theme-boundary { --primary: red; }" } as Theme;

describe("ThemeProvider", () => {
  afterEach(() => vi.restoreAllMocks());

  it("adds no stylesheet when there is no theme", () => {
    const { container } = render(ThemeProvider, {
      props: { theme: undefined },
    });
    expect(container.querySelector("style")).toBeNull();
  });

  it("writes the theme's CSS into its stylesheet", () => {
    const { container } = render(ThemeProvider, { props: { theme } });
    expect(container.querySelector("style")?.textContent).toBe(theme.css);
  });

  it("drops the stylesheet and clears cached variables when the theme goes away", async () => {
    const clear = vi.spyOn(themeManager, "clearCSSVariableCache");
    const { container, rerender } = render(ThemeProvider, { props: { theme } });
    clear.mockClear();

    await rerender({ theme: undefined });

    expect(container.querySelector("style")).toBeNull();
    expect(clear).toHaveBeenCalledOnce();
  });
});
