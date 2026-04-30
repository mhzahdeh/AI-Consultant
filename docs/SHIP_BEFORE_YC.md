# Ship Before YC

This document defines what needs to exist before this product is credible as a YC-style MVP.

The goal is not breadth. The goal is one sharp workflow that real users want badly enough to return.

## Core Thesis

The product promise should stay narrow:

`Upload a brief, pull relevant prior knowledge, and generate a reusable first draft for consulting work.`

If a feature does not strengthen that loop, it is secondary.

## What Must Exist In Product

These are the minimum functional requirements for a real MVP:

- Create an engagement from a brief or uploaded files
- Retrieve relevant prior cases and vault knowledge
- Generate a usable proposal starter, issue tree, and workplan
- Show why those sources were used
- Save strong work back into the vault for later reuse

## What Must Feel Good

These are quality gates, not optional polish:

- Outputs are good enough to edit instead of restart
- Retrieval feels relevant more often than random
- Users can tell which sources shaped the output
- Saving to vault creates obvious future value
- The main path has no confusing, broken, or slow states

## Must Build

These are the development items that should be completed before YC:

### 1. Generation Quality

- Improve proposal, issue tree, and workplan quality so outputs are consistently useful first drafts
- Make selected cases visibly influence generation, not just metadata
- Reduce generic filler language in generated artifacts
- Make regeneration more controllable at the section level

Definition of done:

- A user can keep and edit the draft instead of rewriting it from scratch

### 2. Retrieval Quality

- Improve matching quality for internal and external cases
- Make match reasoning clearer and more defensible
- Make internal cases surface more aggressively when relevant
- Reduce weak or noisy matches in the initial list

Definition of done:

- Users usually agree with the top suggested cases

### 3. Main Workflow Tightening

- Make the happy path obvious and fast:
  - create engagement
  - upload files
  - review matched cases
  - generate outputs
  - inspect traceability
  - save to vault
- Tighten validation, empty states, success states, and error handling
- Remove secondary distractions from the primary flow

Definition of done:

- A first-time user can complete the full loop without hand-holding

### 4. Internal Vault Reuse

- Make saving an engagement into the vault feel valuable
- Make internal cases easier to discover and reuse
- Strengthen the distinction between reusable internal knowledge and public analogs
- Let users see why an internal case is strategically useful

Definition of done:

- Users believe the app gets more valuable with reuse over time

### 5. Trust And Export Quality

- Keep source traceability visible and stable
- Make exports feel presentable enough for working use
- Ensure UI consistency across dashboard, vault, and workspace
- Remove broken visuals, bad spacing, and weak chart defaults

Definition of done:

- The app feels trustworthy enough to use with real work material

## Should Fix

These should be addressed if they block trust, but they are not the wedge:

- Visual inconsistencies across pages
- Secondary pages that dilute the story
- Low-value dashboard filler
- Weak hover states and chart defaults
- Excessive product surface that does not support the core loop

## Ignore For Now

Do not burn pre-YC time here unless one of these blocks the MVP:

- Deep collaboration systems
- Complex enterprise billing
- Broad third-party integrations
- Advanced permissions systems
- Large backend refactors for elegance alone
- Feature expansion unrelated to the core loop
- Analytics surfaces that do not affect user decisions

## What The Founder Must Do Outside The Code

These items cannot be “implemented” in the repo, but they are required before YC:

- Get 3 to 10 real design partners or active users
- Run real briefs and source material through the product
- Observe where users hesitate, mistrust, or abandon the flow
- Capture repeated usage, not just demo enthusiasm
- Gather real quotes about saved time or better reuse

Without this, the app is still a strong prototype rather than a real wedge.

## YC Readiness Questions

You should have sharp answers to:

- Who is the exact user?
- What painful workflow are you replacing?
- Why is this better than ChatGPT plus old decks plus Google Drive?
- What gets better every time the product is used?
- Why does the vault become a compounding advantage?

## Launch Threshold

The MVP is ready to apply with when all of the following are true:

- A new user can complete the full flow without help
- Output quality is strong enough to edit instead of restart
- Retrieval feels relevant most of the time
- Source traceability increases trust rather than confusion
- Saving to vault creates visible future benefit
- At least a few real users come back and use it again

## Build Order

Recommended order for the remaining work:

1. Improve generation quality
2. Improve retrieval quality
3. Tighten the main engagement workflow
4. Strengthen internal vault reuse
5. Polish trust, exports, and visual consistency

## Current Boundary

Codex can help with:

- product design changes
- frontend and backend implementation
- workflow tightening
- retrieval and generation logic
- docs, QA, and test coverage

Codex cannot do the non-fake parts of:

- traction
- user love
- design partners
- real customer validation
- founder clarity on the exact wedge

## Practical Next Step

The best next move is to treat this as a shipping checklist, not a brainstorming note.

Work the build order from top to bottom, and do not add unrelated features until:

- outputs are strong
- retrieval is credible
- the happy path is clean
- at least a few real users keep coming back
