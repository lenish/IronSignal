# IronSignal Trader Upgrade — Commodity Dashboard for Physical Traders

## TL;DR

> **Quick Summary**: Transform IronSignal from a basic news aggregator into a useful commodity trader dashboard by filtering noise (~50% irrelevant news), adding market context data (FX, energy, economic indicators), and improving UX (auto-briefing, exchange metadata, data-dense layout).
> 
> **Deliverables**:
> - Noise-filtered news feed with relevance scoring
> - Market Context Bar: FX rates (USD/CNY, USD/AUD, DXY), energy prices (Brent, WTI, NatGas), economic indicators (CPI, Fed rate, China PMI)
> - LME warehouse inventory display (paid data source, shows placeholder if no API key)
> - Auto-generated daily briefing via Vercel cron
> - Exchange/contract metadata on existing commodity prices
> - Updated footer with accurate sources
> 
> **Estimated Effort**: Large (15 tasks + 4 final verification)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: T1 (vitest) → T2 (negative filter) → T6 (relevance score) → T10 (feed sort) → T13 (cron) → F1-F4

---

## Context

### Original Request
User asked to evaluate IronSignal for physical commodity traders. Analysis revealed ~50% news noise, missing market context data (FX, energy, indicators), no auto-briefing, and lack of exchange metadata on prices.

### Interview Summary
**Key Discussions**:
- **Improvement scope**: Full upgrade (not just quick fixes)
- **Data budget**: Free only — paid sources included but marked as "paid" with placeholder
- **Vercel plan**: Hobby (free) — cron 1x/day max, 10-second function timeout
- **LME inventory**: Include with paid label (Nasdaq Data Link requires subscription)

**Research Findings**:
- Explorer: Full news pipeline mapped — filtering insertion point at `config.ts:classifyCommodity()` before DB insert
- Librarian (RSS): FT Commodities, CNBC, Investing.com verified working. Kitco/Reuters dead.
- Librarian (APIs): Frankfurter ✅ (FX, no key), EIA ✅ (energy, free key), FRED ✅ (indicators, free key), Yahoo Finance ✅ (DXY, futures)
- Nasdaq Data Link LME warehouse data: PAYWALLED — not available on free tier

### Metis Review
**Identified Gaps** (addressed):
- LME data paywalled → Include as optional paid feature with graceful fallback
- Vercel Hobby cron 1x/day → Design for daily cron + client-side polling
- Yahoo Finance TOS risk → Accept current level, use EIA/FRED as primary where possible
- Zero test infrastructure → Added Phase 0 (vitest setup) as prerequisite
- CNY/USD not on Frankfurter → Use Yahoo Finance `CNY=X` (already integrated pattern)

---

## Work Objectives

### Core Objective
Make IronSignal a credible daily-use tool for a physical commodity trader by eliminating news noise, adding market context data, and streamlining the briefing workflow.

### Concrete Deliverables
- Filtered news feed: <20% irrelevant articles (down from ~50%)
- Market Context Bar with live FX, energy, and indicator data
- LME inventory panel (with paid/free status indicator)
- Auto-generated daily briefing (no manual click needed)
- Price display with exchange and contract metadata
- Accurate footer source list

### Definition of Done
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] News feed with "ALL" filter shows <20% non-commodity articles
- [ ] Market Context Bar displays FX, energy, and indicator values
- [ ] Daily briefing auto-displays on page load (if available)
- [ ] Deployed to Vercel and running at ironsignal.vercel.app

### Must Have
- Negative keyword filtering at RSS ingestion
- Relevance scoring on news items
- FX rates display (USD/CNY, USD/AUD, DXY)
- Energy prices display (Brent, WTI, Natural Gas)
- Auto-briefing via cron + auto-fetch on mount
- Exchange labels on commodity prices (e.g., "COMEX", "LME")

### Must NOT Have (Guardrails)
- No authentication or user accounts
- No mobile responsive redesign
- No WebSocket/SSE — keep polling model
- No LLM-based filtering — keyword/rule-based only
- No historical charts for new data (FX, energy, indicators) — current values only
- No more than 3 new npm dependencies
- No separate abstraction layer — keep flat `lib/<domain>.ts` pattern
- No touching existing Claude prompt structure in summary.ts (except adding market data context)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO → Setting up in Task 1
- **Automated tests**: YES (TDD for filter/scoring/fetcher logic)
- **Framework**: vitest (matches Next.js ecosystem)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **API routes**: Use Bash (curl) — Send requests, assert status + response fields
- **UI components**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **Library logic**: Use Bash (vitest) — Run unit tests, verify pass/fail
- **Build**: Use Bash — `npm run build` exits 0

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — test setup + noise reduction + data fetchers):
├── T1:  Vitest setup + initial classifyCommodity tests [quick]
├── T2:  Negative keyword filter + relevance scoring [deep]
├── T3:  FX rates fetcher + API route [quick]
├── T4:  Energy prices fetcher + API route [quick]
├── T5:  Economic indicators fetcher + API route [quick]
├── T6:  LME inventory fetcher + API route (paid/optional) [quick]
└── T7:  Footer sources fix [quick]

