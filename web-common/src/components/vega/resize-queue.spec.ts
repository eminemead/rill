import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cancelResize, queueResize } from "./resize-queue";

describe("queueResize", () => {
  let frames: FrameRequestCallback[] = [];
  let now = 0;

  function flushFrame() {
    const queued = frames;
    frames = [];
    queued.forEach((cb) => cb(now));
  }

  beforeEach(() => {
    frames = [];
    now = 0;
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      frames.push(cb);
      return frames.length;
    });
    vi.spyOn(performance, "now").mockImplementation(() => now);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("runs resizes on the next frame, not synchronously", () => {
    const resize = vi.fn();
    queueResize({}, resize);
    expect(resize).not.toHaveBeenCalled();
    flushFrame();
    expect(resize).toHaveBeenCalledOnce();
  });

  it("spreads resizes across frames once a frame's budget is spent", () => {
    const ran: string[] = [];
    const slow = (name: string) => () => {
      ran.push(name);
      now += 5;
    };
    queueResize({}, slow("a"));
    queueResize({}, slow("b"));
    queueResize({}, slow("c"));
    queueResize({}, slow("d"));

    flushFrame();
    expect(ran).toEqual(["a", "b"]);
    flushFrame();
    expect(ran).toEqual(["a", "b", "c", "d"]);
    expect(frames).toHaveLength(0);
  });

  it("keeps only the latest pending resize per chart", () => {
    const chart = {};
    const first = vi.fn();
    const latest = vi.fn();
    queueResize(chart, first);
    queueResize(chart, latest);
    flushFrame();
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledOnce();
  });

  it("drops a cancelled chart's pending resize", () => {
    const chart = {};
    const resize = vi.fn();
    queueResize(chart, resize);
    cancelResize(chart);
    flushFrame();
    expect(resize).not.toHaveBeenCalled();
  });
});
