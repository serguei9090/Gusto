# Multi-Currency Support Implementation

## Overview
Implemented comprehensive multi-currency support for the RestaurantManage application, enabling international supplier management, multi-location restaurant operations, and accurate import cost tracking.

## Database Schema

### New Tables

#### 1. `currencies`
Stores available currencies in the system.

```sql
CREATE TABLE currencies (
  code TEXT PRIMARY KEY,              -- ISO 4217 code (e.g., 'USD', 'EUR')
  name TEXT NOT NULL,                 -- Full name (e.g., 'US Dollar')
  symbol TEXT NOT NULL,               -- Currency symbol (e.g., '$', '€')
  decimal_places INTEGER DEFAULT 2,  -- Number of decimal places
  is_active INTEGER DEFAULT 1,        -- Active status (1 = active, 0 = inactive)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. `exchange_rates`
Tracks exchange rates between currencies over time.

```sql
CREATE TABLE exchange_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate REAL NOT NULL,
  effective_date TEXT NOT NULL,
  source TEXT,                        -- Source of the rate (e.g., 'manual', 'api')
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_currency) REFERENCES currencies(code),
  FOREIGN KEY (to_currency) REFERENCES currencies(code),
  UNIQUE(from_currency, to_currency, effective_date)
);
```

#### 3. `app_settings`
Stores application-wide settings including base currency.

```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Default Currencies

The system comes pre-configured with 10 major world currencies:

| Code | Name | Symbol | Decimal Places |
|------|------|--------|----------------|
| USD | US Dollar | $ | 2 |
| EUR | Euro | € | 2 |
| GBP | British Pound | £ | 2 |
| CAD | Canadian Dollar | C$ | 2 |
| AUD | Australian Dollar | A$ | 2 |
| JPY | Japanese Yen | ¥ | 0 |
| CNY | Chinese Yuan | ¥ | 2 |
| INR | Indian Rupee | ₹ | 2 |
| MXN | Mexican Peso | $ | 2 |
| BRL | Brazilian Real | R$ | 2 |

## Architecture

### 1. Migration (`002_add_currency_support.ts`)
- Creates currency-related tables
- Inserts default currencies
- Sets USD as default base currency
- Includes default exchange rates

### 2. Repository Layer (`currency.repository.ts`)
Provides data access methods using Kysely query builder:

**Methods:**
- `getAllCurrencies()` - Get all active currencies
- `getCurrency(code)` - Get specific currency by code
- `getAllExchangeRates()` - Get latest exchange rates
- `getExchangeRate(from, to)` - Get specific exchange rate
- `updateExchangeRate(from, to, rate, source)` - Update/add exchange rate
- `getBaseCurrency()` - Get application base currency
- `setBaseCurrency(code)` - Set application base currency
- `addCurrency(currency)` - Add new currency
- `toggleCurrencyStatus(code)` - Enable/disable currency

### 3. State Management (`currency.store.ts`)
Zustand store for managing currency state:

**State:**
- `currencies` - List of available currencies
- `exchangeRates` - Current exchange rates
- `baseCurrency` - Application base currency
- `isLoading` - Loading state
- `error` - Error messages

**Actions:**
- `loadCurrencies()` - Load currencies from database
- `loadExchangeRates()` - Load exchange rates
- `loadBaseCurrency()` - Load base currency setting
- `setBaseCurrency(code)` - Update base currency
- `updateExchangeRate(...)` - Update exchange rate
- `addCurrency(...)` - Add new currency
- `toggleCurrencyStatus(code)` - Toggle currency status
- `initialize()` - Load all currency data

### 4. UI Components (`CurrencySelector.tsx`)
Reusable currency selection component:

**Props:**
- `value` - Selected currency code
- `onChange` - Callback when currency changes
- `label` - Optional label text
- `className` - Optional CSS classes

**Features:**
- Auto-loads currencies on mount
- Displays currency symbol, code, and name
- Integrates with Zustand store

## Utility Functions

The existing `src/utils/currency.ts` provides:
- `convertCurrency(amount, from, to, rates)` - Convert between currencies
- `formatCurrency(amount, currency, options)` - Format with symbol
- `parseCurrencyString(value)` - Parse currency strings
- `getCurrencySymbol(currency)` - Get currency symbol
- `getCurrencyName(currency)` - Get currency name
- `isValidCurrency(code)` - Validate currency code

