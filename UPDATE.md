# UPDATE.md — Supply & Demand Monitoring Platform

## Update: Price Validation & AI-Powered Pricing System

This update extends the existing Supply & Demand Monitoring Platform with a dedicated
Price Validation and Average Pricing System. The platform already displays average prices
per location — this update strengthens that layer with proper validation logic, fair
market price calculation, and a foundation for AI-driven price prediction.

---

## What Already Existed (Base Platform)

The Supply & Demand Monitoring Platform was built to:

- Let users search for products (e.g., rice, fuel) by location
- Display supply levels, demand levels, and average prices per location
- Track demand based on number of searches or user interactions
- Accept supply data from vendors or manual input
- Show basic delivery estimates
- Provide a simple dashboard for supply vs demand trends

Pricing in the base system was handled by averaging submitted prices and ignoring
extreme values — but without a formal validation layer.

---

## What This Update Adds

### 1. Formal Price Submission by Users & Vendors

- Multiple users or vendors can now explicitly submit prices for a product in a given location
- All submissions are stored and processed through validation before being used
- This replaces informal/unvalidated price averaging in the base system

---

### 2. Price Validation Layer

Before any submitted price enters a calculation, it now passes through a validation pipeline:

- **Min/Max Range Enforcement** — Prices outside an acceptable range are automatically rejected
- **Unrealistic Price Filtering** — Submissions that are clearly too high or too low are discarded
- **Price Spike Detection** — Unusual spikes are flagged before they can distort the displayed price
- **User Reporting (Optional)** — Users can flag or report prices they believe are incorrect
- **Valid Price Pool** — Only prices that pass all checks are used in final calculations

This directly upgrades the base platform's note to *"ignore extreme values"* into a
structured, rule-based system.

---

### 3. Average & Median Price Calculation

The update introduces two calculation methods, both operating on the validated price pool only:

**Average Price (existing, now formalized):**
```
Average Price = Sum of Valid Prices ÷ Number of Valid Entries
```

**Median Price (recommended — new):**
- Sorts all valid prices and picks the middle value
- Less sensitive to outliers and fake submissions
- More stable and accurate for fair market price display
- Recommended as the default display method going forward

---

### 4. Groq AI — Historical Data & Price Prediction

Since the platform database is new and lacks historical pricing data, **Groq AI** will be
used to fill this gap by fetching and reasoning over external market data.

**What Groq handles:**
- Fetching historical price trends for products from the web (where local DB data is unavailable)
- Providing a baseline for what a realistic price range should be per product/location
- Powering the price prediction feature (future improvement, groundwork laid here)
- Helping the validation layer set smarter min/max ranges based on real-world data
  rather than hardcoded values

**Integration approach:**
- On product search, if historical price data is missing in Database, a Groq API call
  is made to retrieve estimated market context
- Results are used to inform validation ranges and displayed alongside live submitted prices
- Groq responses are cached to avoid redundant API calls

---

## Updated System Flow

```
User searches for a product
        ↓
Backend fetches supply, demand, and submitted prices from Database
        ↓
If historical price data is missing → Groq AI fetches market context from web
        ↓
Price Validation Layer runs on all submitted prices
(min/max check → spike detection → valid pool assembled)
        ↓
Median (or average) price calculated from valid pool
        ↓
Frontend displays: location, supply level, demand level, fair market price
```

---

## Updated Technology Stack

| Layer | Technology |
| AI / Market Data | Groq AI (historical price fetching & prediction) |

---

## Updated Roadmap

| Feature | Status |
|---|---|
| Price submission by users/vendors | ✅ Added in this update |
| Price validation (min/max, spikes, filtering) | ✅ Added in this update |
| Median pricing calculation | ✅ Added in this update |
| Groq AI for historical data & web fetching | ✅ Added in this update |
| Automatic fake price detection | Should be added  |
| Price prediction system | Should be added  (Groq foundation laid) |
| Machine learning for demand forecasting | Should be added  |
| Real-time API integration | Should be added  |
| Vendor authentication | Should be added  |
| Advanced analytics (charts, predictions) | Should be added  |

---

## Important Notes

- The platform remains **not an e-commerce system** — no payments or transactions
- Data can still be simulated where live vendor input is unavailable
- Groq AI is used strictly for market context and historical data — not for handling user data
- UI remains simple and clean; no major frontend restructuring in this update

---

*This UPDATE.md reflects the sync between the base Supply & Demand Monitoring Platform
and the Price Validation & AI Pricing System as of this release.*