Wave 2 (UI + Integration — after Wave 1):
├── T8:  News feed relevance sort + noise hide (depends: T2) [unspecified-high]
├── T9:  Market Context Bar component (depends: T3, T4, T5) [visual-engineering]
├── T10: Exchange metadata on price display (depends: T1) [quick]
└── T11: LME inventory UI panel (depends: T6) [quick]

Wave 3 (Cron + Briefing — after Wave 2):
├── T12: Auto-briefing cron + vercel.json (depends: T2) [unspecified-high]
├── T13: DailySummary auto-fetch + enriched context (depends: T3, T4, T5, T12) [unspecified-high]
└── T14: Final build + deploy + data verification [quick]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── F1: Plan compliance audit [oracle]
├── F2: Code quality review [unspecified-high]
├── F3: Real QA — Playwright full site test [unspecified-high]
└── F4: Scope fidelity check [deep]

Critical Path: T1 → T2 → T8 → T12 → T13 → T14 → F1-F4
Max Concurrent: 7 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 | — | T2, T3-T6, T10 |
| T2 | T1 | T8, T12 |
| T3 | T1 | T9, T13 |
| T4 | T1 | T9, T13 |
| T5 | T1 | T9, T13 |
| T6 | T1 | T11 |
| T7 | — | — |
| T8 | T2 | T12 |
| T9 | T3, T4, T5 | T14 |
| T10 | T1 | T14 |
| T11 | T6 | T14 |
| T12 | T2 | T13 |
| T13 | T3, T4, T5, T12 | T14 |
| T14 | T8-T13 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 7 tasks — T1 `quick`, T2 `deep`, T3-T6 `quick`, T7 `quick`
- **Wave 2**: 4 tasks — T8 `unspecified-high`, T9 `visual-engineering`, T10 `quick`, T11 `quick`
- **Wave 3**: 3 tasks — T12-T13 `unspecified-high`, T14 `quick`
- **FINAL**: 4 tasks — F1 `oracle`, F2-F3 `unspecified-high`, F4 `deep`

---

## TODOs

- [x] 1. Vitest Setup + Initial Tests

  **What to do**:
  - Install `vitest` as dev dependency
  - Create `vitest.config.ts` with Next.js path aliases (`@/` → `src/`)
  - Add `"test": "vitest run"` script to package.json
  - Write tests for existing `classifyCommodity()` function:
    - "iron ore prices surge" → `iron`
    - "copper cathode demand" → `copper`
    - "gold bullion rally" → `gold`
    - "Apple releases new iPhone" → `general`
    - "Silver Lake Technology raises $2B" → should NOT match `silver` (edge case — current behavior may be wrong, document if so)

  **Must NOT do**:
  - Don't add React Testing Library or component tests yet
  - Don't modify any production code

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2-T7)
  - **Blocks**: T2, T3, T4, T5, T6, T10
  - **Blocked By**: None

  **References**:
  - `src/lib/config.ts:96-119` — `classifyCommodity()` function to test
  - `src/lib/config.ts:53-94` — `COMMODITY_KEYWORDS` map (test data source)
  - `package.json` — add vitest dev dependency and test script
  - `tsconfig.json` — path aliases to mirror in vitest config

  **Acceptance Criteria**:
  - [ ] `npx vitest run` passes all tests
  - [ ] `npm run build` still passes

  **QA Scenarios**:
  ```
  Scenario: Vitest runs successfully
    Tool: Bash
    Steps:
      1. Run `npx vitest run`
      2. Assert exit code 0
      3. Assert output contains "Tests" and "passed"
    Expected Result: All tests pass, 0 failures
    Evidence: .sisyphus/evidence/task-1-vitest-run.txt
  ```

  **Commit**: YES
  - Message: `feat: add vitest config and initial classifyCommodity tests`
  - Files: `vitest.config.ts`, `package.json`, `src/lib/__tests__/config.test.ts`

