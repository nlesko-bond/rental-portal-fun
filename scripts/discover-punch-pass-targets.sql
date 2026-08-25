-- Org 155: which portals list which categories, and which reservation
-- products you can clone into a punch-pass sibling.
--
-- A pack shows on a portal only if its Products."categoryId" is in that
-- portal's options.categoriesIds. Clone an hourly product that already
-- books on the target portal — do not invent a product from scratch.
--
--   psql "$BOND_DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/discover-punch-pass-targets.sql

\echo '=== Portals (Filters type=online_booking) and their categories ==='

SELECT
	f.id AS portal_id,
	f.name AS portal_name,
	cat_id::integer AS category_id,
	pc.name AS category_name,
	pc."productType" AS category_product_type
FROM "Filters" f
CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(f.options->'categoriesIds', '[]'::jsonb)) AS cat_id
LEFT JOIN "ProductCategories" pc
	ON pc.id = cat_id::integer
	AND pc."deletedAt" IS NULL
WHERE f."organizationId" = 155
	AND f.type = 'online_booking'
	AND f."deletedAt" IS NULL
ORDER BY f.name, pc.name;

\echo '=== Reservation products you can clone (hourly vs existing packs) ==='

SELECT
	p.id AS clone_from_product_id,
	p.name,
	p."punchCard" AS is_punch_pass,
	p.quantity,
	p."durationMinutes",
	p."categoryId",
	pc.name AS category_name,
	p."isAvailableOnline",
	string_agg(DISTINCT f.name, ', ' ORDER BY f.name) AS portals_that_list_this_category
FROM "Products" p
LEFT JOIN "ProductCategories" pc
	ON pc.id = p."categoryId"
LEFT JOIN "Filters" f
	ON f."organizationId" = 155
	AND f.type = 'online_booking'
	AND f."deletedAt" IS NULL
	AND f.options->'categoriesIds' @> jsonb_build_array(p."categoryId")
WHERE p."organizationId" = 155
	AND p."deletedAt" IS NULL
	AND COALESCE(p."isArchive", false) = false
	AND p."productType" = 'reservation'
	AND p."isAddon" = false
GROUP BY
	p.id,
	p.name,
	p."punchCard",
	p.quantity,
	p."durationMinutes",
	p."categoryId",
	pc.name,
	p."isAvailableOnline"
ORDER BY pc.name NULLS LAST, p."punchCard", p.name;
