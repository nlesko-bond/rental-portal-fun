-- Copy add-on links (ProductPackages) from hourly clone sources onto punch-pass siblings.
-- The original seed only cloned the product row, facilities, resources, taxes, and prices —
-- not packages — so Court 10-pack has packages=[] while "Rent a court!" has the shooting
-- machine and tennis balls.
--
--   psql "$BOND_DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/attach-punch-pass-addons.sql
--
-- Idempotent: skips a parent that already has live ProductPackages rows.
-- Dry-run: change COMMIT to ROLLBACK.

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.table_id_is_identity(p_table regclass)
RETURNS boolean
LANGUAGE sql
STABLE
AS $f$
	SELECT EXISTS (
		SELECT 1
		FROM pg_attribute a
		WHERE a.attrelid = p_table
			AND a.attname = 'id'
			AND a.attidentity <> ''
	);
$f$;

CREATE OR REPLACE FUNCTION pg_temp.alloc_id(p_table regclass)
RETURNS integer
LANGUAGE plpgsql
AS $f$
DECLARE
	v_seq text;
BEGIN
	v_seq := pg_get_serial_sequence(p_table::text, 'id');
	IF v_seq IS NULL THEN
		RAISE EXCEPTION 'No serial/identity sequence for %.id', p_table;
	END IF;
	RETURN nextval(v_seq)::integer;
END;
$f$;

CREATE OR REPLACE FUNCTION pg_temp.clone_product_packages(
	p_clone_product_id integer,
	p_new_product_id integer
)
RETURNS integer
LANGUAGE plpgsql
AS $f$
DECLARE
	v_tmp text := '_punch_pkg_clone';
	v_copied integer;
	v_pkg_regclass regclass := 'public."ProductPackages"'::regclass;
BEGIN
	EXECUTE format('DROP TABLE IF EXISTS %I', v_tmp);
	EXECUTE format(
		'CREATE TEMP TABLE %I ON COMMIT DROP AS SELECT * FROM "ProductPackages" WHERE "parentProductId" = $1 AND "deletedAt" IS NULL',
		v_tmp
	)
	USING p_clone_product_id;

	EXECUTE format('SELECT count(*) FROM %I', v_tmp) INTO v_copied;
	IF v_copied = 0 THEN
		RETURN 0;
	END IF;

	EXECUTE format(
		'UPDATE %I SET id = pg_temp.alloc_id($1), "parentProductId" = $2, "deletedAt" = NULL',
		v_tmp
	)
	USING v_pkg_regclass, p_new_product_id;

	IF EXISTS (
		SELECT 1 FROM pg_attribute
		WHERE attrelid = v_pkg_regclass AND attname = 'createdAt' AND NOT attisdropped
	) THEN
		EXECUTE format('UPDATE %I SET "createdAt" = now(), "updatedAt" = now()', v_tmp);
	END IF;

	IF pg_temp.table_id_is_identity(v_pkg_regclass) THEN
		EXECUTE format('INSERT INTO "ProductPackages" OVERRIDING SYSTEM VALUE SELECT * FROM %I', v_tmp);
	ELSE
		EXECUTE format('INSERT INTO "ProductPackages" SELECT * FROM %I', v_tmp);
	END IF;

	RETURN v_copied;
END;
$f$;

DO $$
DECLARE
	v_org_id integer := 155;
	rec record;
	v_copied integer;
BEGIN
	DROP TABLE IF EXISTS punch_pass_addon_result;
	CREATE TEMP TABLE punch_pass_addon_result (
		pack_id integer,
		pack_name text,
		cloned_from integer,
		packages_copied integer,
		skipped text
	);

	FOR rec IN
		SELECT
			dst.id AS pack_id,
			dst.name AS pack_name,
			src.id AS clone_from
		FROM (
			VALUES
				('Court 10-pack', 659887),
				('Lessons 1:1 10-pack', 702813),
				('Small Group Lessons 8-pack', 89452),
				('Tennis lessons 10-pack', 877575)
		) AS want(pack_name, clone_from)
		JOIN "Products" dst
			ON dst."organizationId" = v_org_id
			AND dst.name = want.pack_name
			AND dst."deletedAt" IS NULL
		JOIN "Products" src
			ON src.id = want.clone_from
			AND src."organizationId" = v_org_id
			AND src."deletedAt" IS NULL
	LOOP
		IF EXISTS (
			SELECT 1
			FROM "ProductPackages"
			WHERE "parentProductId" = rec.pack_id
				AND "deletedAt" IS NULL
		) THEN
			INSERT INTO punch_pass_addon_result VALUES (
				rec.pack_id, rec.pack_name, rec.clone_from, 0, 'already has packages'
			);
			CONTINUE;
		END IF;

		v_copied := pg_temp.clone_product_packages(rec.clone_from, rec.pack_id);
		INSERT INTO punch_pass_addon_result VALUES (
			rec.pack_id, rec.pack_name, rec.clone_from, v_copied, NULL
		);
		RAISE NOTICE 'Copied % ProductPackages onto % (%) from %',
			v_copied, rec.pack_name, rec.pack_id, rec.clone_from;
	END LOOP;
END;
$$;

SELECT * FROM punch_pass_addon_result ORDER BY pack_name;

SELECT
	pp."parentProductId",
	parent.name AS pack_name,
	pp."childProductId",
	child.name AS addon_name,
	pp.level,
	pp."relationType",
	pp.price
FROM "ProductPackages" pp
JOIN punch_pass_addon_result r ON r.pack_id = pp."parentProductId"
JOIN "Products" parent ON parent.id = pp."parentProductId"
JOIN "Products" child ON child.id = pp."childProductId"
WHERE pp."deletedAt" IS NULL
ORDER BY parent.name, child.name;

COMMIT;