- [ ] 2. Negative Keyword Filter + Relevance Scoring

  **What to do**:
  - Add `NEGATIVE_KEYWORDS` map to `config.ts` (alongside existing `COMMODITY_KEYWORDS`):
    - tech: ["iphone", "software", "app store", "tech giant", "startup", "saas"]
    - sports: ["nfl", "nba", "mlb", "soccer", "football", "dolphins", "touchdown"]
    - entertainment: ["celebrity", "movie", "actor", "netflix", "streaming", "box office"]
    - realestate: ["real estate", "housing market", "mortgage rate", "foreclosure", "home price"]
    - crypto: ["bitcoin", "cryptocurrency", "ethereum", "blockchain", "crypto"]
    - healthcare: ["fda approval", "drug trial", "pharma", "clinical trial"]
  - Add `isRelevantToCommodities(title, description): boolean` function in `config.ts`:
    - Returns `false` if ANY negative keyword matches AND NO commodity keyword matches
    - Returns `true` otherwise (commodity keyword presence overrides negative)
  - Add `calculateRelevanceScore(title, description, source): number` function in `config.ts`:
    - Base score: 0.5
    - +0.2 per commodity keyword match (max +0.4)
    - -0.3 if negative keyword matches
    - +0.2 if source is tier-1 (Mining.com, FT Commodities, Mining Technology)
    - Clamp to [0, 1]
  - Add `relevance_score REAL DEFAULT 0.5` column to news table in `db.ts` (use `CREATE TABLE IF NOT EXISTS` — column added via separate `ALTER TABLE` with try/catch for existing DBs)
  - Modify `rss.ts:fetchFeed()`: call `isRelevantToCommodities()` — skip items that return false (don't insert)
  - Modify `rss.ts:fetchFeed()`: call `calculateRelevanceScore()` — store score with news item
  - Update `refreshAllFeeds()` return to include `filtered` count
  - Write tests for:
    - "Apple tracking rules" → filtered out (negative: tech)
    - "Iron ore price rally on China demand" → passes, score > 0.8
    - "Gold mine discovery in Nevada" → passes, score > 0.7
    - "NFL Dolphins paying $99M" → filtered out (negative: sports)
    - "Goldman Sachs copper hedge fund" → passes (commodity keyword overrides)

  **Must NOT do**:
  - Don't use LLM for classification
  - Don't delete existing items from DB retroactively
  - Don't change the existing `classifyCommodity()` function signature

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T1)
  - **Parallel Group**: Wave 1
  - **Blocks**: T8, T12
  - **Blocked By**: T1

  **References**:
  - `src/lib/config.ts:53-94` — existing `COMMODITY_KEYWORDS` (place `NEGATIVE_KEYWORDS` adjacent)
  - `src/lib/config.ts:96-119` — existing `classifyCommodity()` (don't modify, add new functions)
  - `src/lib/rss.ts:25-52` — `fetchFeed()` where filtering should be inserted (after line 42 classification)
  - `src/lib/rss.ts:54-81` — `refreshAllFeeds()` return type to extend
  - `src/lib/db.ts:23-35` — news table schema (add relevance_score column)
  - `src/lib/db.ts:50-76` — `insertNews()` (add relevance_score to INSERT)
  - `src/lib/types.ts` — `NewsItem` type (add optional `relevanceScore` field)

  **Acceptance Criteria**:
  - [ ] `npx vitest run` — filter tests pass
  - [ ] `curl -s -X POST localhost:3000/api/news/refresh` — response includes `filtered` count > 0
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: Noise filtering works on refresh
    Tool: Bash (curl)
    Steps:
      1. POST /api/news/refresh
      2. Parse JSON response
      3. Assert response has "filtered" field with value > 0
      4. GET /api/news?limit=50
      5. Check that no article title contains "NFL" or "iPhone"
    Expected Result: filtered > 0, no obvious noise in feed
    Evidence: .sisyphus/evidence/task-2-filter-refresh.json

  Scenario: Commodity keyword overrides negative
    Tool: Bash (vitest)
    Steps:
      1. Run test: isRelevantToCommodities("Goldman Sachs launches copper hedge fund", ...)
      2. Assert returns true (copper keyword overrides financial noise)
    Expected Result: true
    Evidence: .sisyphus/evidence/task-2-override-test.txt
  ```

  **Commit**: YES
  - Message: `feat: add negative keyword filter and relevance scoring`
  - Files: `src/lib/config.ts`, `src/lib/rss.ts`, `src/lib/db.ts`, `src/lib/types.ts`, tests

- [ ] 3. FX Rates Fetcher + API Route

  **What to do**:
  - Create `src/lib/fx.ts`:
    - `fetchFXRates(): Promise<FXRates>` — fetch from Yahoo Finance: `CNY=X`, `AUD=X`, `DX-Y.NYB`
    - Follow `src/lib/prices.ts` pattern exactly (same Yahoo Finance v8 URL, same headers, same error handling)
    - Return: `{ usdcny: number, usdaud: number, dxy: number, fetchedAt: string }`
  - Create `src/app/api/fx/route.ts`:
    - GET handler that calls `fetchFXRates()`
    - Follow `src/app/api/prices/route.ts` pattern
  - Add `FXRates` type to `src/lib/types.ts`
  - Write unit test for `fetchFXRates()` (mock fetch)

  **Must NOT do**:
  - Don't add Frankfurter as secondary source yet (keep it simple)
  - Don't persist FX to DB — fetch on-demand like existing prices

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T1)
  - **Parallel Group**: Wave 1
  - **Blocks**: T9, T13
  - **Blocked By**: T1

  **References**:
  - `src/lib/prices.ts:1-56` — **Primary pattern**: Yahoo Finance v8 fetch pattern (URL construction, headers, error handling). Copy this exact approach for FX.
  - `src/lib/config.ts:49-50` — `YAHOO_FINANCE_BASE` URL constant (reuse)
  - `src/app/api/prices/route.ts` — API route pattern to follow
  - `src/lib/types.ts` — where to add `FXRates` type

  **Acceptance Criteria**:
  - [ ] `curl -s localhost:3000/api/fx | jq '.usdcny'` — returns number > 0
  - [ ] `npx vitest run` passes
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: FX API returns valid rates
    Tool: Bash (curl)
    Steps:
      1. GET /api/fx
      2. Parse JSON
      3. Assert usdcny is between 5.0 and 10.0
      4. Assert dxy is between 80 and 120
      5. Assert fetchedAt is a valid ISO timestamp
    Expected Result: All assertions pass
    Evidence: .sisyphus/evidence/task-3-fx-api.json

  Scenario: FX API handles Yahoo Finance failure
    Tool: Bash (vitest)
    Steps:
      1. Mock fetch to reject
      2. Call fetchFXRates()
      3. Assert throws or returns partial data
    Expected Result: Graceful error handling
    Evidence: .sisyphus/evidence/task-3-fx-error.txt
  ```

  **Commit**: YES
  - Message: `feat: add FX rates fetcher and API route`
  - Files: `src/lib/fx.ts`, `src/app/api/fx/route.ts`, `src/lib/types.ts`, tests

- [ ] 4. Energy Prices Fetcher + API Route

  **What to do**:
  - Create `src/lib/energy.ts`:
    - `fetchEnergyPrices(): Promise<EnergyPrices>` — fetch from Yahoo Finance: `BZ=F` (Brent), `CL=F` (WTI), `NG=F` (NatGas)
    - Follow `src/lib/prices.ts` pattern (same Yahoo Finance v8 approach)
    - Return array of `{ symbol, name, price, change, changePercent, fetchedAt }`
  - Create `src/app/api/energy/route.ts`:
    - GET handler following existing route pattern
  - Add `EnergyPrice` type to `src/lib/types.ts`
  - Write unit test

  **Must NOT do**:
  - Don't add EIA as secondary source (Yahoo Finance futures are real-time, EIA is weekly)
  - Don't add charts — current values only

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T1)
  - **Parallel Group**: Wave 1
  - **Blocks**: T9, T13
  - **Blocked By**: T1

  **References**:
  - `src/lib/prices.ts:1-56` — **Primary pattern**: Yahoo Finance fetch. Reuse exact same approach with different symbols.
  - `src/app/api/prices/route.ts` — API route pattern
  - `src/lib/types.ts` — where to add type

  **Acceptance Criteria**:
  - [ ] `curl -s localhost:3000/api/energy | jq '.prices[0].name'` — returns "Brent Crude"
  - [ ] `npx vitest run` passes

  **QA Scenarios**:
  ```
  Scenario: Energy API returns 3 prices
    Tool: Bash (curl)
    Steps:
      1. GET /api/energy
      2. Assert .prices array has length 3
      3. Assert each has symbol, name, price fields
      4. Assert Brent price is between 30 and 200
    Expected Result: 3 energy prices with valid data
    Evidence: .sisyphus/evidence/task-4-energy-api.json
  ```

  **Commit**: YES
  - Message: `feat: add energy prices fetcher and API route`
  - Files: `src/lib/energy.ts`, `src/app/api/energy/route.ts`, `src/lib/types.ts`, tests

