const fs = require("fs");
const assert = require("assert");

function main() {
    test_parseInput();
    test_parseOutput();
    test_shouldProcessLine();
    test_extractDescription();
    test_parseLine();

    textToJson();
    textToJsonBytes();
}

main();

function assertEqual(a, b) {
    const err = new Error(
        `ASSERT: mismatch, ${JSON.stringify(a)} != ${JSON.stringify(b)}`,
    );

    if (typeof a != typeof b) {
        throw err;
    }

    if (typeof a === "boolean") {
        if (a !== b) {
            throw err;
        }
        return;
    }

    if (a.length) {
        if (a.length != b.length) {
            throw err;
        }

        for (let i = 0; i < a.length; i++) {
            if (a[i] != b[i]) {
                throw err;
            }
        }
        return;
    }

    if (a !== b) {
        throw err;
    }
}

function codeToCodepoint(i) {
    return eval('"\\' + `u{${i}}` + '"');
}

function toBytes(str) {
    let b = Buffer.from(str);
    return Array.from(b);
}

function parseInput(str) {
    const output = str
        .match(/[0-9A-Z]+/g)
        .map(codeToCodepoint)
        .join("");
    return output;
}
function test_parseInput() {
    let output;
    output = parseInput("÷ 0020 ÷ 0020 ÷	");
    assertEqual("\u{0020}\u{0020}", output);

    output = parseInput("÷ 0020 × 0308 ÷ 1F466 ÷	");
    assertEqual("\u{0020}\u{0308}\u{1F466}", output);
}

function parseOutput(str) {
    // "÷ 0020 ÷ 0020 ÷	" -> "0020 ÷ 0020"
    let output = str.trim().slice(2, -2);

    output = output
        // "0020 × 0308 ÷ 1F466" -> ["0200 x 0308", "1F466"]
        .split(" ÷ ")
        // ["0200 x 0308", "1F466"] ->[["0200, 0308"], ["1F466"]]
        .map(x => x.split(" × "))
        // [["0200, 0308"], ["1F466"]] -> ["\u{0200}\u{0308}", "\u{1F466}"]
        .map(x => x.map(codeToCodepoint).join(""));
    return output;
}
function test_parseOutput() {
    let output;

    output = parseOutput("÷ 0020 ÷ 0020 ÷");
    assertEqual(["\u{0020}", "\u{0020}"], output);

    output = parseOutput("÷ 0020 × 0308 ÷ 1F466 ÷	");
    assertEqual(["\u{0020}\u{0308}", "\u{1F466}"], output);

    output = parseOutput("÷ 0020 × 0308 ÷ 000D ÷	");
    assertEqual(["\u{0020}\u{0308}", "\u{000D}"], output);
}

function extractDescription(str) {
    let output = str.split(/#\s*/).reverse();
    // push an empty description if one doesn't exist
    if (output.length === 1) {
        output.unshift("");
    }
    return output;
}
function test_extractDescription() {
    assertEqual(["", "sup"], extractDescription("sup"));

    const line =
        "÷ 0020 × 0308 ÷ 000D ÷	#  ÷ [0.2] SPACE (Other) × [9.0] COMBINING DIAERESIS (Extend) ÷ [5.0] <CARRIAGE RETURN (CR)> (CR) ÷ [0.3]";
    const expectRest = "÷ 0020 × 0308 ÷ 000D ÷	";
    const expectDescription =
        "÷ [0.2] SPACE (Other) × [9.0] COMBINING DIAERESIS (Extend) ÷ [5.0] <CARRIAGE RETURN (CR)> (CR) ÷ [0.3]";

    const [gotComment, gotRest] = extractDescription(line);
    assertEqual(expectDescription, gotComment);
    assertEqual(expectRest, gotRest);
}

function shouldProcessLine(str) {
    return str.length > 0 && str[0] !== "#";
}
function test_shouldProcessLine() {
    assertEqual(false, shouldProcessLine(""));
    assertEqual(true, shouldProcessLine("nah"));
    assertEqual(true, shouldProcessLine("nah # description"));
    assertEqual(false, shouldProcessLine("# description"));
}

function parseLine(line) {
    let [description, rest] = extractDescription(line);
    return {
        description: description,
        input: parseInput(rest),
        output: parseOutput(rest),
    };
}
function test_parseLine() {
    const line =
        "÷ 0020 × 0308 ÷ 000D ÷	#  ÷ [0.2] SPACE (Other) × [9.0] COMBINING DIAERESIS (Extend) ÷ [5.0] <CARRIAGE RETURN (CR)> (CR) ÷ [0.3]";
    const expect = {
        description:
            "÷ [0.2] SPACE (Other) × [9.0] COMBINING DIAERESIS (Extend) ÷ [5.0] <CARRIAGE RETURN (CR)> (CR) ÷ [0.3]",
        input: "\u{0020}\u{0308}\u{000D}",
        output: ["\u{0020}\u{0308}", "\u{000D}"],
    };

    const got = parseLine(line);
    assertEqual(expect.description, got.description);
    assertEqual(expect.input, got.input);
    assertEqual(expect.output, got.output);
}

function textToJson() {
    const tests = fs
        .readFileSync("grapheme-break-tests.txt")
        .toString()
        .split("\n")
        .filter(shouldProcessLine)
        .map(parseLine);

    fs.writeFileSync("grapheme-break-tests.json", JSON.stringify(tests, null, 4));
    console.log("wrote grapheme-break-tests.json");
}

function textToJsonBytes() {
    const tests = fs
        .readFileSync("grapheme-break-tests.txt")
        .toString()
        .split("\n")
        .filter(shouldProcessLine)
        .map(parseLine)
        .map(({ description, output, input }) => {
            return {
                description,
                input: toBytes(input),
                output: output.map(toBytes),
            };
        });

    fs.writeFileSync(
        "grapheme-break-tests-bytes.json",
        JSON.stringify(tests, null, 4),
    );
    console.log("wrote grapheme-break-tests-bytes.json");
}
