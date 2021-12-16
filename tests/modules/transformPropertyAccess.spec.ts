import { TransformPropertyAccess } from "../../src/modules/transformPropertyAccess";

describe("Transfrom Property Access", () => {
  it('should transform foo["bar"] to foo.bar', async () => {
    const want = "var foo = { bar: 1 };\nfoo.bar;";
    const input = 'var foo = { bar: 1 };\nfoo["bar"];';
    const got = await new TransformPropertyAccess().process(input);
    expect(got).toBe(want);
  });

  it('should transform foo["bar"]["foobar"] to foo.bar.foobar', async () => {
    const want = "var foo = { bar: { foobar: 1 } };\nfoo.bar.foobar;";
    const input = 'var foo = { bar: { foobar: 1 } };\nfoo["bar"]["foobar"];';
    const got = await new TransformPropertyAccess().process(input);
    expect(got).toBe(want);
  });
});