- [ ] 5. Economic Indicators Fetcher + API Route

  **What to do**:
  - Create `src/lib/indicators.ts`:
    - `fetchIndicators(): Promise<EconomicIndicators>` — fetch from FRED API
    - Series: `FEDFUNDS` (Fed rate), `CPIAUCSL` (CPI), `DTWEXBGS` (Dollar Index)
    - Requires `FRED_API_KEY` env var (free signup at fred.stlouisfed.org)
    - Return: `{ fedRate, cpi, dollarIndex, fetchedAt }`
    - If no FRED key configured, return null gracefully
  - Create `src/app/api/indicators/route.ts`
  - Add `EconomicIndicators` type to `src/lib/types.ts`
  - Add `FRED_API_KEY` to `.env.local.example`
  - Write unit test

  **Must NOT do**:
  - Don't add China PMI yet (lagged data, less useful)
  - Don't persist to DB

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T1)
  - **Parallel Group**: Wave 1
  - **Blocks**: T9, T13
  - **Blocked By**: T1

  **References**:
  - `src/lib/prices.ts:1-56` — fetch pattern (adapt for FRED REST API)
  - FRED API docs: `https://fred.stlouisfed.org/docs/api/fred/series_observations.html`
  - FRED endpoint: `https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key={KEY}&limit=1&sort_order=desc&file_type=json`
  - `.env.local.example` — add FRED_API_KEY template

  **Acceptance Criteria**:
  - [ ] `curl -s localhost:3000/api/indicators | jq '.fedRate'` — returns number
  - [ ] Without FRED key, returns `{ available: false }` (graceful fallback)

  **QA Scenarios**:
  ```
  Scenario: Indicators API returns valid data
    Tool: Bash (curl)
    Steps:
      1. GET /api/indicators
      2. Assert fedRate is between 0 and 20
      3. Assert cpi is between 0 and 15
    Expected Result: Valid indicator values
    Evidence: .sisyphus/evidence/task-5-indicators-api.json

  Scenario: Missing FRED key returns graceful fallback
    Tool: Bash (vitest)
    Steps:
      1. Call fetchIndicators() with no FRED_API_KEY env
      2. Assert returns null or { available: false }
    Expected Result: No error thrown
    Evidence: .sisyphus/evidence/task-5-no-key.txt
  ```

  **Commit**: YES
  - Message: `feat: add economic indicators fetcher and API route`
  - Files: `src/lib/indicators.ts`, `src/app/api/indicators/route.ts`, `src/lib/types.ts`, `.env.local.example`, tests

