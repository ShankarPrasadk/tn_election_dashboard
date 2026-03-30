# AI Architecture

## Current Direction

This project should evolve as a citation-first election intelligence system, not as an unconstrained agent demo.

The current backend in `server/` is intentionally deterministic:

- it loads the generated candidate corpus from `public/data/tn-candidate-directory.json`
- it exposes guarded search and retrieval endpoints
- it blocks sensitive personal inference requests
- it returns source citations alongside answers

That foundation is the correct place to attach RAG and orchestration later.

## Recommended Stack

1. Structured data layer

- Postgres as the canonical store for candidate, constituency, party, and election-cycle entities
- object storage for raw source snapshots
- vector index only for unstructured documents

2. Retrieval layer

- SQL and metadata filters for exact queries
- vector retrieval for affidavit text, manifestos, speeches, and vetted public articles
- hybrid ranking to combine exact election filters with semantic recall

3. Guardrails

- schema validation on every request and every ingestion output
- required citations for generated answers
- source allowlist for accepted domains
- explicit separation between verified facts and generated summaries
- blocked categories for sensitive or unsupported personal inference

4. Orchestration

- LangGraph for ingestion, enrichment, validation, retries, and approval gates
- queue workers for long-running backfills and refreshes
- field-level provenance so every value can be traced back to a source snapshot

5. Tooling

- MCP servers for internal research workflows, source discovery, validation, and editorial tooling
- not as the first public application runtime dependency

## Parallel Agent Model

Parallel work is appropriate only when tasks are partitioned cleanly.

Good boundaries:

- one worker per election year
- one worker per constituency batch
- one worker for source discovery
- one worker for extraction
- one worker for verification and citation review

Required controls:

- idempotent jobs
- retry and backoff
- deterministic merge rules
- audit trail per field
- human review for conflicts and low-confidence outputs

## Suggested Phases

### Phase 1

- finish stabilizing historical ingestion from 2006 to 2026
- normalize parties, constituencies, and source metadata
- make the API the single retrieval surface for the frontend

### Phase 2

- add a database-backed ingestion pipeline
- snapshot raw source pages and extraction artifacts
- expose provenance and freshness in every candidate response

### Phase 3

- add RAG over unstructured election documents
- keep structured filters in front of semantic retrieval
- require citations in every answer

### Phase 4

- add LangGraph for multi-step enrichment and approval workflows
- add internal MCP servers for researcher and editor tooling
- add offline evaluation for factuality, citation coverage, and safety

## What Not To Do

- do not let freeform agents become the source of truth for candidate facts
- do not put multi-agent orchestration in the browser
- do not add MLflow until there are real model experiments worth tracking
- do not answer politically sensitive questions without grounding and citations