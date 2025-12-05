import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764959714327 implements MigrationInterface {
	name = 'Migration1764959714327';

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "plans" ADD "active" boolean NOT NULL DEFAULT true`);
		await queryRunner.query(`ALTER TABLE "subscriptions" ADD "active" boolean NOT NULL DEFAULT true`);
		await queryRunner.query(`ALTER TABLE "subscriptions" ADD "startDate" TIMESTAMP WITH TIME ZONE`);
		await queryRunner.query(`ALTER TABLE "subscriptions" ADD "canceledAt" TIMESTAMP WITH TIME ZONE`);
		await queryRunner.query(`ALTER TABLE "subscriptions" ADD "expiresAt" TIMESTAMP WITH TIME ZONE`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "expiresAt"`);
		await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "canceledAt"`);
		await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "startDate"`);
		await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "active"`);
		await queryRunner.query(`ALTER TABLE "plans" DROP COLUMN "active"`);
	}

}