- [ ] 6. LME Inventory Fetcher + API Route (Paid/Optional)

  **What to do**:
  - Create `src/lib/lme.ts`:
    - `fetchLMEInventory(): Promise<LMEInventory | null>` — fetch from Nasdaq Data Link API
    - URL: `https://data.nasdaq.com/api/v3/datasets/LME/ST_{METAL}.json?api_key={KEY}&rows=30`
    - Metals: `CU` (copper), `AL` (aluminium), `ZN` (zinc), `NI` (nickel)
    - Requires `NASDAQ_DATA_LINK_KEY` env var (PAID subscription)
    - If no key: return `{ available: false, reason: "Nasdaq Data Link subscription required" }`
    - If key present: return inventory data with daily stock levels
  - Create `src/app/api/lme/route.ts`
  - Add `LMEInventory` type to `src/lib/types.ts`
  - Add `NASDAQ_DATA_LINK_KEY` to `.env.local.example` with comment: `# Paid — https://data.nasdaq.com`
  - Write unit test (mock API)

  **Must NOT do**:
  - Don't scrape LME website
  - Don't make this a hard dependency — app must work without it

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (after T1)
  - **Parallel Group**: Wave 1
  - **Blocks**: T11
  - **Blocked By**: T1

  **References**:
  - Nasdaq Data Link API: `https://docs.data.nasdaq.com/docs/in-depth-usage`
  - `src/lib/prices.ts` — fetch pattern to follow
  - `.env.local.example` — add NASDAQ_DATA_LINK_KEY

  **Acceptance Criteria**:
  - [ ] Without key: `curl -s localhost:3000/api/lme | jq '.available'` → `false`
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: LME API without key returns graceful fallback
    Tool: Bash (curl)
    Steps:
      1. GET /api/lme (no NASDAQ_DATA_LINK_KEY set)
      2. Assert response has available: false
      3. Assert response has reason string
    Expected Result: Graceful "subscription required" response
    Evidence: .sisyphus/evidence/task-6-lme-no-key.json
  ```

  **Commit**: YES
  - Message: `feat: add LME inventory fetcher with paid source fallback`
  - Files: `src/lib/lme.ts`, `src/app/api/lme/route.ts`, `src/lib/types.ts`, `.env.local.example`, tests

- [x] 7. Footer Sources Fix

  **What to do**:
  - Update footer in `src/app/page.tsx` to show actual current sources:
    - Old: "Mining.com · Kitco · MetalMiner · Mining Technology · Google News"
    - New: "FT · CNBC · Mining.com · MarketWatch · Investing.com · MetalMiner · Mining Technology"
  - Remove Kitco (dead), add FT/CNBC/MarketWatch/Investing.com

  **Must NOT do**:
  - Don't change layout or styling

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/app/page.tsx:61` — footer line with source list
  - `src/lib/config.ts:3-39` — actual `RSS_FEEDS` array (source of truth for names)

  **Acceptance Criteria**:
  - [ ] Footer text contains "FT" and "CNBC"
  - [ ] Footer text does NOT contain "Kitco"

  **QA Scenarios**:
  ```
  Scenario: Footer shows correct sources
    Tool: Playwright
    Steps:
      1. Navigate to /
      2. Find footer element
      3. Assert text contains "FT"
      4. Assert text does NOT contain "Kitco"
    Expected Result: Updated source list displayed
    Evidence: .sisyphus/evidence/task-7-footer.png
  ```

  **Commit**: YES
  - Message: `fix: update footer with accurate source list`
  - Files: `src/app/page.tsx`

