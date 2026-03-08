# QMD Search Skill

Use QMD to efficiently search the user's knowledge base (athena-memory collection with 290 files).

## Commands

```bash
# Search with query expansion (recommended)
bunx qmd query "<search term>" --collection athena-memory -n <num>

# Full-text search (faster, no LLM)
bunx qmd search "<search term>" --collection athena-memory -n <num> --full
```

## When to Use

- User asks to search notes, find documents, or look up information
- Looking for context in memory files
- Finding previous decisions, research, or conversations

## Notes

- Run from: /root/.openclaw/workspace/qmd
- Collection: athena-memory (290 files indexed)
- Default results: 5
