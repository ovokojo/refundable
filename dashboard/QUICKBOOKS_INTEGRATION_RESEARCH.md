# QuickBooks Integration - Tariff Transaction Identification

## Research Summary & Recommendations

### QuickBooks API Overview

**API Type:** REST API with OAuth 2.0 authentication
**Base URL:** `https://quickbooks.api.intuit.com/v3/company/{companyId}`
**Data Format:** JSON

---

## Key QuickBooks Entities for Tariff Tracking

### 1. **Bills** (Primary Source)
- **Purpose:** Vendor invoices for goods/services purchased
- **Key Fields:**
  - `VendorRef` - Supplier/vendor ID
  - `TxnDate` - Transaction date
  - `TotalAmt` - Total bill amount
  - `Line` - Line items with descriptions, amounts, account codes
  - `DueDate` - Payment due date
  - `DocNumber` - Invoice/reference number

**Tariff Identification:**
- Look for line items with tariff-related descriptions
- Match vendor names against known import suppliers
- Check account codes for customs/duty expense accounts
- Flag bills with international vendor addresses

### 2. **Purchases** (Secondary Source)
- **Purpose:** Direct purchases (cash/credit card)
- **Key Fields:**
  - `PaymentType` - Cash, Check, CreditCard
  - `EntityRef` - Vendor/paye
  - `AccountRef` - Expense account
  - `Line` - Purchase details
  - `TotalAmt` - Purchase total

**Tariff Identification:**
- Credit card charges to customs brokers
- Wire transfers to international suppliers
- Expense account = Customs duties/tariffs

### 3. **Vendor Credits**
- **Purpose:** Refunds/credits from vendors
- **Relevance:** May include tariff refunds

### 4. **Journal Entries**
- **Purpose:** Manual accounting adjustments
- **Relevance:** Tariff accruals, adjustments

### 5. **Accounts**
- **Purpose:** Chart of accounts
- **Key for Filtering:**
  - Look for accounts like "Customs Duties", "Import Tariffs", "Freight & Duties"
  - Account type: Expense

---

## Tariff Identification Strategies

### Strategy 1: Vendor-Based Filtering ✅ **RECOMMENDED**
**Approach:** Identify international vendors and customs brokers

**Implementation:**
```javascript
// Filter vendors by:
1. Country code != "US" (or home country)
2. Vendor name contains keywords:
   - "Customs", "Broker", "Freight Forwarder"
   - "Logistics", "Shipping", "Import"
3. Bill to international addresses
```

**Pros:**
- High accuracy for import-related transactions
- Easy to implement
- Can be automated

**Cons:**
- Requires vendor data quality
- May miss some tariffs if vendor classification is incomplete

### Strategy 2: Account Code Filtering ✅ **RECOMMENDED**
**Approach:** Filter by expense account codes

**Implementation:**
```javascript
// Query bills/purchases where:
1. Line.AccountRef.name contains:
   - "Tariff", "Duty", "Customs"
   - "Import Tax", "Border Tax"
   - "Freight", "Landing"
2. Account type = "Expense"
3. Account.SubAccount = true (granular tracking)
```

**Pros:**
- Very accurate if properly categorized
- Direct link to tariff expenses
- Easy reporting

**Cons:**
- Requires proper account setup by customer
- Depends on bookkeeper consistency

### Strategy 3: Line Item Description Analysis 🤔 **MODERATE**
**Approach:** Parse line item descriptions for tariff keywords

**Implementation:**
```javascript
// Search Line.Description for:
- "IEEPA tariff", "Section 301", "Section 232"
- "Customs duty", "Import duty", "Tariff"
- HTS codes (e.g., "HTS 1234.56.7890")
- "Duty fee", "CBP charge"
```

**Pros:**
- Can catch tariffs not in special accounts
- Works with any bookkeeping system

**Cons:**
- Less reliable (depends on data entry)
- False positives possible
- NLP/regex required

### Strategy 4: Amount Pattern Analysis ⚠️ **ADVANCED**
**Approach:** Identify tariff-like amounts based on patterns

**Implementation:**
```javascript
// Look for:
1. Tariff amounts often:
   - Percentage of invoice total (common rates: 10%, 15%, 25%)
   - Separate line items on same invoice
   - Amounts that match HTS code rates
2. Compare line items on same bill:
   - If goods line + duty line pattern detected
```

