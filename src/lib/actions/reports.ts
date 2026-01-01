"use server";

import { db } from "@/lib/db";
import { ledgerEntries, chartOfAccounts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getBalanceSheet(orgId: string) {
  // SQL query to aggregate balances
  // Assets = Liabilities + Equity
  // Profit & Loss is part of Equity (Retained Earnings)
  
  const balances = await db
    .select({
      accountName: chartOfAccounts.name,
      accountType: chartOfAccounts.type,
      totalDebit: sql<number>`sum(${ledgerEntries.debit})`,
      totalCredit: sql<number>`sum(${ledgerEntries.credit})`,
      balance: sql<number>`sum(${ledgerEntries.debit}) - sum(${ledgerEntries.credit})`
    })
    .from(chartOfAccounts)
    .innerJoin(ledgerEntries, eq(chartOfAccounts.id, ledgerEntries.accountId))
    .where(eq(chartOfAccounts.organizationId, orgId))
    .groupBy(chartOfAccounts.id, chartOfAccounts.name, chartOfAccounts.type);

  const report = {
    assets: balances.filter(b => b.accountType === 'Asset'),
    liabilities: balances.filter(b => b.accountType === 'Liability'),
    equity: balances.filter(b => b.accountType === 'Equity'),
    totalAssets: balances.filter(b => b.accountType === 'Asset').reduce((acc, curr) => acc + Number(curr.balance), 0),
    totalLiabilities: balances.filter(b => b.accountType === 'Liability').reduce((acc, curr) => acc - Number(curr.balance), 0), // Credit balance for liabilities
    totalEquity: balances.filter(b => b.accountType === 'Equity').reduce((acc, curr) => acc - Number(curr.balance), 0),
  };

  return report;
}