- [ ] 8. News Feed Relevance Sort + Noise Hide

  **What to do**:
  - Modify `src/app/api/news/route.ts`: change ORDER BY from `published_at DESC` to `relevance_score DESC, published_at DESC`
  - Modify `src/lib/db.ts:getNews()`: add optional `minRelevance` parameter (default 0.3)
  - Add `relevance_score` to the SELECT columns in `getNews()`
  - Modify `src/components/NewsFeed.tsx`:
    - Show relevance indicator on each item (subtle dot: green for >0.7, yellow for >0.4, hidden for others)
    - When filter is "ALL", only show items with relevance_score >= 0.3
    - Individual commodity filters (IRON, COPPER, etc.) show all items of that commodity regardless of score

  **Must NOT do**:
  - Don't add a relevance slider or user-configurable threshold
  - Don't remove low-relevance items from DB

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with T9-T11)
  - **Blocks**: T12
  - **Blocked By**: T2

  **References**:
  - `src/lib/db.ts:78-112` — `getNews()` function (add minRelevance param, change ORDER BY)
  - `src/app/api/news/route.ts` — pass minRelevance to getNews()
  - `src/components/NewsFeed.tsx:74-78` — news item rendering (add relevance dot)
  - `src/components/NewsFeed.tsx:159-162` — filter logic (adjust for relevance threshold)

  **Acceptance Criteria**:
  - [ ] `curl -s localhost:3000/api/news?limit=20` — first results have higher relevance_score
  - [ ] No "NFL", "iPhone", "foreclosure" headlines in default feed
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: Default feed hides noise
    Tool: Playwright
    Steps:
      1. Navigate to /
      2. Wait for news feed to load
      3. Read first 15 article titles
      4. Assert none contain sports/tech/realestate keywords
      5. Assert at least 3 contain commodity keywords (iron, copper, gold, etc.)
    Expected Result: Feed is commodity-focused
    Evidence: .sisyphus/evidence/task-8-feed-filtered.png
  ```

  **Commit**: YES
  - Message: `feat: sort news by relevance and hide low-score items`
  - Files: `src/lib/db.ts`, `src/app/api/news/route.ts`, `src/components/NewsFeed.tsx`

- [ ] 9. Market Context Bar Component

  **What to do**:
  - Create `src/components/MarketContext.tsx`:
    - Horizontal bar below the price charts, above the news feed
    - Three sections side-by-side: FX | Energy | Indicators
    - Each shows: label, value, change direction (▲/▼)
    - FX: USD/CNY, USD/AUD, DXY
    - Energy: Brent, WTI, NatGas
    - Indicators: Fed Rate, CPI (show as static badges, no change arrow)
    - Auto-refresh every 5 minutes (match existing polling pattern)
    - Fetches from `/api/fx`, `/api/energy`, `/api/indicators`
    - If any API fails, show "—" for that value (never crash)
    - Compact design: same `text-xs font-mono` style as PriceTicker
  - Add `<MarketContext />` to `src/app/page.tsx` between PriceCharts and main content area

  **Must NOT do**:
  - No charts or sparklines for these values
  - No click-through to detail pages
  - No responsive layout adjustments

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T14
  - **Blocked By**: T3, T4, T5

  **References**:
  - `src/components/PriceTicker.tsx` — **Primary pattern**: compact horizontal data bar with auto-refresh. Copy this component structure (useCallback + useEffect + setInterval pattern).
  - `src/components/PriceTicker.tsx:48-90` — rendering pattern for price values with change indicators
  - `src/app/globals.css` — theme tokens: `--color-accent-*`, `--color-text-*`, `--color-bg-*`
  - `src/app/page.tsx` — where to insert the component (after PriceCharts, before main grid)

  **Acceptance Criteria**:
  - [ ] Market Context Bar visible below price charts
  - [ ] Shows FX, energy, and indicator values
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: Market Context Bar displays all sections
    Tool: Playwright
    Steps:
      1. Navigate to /
      2. Wait 5 seconds for data load
      3. Assert "USD/CNY" text visible
      4. Assert "Brent" text visible
      5. Assert "Fed Rate" text visible
      6. Screenshot the market context section
    Expected Result: All three sections visible with values
    Evidence: .sisyphus/evidence/task-9-market-context.png
  ```

  **Commit**: YES
  - Message: `feat: add Market Context Bar component`
  - Files: `src/components/MarketContext.tsx`, `src/app/page.tsx`

- [ ] 10. Exchange Metadata on Price Display

  **What to do**:
  - Add exchange and contract info to `COMMODITIES` config in `config.ts`:
    - Iron Ore `TIO=F`: exchange "SGX", contract "62% FE Fines"
    - Copper `HG=F`: exchange "COMEX", contract "Futures"
    - Aluminium `ALI=F`: exchange "COMEX", contract "Futures"
    - Gold `GC=F`: exchange "COMEX", contract "Futures"
    - Silver `SI=F`: exchange "COMEX", contract "Futures"
  - Update `CommodityConfig` type in `types.ts` to include `exchange` and `contract` fields
  - Modify `PriceTicker.tsx` to display exchange label as subtle badge next to commodity name (e.g., "Iron Ore `SGX`")
  - Modify `PriceCharts.tsx` to show exchange in chart header

  **Must NOT do**:
  - Don't change price fetching logic
  - Don't add bid/ask data

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T14
  - **Blocked By**: T1

  **References**:
  - `src/lib/config.ts:41-47` — `COMMODITIES` array (add exchange/contract fields)
  - `src/lib/types.ts` — `CommodityConfig` type (add fields)
  - `src/components/PriceTicker.tsx:60-80` — price rendering (add exchange badge)
  - `src/components/PriceCharts.tsx:35-50` — chart header (add exchange label)

  **Acceptance Criteria**:
  - [ ] Price ticker shows "COMEX" or "SGX" next to each commodity
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: Exchange labels visible on prices
    Tool: Playwright
    Steps:
      1. Navigate to /
      2. Wait for price ticker to load
      3. Assert text "COMEX" appears at least 4 times
      4. Assert text "SGX" appears at least 1 time
    Expected Result: Exchange labels displayed
    Evidence: .sisyphus/evidence/task-10-exchange-labels.png
  ```

  **Commit**: YES
  - Message: `feat: add exchange metadata to price display`
  - Files: `src/lib/config.ts`, `src/lib/types.ts`, `src/components/PriceTicker.tsx`, `src/components/PriceCharts.tsx`

- [ ] 11. LME Inventory UI Panel

  **What to do**:
  - Create `src/components/LMEInventory.tsx`:
    - Small panel in the sidebar (below Daily Briefing)
    - If data available: show table with metal, stock level, daily change
    - If no API key: show "LME Warehouse Stocks" header + message "Requires Nasdaq Data Link subscription" with link
    - Style: same dark theme, compact, `text-xs font-mono`
    - Auto-refresh every 30 minutes (data is T+1 daily anyway)
  - Add `<LMEInventory />` to sidebar in `src/app/page.tsx`

  **Must NOT do**:
  - Don't make it prominent — it's a secondary data panel
  - Don't add charts for inventory

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: T14
  - **Blocked By**: T6

  **References**:
  - `src/components/DailySummary.tsx` — sidebar component pattern (copy structure)
  - `src/app/page.tsx` — sidebar section (`<aside>`) where to add
  - `src/app/globals.css` — theme tokens

  **Acceptance Criteria**:
  - [ ] LME panel visible in sidebar
  - [ ] Shows "subscription required" message (since no key on Vercel)
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: LME panel shows fallback message
    Tool: Playwright
    Steps:
      1. Navigate to /
      2. Find sidebar
      3. Assert "LME Warehouse" or "Warehouse Stocks" text visible
      4. Assert "subscription" or "Nasdaq" text visible
    Expected Result: Graceful paid-source indicator shown
    Evidence: .sisyphus/evidence/task-11-lme-panel.png
  ```

  **Commit**: YES
  - Message: `feat: add LME inventory UI panel`
  - Files: `src/components/LMEInventory.tsx`, `src/app/page.tsx`

