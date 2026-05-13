/*
  Warnings:

  - Added the required column `scope_snapshot` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "scope_snapshot" JSONB NOT NULL;
