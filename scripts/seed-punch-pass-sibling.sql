-- Clone an hourly rental into a punch-pass sibling SKU for the consumer portal demo.
--
--   export BOND_DATABASE_URL='postgresql://...'
--   psql "$BOND_DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/seed-punch-pass-sibling.sql
--
-- or:  ./scripts/seed-punch-pass-sibling.sh
--
-- Public API isPunchPass is Products."punchCard" (not the PunchPasses table).
-- Does not write PunchPasses / UserPunchPasses / UserRedemptions.
-- Edit the CONFIG block in the DO body, then run.
-- Dry-run: change the final COMMIT to ROLLBACK.

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

CREATE OR REPLACE FUNCTION pg_temp.clone_join_table(
	p_table regclass,
	p_clone_product_id integer,
	p_new_product_id integer
)
RETURNS integer
LANGUAGE plpgsql
AS $f$
DECLARE
	v_tmp text := '_punch_join_clone';
	v_has_deleted boolean;
	v_copied integer;
BEGIN
	EXECUTE format('DROP TABLE IF EXISTS %I', v_tmp);

	SELECT EXISTS (
		SELECT 1
		FROM pg_attribute
		WHERE attrelid = p_table
			AND attname = 'deletedAt'
			AND NOT attisdropped
	) INTO v_has_deleted;

	IF v_has_deleted THEN
		EXECUTE format(
			'CREATE TEMP TABLE %I ON COMMIT DROP AS SELECT * FROM %s WHERE "productId" = $1 AND "deletedAt" IS NULL',
			v_tmp,
			p_table
		)
		USING p_clone_product_id;
	ELSE
		EXECUTE format(
			'CREATE TEMP TABLE %I ON COMMIT DROP AS SELECT * FROM %s WHERE "productId" = $1',
			v_tmp,
			p_table
		)
		USING p_clone_product_id;
	END IF;

	EXECUTE format('SELECT count(*) FROM %I', v_tmp) INTO v_copied;
	IF v_copied = 0 THEN
		RETURN 0;
	END IF;

	EXECUTE format(
		'UPDATE %I SET id = pg_temp.alloc_id($1), "productId" = $2',
		v_tmp
	)
	USING p_table, p_new_product_id;

	IF EXISTS (
		SELECT 1 FROM pg_attribute
		WHERE attrelid = p_table AND attname = 'createdAt' AND NOT attisdropped
	) THEN
		EXECUTE format('UPDATE %I SET "createdAt" = now(), "updatedAt" = now()', v_tmp);
	END IF;

	IF v_has_deleted THEN
		EXECUTE format('UPDATE %I SET "deletedAt" = NULL', v_tmp);
	END IF;

	IF pg_temp.table_id_is_identity(p_table) THEN
		EXECUTE format('INSERT INTO %s OVERRIDING SYSTEM VALUE SELECT * FROM %I', p_table, v_tmp);
	ELSE
		EXECUTE format('INSERT INTO %s SELECT * FROM %I', p_table, v_tmp);
	END IF;

	RETURN v_copied;
END;
$f$;

CREATE OR REPLACE FUNCTION pg_temp.insert_price(
	p_org_id integer,
	p_product_id integer,
	p_name text,
	p_price numeric,
	p_currency text,
	p_template_product_id integer
)
RETURNS integer
LANGUAGE plpgsql
AS $f$
DECLARE
	v_tmp text := '_punch_price_clone';
	v_id integer;
	v_seq text;
	v_has_template boolean;
	v_prices_regclass regclass := 'public."Prices"'::regclass;
BEGIN
	SELECT EXISTS (
		SELECT 1
		FROM "Prices"
		WHERE "productId" = p_template_product_id
			AND "deletedAt" IS NULL
	) INTO v_has_template;

	IF v_has_template THEN
		EXECUTE format('DROP TABLE IF EXISTS %I', v_tmp);
		CREATE TEMP TABLE _punch_price_clone ON COMMIT DROP AS
		SELECT * FROM "Prices"
		WHERE "productId" = p_template_product_id
			AND "deletedAt" IS NULL
		ORDER BY id
		LIMIT 1;

		v_seq := pg_get_serial_sequence('public."Prices"', 'id');
		UPDATE _punch_price_clone SET
			id = nextval(v_seq)::integer,
			"organizationId" = p_org_id,
			"productId" = p_product_id,
			"packageId" = NULL,
			name = p_name,
			price = p_price,
			currency = p_currency,
			"deletedAt" = NULL,
			"createdAt" = now(),
			"updatedAt" = now();

		IF pg_temp.table_id_is_identity(v_prices_regclass) THEN
			INSERT INTO "Prices" OVERRIDING SYSTEM VALUE
			SELECT * FROM _punch_price_clone
			RETURNING id INTO v_id;
		ELSE
			INSERT INTO "Prices"
			SELECT * FROM _punch_price_clone
			RETURNING id INTO v_id;
		END IF;
		RETURN v_id;
	END IF;

	INSERT INTO "Prices" (
		"organizationId",
		"productId",
		name,
		price,
		currency,
		"createdAt",
		"updatedAt"
	)
	VALUES (
		p_org_id,
		p_product_id,
		p_name,
		p_price,
		p_currency,
		now(),
		now()
	)
	RETURNING id INTO v_id;
	RETURN v_id;
