import * as path from "path";
import { read, untranslatedStream } from "../../src/commands/translate";
import { serialize } from "../../src/lib/serializer";

const poPath = path.resolve(
    __dirname,
    "../fixtures/translateTest/translate.po"
);

test("translate poFile", () => {
    const poData = read(poPath);
    const stream = untranslatedStream(poData.translations);
    // skip first message(empty msgid in header)
    stream.next();
    stream.next("");
    stream.next(["test"]);
    stream.next(["test1", "test2"]);
    const data = serialize(poData).toString();
    expect(data).toMatchSnapshot();
});
