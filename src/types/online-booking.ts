/** Mirrors public OpenAPI; category `settings` stays loose until the spec tightens. */
export type OnlineBookingView = "list" | "calendar" | "matrix";

export type CategorySettings = {
  bookingDurations?: number[];
  /** When true, bookings are requests pending approval (vs pay-now / instant book). */
  approvalRequired?: boolean;
} & Record<string, unknown>;

export type ReservationProductCategoryDto = {
  id: number;
  organizationId: number;
  name?: string;
  description?: string;
  productType?: string;
  settings?: CategorySettings;
};

export type ExtendedFacilityDto = {
  id: number;
  name: string;
  timezone?: string;
  description?: string;
  linkSEO?: string;
};

/**
 * Optional portal white-label tokens from Bond `options.branding`.
 * Unknown keys are ignored; extend as the public API documents more fields.
 */
export type PortalBranding = {
  primaryColor?: string;
  primary?: string;
  accentColor?: string;
  accent?: string;
  successColor?: string;
  success?: string;
  fontFamily?: string;
  fontFamilyStack?: string;
  /** Page / card backgrounds */
  backgroundColor?: string;
  surfaceColor?: string;
  /** Text and chrome */
  textColor?: string;
  textPrimaryColor?: string;
  textMutedColor?: string;
  borderColor?: string;
} & Record<string, unknown>;

export type ExtendedOnlineBookingPortalOptionsDto = {
  defaultFacility: ExtendedFacilityDto;
  facilities: ExtendedFacilityDto[];
  defaultCategory: ReservationProductCategoryDto;
  categories: ReservationProductCategoryDto[];
  defaultActivity: string;
  activities: string[];
  defaultView: OnlineBookingView;
  views: OnlineBookingView[];
  enableStartTimeSelection?: boolean;
  startTimeIntervals?: number[];
  /** Optional org theme; maps to `--cb-*` in `resolveBookingThemeStyle`. */
  branding?: PortalBranding;
};

export type PublicOnlineBookingPortalDto = {
  id: number;
  name: string;
  options: ExtendedOnlineBookingPortalOptionsDto;
};

export type SimplePriceDto = {
  id: number;
  organizationId: number;
  name?: string;
  price: number;
  currency: string;
  startDate?: string;
  endDate?: string;
};

/** Often returned as add-ons / required extras on reservation products. */
export type RequiredProductRefDto = {
  id: number;
  name?: string;
  description?: string;
  prices?: SimplePriceDto[];
  /** e.g. `membership` when gated by membership */
  productType?: string;
};

export type ExtendedProductDto = {
  id: number;
  organizationId: number;
  name: string;
  quantity: number;
  description?: string;
  prices: SimplePriceDto[];
  isAll: boolean;
  isPunchPass: boolean;
  isProRated: boolean;
  timezone?: string;
  /** When Bond expands public products with media */
  mainMedia?: { url?: string };
  media?: Array<{ url?: string }>;
  /** Add-ons or linked products (e.g. bat rental) when returned by the API */
  requiredProducts?: RequiredProductRefDto[];
  /** Checkout questionnaire ids from Bond (legacy / alternate key). */
  forms?: number[];
  /** Bond public API: `questionnaireIds` on category products (see ExtendedProductDto in OpenAPI). */
  questionnaireIds?: number[];
  /** OpenAPI spelling on `ExtendedProductDto`: `questionnairesIds`. */
  questionnairesIds?: number[];
  /** Membership / gate flag from API (`isGated` on ExtendedProductDto). */
  isGated?: boolean;
  /** Product packages (optional add-ons often nested here in Bond payloads) */
  packages?: unknown[];
  downPayment?: number;
  /** Alternate spelling from some API payloads */
  downpayment?: number;
  memberOnly?: boolean;
  entitlementDiscounts?: unknown[];
};

export type PaginationMetaDto = {
  totalItems: number;
  itemsPerPage: number;
  page?: number;
  offset?: number;
  nextOffset?: number | null;
};

export type PaginatedProductsResponse = {
  meta: PaginationMetaDto;
  data: ExtendedProductDto[];
};

/** One calendar day in schedule settings; `times` are valid preferred start instants (`HH:mm:ss`). */
export type DateAndTimesDto = {
  date: string;
  times?: string[];
};

