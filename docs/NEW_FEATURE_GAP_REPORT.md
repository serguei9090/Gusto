# Gusto - New Features & Gap Analysis Report

**Date:** 2026-02-08  
**Scope:** Architecture, Feature Roadmap, and Module Optimizations

---

## 1. Executive Summary
This report identifies critical functional gaps in the current "Gusto" (RestaurantManage) ecosystem and proposes a set of new modules designed to transform the application from a static costing tool into a proactive restaurant management platform.

---

## 2. Existing Module Analysis (Gap Report)

### 2.1 Inventory Management
*   **Gap:** **Variance Analysis.** Currently, the system logs transactions but does not compare "Theoretical Stock" (what should be there based on recipes/sales) vs. "Physical Stock" (actual count).
*   **Gap:** **Barcode/QR Scanning.** No mobile or desktop-tethered scanning support for faster inventory intake and counts.
*   **Gap:** **Unit Reconciliation.** Lack of automated conversion for ingredients purchased in one unit (e.g., Case of 12) and used in others (e.g., individual bottles).

### 2.2 Recipe Costing & Engineering
*   **Gap:** **Sub-Recipes (Nested Recipes).** The inability to use a "Base Sauce" or "Dough" recipe as an ingredient in another recipe.
*   **Gap:** **Allergen & Nutritional Tracking.** No metadata fields for dietary restrictions (GF, Vegan, Nut-free) or calorie counts.
*   **Gap:** **Yield Testing Workflows.** No specific tool to record the results of yield tests (e.g., "5kg of raw beef yields 3.2kg of cooked sliced beef").

### 2.3 Supplier & Purchasing
*   **Gap:** **Order History & Pricing Trends.** No visual representation of how a specific supplier's prices have fluctuated over time.
*   **Gap:** **Lead Time Tracking.** No data on how long it takes for a supplier to deliver after an order is placed.

### 2.4 Dashboard & Analytics
*   **Gap:** **Predictive Refill.** The dashboard shows low stock but doesn't predict *when* stock will run out based on historical usage.
*   **Gap:** **Menu Mix Analysis.** No integration of sales data to show which high-margin recipes are actually selling.

---

## 3. Proposed New Modules

### 3.1 Module: Sales & POS Integration (Actual vs. Theoretical)
**Purpose:** Connect Gusto to external Point of Sale (POS) systems to automate inventory depletion and analyze "Actual vs. Theoretical" food cost.
*   **Key Features:**
    - Daily sales Import (JSON/CSV or API).
    - Automatic inventory deduction based on recipes linked to POS items.
    - Variance Report: Identify theft, waste, or over-portioning.

### 3.2 Module: Menu Engineering & Profit Optimization
**Purpose:** Use the BCG Matrix (Stars, Plowhorses, Dogs, Puzzles) to categorize recipes based on popularity and profitability.
*   **Key Features:**
    - Profitability/Popularity Scatter Plot.
    - "What-if" Costing: See how a $0.50 increase in an ingredient affects the entire menu's profitability.
    - Suggested Price Adjustments based on target Food Cost % (FCP).

### 3.3 Module: Automated Purchasing & Vendor Portal
**Purpose:** Streamline the procurement process by generating and sending orders directly to suppliers.
*   **Key Features:**
    - One-click Purchase Order (PO) generation based on "Low Stock" and "Par Levels".
    - Digital Vendor Portal: Allow suppliers to update their own prices (subject to approval).
    - Receiving Workflow: Compare "PO sent" vs. "Invoice received" vs. "Actual items delivered".

### 3.4 Module: Production Planning & Employee Roles
**Purpose:** Manage the "Who" and "When" of the kitchen operation.
*   **Key Features:**
    - Production Schedules: Assign prep sheets to specific days/shifts.
    - Role-Based Access Control (RBAC): Manager vs. Chef vs. Prep Cook views.
    - Labor Cost Integration: Track the time spent on specific prep tasks to calculate "True Marginal Cost".

---

## 4. System-Wide System Gaps

| Category | Gap Description | Priority |
| :--- | :--- | :--- |
| **Connectivity** | Lack of Cloud Sync for multi-device (Desktop + Mobile) environments. | 🔴 High |
| **Automation** | No automated exchange rate updates for multi-currency operations. | 🟡 Medium |
| **Audit** | No granular "History Log" showing which user changed a recipe price. | 🟡 Medium |
| **Customization** | No custom field support for ingredients (e.g., "Brand Name", "UPC"). | 🟢 Low |

---

## 5. Conclusion & Strategic Roadmap
The immediate focus should be on bridging the **Inventory Variance** gap and implementing **Sub-Recipes**, as these provide the most immediate value to professional kitchens. The transition to **POS Integration** represents the next phase of maturity for the Gusto platform.