**Pros:**
- Can identify hidden tariffs
- Useful for validation

**Cons:**
- Requires sophisticated logic
- Higher false positive rate
- Needs validation

### Strategy 5: HTS Code Extraction 🎯 **OPTIMAL**
**Approach:** Extract Harmonized Tariff Schedule (HTS) codes from descriptions

**Implementation:**
```javascript
// Parse descriptions for HTS codes:
- Pattern: \d{4}\.\d{2}\.\d{2,4}
- Example: "HTS 8471.30.0100"
- Validate against HTS database
- Match to IEEPA tariff lists
```

**Pros:**
- Most accurate method
- Enables precise tariff calculation
- Links to official tariff schedules

**Cons:**
- Requires HTS codes in descriptions (rare)
- Needs HTS database lookup
- More complex implementation

---

## Recommended Implementation Approach

### Phase 1: MVP (Week 1-2)
**Multi-Filter Approach:**
```
1. Account Code Filter (primary)
   ↓
2. Vendor Country Filter (secondary)
   ↓
3. Description Keyword Search (tertiary)
```

**Data to Pull:**
- Bills (last 3 years)
- Purchases (last 3 years)
- Vendors (all)
- Accounts (expense accounts only)

**Fields to Extract:**
```json
{
  "transaction_id": "Id",
  "transaction_type": "Bill/Purchase",
  "date": "TxnDate",
  "vendor": "VendorRef.name",
  "vendor_country": "Vendor.BillAddr.Country",
  "amount": "TotalAmt",
  "line_items": [{
    "description": "Line.Description",
    "amount": "Line.Amount",
    "account": "Line.AccountRef.name",
    "account_id": "Line.AccountRef.value"
  }],
  "doc_number": "DocNumber",
  "due_date": "DueDate",
  "currency": "CurrencyRef.value"
}
```

### Phase 2: AI Enhancement (Week 3-4)
**Add Intelligence:**
- ML model to classify transactions
- Pattern recognition for tariff amounts
- HTS code extraction
- Confidence scoring

### Phase 3: Validation (Week 5-6)
**User Review Interface:**
- Show identified tariff transactions
- Allow user to confirm/reject
- Mark false positives
- Add missed transactions manually

---

## QuickBooks API Integration Requirements

### Authentication
**OAuth 2.0 Flow:**
1. Register app at developer.intuit.com
2. Get Client ID & Client Secret
3. Redirect user to Intuit authorization URL
4. User grants access
5. Receive authorization code
6. Exchange code for access_token & refresh_token
7. Store tokens securely
8. Refresh token every 60 days

**Scopes Needed:**
```
com.intuit.quickbooks.accounting
- Read access to: Bills, Purchases, Vendors, Accounts
```

### API Endpoints
```
GET /v3/company/{companyId}/query
- SQL-like queries
- Pagination support (max 1000 per page)

Query Examples:
- "SELECT * FROM Bill WHERE TxnDate >= '2018-01-01'"
- "SELECT * FROM Purchase WHERE TxnDate >= '2018-01-01'"
- "SELECT * FROM Vendor WHERE Active = true"
- "SELECT * FROM Account WHERE AccountType = 'Expense'"
```

### Rate Limits
- **Default:** 500 requests/minute
- **Burst:** 100 requests/minute
- Use batch queries where possible
- Implement exponential backoff

---

## Data Sync Strategy

### Initial Sync
```
1. Pull all vendors → Build vendor country map
2. Pull expense accounts → Identify tariff accounts
3. Pull bills (3 years) → Apply filters
4. Pull purchases (3 years) → Apply filters
5. Store in local database
6. Calculate estimated refunds
```

### Incremental Sync (Daily)
```
1. Query transactions modified since last sync
2. Apply same filters
3. Update local database
4. Recalculate estimates
5. Notify user of changes
```

---

## User Experience Flow

### Connection Flow
```
1. User clicks "Connect QuickBooks"
2. Redirect to Intuit login
3. User selects company file
4. Grant permissions
5. Redirect back to Refundable
6. Show "Syncing..." progress
7. Display summary:
   - X vendors found
   - Y accounts analyzed
   - Z potential tariff transactions identified
   - $ Estimated refund
```

