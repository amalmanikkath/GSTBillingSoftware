import { pgTable, uuid, text, integer, decimal, timestamp, date, pgEnum, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const contactTypeEnum = pgEnum('contact_type', ['Customer', 'Vendor']);
export const itemTypeEnum = pgEnum('item_type', ['Goods', 'Service']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['Draft', 'Sent', 'Paid', 'Void']);
export const accountTypeEnum = pgEnum('account_type', ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']);

// Organizations Table
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  legalName: text('legal_name').notNull(),
  tradeName: text('trade_name'),
  gstin: text('gstin').unique().notNull(),
  logoUrl: text('logo_url'),
  signatureUrl: text('signature_url'),
  stateCode: integer('state_code').notNull(),
  address: jsonb('address').notNull(),
  baseCurrency: text('base_currency').default('INR'),
  fiscalYearStart: date('fiscal_year_start').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Stores (Branches) Table
export const stores = pgTable('stores', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  gstin: text('gstin'),
  address: jsonb('address'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Contacts Table
export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  type: contactTypeEnum('type').notNull(),
  name: text('name').notNull(),
  companyName: text('company_name'),
  gstin: text('gstin'),
  stateCode: integer('state_code').notNull(),
  email: text('email'),
  phone: text('phone'),
  billingAddress: jsonb('billing_address'),
  shippingAddress: jsonb('shipping_address'),
  openingBalance: decimal('opening_balance', { precision: 20, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Items Table
export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  sku: text('sku'),
  type: itemTypeEnum('type').default('Goods'),
  hsnCode: text('hsn_code'),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).notNull(), // 0, 5, 12, 18, 28
  sellingPrice: decimal('selling_price', { precision: 20, scale: 2 }).notNull(),
  purchasePrice: decimal('purchase_price', { precision: 20, scale: 2 }).notNull(),
  unit: text('unit').default('pcs'),
  reorderLevel: decimal('reorder_level', { precision: 20, scale: 2 }).default('0.00'),
  currentStock: decimal('current_stock', { precision: 20, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Invoices Table
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  contactId: uuid('contact_id').references(() => contacts.id).notNull(),
  invoiceNumber: text('invoice_number').notNull(),
  date: date('date').notNull(),
  dueDate: date('due_date'),
  status: invoiceStatusEnum('status').default('Draft'),
  subtotal: decimal('subtotal', { precision: 20, scale: 2 }).notNull(),
  totalTax: decimal('total_tax', { precision: 20, scale: 2 }).notNull(),
  roundOff: decimal('round_off', { precision: 10, scale: 2 }).default('0.00'),
  grandTotal: decimal('grand_total', { precision: 20, scale: 2 }).notNull(),
  placeOfSupply: integer('place_of_supply').notNull(),
  irn: text('irn'),
  signedQrCode: text('signed_qr_code'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Invoice Line Items Table
export const invoiceLines = pgTable('invoice_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').references(() => invoices.id).notNull(),
  itemId: uuid('item_id').references(() => items.id).notNull(),
  quantity: decimal('quantity', { precision: 20, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 20, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 20, scale: 2 }).default('0.00'),
  taxableValue: decimal('taxable_value', { precision: 20, scale: 2 }).notNull(),
  cgst: decimal('cgst', { precision: 20, scale: 2 }).default('0.00'),
  sgst: decimal('sgst', { precision: 20, scale: 2 }).default('0.00'),
  igst: decimal('igst', { precision: 20, scale: 2 }).default('0.00'),
});

// Accounting: Chart of Accounts
export const chartOfAccounts = pgTable('chart_of_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  name: text('name').notNull(),
  type: accountTypeEnum('type').notNull(),
  code: text('code'),
  isSystem: boolean('is_system').default(false),
});

// Accounting: Journal Entries
export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
  date: timestamp('date').defaultNow().notNull(),
  description: text('description'),
  referenceType: text('reference_type'), // e.g., 'Invoice', 'Payment'
  referenceId: uuid('reference_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Accounting: Ledger Entries (Double Entry)
export const ledgerEntries = pgTable('ledger_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  journalEntryId: uuid('journal_entry_id').references(() => journalEntries.id).notNull(),
  accountId: uuid('account_id').references(() => chartOfAccounts.id).notNull(),
  debit: decimal('debit', { precision: 20, scale: 2 }).default('0.00'),
  credit: decimal('credit', { precision: 20, scale: 2 }).default('0.00'),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  stores: many(stores),
  contacts: many(contacts),
  items: many(items),
  invoices: many(invoices),
  journalEntries: many(journalEntries),
  chartOfAccounts: many(chartOfAccounts),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [invoices.contactId],
    references: [contacts.id],
  }),
  lines: many(invoiceLines),
}));

export const invoiceLinesRelations = relations(invoiceLines, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLines.invoiceId],
    references: [invoices.id],
  }),
  item: one(items, {
    fields: [invoiceLines.itemId],
    references: [items.id],
  }),
}));

export const journalEntriesRelations = relations(journalEntries, ({ many }) => ({
  ledgerEntries: many(ledgerEntries),
}));

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [ledgerEntries.journalEntryId],
    references: [journalEntries.id],
  }),
  account: one(chartOfAccounts, {
    fields: [ledgerEntries.accountId],
    references: [chartOfAccounts.id],
  }),
}));