## Next Steps

### Integration Tasks
1. **Ingredient Forms**
   - Add CurrencySelector to ingredient creation/edit forms
   - Store currency with ingredient prices
   - Display prices in both original and base currency

2. **Recipe Forms**
   - Add CurrencySelector to recipe forms
   - Calculate total cost considering multiple currencies
   - Convert all costs to base currency for accurate totals

3. **Cost Calculations**
   - Update recipe costing to handle multi-currency ingredients
   - Convert all ingredient costs to base currency before summing
   - Display both original and converted prices

4. **Settings Page**
   - Create currency management UI
   - Allow adding/editing currencies
   - Manage exchange rates
   - Set base currency

5. **Exchange Rate Updates**
   - Consider integrating with exchange rate API
   - Add scheduled updates for exchange rates
   - Track exchange rate history

## Usage Examples

### Using the Repository
```typescript
import { currencyRepository } from '@/features/settings/services/currency.repository';

// Get all currencies
const currencies = await currencyRepository.getAllCurrencies();

// Get exchange rate
const rate = await currencyRepository.getExchangeRate('EUR', 'USD');

// Update exchange rate
await currencyRepository.updateExchangeRate('EUR', 'USD', 1.08, 'manual');
```

### Using the Store
```typescript
import { useCurrencyStore } from '@/features/settings/store/currency.store';

function MyComponent() {
  const { currencies, baseCurrency, setBaseCurrency } = useCurrencyStore();
  
  // Initialize on mount
  useEffect(() => {
    useCurrencyStore.getState().initialize();
  }, []);
  
  // Change base currency
  const handleCurrencyChange = async (code: string) => {
    await setBaseCurrency(code);
  };
}
```

### Using the CurrencySelector
```typescript
import { CurrencySelector } from '@/features/settings/components/CurrencySelector';

function IngredientForm() {
  const [currency, setCurrency] = useState('USD');
  
  return (
    <CurrencySelector
      value={currency}
      onChange={setCurrency}
      label="Price Currency"
    />
  );
}
```

## Testing Considerations

### Unit Tests
- Test currency conversion logic
- Test exchange rate calculations
- Test repository methods

### Integration Tests
- Test currency selection in forms
- Test cost calculations with multiple currencies
- Test exchange rate updates

### E2E Tests
- Test creating ingredients with different currencies
- Test recipe costing with multi-currency ingredients
- Test currency settings management

## Performance Considerations

1. **Exchange Rate Caching**
   - Rates are loaded once and cached in Zustand store
   - Refresh only when needed

2. **Query Optimization**
   - Uses Kysely query builder for type-safe queries
   - Efficient subqueries for latest exchange rates

3. **Lazy Loading**
   - Currencies loaded only when needed
   - CurrencySelector auto-loads on mount

## Security Considerations

1. **Input Validation**
   - Validate currency codes (ISO 4217 format)
   - Validate exchange rates (positive numbers)
   - Sanitize user input

2. **Data Integrity**
   - Foreign key constraints ensure referential integrity
   - Unique constraints prevent duplicate rates for same date
   - Default values prevent null issues

## Migration Path

To apply this feature to an existing database:

1. Run the migration:
```typescript
import { migration } from '@/services/database/migrations/002_add_currency_support';
await migration.up(db);
```

2. Initialize currency store in app:
```typescript
import { useCurrencyStore } from '@/features/settings/store/currency.store';

// In App.tsx or main entry point
useEffect(() => {
  useCurrencyStore.getState().initialize();
}, []);
```

3. Update forms to include currency selection
4. Update cost calculation logic to handle conversions

## Files Created/Modified

### New Files
- `src/services/database/migrations/002_add_currency_support.ts`
- `src/features/settings/services/currency.repository.ts`
- `src/features/settings/store/currency.store.ts`
- `src/features/settings/components/CurrencySelector.tsx`

### Modified Files
- `src/types/db.types.ts` - Added currency table types
- `GAPS_ISSUES.md` - Marked multi-currency support as implemented

## Conclusion

The multi-currency support implementation provides a solid foundation for international operations. The architecture is extensible, type-safe, and follows best practices for database design, state management, and UI components.

The next phase involves integrating this infrastructure into the existing ingredient and recipe management workflows to enable full multi-currency cost tracking and reporting.
