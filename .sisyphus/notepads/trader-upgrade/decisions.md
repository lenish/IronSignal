## 2026-03-10
- Added `relevance_score` to news schema with default `0.5` and backward-compatible `ALTER TABLE` attempt in `ensureSchema()` to avoid breaking existing local DBs.
- Kept `classifyCommodity()` behavior intact and separated relevance logic into `isRelevantToCommodities()` + `calculateRelevanceScore()` for composability.
