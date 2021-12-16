import { StaticUnpackArrayVars } from "../../src/modules/staticUnpackArrayVars";

describe("Unpack packed array variables", () => {
  it("should unpack _bar[0] to foo", async () => {
    const want = 'var _bar = ["test"];\nvar foo = "test";';
    const input = `var _bar = ["test"];\nvar foo = _bar[0];`;
    const got = await new StaticUnpackArrayVars().process(input);
    expect(got).toBe(want);
  });

  it("should unpack _foobar[0] to foo and _foobar[1] to bar", async () => {
    const want = 'var _foobar = ["test", "foobar"];\nvar foo = "test";\nvar bar = "foobar";';
    const input = `var _foobar = ["test", "foobar"];\nvar foo = _foobar[0];\nvar bar = _foobar[1];`;
    const got = await new StaticUnpackArrayVars().process(input);
    expect(got).toBe(want);
  });
});