- [ ] 12. Auto-Briefing Cron + vercel.json

  **What to do**:
  - Create `vercel.json` with cron config:
    ```json
    { "crons": [{ "path": "/api/cron/refresh", "schedule": "0 6 * * *" }] }
    ```
    (Run at 06:00 UTC daily = 15:00 KST)
  - Create `src/app/api/cron/refresh/route.ts`:
    - Verify `Authorization: Bearer ${CRON_SECRET}` header (Vercel cron auth)
    - Step 1: Call `refreshAllFeeds()` to collect new news
    - Step 2: Call `generateDailySummary()` to create today's briefing
    - Return: `{ newsInserted, newsFiltered, summaryGenerated }`
    - Must complete within 10 seconds (Hobby timeout)
  - Add `CRON_SECRET` to `.env.local.example`
  - Set `CRON_SECRET` on Vercel env vars

  **Must NOT do**:
  - Don't add multiple cron schedules (Hobby plan limits)
  - Don't skip cron auth check

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: T13
  - **Blocked By**: T2

  **References**:
  - Vercel cron docs: `https://vercel.com/docs/cron-jobs`
  - `src/lib/rss.ts:54-81` — `refreshAllFeeds()` to call
  - `src/lib/summary.ts:72-95` — `generateDailySummary()` to call
  - `src/app/api/news/refresh/route.ts` — existing manual refresh route (reference pattern)

  **Acceptance Criteria**:
  - [ ] `vercel.json` exists with valid cron config
  - [ ] `curl -s -H "Authorization: Bearer test" localhost:3000/api/cron/refresh` — returns success
  - [ ] Without auth header → 401

  **QA Scenarios**:
  ```
  Scenario: Cron endpoint works with auth
    Tool: Bash (curl)
    Steps:
      1. POST /api/cron/refresh with Authorization header
      2. Assert 200 response
      3. Assert response has newsInserted and summaryGenerated fields
    Expected Result: Successful refresh + briefing generation
    Evidence: .sisyphus/evidence/task-12-cron-auth.json

  Scenario: Cron endpoint rejects without auth
    Tool: Bash (curl)
    Steps:
      1. GET /api/cron/refresh without Authorization header
      2. Assert 401 response
    Expected Result: Unauthorized
    Evidence: .sisyphus/evidence/task-12-cron-no-auth.txt
  ```

  **Commit**: YES
  - Message: `feat: add cron route for daily news refresh and briefing`
  - Files: `vercel.json`, `src/app/api/cron/refresh/route.ts`, `.env.local.example`

