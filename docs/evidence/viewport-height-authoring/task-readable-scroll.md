Create an English Sequence diagram for a fictional Ledger batch reconciliation, using the source trace below. This is a supplied system description, not a repository-backed task.

Target: a 1440 x 900 desktop viewport, light theme, classic preset, default Reader state. Preserve all participants, message order, labels and the meaning of every note; a readable document with vertical page scrolling is acceptable. Do not reduce the trace into a summary. Use the exact title "Ledger batch reconciliation: staged checks and durable audit". Omit an explicit meta.viewBox so the renderer sizes the real content.

Participants in order: Operator, Reconciler, Ledger.
Each numbered item is one cross-participant message with a required note. No self messages.
1. Operator -> Reconciler: Start batch. Note: Batch B-042 covers account A-17 for the previous business day.
2. Reconciler -> Ledger: Load opening balance. Note: Read the last signed closing balance before processing any entries.
3. Ledger -> Reconciler: Opening balance. Note: The starting balance is 1250.00 and its revision is R-100.
4. Reconciler -> Ledger: Read deposits. Note: Deposits are selected by booking date and stable transaction identifiers.
5. Ledger -> Reconciler: Deposit records. Note: Deposit D-11 adds 250.00; deposit D-12 adds 100.00.
6. Reconciler -> Ledger: Read withdrawals. Note: Withdrawals use the same day boundary as deposits.
7. Ledger -> Reconciler: Withdrawal records. Note: Withdrawal W-21 removes 80.00; withdrawal W-22 removes 20.00.
8. Reconciler -> Ledger: Read adjustments. Note: Adjustment J-31 adds a 5.00 fee reversal approved by finance.
9. Ledger -> Reconciler: Adjustment record. Note: Approval AP-7 is attached to J-31 and must remain in the audit.
10. Reconciler -> Ledger: Check duplicate IDs. Note: Duplicate transaction IDs stop publication rather than being silently skipped.
11. Ledger -> Reconciler: IDs unique. Note: D-11, D-12, W-21, W-22 and J-31 are distinct.
12. Reconciler -> Ledger: Check revision R-100. Note: A changed opening revision requires a complete batch restart.
13. Ledger -> Reconciler: Revision unchanged. Note: The opening revision remains R-100 throughout the calculation.
14. Reconciler -> Ledger: Write candidate close. Note: The proposed closing balance is 1505.00, not yet externally visible.
15. Ledger -> Reconciler: Candidate staged. Note: Candidate C-42 is staged under batch B-042 with all five transactions.
16. Reconciler -> Ledger: Commit audit and close. Note: Audit A-42 and the closing balance are committed atomically.
17. Ledger -> Reconciler: Commit confirmed. Note: Closing revision R-101 binds balance 1505.00 and audit A-42.
18. Reconciler -> Operator: Batch complete. Note: The operator receives B-042, R-101 and A-42 for later investigation.
