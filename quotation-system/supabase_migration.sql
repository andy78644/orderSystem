-- PostgreSQL Migration SQL for Supabase
-- 在 Supabase SQL Editor 中執行此 SQL

-- CreateTable: users
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable: forms
CREATE TABLE IF NOT EXISTS "forms" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vendor_name" TEXT NOT NULL,
    "vendor_phone" TEXT NOT NULL,
    "vendor_email" TEXT NOT NULL,
    "allow_multiple_submissions" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable: form_items
CREATE TABLE IF NOT EXISTS "form_items" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "specification" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: quotations
CREATE TABLE IF NOT EXISTS "quotations" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "total_amount" DOUBLE PRECISION,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: quotation_items
CREATE TABLE IF NOT EXISTS "quotation_items" (
    "id" TEXT NOT NULL,
    "quotation_id" TEXT NOT NULL,
    "form_item_id" TEXT NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "forms_created_by_idx" ON "forms"("created_by");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "form_items_form_id_idx" ON "form_items"("form_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "quotations_form_id_idx" ON "quotations"("form_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "quotation_items_quotation_id_idx" ON "quotation_items"("quotation_id");

-- AddForeignKey
ALTER TABLE "forms"
ADD CONSTRAINT "forms_created_by_fkey"
FOREIGN KEY ("created_by")
REFERENCES "users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_items"
ADD CONSTRAINT "form_items_form_id_fkey"
FOREIGN KEY ("form_id")
REFERENCES "forms"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations"
ADD CONSTRAINT "quotations_form_id_fkey"
FOREIGN KEY ("form_id")
REFERENCES "forms"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items"
ADD CONSTRAINT "quotation_items_quotation_id_fkey"
FOREIGN KEY ("quotation_id")
REFERENCES "quotations"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_items"
ADD CONSTRAINT "quotation_items_form_item_id_fkey"
FOREIGN KEY ("form_item_id")
REFERENCES "form_items"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Create migration tracking table (optional, for Prisma compatibility)
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checksum" TEXT NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Insert migration record
INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "finished_at", "applied_steps_count")
VALUES (
    '20251106180045_init',
    'migration_checksum',
    '20251106180045_init',
    CURRENT_TIMESTAMP,
    1
)
ON CONFLICT DO NOTHING;
