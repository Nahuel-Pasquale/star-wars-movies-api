import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMovies1790875676503 implements MigrationInterface {
    name = 'CreateMovies1790875676503'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."movies_source_enum" AS ENUM('MANUAL', 'SWAPI')`);
        await queryRunner.query(`CREATE TABLE "movies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "swapi_id" character varying(50), "title" character varying(255) NOT NULL, "episode_id" integer, "opening_crawl" text, "director" character varying(255), "producer" character varying(255), "release_date" date, "source" "public"."movies_source_enum" NOT NULL DEFAULT 'MANUAL', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c925d35378b4694d866a7ef2024" UNIQUE ("swapi_id"), CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "movies"`);
        await queryRunner.query(`DROP TYPE "public"."movies_source_enum"`);
    }

}