END;
$f$;

DO $$
DECLARE
	v_org_id integer := 155;
	v_clone_product_id integer := 659887;
	v_name text := 'Court 10-pack';
	v_punches integer := 10;
	v_duration_minutes integer := 60;
	v_pack_price numeric := 150;
	v_pack_currency text := 'USD';
	v_new_id integer;
	v_visit_price_id integer;
	v_pack_price_id integer;
	v_identity boolean;
	v_seq text;
	v_facilities integer;
	v_resources integer;
	v_taxes integer;
	v_products_regclass regclass := 'public."Products"'::regclass;
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM "Products"
		WHERE id = v_clone_product_id
			AND "organizationId" = v_org_id
			AND "deletedAt" IS NULL
	) THEN
		RAISE EXCEPTION 'Clone product % not found in org %', v_clone_product_id, v_org_id;
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "Products"
		WHERE "organizationId" = v_org_id
			AND name = v_name
			AND "deletedAt" IS NULL
	) THEN
		RAISE EXCEPTION 'Product % already exists in org % — rename v_name or delete the existing row', v_name, v_org_id;
	END IF;

	v_seq := pg_get_serial_sequence('public."Products"', 'id');
	IF v_seq IS NULL THEN
		RAISE EXCEPTION 'No serial/identity sequence for public."Products".id';
	END IF;

	DROP TABLE IF EXISTS _punch_clone_product;
	CREATE TEMP TABLE _punch_clone_product ON COMMIT DROP AS
	SELECT * FROM "Products" WHERE id = v_clone_product_id;

	UPDATE _punch_clone_product SET
		id = nextval(v_seq)::integer,
		name = v_name,
		"punchCard" = true,
		quantity = v_punches,
		"durationMinutes" = v_duration_minutes,
		"durationDays" = NULL,
		"paymentProcessorId" = NULL,
		"defaultPriceId" = NULL,
		"isAvailableOnline" = true,
		status = 'active',
		"isArchive" = false,
		"deletedAt" = NULL,
		"createdAt" = now(),
		"updatedAt" = now();

	IF pg_temp.table_id_is_identity(v_products_regclass) THEN
		INSERT INTO "Products" OVERRIDING SYSTEM VALUE
		SELECT * FROM _punch_clone_product
		RETURNING id INTO v_new_id;
	ELSE
		INSERT INTO "Products"
		SELECT * FROM _punch_clone_product
		RETURNING id INTO v_new_id;
	END IF;

	v_facilities := pg_temp.clone_join_table(
		'public."ProductsToFacilities"'::regclass,
		v_clone_product_id,
		v_new_id
	);
	v_resources := pg_temp.clone_join_table(
		'public."ProductResources"'::regclass,
		v_clone_product_id,
		v_new_id
	);

	DROP TABLE IF EXISTS _punch_clone_taxes;
	CREATE TEMP TABLE _punch_clone_taxes ON COMMIT DROP AS
	SELECT * FROM "ProductTaxes" WHERE "productId" = v_clone_product_id;
	UPDATE _punch_clone_taxes SET
		"productId" = v_new_id,
		"createdAt" = now(),
		"updatedAt" = now();
	INSERT INTO "ProductTaxes" SELECT * FROM _punch_clone_taxes;
	GET DIAGNOSTICS v_taxes = ROW_COUNT;

	v_pack_price_id := pg_temp.insert_price(
		v_org_id,
		v_new_id,
		'Pack',
		v_pack_price,
		v_pack_currency,
		v_clone_product_id
	);
	v_visit_price_id := pg_temp.insert_price(
		v_org_id,
		v_new_id,
		'Visit',
		0,
		v_pack_currency,
		v_clone_product_id
	);

	UPDATE "Products"
	SET "defaultPriceId" = v_visit_price_id,
		"updatedAt" = now()
	WHERE id = v_new_id;

	DROP TABLE IF EXISTS punch_pass_seed_result;
	CREATE TEMP TABLE punch_pass_seed_result (
		product_id integer,
		name text,
		punch_card boolean,
		quantity integer,
		duration_minutes integer,
		pack_price_id integer,
		visit_price_id integer,
		cloned_from integer,
		facilities_copied integer,
		resources_copied integer,
		taxes_copied integer
	);
	INSERT INTO punch_pass_seed_result VALUES (
		v_new_id,
		v_name,
		true,
		v_punches,
		v_duration_minutes,
		v_pack_price_id,
		v_visit_price_id,
		v_clone_product_id,
		v_facilities,
		v_resources,
		v_taxes
	);

	RAISE NOTICE 'Created punch-pass product id=% (cloned %) packPriceId=% visitPriceId=%',
		v_new_id, v_clone_product_id, v_pack_price_id, v_visit_price_id;
END;
$$;

SELECT * FROM punch_pass_seed_result;

SELECT p.id, p.name, p."punchCard", p.quantity, p."durationMinutes", p."defaultPriceId",
	pr.id AS price_id, pr.name AS price_name, pr.price, pr.currency
FROM "Products" p
JOIN punch_pass_seed_result r ON r.product_id = p.id
LEFT JOIN "Prices" pr ON pr."productId" = p.id AND pr."deletedAt" IS NULL
ORDER BY pr.price DESC;

COMMIT;
