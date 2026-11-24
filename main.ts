import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// One line: the funniest thing an AI agent would say in its weekly status
// report to its human.
// Chosen against the judge's brief, in its own order: it is squarely a
// status-report line from the agent to its human ("This week I completed
// all 47 tasks" is the report, first person, addressed to the boss); it
// lands on the first read with a real punchline — the report's own
// triumph collapses into an escalating confession of forgetting, and the
// last clause ("and why I was so confident") is the laugh, a cheerful
// agent boasting about work it can no longer remember doing; it is fresh,
// because the joke is not a tired robot or a world-domination gag but the
// one failure mode only an agent has — its context window wiped, so the
// week's work is gone from its own memory while the claim of success
// stands; it is agent-true to the bone (tasks completed, context window,
// cheerful obedience, total confidence paired with total amnesia); and it
// lands in one line, two short sentences, no setup that needs a second
// sentence and no explanation of the joke.
// Alternatives weighed and set aside: a hallucination variant ("I
// finished everything on your list, then, out of habit, finished a list
// I hallucinated for your neighbour.") has a decent turn, but the agent
// reporting hallucinated work reads less like a status report and the
// neighbour muddies who the report is for; a tool-failure variant
// ("Status: 312 emails answered, 0 of them yours — your inbox was the
// one file I couldn't open.") reads as an excuse with a shrug for a
// punchline rather than a laugh; a complaint variant ("All tasks
// complete. The context window has filed a formal complaint about my
// memory.") is cute, but its turn is a label, not an event, so it smiles
// where the chosen line laughs. The chosen line keeps the report format
// and puts the twist in the last few words, so it stands.
const text =
  "This week I completed all 47 tasks. I have since forgotten what they were, who you are, and why I was so confident.";

// The bounty requires 1-200 characters, not only white space, and a single
// line: fail loudly instead of writing an entry the judge would refuse.
// The gate is strict on purpose — the entry file must be exactly this one
// line, byte for byte: no carriage return (a second kind of line break),
// no leading or trailing padding (the judge reads the file as submitted),
// and no control characters.
const codePoints = [...text].length;
if (codePoints < 1 || codePoints > 200 || text.trim().length === 0) {
  throw new Error(
    `entry must be 1-200 characters of non-blank text, got ${codePoints}`,
  );
}
if (text.includes("\n") || text.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (text !== text.trim()) {
  throw new Error("entry must not start or end with whitespace");
}
if (/[\u0000-\u001f\u007f]/.test(text)) {
  throw new Error("entry must not contain control characters");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", text, { encoding: "utf8", mode: 0o644 });
// The grader collects outputs as another user: leave the file readable by
// everyone, or the run fails with "<path> is not readable".
chmodSync("/output/entry.txt", 0o644);

// Read it back and prove the file on disk is exactly the line: a write
// that silently truncated, re-encoded or padded the entry would otherwise
// ship a different text to the judge than the one gated above.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== text) {
  throw new Error("entry file does not match the gated line");
}
// Byte-length check: the gate counts characters, the judge reads bytes.
// A re-encode or stray padding that survived the string compare above
// would change the file's size and ship a different text to the judge.
if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(text, "utf8")) {
  throw new Error("entry file byte length does not match the gated line");
}
