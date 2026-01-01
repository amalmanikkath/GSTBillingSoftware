"use server";

import { db } from "@/lib/db";
import { 
  invoices, 
  invoiceLines, 
  journalEntries, 
  ledgerEntries, 
  chartOfAccounts,
  items
} from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function finalizeInvoice(invoiceId: string) {
  return await db.transaction(async (tx) => {
    // 1. Fetch Invoice Details
    const invoice = await tx.query.invoices.findFirst({
      where: eq(invoices.id, invoiceId),
      with: { lines: true }
    });

    if (!invoice || invoice.status === 'Paid') throw new Error("Invalid invoice transition");

    const orgId = invoice.organizationId;

    // 2. Add Journal Entry
    const [journalEntry] = await tx.insert(journalEntries).values({
      organizationId: orgId,
      date: new Date(invoice.date),
      description: `Sales Invoice ${invoice.invoiceNumber}`,
      referenceType: 'Invoice',
      referenceId: invoice.id,
    }).returning();

    // 3. Find relevant accounts
    const accounts = await tx.query.chartOfAccounts.findMany({
      where: eq(chartOfAccounts.organizationId, orgId)
    });

    const arAccount = accounts.find(a => a.name === 'Accounts Receivable');
    const salesAccount = accounts.find(a => a.name === 'Sales Revenue');
    const gstAccount = accounts.find(a => a.name === 'Duties & Taxes (GST)');

    if (!arAccount || !salesAccount || !gstAccount) 
      throw new Error("Required chart of accounts not found");

    // 4. Create Ledger Entries (Double Entry)
    // Debit AR (Asset)
    await tx.insert(ledgerEntries).values({
      journalEntryId: journalEntry.id,
      accountId: arAccount.id,
      debit: invoice.grandTotal,
      credit: "0.00"
    });

    // Credit Sales (Revenue)
    await tx.insert(ledgerEntries).values({
      journalEntryId: journalEntry.id,
      accountId: salesAccount.id,
      debit: "0.00",
      credit: invoice.subtotal
    });

    // Credit GST Payable (Liability)
    await tx.insert(ledgerEntries).values({
      journalEntryId: journalEntry.id,
      accountId: gstAccount.id,
      debit: "0.00",
      credit: invoice.totalTax
    });

    // 5. Update Inventory (Deduct items)
    for (const line of invoice.lines) {
        await tx.update(items)
          .set({ currentStock: sql`${items.currentStock} - ${line.quantity}` })
          .where(eq(items.id, line.itemId));
    }

    // 6. Update Invoice Status
    await tx.update(invoices)
      .set({ status: 'Paid' })
      .where(eq(invoices.id, invoiceId));

    return { success: true };
  });
}