### Review Flow
```
1. Show identified transactions in table
2. Filters: date range, vendor, account
3. Checkboxes to include/exclude
4. Confidence score (high/medium/low)
5. "Submit for Analysis" button
6. Generate claim
```

---

## Security & Compliance

### Data Protection
- **Encryption:** AES-256 for tokens
- **Storage:** Encrypted database fields
- **Access:** OAuth tokens never exposed to frontend
- **Retention:** Store only necessary data
- **Deletion:** User can disconnect & delete data

### Privacy
- Don't store vendor details beyond what's needed
- Anonymize transaction data for analytics
- GDPR/CCPA compliant data handling
- Clear data retention policy

---

## Technical Recommendations

### Backend Stack
```
- Node.js + Express (API)
- PostgreSQL (data storage)
- Redis (cache, queue)
- QuickBooks Node SDK (npm: node-quickbooks)
```

### Database Schema (Simplified)
```sql
-- QuickBooks connections
CREATE TABLE qb_connections (
  id UUID PRIMARY KEY,
  user_id UUID,
  company_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Synced transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID,
  qb_txn_id VARCHAR(255),
  txn_type VARCHAR(50),
  vendor_name VARCHAR(255),
  vendor_country VARCHAR(2),
  amount DECIMAL(10,2),
  txn_date DATE,
  tariff_amount DECIMAL(10,2),
  confidence_score DECIMAL(3,2),
  status VARCHAR(50),
  raw_data JSONB
);

-- Identified tariffs
CREATE TABLE tariff_claims (
  id UUID PRIMARY KEY,
  user_id UUID,
  transaction_ids UUID[],
  total_amount DECIMAL(10,2),
  estimated_refund DECIMAL(10,2),
  status VARCHAR(50),
  submitted_at TIMESTAMP
);
```

---

## Challenges & Mitigations

| Challenge | Mitigation |
|-----------|-----------|
| Users may not categorize tariffs separately | Use multi-filter approach + ML |
| HTS codes rarely in descriptions | Keyword search + amount patterns |
| Vendor country data incomplete | Infer from currency, bank transfers |
| Large transaction volumes | Pagination, async processing |
| Token expiration | Auto-refresh, monitoring |
| API rate limits | Batch queries, caching |

---

## Next Steps

### Immediate (This Week)
1. ✅ Build QuickBooks OAuth connection UI
2. ✅ Create transaction sync mock flow
3. ✅ Design transaction review interface
4. ⏳ Implement filter logic (mock data)
5. ⏳ Build confidence scoring display

### Short-term (Next 2 Weeks)
1. Register Intuit Developer account
2. Create production app credentials
3. Implement real OAuth flow
4. Build API integration layer
5. Test with sample QuickBooks company

### Long-term (Month 2)
1. ML model for transaction classification
2. HTS code database integration
3. Multi-currency support
4. Historical data import (3+ years)
5. Advanced analytics dashboard

---

## Cost Estimates

### QuickBooks API
- **Development:** Free sandbox access
- **Production:** Free (included with QuickBooks Online)
- **Rate limits:** 500 req/min (sufficient for most)

### Infrastructure
- **Hosting:** $20-50/month (VPS/cloud)
- **Database:** $15-30/month (managed PostgreSQL)
- **Total:** ~$35-80/month

---

## Questions for User

1. **Account Structure:** Do users typically have dedicated tariff/duty expense accounts, or are these mixed with other costs?
2. **Vendor Data:** Is vendor country information usually populated in QuickBooks?
3. **Volume:** What's the typical transaction volume? (helps optimize sync strategy)
4. **HTS Codes:** Do invoices/descriptions include HTS codes?
5. **Timeframe:** How far back should we pull data? (IEEPA tariffs 2018-2025)

---

## Conclusion

**Best Approach:** Multi-filter strategy combining:
1. **Primary:** Account code filtering (most reliable)
2. **Secondary:** Vendor country filtering (catches imports)
3. **Tertiary:** Description keyword search (catches miscategorized)
4. **Enhancement:** ML confidence scoring (reduces manual review)

**Implementation Priority:**
1. Build OAuth connection flow ✅
2. Create transaction review UI ✅
3. Implement filtering logic
4. Add confidence scoring
5. Enable manual review/correction

This approach balances accuracy with user experience, allowing for automated identification while maintaining human oversight for quality assurance.