/** Resource row from schedule **settings** (lighter than expanded schedule resource). */
export type PublicResourceDto = {
  id: number;
  name: string;
  type: string;
  sports: string[];
  status: string;
  description?: string | null;
  parentResourceId?: number | null;
  metadata?: unknown;
};

export type ScheduleTimeSlotDto = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  price: number;
  timezone: string;
  isAvailable: boolean;
  spacesIds?: number[];
};

export type PublicResourceScheduleDto = {
  resource: PublicResourceDto;
  timeSlots: ScheduleTimeSlotDto[];
  spaces?: PublicResourceDto[];
};

export type BookingScheduleDto = {
  dates: DateAndTimesDto[];
  resources: PublicResourceScheduleDto[];
};

export type BookingScheduleSettingsDto = {
  dates: DateAndTimesDto[];
  resources: PublicResourceDto[];
};

/** `GET .../online-booking/user/{userId}/booking-information` */
export type UserBookingInformationDto = {
  slots?: unknown;
  members?: unknown;
  settings?: unknown;
} & Record<string, unknown>;

export type PublicQuestionnaireQuestionDto = Record<string, unknown>;

/** `GET .../questionnaires/{id}` */
export type PublicQuestionnaireDto = {
  id: number;
  title?: string;
  organizationId?: number;
  createdAt?: string;
  questions?: PublicQuestionnaireQuestionDto[];
} & Record<string, unknown>;

export type PublicCheckoutQuestionnaireDto = PublicQuestionnaireDto & Record<string, unknown>;

/** Cart-level purchase intent — `"order"` = approval-required, `"purchase"` = immediate pay. */
export type CartPurchaseTypeEnum = "order" | "purchase";

/** Cart lifecycle state from Bond `CartStateEnum`. After `finalize` the state moves to `invoiced`. */
export type CartStateEnum = "active" | "canceled" | "cleared" | "invoiced";

/** Cart validity from Bond `CartStatusEnum`. */
export type CartStatusEnum = "valid" | "invalid" | "unknown" | "processing";

/**
 * `POST .../online-booking/create` → 201, also returned by `GET .../cart/{cartId}`.
 *
 * Field reference (from hosted Bond Swagger `OrganizationCartDto`):
 * - `price` — total cart price (includes approval items).
 * - `minimumPrice` — purchasable items only (excludes `purchaseType: "order"` items). Drives "Pay full".
 * - `downpayment` — whole-cart deposit (lowercase per spec).
 * - `minimumDownpayment` — purchasable items only deposit. Drives "Pay minimum".
 * - `subtotal` / `discountSubtotal` / `taxAmount` / `discountAmount` — pre/post-discount/tax totals.
 * - `purchaseType` — `"order" | "purchase"`. Mixed carts have approval (`order`) **and** pay-now (`purchase`) items.
 *
 * The `total` / `tax` / legacy `downPayment` fields are kept as optional fallbacks for older payloads.
 */
export type OrganizationCartDto = {
  id: number;
  organizationId: number;
  price?: number;
  /** Purchasable items only (excludes approval/order items). Use for "Pay full" amount on finalize. */
  minimumPrice?: number;
  status?: CartStatusEnum | string;
  state?: CartStateEnum | string;
  currency?: string;
  subtotal?: number;
  discountSubtotal?: number;
  /** Whole-cart deposit (Bond spelling — lowercase `p`). */
  downpayment?: number;
  /** Purchasable items only deposit. Use for "Pay minimum" amount on finalize. */
  minimumDownpayment?: number;
  /** Cart-level intent: `"order"` = all items require approval, `"purchase"` = immediate pay. */
  purchaseType?: CartPurchaseTypeEnum | string;
  tippableAmount?: number;
  /** When Bond returns tax breakdown (names vary; see `checkout-bag-totals`). */
  tax?: number;
  taxAmount?: number;
  /** Line-level tax rows (`name`, `rate`, `price`, …) — see hosted `OrganizationCartDto` / tax DTOs. */
  taxes?: unknown[];
  total?: number;
  discountAmount?: number;
  /** CartDiscountDto[] — entitlement / promo lines with `discount.name`, `discountAmount`, etc. */
  discounts?: unknown[];
  cartItems?: unknown[];
} & Record<string, unknown>;
