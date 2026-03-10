## 2026-03-10
- Commodity relevance filtering works best as negative-keyword exclusion with commodity-keyword override, preserving macro/economy headlines with no explicit commodity terms.
- Relevance scoring with capped boosts (`title` up to +0.4, `description` up to +0.2) and penalties keeps scores stable while still rewarding high-signal source + keyword overlap.
