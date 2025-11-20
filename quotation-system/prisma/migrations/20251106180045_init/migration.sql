-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "forms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "vendor_phone" TEXT NOT NULL,
    "vendor_email" TEXT NOT NULL,
    "allow_multiple_submissions" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "forms_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "form_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "form_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "specification" TEXT,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "form_items_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "form_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "total_amount" REAL,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    CONSTRAINT "quotations_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quotation_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotation_id" TEXT NOT NULL,
    "form_item_id" TEXT NOT NULL,
    "unit_price" REAL NOT NULL,
    "quantity" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quotation_items_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "quotation_items_form_item_id_fkey" FOREIGN KEY ("form_item_id") REFERENCES "form_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "forms_created_by_idx" ON "forms"("created_by");

-- CreateIndex
CREATE INDEX "form_items_form_id_idx" ON "form_items"("form_id");

-- CreateIndex
CREATE INDEX "quotations_form_id_idx" ON "quotations"("form_id");

-- CreateIndex
CREATE INDEX "quotation_items_quotation_id_idx" ON "quotation_items"("quotation_id");
