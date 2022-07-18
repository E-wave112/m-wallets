import { MigrationInterface, QueryRunner } from 'typeorm';

export class pilot1658109400332 implements MigrationInterface {
    name = 'pilot1658109400332';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."User_platform_enum" AS ENUM('android', 'ios', 'web')`,
        );
        await queryRunner.query(
            `CREATE TABLE "User" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL DEFAULT '', "lastName" character varying NOT NULL DEFAULT '', "email" character varying NOT NULL DEFAULT '', "pin" character varying NOT NULL, "phone" character varying NOT NULL, "transactionPin" character varying NOT NULL DEFAULT '', "verified" boolean NOT NULL DEFAULT false, "privateKey" character varying NOT NULL DEFAULT '', "resetToken" character varying NOT NULL DEFAULT '', "resetTokenExpiry" bigint NOT NULL DEFAULT '10000', "dob" character varying NOT NULL DEFAULT '', "isAdmin" boolean NOT NULL DEFAULT false, "deviceId" character varying NOT NULL DEFAULT '', "deviceIp" character varying NOT NULL DEFAULT '', "deviceModel" character varying NOT NULL DEFAULT '', "platform" "public"."User_platform_enum" NOT NULL DEFAULT 'web', "lastLoggedIn" character varying NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "Transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" integer NOT NULL DEFAULT '0', "type" character varying NOT NULL, "status" character varying NOT NULL, "reference" character varying NOT NULL, "narration" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_7761bf9766670b894ff2fdb3700" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "emailver" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "verifyToken" character varying NOT NULL DEFAULT '', "email" character varying NOT NULL DEFAULT '', "verifyTokenExpiry" bigint NOT NULL DEFAULT '900002', "valid" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0433e55621330d1cb7003ee06" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "Wallet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "balance" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_2f7aa51d6746fc8fc8ed63ddfb" UNIQUE ("userId"), CONSTRAINT "PK_8828fa4047435abf9287ff0e89e" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "Transactions" ADD CONSTRAINT "FK_f01450fedf7507118ad25dcf41e" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "Wallet" ADD CONSTRAINT "FK_2f7aa51d6746fc8fc8ed63ddfbc" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "Wallet" DROP CONSTRAINT "FK_2f7aa51d6746fc8fc8ed63ddfbc"`,
        );
        await queryRunner.query(
            `ALTER TABLE "Transactions" DROP CONSTRAINT "FK_f01450fedf7507118ad25dcf41e"`,
        );
        await queryRunner.query(`DROP TABLE "Wallet"`);
        await queryRunner.query(`DROP TABLE "emailver"`);
        await queryRunner.query(`DROP TABLE "Transactions"`);
        await queryRunner.query(`DROP TABLE "User"`);
        await queryRunner.query(`DROP TYPE "public"."User_platform_enum"`);
    }
}
