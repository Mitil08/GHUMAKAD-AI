# Ghumakad AI Destination Dataset Specification

## Overview

The Ghumakad AI destination dataset is a curated collection of Indian destinations representing a diverse range of geography, budgets, and travel vibes (beaches, mountains, wildlife, heritage, spiritual, adventure, food & culture, city exploration, offbeat).

## Expense Fields and Unit Assumptions

| Field Name | Type | Unit / Scope | Formula / Application |
| :--- | :--- | :--- | :--- |
| `accommodation_cost` | Number (INR) or `null` | Per room per night | Estimated standard budget/mid-range room. Rooms required = `ceil(travellers / 2)`. Total accommodation = `rooms * accommodation_cost * duration_days`. |
| `food_cost` | Number (INR) or `null` | Per person per day | Standard local dining (breakfast, lunch, dinner + snacks). Total food = `travellers * food_cost * duration_days`. |
| `local_transport_cost`| Number (INR) or `null` | Per person per day | Auto-rickshaw, metro, shared cabs, or local transit. Total transit = `travellers * local_transport_cost * duration_days`. |
| `activity_cost` | Number (INR) or `null` | Per person per day | Entry tickets, monuments, boat rides, guide fees. Total activities = `travellers * activity_cost * duration_days`. |
| `intercity_transport_cost`| Number (INR) or `null` | Per person baseline | Estimated train/bus transit from central departure hubs. If `null`, flagged as unverified/variable depending on departure point. |
| `estimated_cost_confidence`| String | Enum: `high`, `medium`, `low` | Confidence in price realism based on seasonal volatility. |
| `cost_last_verified` | String or `null` | YYYY-MM | Date of last field verification or audit against published tourism tariffs. |
| `source_urls` | Array of Strings | Web / Gov Tourism links | Official state tourism departments, IRCTC, and verified travel aggregators. |

## Important Data Rules

1. **Unknown Values**: Numerical unknowns are represented as `null`. They are **never** treated as free (0 INR).
2. **Completeness Flag**: If any core cost field (`accommodation_cost`, `food_cost`, `local_transport_cost`) is `null`, the budget engine flags the estimate as incomplete.
3. **No Artificial Price Manipulation**: Costs are realistic and not altered to force affordable matches.
