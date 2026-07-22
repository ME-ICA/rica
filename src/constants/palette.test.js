import { getClassStyle, colorFor, shapeFor } from "./palette";

test("known classes have distinct colours and shapes", () => {
  const classes = ["accepted", "rejected", "ignored"];
  const colors = classes.map((c) => colorFor(c));
  const shapes = classes.map((c) => shapeFor(c));
  expect(new Set(colors).size).toBe(classes.length);
  expect(new Set(shapes).size).toBe(classes.length);
});

test("Okabe-Ito colours are exact when colourblind is on", () => {
  expect(colorFor("accepted", { colorblind: true })).toBe("#009E73");
  expect(colorFor("rejected", { colorblind: true })).toBe("#D55E00");
  expect(colorFor("ignored", { colorblind: true })).toBe("#0072B2");
  expect(colorFor("other", { colorblind: true })).toBe("#999999");
});

test("unknown class falls back to other", () => {
  expect(shapeFor("brand-new-label")).toBe(shapeFor("other"));
  expect(colorFor("brand-new-label")).toBe(colorFor("other"));
});

test("selected returns the hover variant", () => {
  const base = getClassStyle("accepted", { colorblind: true });
  const selected = getClassStyle("accepted", { colorblind: true, selected: true });
  expect(selected.color).not.toBe(base.color);
});

test("shape is independent of the colourblind flag", () => {
  expect(shapeFor("rejected")).toBe("square");
  expect(getClassStyle("rejected", { colorblind: false }).shape).toBe("square");
  expect(getClassStyle("rejected", { colorblind: true }).shape).toBe("square");
});
