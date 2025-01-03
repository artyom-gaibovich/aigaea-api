/*
  Warnings:

  - Added the required column `aigaea_password` to the `proxy_client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beget_password` to the `proxy_client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "aigaea"."proxy_client" ADD COLUMN     "aigaea_password" TEXT NOT NULL,
ADD COLUMN     "beget_password" TEXT NOT NULL;
