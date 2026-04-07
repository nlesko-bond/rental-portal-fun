import { bondBffGetJson, bondBffPostJson } from "./bond-json";
import type {
  OrganizationCartDto,
  PublicCheckoutQuestionnaireDto,
  PublicQuestionnaireDto,
  UserBookingInformationDto,
} from "@/types/online-booking";
import type { BondUserDto } from "./bond-user-types";

function orgBase(orgId: number): string[] {
  return ["v1", "organization", String(orgId)];
}

/**
 * `GET /v1/organization/{orgId}/user` — JWT via cookies → BFF.
 */
export async function fetchCurrentBondUser(
  orgId: number,
  expand: string[] = ["family", "address"]
): Promise<BondUserDto> {
  const path = [...orgBase(orgId), "user"];
  const q = new URLSearchParams();
  for (const e of expand) {
    q.append("expand", e);
  }
  return bondBffGetJson<BondUserDto>(path, q);
}

/**
 * `GET .../online-booking/user/{userId}/booking-information`
 */
export async function fetchUserBookingInformation(
  orgId: number,
  userId: number,
  params: { startDate: string; endDate: string; categoryId: number; facilityId: number }
): Promise<UserBookingInformationDto> {
  const path = [...orgBase(orgId), "online-booking", "user", String(userId), "booking-information"];
  const q = new URLSearchParams();
  q.set("startDate", params.startDate);
  q.set("endDate", params.endDate);
  q.set("categoryId", String(params.categoryId));
  q.set("facilityId", String(params.facilityId));
  return bondBffGetJson<UserBookingInformationDto>(path, q);
}

/**
 * `GET .../questionnaires/{questionnaireId}` — API key only; product `forms` IDs.
 */
export async function fetchPublicQuestionnaireById(
  orgId: number,
  questionnaireId: number,
  expand: string[] = ["questions"]
): Promise<PublicQuestionnaireDto> {
  const path = [...orgBase(orgId), "questionnaires", String(questionnaireId)];
  const q = new URLSearchParams();
  for (const e of expand) {
    q.append("expand", e);
  }
  return bondBffGetJson<PublicQuestionnaireDto>(path, q);
}

export type CheckoutQuestionnairesResponse = {
  meta?: unknown;
  data: PublicCheckoutQuestionnaireDto[];
};

/**
 * `GET .../user/{userId}/checkout-questionnaires` — JWT; `questionnaireIds` required (repeat query param).
 */
export async function fetchCheckoutQuestionnaires(
  orgId: number,
  userId: number,
  questionnaireIds: number[],
  opts?: { cartId?: number; includeOrgWaiver?: boolean; expand?: string[] }
): Promise<CheckoutQuestionnairesResponse> {
  const path = [...orgBase(orgId), "user", String(userId), "checkout-questionnaires"];
  const q = new URLSearchParams();
  for (const id of questionnaireIds) {
    q.append("questionnaireIds", String(id));
  }
  if (opts?.cartId != null) {
    q.set("cartId", String(opts.cartId));
  }
  if (opts?.includeOrgWaiver === true) {
    q.set("includeOrgWaiver", "true");
  }
  for (const e of opts?.expand ?? ["questions"]) {
    q.append("expand", e);
  }
  return bondBffGetJson<CheckoutQuestionnairesResponse>(path, q);
}

/**
 * `GET .../products/{productId}/user/{userId}/required` — logged-in required add-ons.
 */
export async function fetchUserRequiredProducts(
  orgId: number,
  productId: number,
  userId: number
): Promise<unknown> {
  const path = [...orgBase(orgId), "products", String(productId), "user", String(userId), "required"];
  return bondBffGetJson(path);
}

/**
 * `POST .../online-booking/create` — JWT. Creates **reservation + cart** (`cartReservation` in Swagger).
 * In the rental portal, **instant book** calls this from “Add to cart”. **Approval** categories defer
 * this call until checkout “Submit request” so the reservation is created when the member submits.
 */
export async function postOnlineBookingCreate(
  orgId: number,
  body: Record<string, unknown>
): Promise<OrganizationCartDto> {
  const path = [...orgBase(orgId), "online-booking", "create"];
  return bondBffPostJson<OrganizationCartDto>(path, body);
}
