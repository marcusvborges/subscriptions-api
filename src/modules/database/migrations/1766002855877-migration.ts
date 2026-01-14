import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1766002855877 implements MigrationInterface {
    name = 'Migration1766002855877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."plan_prices_interval_enum" AS ENUM('month', 'year', 'week', 'day')`);
        await queryRunner.query(`CREATE TABLE "plan_prices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "interval" "public"."plan_prices_interval_enum" NOT NULL DEFAULT 'month', "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'BRL', "trialAvailable" boolean NOT NULL DEFAULT false, "trialDays" integer, "metadata" jsonb, "planId" uuid, CONSTRAINT "PK_69b05dce9891d42a3d0fc77eec1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "category" character varying`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "features" jsonb`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "startDate" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "canceledAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "expiresAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "priceId" uuid`);
        await queryRunner.query(`ALTER TABLE "plans" ADD CONSTRAINT "UQ_253d25dae4c94ee913bc5ec4850" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "plan_prices" ADD CONSTRAINT "FK_eb2f222f91a8e78e9e1d591b0de" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_adc20a425b6268a729c11f87a18" FOREIGN KEY ("priceId") REFERENCES "plan_prices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_adc20a425b6268a729c11f87a18"`);
        await queryRunner.query(`ALTER TABLE "plan_prices" DROP CONSTRAINT "FK_eb2f222f91a8e78e9e1d591b0de"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP CONSTRAINT "UQ_253d25dae4c94ee913bc5ec4850"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "priceId"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "canceledAt"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "features"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "plans" ADD "price" numeric(10,2) NOT NULL`);
        await queryRunner.query(`DROP TABLE "plan_prices"`);
        await queryRunner.query(`DROP TYPE "public"."plan_prices_interval_enum"`);
    }

}
