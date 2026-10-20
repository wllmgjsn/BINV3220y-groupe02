import { COMPANY_STATUSES, type Company, type CompanyStatus } from "../models/company.ts";
import type { Health } from "../models/health.ts";
import { OFFER_STATUSES, PERIOD_CODES, type Offer } from "../models/offer.ts";
import {
  CONTACT_ROLES,
  USER_KINDS,
  type CompanySummary,
  type Session,
  type User,
} from "../models/user.ts";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isOneOf = <T extends string>(values: readonly T[], value: unknown): value is T =>
  typeof value === "string" && (values as readonly string[]).includes(value);

export const isHealth = (value: unknown): value is Health =>
  isRecord(value) && value.status === "ok";

const isCompanyStatus = (value: unknown): value is CompanyStatus =>
  isOneOf(COMPANY_STATUSES, value);

export const isCompany = (value: unknown): value is Company =>
  isRecord(value) &&
  typeof value.id === "number" &&
  typeof value.name === "string" &&
  typeof value.shortName === "string" &&
  typeof value.locality === "string" &&
  isCompanyStatus(value.status);

export const isCompanyList = (value: unknown): value is Company[] =>
  Array.isArray(value) && value.every(isCompany);

const isCompanySummary = (value: unknown): value is CompanySummary =>
  isRecord(value) && typeof value.id === "number" && typeof value.shortName === "string";

export const isUser = (value: unknown): value is User =>
  isRecord(value) &&
  isOneOf(USER_KINDS, value.kind) &&
  typeof value.id === "number" &&
  typeof value.firstName === "string" &&
  typeof value.lastName === "string" &&
  typeof value.email === "string" &&
  Array.isArray(value.roles) &&
  value.roles.every((role) => isOneOf(CONTACT_ROLES, role)) &&
  Array.isArray(value.companies) &&
  value.companies.every(isCompanySummary);

export const isUserList = (value: unknown): value is User[] =>
  Array.isArray(value) && value.every(isUser);

export const isSession = (value: unknown): value is Session =>
  isRecord(value) && typeof value.token === "string" && isUser(value.user);

export const isOffer = (value: unknown): value is Offer =>
  isRecord(value) &&
  typeof value.id === "number" &&
  typeof value.title === "string" &&
  typeof value.companyShortName === "string" &&
  typeof value.academicYear === "string" &&
  isOneOf(PERIOD_CODES, value.period) &&
  isOneOf(OFFER_STATUSES, value.status);

export const isOfferList = (value: unknown): value is Offer[] =>
  Array.isArray(value) && value.every(isOffer);
