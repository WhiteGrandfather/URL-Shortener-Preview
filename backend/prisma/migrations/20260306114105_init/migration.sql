-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalUrl" TEXT NOT NULL,
    "previewTitle" TEXT NOT NULL,
    "previewDescription" TEXT NOT NULL,
    "previewImage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Link_originalUrl_key" ON "Link"("originalUrl");
