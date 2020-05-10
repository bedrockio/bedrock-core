# Contribution Guide

(work in progress)

## What should live in this repo?

Something like npm plugins might become useful, but the overhead for having to think about what to separate, not to mention maintenance and dependencies has its own cost.

For now we should allow code that is potentially useful as long as it is:

- Well coded (don't toss junk in).
- Documented, at least minimally (think about people using it for the first time).
- Organized somewhere that makes sense.
- Isn't a dependency out of the box but can be opted into.
- Isn't short lived (ie. is the code likely to become obsolete as the browser landscape changes?).
- Ideally production tested.

## Potential criteria for creating an npm package

- The code has usefulness on its own outside Bedrock (?).
- The code requires multiple files or a complex structure that should be isolated from Bedrock (?).