- [ ] 13. DailySummary Auto-Fetch + Enriched Context

  **What to do**:
  - Modify `src/components/DailySummary.tsx`:
    - On mount, `fetchSummary()` should auto-fetch latest summary (GET /api/summary) — already does this
    - If summary exists for today, display it immediately (no "Generate" click needed)
    - Keep "Generate Summary" button as fallback for manual trigger
    - Add market context to the briefing: show today's key prices (FX, energy) below the summary text as compact data row
  - Modify `src/lib/summary.ts` prompt:
    - Add current market data context to the Claude prompt (FX, energy rates)
    - Import `fetchFXRates` and `fetchEnergyPrices` — inject into prompt as additional context
    - Keep existing prompt structure, just append market data section

  **Must NOT do**:
  - Don't redesign the briefing prompt format
  - Don't auto-generate on mount (that's what cron is for)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3
  - **Blocks**: T14
  - **Blocked By**: T3, T4, T5, T12

  **References**:
  - `src/components/DailySummary.tsx:55-99` — component to modify (auto-display logic)
  - `src/lib/summary.ts:5-68` — summary generation (add market data to prompt)
  - `src/lib/fx.ts` — import for FX data
  - `src/lib/energy.ts` — import for energy data

  **Acceptance Criteria**:
  - [ ] Page loads with briefing displayed (if one exists for today)
  - [ ] Briefing includes market context data
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: Briefing auto-displays on page load
    Tool: Playwright
    Steps:
      1. Navigate to /
      2. Wait 5 seconds
      3. Check sidebar for briefing content (not "No summary available")
      4. If briefing exists, assert it contains text (not empty)
    Expected Result: Briefing visible without clicking Generate
    Evidence: .sisyphus/evidence/task-13-auto-briefing.png
  ```

  **Commit**: YES
  - Message: `feat: auto-display briefing and add market context to summary`
  - Files: `src/components/DailySummary.tsx`, `src/lib/summary.ts`

- [ ] 14. Final Build + Deploy + Data Verification

  **What to do**:
  - Run `npm run build` — verify zero errors
  - Run `npm run lint` — verify zero errors
  - Run `npx vitest run` — verify all tests pass
  - Deploy to Vercel: `vercel --prod`
  - Trigger news refresh: `POST /api/news/refresh`
  - Verify all API endpoints on production:
    - `/api/prices` — commodity prices with data
    - `/api/fx` — FX rates
    - `/api/energy` — energy prices
    - `/api/indicators` — economic indicators (if FRED key set)
    - `/api/lme` — LME fallback message
    - `/api/news?limit=20` — filtered news with relevance scores
    - `/api/summary` — latest briefing
  - Set `CRON_SECRET` env var on Vercel
  - Set `FRED_API_KEY` env var on Vercel (if obtained)
  - Git commit and push all changes

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (after Wave 3)
  - **Blocks**: F1-F4
  - **Blocked By**: T8-T13

  **References**:
  - All previous task files
  - Vercel project: `ryans-projects-cc21fec1/ironsignal`
  - Production URL: `https://ironsignal.vercel.app`

  **Acceptance Criteria**:
  - [ ] `npm run build` exits 0
  - [ ] `npx vitest run` — all pass
  - [ ] Production site loads with Market Context Bar, filtered news, exchange labels
  - [ ] All API endpoints return valid data on production

  **QA Scenarios**:
  ```
  Scenario: Production deployment fully functional
    Tool: Playwright + Bash (curl)
    Steps:
      1. Navigate to https://ironsignal.vercel.app
      2. Verify price ticker with exchange labels
      3. Verify Market Context Bar with FX/energy/indicators
      4. Verify news feed is commodity-focused (no obvious noise)
      5. Verify sidebar has briefing and LME panel
      6. curl all API endpoints, assert 200 responses
    Expected Result: Full dashboard operational
    Evidence: .sisyphus/evidence/task-14-production-full.png
  ```

  **Commit**: YES
  - Message: `chore: final build verification and deploy`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `tsc --noEmit` + linter + `bun test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Navigate to ironsignal.vercel.app. Verify: price ticker loads with exchange labels, Market Context Bar shows FX/energy/indicators, news feed shows commodity-relevant articles (check first 20), daily briefing displays automatically, filter buttons work, all links open correctly. Screenshot each section.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **T1**: `feat: add vitest config and initial classifyCommodity tests` — vitest.config.ts, src/lib/__tests__/config.test.ts
- **T2**: `feat: add negative keyword filter and relevance scoring` — src/lib/config.ts, src/lib/rss.ts, src/lib/db.ts, tests
- **T3**: `feat: add FX rates fetcher and API route` — src/lib/fx.ts, src/app/api/fx/route.ts, tests
- **T4**: `feat: add energy prices fetcher and API route` — src/lib/energy.ts, src/app/api/energy/route.ts, tests
- **T5**: `feat: add economic indicators fetcher and API route` — src/lib/indicators.ts, src/app/api/indicators/route.ts, tests
- **T6**: `feat: add LME inventory fetcher with paid source fallback` — src/lib/lme.ts, src/app/api/lme/route.ts, tests
- **T7**: `fix: update footer with accurate source list` — src/app/page.tsx
- **T8**: `feat: sort news by relevance and hide low-score items` — src/components/NewsFeed.tsx, src/app/api/news/route.ts
- **T9**: `feat: add Market Context Bar component` — src/components/MarketContext.tsx, src/app/page.tsx
- **T10**: `feat: add exchange metadata to price display` — src/lib/config.ts, src/components/PriceTicker.tsx
- **T11**: `feat: add LME inventory UI panel` — src/components/LMEInventory.tsx, src/app/page.tsx
- **T12**: `feat: add cron routes for news refresh and briefing` — src/app/api/cron/*, vercel.json
- **T13**: `feat: auto-display briefing and add market context to summary` — src/components/DailySummary.tsx, src/lib/summary.ts
- **T14**: `chore: final build verification and deploy` — no file changes, deploy only

---

## Success Criteria

### Verification Commands
```bash
npm run build          # Expected: exits 0, no errors
npm run lint           # Expected: exits 0
npx vitest run         # Expected: all tests pass
curl -s https://ironsignal.vercel.app/api/fx | jq '.rates'          # Returns FX rates
curl -s https://ironsignal.vercel.app/api/energy | jq '.prices'     # Returns energy prices
curl -s https://ironsignal.vercel.app/api/indicators | jq '.data'   # Returns indicator data
curl -s https://ironsignal.vercel.app/api/news?limit=20             # News with relevance scores
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] News noise < 20% (down from ~50%)
- [ ] Market Context Bar visible with live data
- [ ] Daily briefing auto-displays
- [ ] Deployed and running on Vercel
