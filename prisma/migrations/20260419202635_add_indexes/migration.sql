-- CreateIndex
CREATE INDEX "Budget_coupleId_idx" ON "Budget"("coupleId");

-- CreateIndex
CREATE INDEX "Budget_coupleId_month_idx" ON "Budget"("coupleId", "month");

-- CreateIndex
CREATE INDEX "Category_coupleId_idx" ON "Category"("coupleId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Transaction_coupleId_idx" ON "Transaction"("coupleId");

-- CreateIndex
CREATE INDEX "Transaction_coupleId_date_idx" ON "Transaction"("coupleId", "date");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
