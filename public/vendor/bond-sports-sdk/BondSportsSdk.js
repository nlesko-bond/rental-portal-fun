"use strict";
var BondSportsSdk = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    AccountingCodeDtoFromJSON: () => AccountingCodeDtoFromJSON,
    AccountingCodeDtoFromJSONTyped: () => AccountingCodeDtoFromJSONTyped,
    AccountingCodeDtoToJSON: () => AccountingCodeDtoToJSON,
    AccountingCodeDtoToJSONTyped: () => AccountingCodeDtoToJSONTyped,
    ActivityEnum: () => ActivityEnum,
    ActivityEnumFromJSON: () => ActivityEnumFromJSON,
    ActivityEnumFromJSONTyped: () => ActivityEnumFromJSONTyped,
    ActivityEnumToJSON: () => ActivityEnumToJSON,
    ActivityEnumToJSONTyped: () => ActivityEnumToJSONTyped,
    ActivityTimeDtoFromJSON: () => ActivityTimeDtoFromJSON,
    ActivityTimeDtoFromJSONTyped: () => ActivityTimeDtoFromJSONTyped,
    ActivityTimeDtoToJSON: () => ActivityTimeDtoToJSON,
    ActivityTimeDtoToJSONTyped: () => ActivityTimeDtoToJSONTyped,
    AddCartItemDtoFromJSON: () => AddCartItemDtoFromJSON,
    AddCartItemDtoFromJSONTyped: () => AddCartItemDtoFromJSONTyped,
    AddCartItemDtoToJSON: () => AddCartItemDtoToJSON,
    AddCartItemDtoToJSONTyped: () => AddCartItemDtoToJSONTyped,
    AddonTimePeriodEnum: () => AddonTimePeriodEnum,
    AddonTimePeriodEnumFromJSON: () => AddonTimePeriodEnumFromJSON,
    AddonTimePeriodEnumFromJSONTyped: () => AddonTimePeriodEnumFromJSONTyped,
    AddonTimePeriodEnumToJSON: () => AddonTimePeriodEnumToJSON,
    AddonTimePeriodEnumToJSONTyped: () => AddonTimePeriodEnumToJSONTyped,
    AddressDtoFromJSON: () => AddressDtoFromJSON,
    AddressDtoFromJSONTyped: () => AddressDtoFromJSONTyped,
    AddressDtoToJSON: () => AddressDtoToJSON,
    AddressDtoToJSONTyped: () => AddressDtoToJSONTyped,
    AmenitiesNameEnum: () => AmenitiesNameEnum,
    AmenitiesNameEnumFromJSON: () => AmenitiesNameEnumFromJSON,
    AmenitiesNameEnumFromJSONTyped: () => AmenitiesNameEnumFromJSONTyped,
    AmenitiesNameEnumToJSON: () => AmenitiesNameEnumToJSON,
    AmenitiesNameEnumToJSONTyped: () => AmenitiesNameEnumToJSONTyped,
    AuthPublicApiApi: () => AuthPublicApiApi,
    AuthTokensDtoFromJSON: () => AuthTokensDtoFromJSON,
    AuthTokensDtoFromJSONTyped: () => AuthTokensDtoFromJSONTyped,
    AuthTokensDtoToJSON: () => AuthTokensDtoToJSON,
    AuthTokensDtoToJSONTyped: () => AuthTokensDtoToJSONTyped,
    AvailabilityStatusEnum: () => AvailabilityStatusEnum,
    AvailabilityStatusEnumFromJSON: () => AvailabilityStatusEnumFromJSON,
    AvailabilityStatusEnumFromJSONTyped: () => AvailabilityStatusEnumFromJSONTyped,
    AvailabilityStatusEnumToJSON: () => AvailabilityStatusEnumToJSON,
    AvailabilityStatusEnumToJSONTyped: () => AvailabilityStatusEnumToJSONTyped,
    BASE_PATH: () => BASE_PATH,
    BaseAPI: () => BaseAPI,
    BasicCustomerDtoFromJSON: () => BasicCustomerDtoFromJSON,
    BasicCustomerDtoFromJSONTyped: () => BasicCustomerDtoFromJSONTyped,
    BasicCustomerDtoToJSON: () => BasicCustomerDtoToJSON,
    BasicCustomerDtoToJSONTyped: () => BasicCustomerDtoToJSONTyped,
    BasicFacilityDtoFromJSON: () => BasicFacilityDtoFromJSON,
    BasicFacilityDtoFromJSONTyped: () => BasicFacilityDtoFromJSONTyped,
    BasicFacilityDtoToJSON: () => BasicFacilityDtoToJSON,
    BasicFacilityDtoToJSONTyped: () => BasicFacilityDtoToJSONTyped,
    BasicMembershipMemberDtoFromJSON: () => BasicMembershipMemberDtoFromJSON,
    BasicMembershipMemberDtoFromJSONTyped: () => BasicMembershipMemberDtoFromJSONTyped,
    BasicMembershipMemberDtoToJSON: () => BasicMembershipMemberDtoToJSON,
    BasicMembershipMemberDtoToJSONTyped: () => BasicMembershipMemberDtoToJSONTyped,
    BasicProductDtoFromJSON: () => BasicProductDtoFromJSON,
    BasicProductDtoFromJSONTyped: () => BasicProductDtoFromJSONTyped,
    BasicProductDtoToJSON: () => BasicProductDtoToJSON,
    BasicProductDtoToJSONTyped: () => BasicProductDtoToJSONTyped,
    BasicProductPackageDtoFromJSON: () => BasicProductPackageDtoFromJSON,
    BasicProductPackageDtoFromJSONTyped: () => BasicProductPackageDtoFromJSONTyped,
    BasicProductPackageDtoToJSON: () => BasicProductPackageDtoToJSON,
    BasicProductPackageDtoToJSONTyped: () => BasicProductPackageDtoToJSONTyped,
    BasicPurchaseDtoFromJSON: () => BasicPurchaseDtoFromJSON,
    BasicPurchaseDtoFromJSONTyped: () => BasicPurchaseDtoFromJSONTyped,
    BasicPurchaseDtoToJSON: () => BasicPurchaseDtoToJSON,
    BasicPurchaseDtoToJSONTyped: () => BasicPurchaseDtoToJSONTyped,
    BasicTimeSlotDtoFromJSON: () => BasicTimeSlotDtoFromJSON,
    BasicTimeSlotDtoFromJSONTyped: () => BasicTimeSlotDtoFromJSONTyped,
    BasicTimeSlotDtoToJSON: () => BasicTimeSlotDtoToJSON,
    BasicTimeSlotDtoToJSONTyped: () => BasicTimeSlotDtoToJSONTyped,
    BlobApiResponse: () => BlobApiResponse,
    BondSportsApi: () => BondSportsApi,
    BondSportsApiErrors: () => BondSportsApiErrors,
    BookingScheduleDtoFromJSON: () => BookingScheduleDtoFromJSON,
    BookingScheduleDtoFromJSONTyped: () => BookingScheduleDtoFromJSONTyped,
    BookingScheduleDtoToJSON: () => BookingScheduleDtoToJSON,
    BookingScheduleDtoToJSONTyped: () => BookingScheduleDtoToJSONTyped,
    BookingScheduleSettingsDtoFromJSON: () => BookingScheduleSettingsDtoFromJSON,
    BookingScheduleSettingsDtoFromJSONTyped: () => BookingScheduleSettingsDtoFromJSONTyped,
    BookingScheduleSettingsDtoToJSON: () => BookingScheduleSettingsDtoToJSON,
    BookingScheduleSettingsDtoToJSONTyped: () => BookingScheduleSettingsDtoToJSONTyped,
    COLLECTION_FORMATS: () => COLLECTION_FORMATS,
    CartDiscountDtoFromJSON: () => CartDiscountDtoFromJSON,
    CartDiscountDtoFromJSONTyped: () => CartDiscountDtoFromJSONTyped,
    CartDiscountDtoToJSON: () => CartDiscountDtoToJSON,
    CartDiscountDtoToJSONTyped: () => CartDiscountDtoToJSONTyped,
    CartItemDescriptionEnum: () => CartItemDescriptionEnum,
    CartItemDescriptionEnumFromJSON: () => CartItemDescriptionEnumFromJSON,
    CartItemDescriptionEnumFromJSONTyped: () => CartItemDescriptionEnumFromJSONTyped,
    CartItemDescriptionEnumToJSON: () => CartItemDescriptionEnumToJSON,
    CartItemDescriptionEnumToJSONTyped: () => CartItemDescriptionEnumToJSONTyped,
    CartItemDtoFromJSON: () => CartItemDtoFromJSON,
    CartItemDtoFromJSONTyped: () => CartItemDtoFromJSONTyped,
    CartItemDtoToJSON: () => CartItemDtoToJSON,
    CartItemDtoToJSONTyped: () => CartItemDtoToJSONTyped,
    CartItemMetadataDtoFromJSON: () => CartItemMetadataDtoFromJSON,
    CartItemMetadataDtoFromJSONTyped: () => CartItemMetadataDtoFromJSONTyped,
    CartItemMetadataDtoToJSON: () => CartItemMetadataDtoToJSON,
    CartItemMetadataDtoToJSONTyped: () => CartItemMetadataDtoToJSONTyped,
    CartPurchaseTypeEnum: () => CartPurchaseTypeEnum,
    CartPurchaseTypeEnumFromJSON: () => CartPurchaseTypeEnumFromJSON,
    CartPurchaseTypeEnumFromJSONTyped: () => CartPurchaseTypeEnumFromJSONTyped,
    CartPurchaseTypeEnumToJSON: () => CartPurchaseTypeEnumToJSON,
    CartPurchaseTypeEnumToJSONTyped: () => CartPurchaseTypeEnumToJSONTyped,
    CartStateEnum: () => CartStateEnum,
    CartStateEnumFromJSON: () => CartStateEnumFromJSON,
    CartStateEnumFromJSONTyped: () => CartStateEnumFromJSONTyped,
    CartStateEnumToJSON: () => CartStateEnumToJSON,
    CartStateEnumToJSONTyped: () => CartStateEnumToJSONTyped,
    CartStatusEnum: () => CartStatusEnum,
    CartStatusEnumFromJSON: () => CartStatusEnumFromJSON,
    CartStatusEnumFromJSONTyped: () => CartStatusEnumFromJSONTyped,
    CartStatusEnumToJSON: () => CartStatusEnumToJSON,
    CartStatusEnumToJSONTyped: () => CartStatusEnumToJSONTyped,
    CartTaxDtoFromJSON: () => CartTaxDtoFromJSON,
    CartTaxDtoFromJSONTyped: () => CartTaxDtoFromJSONTyped,
    CartTaxDtoToJSON: () => CartTaxDtoToJSON,
    CartTaxDtoToJSONTyped: () => CartTaxDtoToJSONTyped,
    CartsPublicApiApi: () => CartsPublicApiApi,
    CloneFolderDtoFromJSON: () => CloneFolderDtoFromJSON,
    CloneFolderDtoFromJSONTyped: () => CloneFolderDtoFromJSONTyped,
    CloneFolderDtoToJSON: () => CloneFolderDtoToJSON,
    CloneFolderDtoToJSONTyped: () => CloneFolderDtoToJSONTyped,
    Configuration: () => Configuration,
    CreateBookingAddonDtoFromJSON: () => CreateBookingAddonDtoFromJSON,
    CreateBookingAddonDtoFromJSONTyped: () => CreateBookingAddonDtoFromJSONTyped,
    CreateBookingAddonDtoToJSON: () => CreateBookingAddonDtoToJSON,
    CreateBookingAddonDtoToJSONTyped: () => CreateBookingAddonDtoToJSONTyped,
    CreateBookingDtoFromJSON: () => CreateBookingDtoFromJSON,
    CreateBookingDtoFromJSONTyped: () => CreateBookingDtoFromJSONTyped,
    CreateBookingDtoToJSON: () => CreateBookingDtoToJSON,
    CreateBookingDtoToJSONTyped: () => CreateBookingDtoToJSONTyped,
    CreateBookingSegmentDtoFromJSON: () => CreateBookingSegmentDtoFromJSON,
    CreateBookingSegmentDtoFromJSONTyped: () => CreateBookingSegmentDtoFromJSONTyped,
    CreateBookingSegmentDtoToJSON: () => CreateBookingSegmentDtoToJSON,
    CreateBookingSegmentDtoToJSONTyped: () => CreateBookingSegmentDtoToJSONTyped,
    CreateBookingTimeSlotDtoFromJSON: () => CreateBookingTimeSlotDtoFromJSON,
    CreateBookingTimeSlotDtoFromJSONTyped: () => CreateBookingTimeSlotDtoFromJSONTyped,
    CreateBookingTimeSlotDtoToJSON: () => CreateBookingTimeSlotDtoToJSON,
    CreateBookingTimeSlotDtoToJSONTyped: () => CreateBookingTimeSlotDtoToJSONTyped,
    CreateFolderDtoFromJSON: () => CreateFolderDtoFromJSON,
    CreateFolderDtoFromJSONTyped: () => CreateFolderDtoFromJSONTyped,
    CreateFolderDtoToJSON: () => CreateFolderDtoToJSON,
    CreateFolderDtoToJSONTyped: () => CreateFolderDtoToJSONTyped,
    CurrencyEnum: () => CurrencyEnum,
    CurrencyEnumFromJSON: () => CurrencyEnumFromJSON,
    CurrencyEnumFromJSONTyped: () => CurrencyEnumFromJSONTyped,
    CurrencyEnumToJSON: () => CurrencyEnumToJSON,
    CurrencyEnumToJSONTyped: () => CurrencyEnumToJSONTyped,
    CustomerFamilyStatusEnum: () => CustomerFamilyStatusEnum,
    CustomerFamilyStatusEnumFromJSON: () => CustomerFamilyStatusEnumFromJSON,
    CustomerFamilyStatusEnumFromJSONTyped: () => CustomerFamilyStatusEnumFromJSONTyped,
    CustomerFamilyStatusEnumToJSON: () => CustomerFamilyStatusEnumToJSON,
    CustomerFamilyStatusEnumToJSONTyped: () => CustomerFamilyStatusEnumToJSONTyped,
    CustomerInMembershipTypeEnum: () => CustomerInMembershipTypeEnum,
    CustomerInMembershipTypeEnumFromJSON: () => CustomerInMembershipTypeEnumFromJSON,
    CustomerInMembershipTypeEnumFromJSONTyped: () => CustomerInMembershipTypeEnumFromJSONTyped,
    CustomerInMembershipTypeEnumToJSON: () => CustomerInMembershipTypeEnumToJSON,
    CustomerInMembershipTypeEnumToJSONTyped: () => CustomerInMembershipTypeEnumToJSONTyped,
    CustomerTypeEnum: () => CustomerTypeEnum,
    CustomerTypeEnumFromJSON: () => CustomerTypeEnumFromJSON,
    CustomerTypeEnumFromJSONTyped: () => CustomerTypeEnumFromJSONTyped,
    CustomerTypeEnumToJSON: () => CustomerTypeEnumToJSON,
    CustomerTypeEnumToJSONTyped: () => CustomerTypeEnumToJSONTyped,
    DateAndTimesDtoFromJSON: () => DateAndTimesDtoFromJSON,
    DateAndTimesDtoFromJSONTyped: () => DateAndTimesDtoFromJSONTyped,
    DateAndTimesDtoToJSON: () => DateAndTimesDtoToJSON,
    DateAndTimesDtoToJSONTyped: () => DateAndTimesDtoToJSONTyped,
    DayOfWeekNameEnum: () => DayOfWeekNameEnum,
    DayOfWeekNameEnumFromJSON: () => DayOfWeekNameEnumFromJSON,
    DayOfWeekNameEnumFromJSONTyped: () => DayOfWeekNameEnumFromJSONTyped,
    DayOfWeekNameEnumToJSON: () => DayOfWeekNameEnumToJSON,
    DayOfWeekNameEnumToJSONTyped: () => DayOfWeekNameEnumToJSONTyped,
    DefaultConfig: () => DefaultConfig,
    DiscountMethodsEnum: () => DiscountMethodsEnum,
    DiscountMethodsEnumFromJSON: () => DiscountMethodsEnumFromJSON,
    DiscountMethodsEnumFromJSONTyped: () => DiscountMethodsEnumFromJSONTyped,
    DiscountMethodsEnumToJSON: () => DiscountMethodsEnumToJSON,
    DiscountMethodsEnumToJSONTyped: () => DiscountMethodsEnumToJSONTyped,
    DiscountOnEnum: () => DiscountOnEnum,
    DiscountOnEnumFromJSON: () => DiscountOnEnumFromJSON,
    DiscountOnEnumFromJSONTyped: () => DiscountOnEnumFromJSONTyped,
    DiscountOnEnumToJSON: () => DiscountOnEnumToJSON,
    DiscountOnEnumToJSONTyped: () => DiscountOnEnumToJSONTyped,
    DiscountTypeEnum: () => DiscountTypeEnum,
    DiscountTypeEnumFromJSON: () => DiscountTypeEnumFromJSON,
    DiscountTypeEnumFromJSONTyped: () => DiscountTypeEnumFromJSONTyped,
    DiscountTypeEnumToJSON: () => DiscountTypeEnumToJSON,
    DiscountTypeEnumToJSONTyped: () => DiscountTypeEnumToJSONTyped,
    DurationDtoFromJSON: () => DurationDtoFromJSON,
    DurationDtoFromJSONTyped: () => DurationDtoFromJSONTyped,
    DurationDtoToJSON: () => DurationDtoToJSON,
    DurationDtoToJSONTyped: () => DurationDtoToJSONTyped,
    EntitlementDiscountDtoFromJSON: () => EntitlementDiscountDtoFromJSON,
    EntitlementDiscountDtoFromJSONTyped: () => EntitlementDiscountDtoFromJSONTyped,
    EntitlementDiscountDtoToJSON: () => EntitlementDiscountDtoToJSON,
    EntitlementDiscountDtoToJSONTyped: () => EntitlementDiscountDtoToJSONTyped,
    EntitlementDiscountGroupDtoFromJSON: () => EntitlementDiscountGroupDtoFromJSON,
    EntitlementDiscountGroupDtoFromJSONTyped: () => EntitlementDiscountGroupDtoFromJSONTyped,
    EntitlementDiscountGroupDtoToJSON: () => EntitlementDiscountGroupDtoToJSON,
    EntitlementDiscountGroupDtoToJSONTyped: () => EntitlementDiscountGroupDtoToJSONTyped,
    ErrorResponsesDtoFromJSON: () => ErrorResponsesDtoFromJSON,
    ErrorResponsesDtoFromJSONTyped: () => ErrorResponsesDtoFromJSONTyped,
    ErrorResponsesDtoToJSON: () => ErrorResponsesDtoToJSON,
    ErrorResponsesDtoToJSONTyped: () => ErrorResponsesDtoToJSONTyped,
    EventDtoFromJSON: () => EventDtoFromJSON,
    EventDtoFromJSONTyped: () => EventDtoFromJSONTyped,
    EventDtoToJSON: () => EventDtoToJSON,
    EventDtoToJSONTyped: () => EventDtoToJSONTyped,
    EventExpandEnum: () => EventExpandEnum,
    EventExpandEnumFromJSON: () => EventExpandEnumFromJSON,
    EventExpandEnumFromJSONTyped: () => EventExpandEnumFromJSONTyped,
    EventExpandEnumToJSON: () => EventExpandEnumToJSON,
    EventExpandEnumToJSONTyped: () => EventExpandEnumToJSONTyped,
    ExpandUserEnum: () => ExpandUserEnum,
    ExpandUserEnumFromJSON: () => ExpandUserEnumFromJSON,
    ExpandUserEnumFromJSONTyped: () => ExpandUserEnumFromJSONTyped,
    ExpandUserEnumToJSON: () => ExpandUserEnumToJSON,
    ExpandUserEnumToJSONTyped: () => ExpandUserEnumToJSONTyped,
    ExtendedFacilityDtoFromJSON: () => ExtendedFacilityDtoFromJSON,
    ExtendedFacilityDtoFromJSONTyped: () => ExtendedFacilityDtoFromJSONTyped,
    ExtendedFacilityDtoToJSON: () => ExtendedFacilityDtoToJSON,
    ExtendedFacilityDtoToJSONTyped: () => ExtendedFacilityDtoToJSONTyped,
    ExtendedOnlineBookingPortalOptionsDtoFromJSON: () => ExtendedOnlineBookingPortalOptionsDtoFromJSON,
    ExtendedOnlineBookingPortalOptionsDtoFromJSONTyped: () => ExtendedOnlineBookingPortalOptionsDtoFromJSONTyped,
    ExtendedOnlineBookingPortalOptionsDtoToJSON: () => ExtendedOnlineBookingPortalOptionsDtoToJSON,
    ExtendedOnlineBookingPortalOptionsDtoToJSONTyped: () => ExtendedOnlineBookingPortalOptionsDtoToJSONTyped,
    ExtendedProductDtoFromJSON: () => ExtendedProductDtoFromJSON,
    ExtendedProductDtoFromJSONTyped: () => ExtendedProductDtoFromJSONTyped,
    ExtendedProductDtoToJSON: () => ExtendedProductDtoToJSON,
    ExtendedProductDtoToJSONTyped: () => ExtendedProductDtoToJSONTyped,
    ExtendedRequiredProductDtoFromJSON: () => ExtendedRequiredProductDtoFromJSON,
    ExtendedRequiredProductDtoFromJSONTyped: () => ExtendedRequiredProductDtoFromJSONTyped,
    ExtendedRequiredProductDtoToJSON: () => ExtendedRequiredProductDtoToJSON,
    ExtendedRequiredProductDtoToJSONTyped: () => ExtendedRequiredProductDtoToJSONTyped,
    ExtendedUserDtoFromJSON: () => ExtendedUserDtoFromJSON,
    ExtendedUserDtoFromJSONTyped: () => ExtendedUserDtoFromJSONTyped,
    ExtendedUserDtoToJSON: () => ExtendedUserDtoToJSON,
    ExtendedUserDtoToJSONTyped: () => ExtendedUserDtoToJSONTyped,
    FetchError: () => FetchError,
    FinalizeCart200ResponseFromJSON: () => FinalizeCart200ResponseFromJSON,
    FinalizeCart200ResponseFromJSONTyped: () => FinalizeCart200ResponseFromJSONTyped,
    FinalizeCart200ResponseToJSON: () => FinalizeCart200ResponseToJSON,
    FinalizeCart200ResponseToJSONTyped: () => FinalizeCart200ResponseToJSONTyped,
    FindOrCreateFolderDtoFromJSON: () => FindOrCreateFolderDtoFromJSON,
    FindOrCreateFolderDtoFromJSONTyped: () => FindOrCreateFolderDtoFromJSONTyped,
    FindOrCreateFolderDtoToJSON: () => FindOrCreateFolderDtoToJSON,
    FindOrCreateFolderDtoToJSONTyped: () => FindOrCreateFolderDtoToJSONTyped,
    FolderContentRestrictionsDtoFromJSON: () => FolderContentRestrictionsDtoFromJSON,
    FolderContentRestrictionsDtoFromJSONTyped: () => FolderContentRestrictionsDtoFromJSONTyped,
    FolderContentRestrictionsDtoToJSON: () => FolderContentRestrictionsDtoToJSON,
    FolderContentRestrictionsDtoToJSONTyped: () => FolderContentRestrictionsDtoToJSONTyped,
    FolderRestrictionsDtoFromJSON: () => FolderRestrictionsDtoFromJSON,
    FolderRestrictionsDtoFromJSONTyped: () => FolderRestrictionsDtoFromJSONTyped,
    FolderRestrictionsDtoToJSON: () => FolderRestrictionsDtoToJSON,
    FolderRestrictionsDtoToJSONTyped: () => FolderRestrictionsDtoToJSONTyped,
    GenderEnum: () => GenderEnum,
    GenderEnumFromJSON: () => GenderEnumFromJSON,
    GenderEnumFromJSONTyped: () => GenderEnumFromJSONTyped,
    GenderEnumToJSON: () => GenderEnumToJSON,
    GenderEnumToJSONTyped: () => GenderEnumToJSONTyped,
    GenderNameEnum: () => GenderNameEnum,
    GenderNameEnumFromJSON: () => GenderNameEnumFromJSON,
    GenderNameEnumFromJSONTyped: () => GenderNameEnumFromJSONTyped,
    GenderNameEnumToJSON: () => GenderNameEnumToJSON,
    GenderNameEnumToJSONTyped: () => GenderNameEnumToJSONTyped,
    GenericResponseDtoFromJSON: () => GenericResponseDtoFromJSON,
    GenericResponseDtoFromJSONTyped: () => GenericResponseDtoFromJSONTyped,
    GenericResponseDtoToJSON: () => GenericResponseDtoToJSON,
    GenericResponseDtoToJSONTyped: () => GenericResponseDtoToJSONTyped,
    GetCheckoutQuestionnaires200ResponseFromJSON: () => GetCheckoutQuestionnaires200ResponseFromJSON,
    GetCheckoutQuestionnaires200ResponseFromJSONTyped: () => GetCheckoutQuestionnaires200ResponseFromJSONTyped,
    GetCheckoutQuestionnaires200ResponseToJSON: () => GetCheckoutQuestionnaires200ResponseToJSON,
    GetCheckoutQuestionnaires200ResponseToJSONTyped: () => GetCheckoutQuestionnaires200ResponseToJSONTyped,
    GetCheckoutQuestionnairesExpandEnum: () => GetCheckoutQuestionnairesExpandEnum,
    GetOrganizationPrograms200ResponseFromJSON: () => GetOrganizationPrograms200ResponseFromJSON,
    GetOrganizationPrograms200ResponseFromJSONTyped: () => GetOrganizationPrograms200ResponseFromJSONTyped,
    GetOrganizationPrograms200ResponseToJSON: () => GetOrganizationPrograms200ResponseToJSON,
    GetOrganizationPrograms200ResponseToJSONTyped: () => GetOrganizationPrograms200ResponseToJSONTyped,
    GetPaginatedCategoryProducts200ResponseFromJSON: () => GetPaginatedCategoryProducts200ResponseFromJSON,
    GetPaginatedCategoryProducts200ResponseFromJSONTyped: () => GetPaginatedCategoryProducts200ResponseFromJSONTyped,
    GetPaginatedCategoryProducts200ResponseToJSON: () => GetPaginatedCategoryProducts200ResponseToJSON,
    GetPaginatedCategoryProducts200ResponseToJSONTyped: () => GetPaginatedCategoryProducts200ResponseToJSONTyped,
    GetPopulatedSessionsByProgramId200ResponseFromJSON: () => GetPopulatedSessionsByProgramId200ResponseFromJSON,
    GetPopulatedSessionsByProgramId200ResponseFromJSONTyped: () => GetPopulatedSessionsByProgramId200ResponseFromJSONTyped,
    GetPopulatedSessionsByProgramId200ResponseToJSON: () => GetPopulatedSessionsByProgramId200ResponseToJSON,
    GetPopulatedSessionsByProgramId200ResponseToJSONTyped: () => GetPopulatedSessionsByProgramId200ResponseToJSONTyped,
    GetPublicPortalByIdExpandEnum: () => GetPublicPortalByIdExpandEnum,
    GetPublicQuestionnaireByIdExpandEnum: () => GetPublicQuestionnaireByIdExpandEnum,
    GetSegmentEvents200ResponseFromJSON: () => GetSegmentEvents200ResponseFromJSON,
    GetSegmentEvents200ResponseFromJSONTyped: () => GetSegmentEvents200ResponseFromJSONTyped,
    GetSegmentEvents200ResponseToJSON: () => GetSegmentEvents200ResponseToJSON,
    GetSegmentEvents200ResponseToJSONTyped: () => GetSegmentEvents200ResponseToJSONTyped,
    GetSessionProducts200ResponseFromJSON: () => GetSessionProducts200ResponseFromJSON,
    GetSessionProducts200ResponseFromJSONTyped: () => GetSessionProducts200ResponseFromJSONTyped,
    GetSessionProducts200ResponseToJSON: () => GetSessionProducts200ResponseToJSON,
    GetSessionProducts200ResponseToJSONTyped: () => GetSessionProducts200ResponseToJSONTyped,
    GetSessionSegments200ResponseFromJSON: () => GetSessionSegments200ResponseFromJSON,
    GetSessionSegments200ResponseFromJSONTyped: () => GetSessionSegments200ResponseFromJSONTyped,
    GetSessionSegments200ResponseToJSON: () => GetSessionSegments200ResponseToJSON,
    GetSessionSegments200ResponseToJSONTyped: () => GetSessionSegments200ResponseToJSONTyped,
    GlResourceTypeEnum: () => GlResourceTypeEnum,
    GlResourceTypeEnumFromJSON: () => GlResourceTypeEnumFromJSON,
    GlResourceTypeEnumFromJSONTyped: () => GlResourceTypeEnumFromJSONTyped,
    GlResourceTypeEnumToJSON: () => GlResourceTypeEnumToJSON,
    GlResourceTypeEnumToJSONTyped: () => GlResourceTypeEnumToJSONTyped,
    GlTypeDtoFromJSON: () => GlTypeDtoFromJSON,
    GlTypeDtoFromJSONTyped: () => GlTypeDtoFromJSONTyped,
    GlTypeDtoToJSON: () => GlTypeDtoToJSON,
    GlTypeDtoToJSONTyped: () => GlTypeDtoToJSONTyped,
    InvoiceStatusEnum: () => InvoiceStatusEnum,
    InvoiceStatusEnumFromJSON: () => InvoiceStatusEnumFromJSON,
    InvoiceStatusEnumFromJSONTyped: () => InvoiceStatusEnumFromJSONTyped,
    InvoiceStatusEnumToJSON: () => InvoiceStatusEnumToJSON,
    InvoiceStatusEnumToJSONTyped: () => InvoiceStatusEnumToJSONTyped,
    JSONApiResponse: () => JSONApiResponse,
    LevelOfPlayEnum: () => LevelOfPlayEnum,
    LevelOfPlayEnumFromJSON: () => LevelOfPlayEnumFromJSON,
    LevelOfPlayEnumFromJSONTyped: () => LevelOfPlayEnumFromJSONTyped,
    LevelOfPlayEnumToJSON: () => LevelOfPlayEnumToJSON,
    LevelOfPlayEnumToJSONTyped: () => LevelOfPlayEnumToJSONTyped,
    LevelOfPlayNameEnum: () => LevelOfPlayNameEnum,
    LevelOfPlayNameEnumFromJSON: () => LevelOfPlayNameEnumFromJSON,
    LevelOfPlayNameEnumFromJSONTyped: () => LevelOfPlayNameEnumFromJSONTyped,
    LevelOfPlayNameEnumToJSON: () => LevelOfPlayNameEnumToJSON,
    LevelOfPlayNameEnumToJSONTyped: () => LevelOfPlayNameEnumToJSONTyped,
    MediaDtoFromJSON: () => MediaDtoFromJSON,
    MediaDtoFromJSONTyped: () => MediaDtoFromJSONTyped,
    MediaDtoToJSON: () => MediaDtoToJSON,
    MediaDtoToJSONTyped: () => MediaDtoToJSONTyped,
    MediaTypesEnum: () => MediaTypesEnum,
    MediaTypesEnumFromJSON: () => MediaTypesEnumFromJSON,
    MediaTypesEnumFromJSONTyped: () => MediaTypesEnumFromJSONTyped,
    MediaTypesEnumToJSON: () => MediaTypesEnumToJSON,
    MediaTypesEnumToJSONTyped: () => MediaTypesEnumToJSONTyped,
    MembershipStatusEnum: () => MembershipStatusEnum,
    MembershipStatusEnumFromJSON: () => MembershipStatusEnumFromJSON,
    MembershipStatusEnumFromJSONTyped: () => MembershipStatusEnumFromJSONTyped,
    MembershipStatusEnumToJSON: () => MembershipStatusEnumToJSON,
    MembershipStatusEnumToJSONTyped: () => MembershipStatusEnumToJSONTyped,
    MembershipTypeEnum: () => MembershipTypeEnum,
    MembershipTypeEnumFromJSON: () => MembershipTypeEnumFromJSON,
    MembershipTypeEnumFromJSONTyped: () => MembershipTypeEnumFromJSONTyped,
    MembershipTypeEnumToJSON: () => MembershipTypeEnumToJSON,
    MembershipTypeEnumToJSONTyped: () => MembershipTypeEnumToJSONTyped,
    MetaSelectOptionDtoFromJSON: () => MetaSelectOptionDtoFromJSON,
    MetaSelectOptionDtoFromJSONTyped: () => MetaSelectOptionDtoFromJSONTyped,
    MetaSelectOptionDtoToJSON: () => MetaSelectOptionDtoToJSON,
    MetaSelectOptionDtoToJSONTyped: () => MetaSelectOptionDtoToJSONTyped,
    MetaType: () => MetaType,
    MetaTypeEnum: () => MetaTypeEnum,
    MetaTypeEnumFromJSON: () => MetaTypeEnumFromJSON,
    MetaTypeEnumFromJSONTyped: () => MetaTypeEnumFromJSONTyped,
    MetaTypeEnumToJSON: () => MetaTypeEnumToJSON,
    MetaTypeEnumToJSONTyped: () => MetaTypeEnumToJSONTyped,
    MetaTypeFromJSON: () => MetaTypeFromJSON,
    MetaTypeFromJSONTyped: () => MetaTypeFromJSONTyped,
    MetaTypeToJSON: () => MetaTypeToJSON,
    MetaTypeToJSONTyped: () => MetaTypeToJSONTyped,
    OnlineBookingPublicApiApi: () => OnlineBookingPublicApiApi,
    OnlineBookingSettingsDtoFromJSON: () => OnlineBookingSettingsDtoFromJSON,
    OnlineBookingSettingsDtoFromJSONTyped: () => OnlineBookingSettingsDtoFromJSONTyped,
    OnlineBookingSettingsDtoToJSON: () => OnlineBookingSettingsDtoToJSON,
    OnlineBookingSettingsDtoToJSONTyped: () => OnlineBookingSettingsDtoToJSONTyped,
    OnlineBookingViewsEnum: () => OnlineBookingViewsEnum,
    OnlineBookingViewsEnumFromJSON: () => OnlineBookingViewsEnumFromJSON,
    OnlineBookingViewsEnumFromJSONTyped: () => OnlineBookingViewsEnumFromJSONTyped,
    OnlineBookingViewsEnumToJSON: () => OnlineBookingViewsEnumToJSON,
    OnlineBookingViewsEnumToJSONTyped: () => OnlineBookingViewsEnumToJSONTyped,
    OpeningTimeDtoFromJSON: () => OpeningTimeDtoFromJSON,
    OpeningTimeDtoFromJSONTyped: () => OpeningTimeDtoFromJSONTyped,
    OpeningTimeDtoToJSON: () => OpeningTimeDtoToJSON,
    OpeningTimeDtoToJSONTyped: () => OpeningTimeDtoToJSONTyped,
    OrderByProgramEnum: () => OrderByProgramEnum,
    OrderByProgramEnumFromJSON: () => OrderByProgramEnumFromJSON,
    OrderByProgramEnumFromJSONTyped: () => OrderByProgramEnumFromJSONTyped,
    OrderByProgramEnumToJSON: () => OrderByProgramEnumToJSON,
    OrderByProgramEnumToJSONTyped: () => OrderByProgramEnumToJSONTyped,
    OrganizationCartDtoFromJSON: () => OrganizationCartDtoFromJSON,
    OrganizationCartDtoFromJSONTyped: () => OrganizationCartDtoFromJSONTyped,
    OrganizationCartDtoToJSON: () => OrganizationCartDtoToJSON,
    OrganizationCartDtoToJSONTyped: () => OrganizationCartDtoToJSONTyped,
    PackageProductsRelationTypeEnum: () => PackageProductsRelationTypeEnum,
    PackageProductsRelationTypeEnumFromJSON: () => PackageProductsRelationTypeEnumFromJSON,
    PackageProductsRelationTypeEnumFromJSONTyped: () => PackageProductsRelationTypeEnumFromJSONTyped,
    PackageProductsRelationTypeEnumToJSON: () => PackageProductsRelationTypeEnumToJSON,
    PackageProductsRelationTypeEnumToJSONTyped: () => PackageProductsRelationTypeEnumToJSONTyped,
    PaginatedProductsDtoFromJSON: () => PaginatedProductsDtoFromJSON,
    PaginatedProductsDtoFromJSONTyped: () => PaginatedProductsDtoFromJSONTyped,
    PaginatedProductsDtoToJSON: () => PaginatedProductsDtoToJSON,
    PaginatedProductsDtoToJSONTyped: () => PaginatedProductsDtoToJSONTyped,
    PaginatedSessionsDtoFromJSON: () => PaginatedSessionsDtoFromJSON,
    PaginatedSessionsDtoFromJSONTyped: () => PaginatedSessionsDtoFromJSONTyped,
    PaginatedSessionsDtoToJSON: () => PaginatedSessionsDtoToJSON,
    PaginatedSessionsDtoToJSONTyped: () => PaginatedSessionsDtoToJSONTyped,
    PaginationMetaDtoFromJSON: () => PaginationMetaDtoFromJSON,
    PaginationMetaDtoFromJSONTyped: () => PaginationMetaDtoFromJSONTyped,
    PaginationMetaDtoToJSON: () => PaginationMetaDtoToJSON,
    PaginationMetaDtoToJSONTyped: () => PaginationMetaDtoToJSONTyped,
    PaginationResultDtoFromJSON: () => PaginationResultDtoFromJSON,
    PaginationResultDtoFromJSONTyped: () => PaginationResultDtoFromJSONTyped,
    PaginationResultDtoToJSON: () => PaginationResultDtoToJSON,
    PaginationResultDtoToJSONTyped: () => PaginationResultDtoToJSONTyped,
    PaginationTypeEnum: () => PaginationTypeEnum,
    PaginationTypeEnumFromJSON: () => PaginationTypeEnumFromJSON,
    PaginationTypeEnumFromJSONTyped: () => PaginationTypeEnumFromJSONTyped,
    PaginationTypeEnumToJSON: () => PaginationTypeEnumToJSON,
    PaginationTypeEnumToJSONTyped: () => PaginationTypeEnumToJSONTyped,
    ParentResourceDtoFromJSON: () => ParentResourceDtoFromJSON,
    ParentResourceDtoFromJSONTyped: () => ParentResourceDtoFromJSONTyped,
    ParentResourceDtoToJSON: () => ParentResourceDtoToJSON,
    ParentResourceDtoToJSONTyped: () => ParentResourceDtoToJSONTyped,
    PaymentPlanDtoFromJSON: () => PaymentPlanDtoFromJSON,
    PaymentPlanDtoFromJSONTyped: () => PaymentPlanDtoFromJSONTyped,
    PaymentPlanDtoToJSON: () => PaymentPlanDtoToJSON,
    PaymentPlanDtoToJSONTyped: () => PaymentPlanDtoToJSONTyped,
    PaymentPlanScheduleDtoFromJSON: () => PaymentPlanScheduleDtoFromJSON,
    PaymentPlanScheduleDtoFromJSONTyped: () => PaymentPlanScheduleDtoFromJSONTyped,
    PaymentPlanScheduleDtoToJSON: () => PaymentPlanScheduleDtoToJSON,
    PaymentPlanScheduleDtoToJSONTyped: () => PaymentPlanScheduleDtoToJSONTyped,
    PaymentPlanStatusEnum: () => PaymentPlanStatusEnum,
    PaymentPlanStatusEnumFromJSON: () => PaymentPlanStatusEnumFromJSON,
    PaymentPlanStatusEnumFromJSONTyped: () => PaymentPlanStatusEnumFromJSONTyped,
    PaymentPlanStatusEnumToJSON: () => PaymentPlanStatusEnumToJSON,
    PaymentPlanStatusEnumToJSONTyped: () => PaymentPlanStatusEnumToJSONTyped,
    PaymentPlanTypeEnum: () => PaymentPlanTypeEnum,
    PaymentPlanTypeEnumFromJSON: () => PaymentPlanTypeEnumFromJSON,
    PaymentPlanTypeEnumFromJSONTyped: () => PaymentPlanTypeEnumFromJSONTyped,
    PaymentPlanTypeEnumToJSON: () => PaymentPlanTypeEnumToJSON,
    PaymentPlanTypeEnumToJSONTyped: () => PaymentPlanTypeEnumToJSONTyped,
    PaymentStatusEnum: () => PaymentStatusEnum,
    PaymentStatusEnumFromJSON: () => PaymentStatusEnumFromJSON,
    PaymentStatusEnumFromJSONTyped: () => PaymentStatusEnumFromJSONTyped,
    PaymentStatusEnumToJSON: () => PaymentStatusEnumToJSON,
    PaymentStatusEnumToJSONTyped: () => PaymentStatusEnumToJSONTyped,
    PlatformsEnum: () => PlatformsEnum,
    PlatformsEnumFromJSON: () => PlatformsEnumFromJSON,
    PlatformsEnumFromJSONTyped: () => PlatformsEnumFromJSONTyped,
    PlatformsEnumToJSON: () => PlatformsEnumToJSON,
    PlatformsEnumToJSONTyped: () => PlatformsEnumToJSONTyped,
    PortalsPublicApiApi: () => PortalsPublicApiApi,
    PricingScheduleDtoFromJSON: () => PricingScheduleDtoFromJSON,
    PricingScheduleDtoFromJSONTyped: () => PricingScheduleDtoFromJSONTyped,
    PricingScheduleDtoToJSON: () => PricingScheduleDtoToJSON,
    PricingScheduleDtoToJSONTyped: () => PricingScheduleDtoToJSONTyped,
    ProductExpandEnum: () => ProductExpandEnum,
    ProductExpandEnumFromJSON: () => ProductExpandEnumFromJSON,
    ProductExpandEnumFromJSONTyped: () => ProductExpandEnumFromJSONTyped,
    ProductExpandEnumToJSON: () => ProductExpandEnumToJSON,
    ProductExpandEnumToJSONTyped: () => ProductExpandEnumToJSONTyped,
    ProductPackageLevelEnum: () => ProductPackageLevelEnum,
    ProductPackageLevelEnumFromJSON: () => ProductPackageLevelEnumFromJSON,
    ProductPackageLevelEnumFromJSONTyped: () => ProductPackageLevelEnumFromJSONTyped,
    ProductPackageLevelEnumToJSON: () => ProductPackageLevelEnumToJSON,
    ProductPackageLevelEnumToJSONTyped: () => ProductPackageLevelEnumToJSONTyped,
    ProductResourceDtoFromJSON: () => ProductResourceDtoFromJSON,
    ProductResourceDtoFromJSONTyped: () => ProductResourceDtoFromJSONTyped,
    ProductResourceDtoToJSON: () => ProductResourceDtoToJSON,
    ProductResourceDtoToJSONTyped: () => ProductResourceDtoToJSONTyped,
    ProductSubTypesEnum: () => ProductSubTypesEnum,
    ProductSubTypesEnumFromJSON: () => ProductSubTypesEnumFromJSON,
    ProductSubTypesEnumFromJSONTyped: () => ProductSubTypesEnumFromJSONTyped,
    ProductSubTypesEnumToJSON: () => ProductSubTypesEnumToJSON,
    ProductSubTypesEnumToJSONTyped: () => ProductSubTypesEnumToJSONTyped,
    ProductTypesEnum: () => ProductTypesEnum,
    ProductTypesEnumFromJSON: () => ProductTypesEnumFromJSON,
    ProductTypesEnumFromJSONTyped: () => ProductTypesEnumFromJSONTyped,
    ProductTypesEnumToJSON: () => ProductTypesEnumToJSON,
    ProductTypesEnumToJSONTyped: () => ProductTypesEnumToJSONTyped,
    ProductsPublicApiApi: () => ProductsPublicApiApi,
    ProgramDtoFromJSON: () => ProgramDtoFromJSON,
    ProgramDtoFromJSONTyped: () => ProgramDtoFromJSONTyped,
    ProgramDtoToJSON: () => ProgramDtoToJSON,
    ProgramDtoToJSONTyped: () => ProgramDtoToJSONTyped,
    ProgramExpandEnum: () => ProgramExpandEnum,
    ProgramExpandEnumFromJSON: () => ProgramExpandEnumFromJSON,
    ProgramExpandEnumFromJSONTyped: () => ProgramExpandEnumFromJSONTyped,
    ProgramExpandEnumToJSON: () => ProgramExpandEnumToJSON,
    ProgramExpandEnumToJSONTyped: () => ProgramExpandEnumToJSONTyped,
    ProgramTypeNameEnum: () => ProgramTypeNameEnum,
    ProgramTypeNameEnumFromJSON: () => ProgramTypeNameEnumFromJSON,
    ProgramTypeNameEnumFromJSONTyped: () => ProgramTypeNameEnumFromJSONTyped,
    ProgramTypeNameEnumToJSON: () => ProgramTypeNameEnumToJSON,
    ProgramTypeNameEnumToJSONTyped: () => ProgramTypeNameEnumToJSONTyped,
    ProgramTypesEnum: () => ProgramTypesEnum,
    ProgramTypesEnumFromJSON: () => ProgramTypesEnumFromJSON,
    ProgramTypesEnumFromJSONTyped: () => ProgramTypesEnumFromJSONTyped,
    ProgramTypesEnumToJSON: () => ProgramTypesEnumToJSON,
    ProgramTypesEnumToJSONTyped: () => ProgramTypesEnumToJSONTyped,
    ProgramsPublicApiApi: () => ProgramsPublicApiApi,
    PublicAuthRefreshSuccessDtoFromJSON: () => PublicAuthRefreshSuccessDtoFromJSON,
    PublicAuthRefreshSuccessDtoFromJSONTyped: () => PublicAuthRefreshSuccessDtoFromJSONTyped,
    PublicAuthRefreshSuccessDtoToJSON: () => PublicAuthRefreshSuccessDtoToJSON,
    PublicAuthRefreshSuccessDtoToJSONTyped: () => PublicAuthRefreshSuccessDtoToJSONTyped,
    PublicCheckoutQuestionnaireDtoFromJSON: () => PublicCheckoutQuestionnaireDtoFromJSON,
    PublicCheckoutQuestionnaireDtoFromJSONTyped: () => PublicCheckoutQuestionnaireDtoFromJSONTyped,
    PublicCheckoutQuestionnaireDtoToJSON: () => PublicCheckoutQuestionnaireDtoToJSON,
    PublicCheckoutQuestionnaireDtoToJSONTyped: () => PublicCheckoutQuestionnaireDtoToJSONTyped,
    PublicOnlineBookingPortalDtoFromJSON: () => PublicOnlineBookingPortalDtoFromJSON,
    PublicOnlineBookingPortalDtoFromJSONTyped: () => PublicOnlineBookingPortalDtoFromJSONTyped,
    PublicOnlineBookingPortalDtoToJSON: () => PublicOnlineBookingPortalDtoToJSON,
    PublicOnlineBookingPortalDtoToJSONTyped: () => PublicOnlineBookingPortalDtoToJSONTyped,
    PublicQuestionDtoFromJSON: () => PublicQuestionDtoFromJSON,
    PublicQuestionDtoFromJSONTyped: () => PublicQuestionDtoFromJSONTyped,
    PublicQuestionDtoToJSON: () => PublicQuestionDtoToJSON,
    PublicQuestionDtoToJSONTyped: () => PublicQuestionDtoToJSONTyped,
    PublicQuestionnaireDtoFromJSON: () => PublicQuestionnaireDtoFromJSON,
    PublicQuestionnaireDtoFromJSONTyped: () => PublicQuestionnaireDtoFromJSONTyped,
    PublicQuestionnaireDtoToJSON: () => PublicQuestionnaireDtoToJSON,
    PublicQuestionnaireDtoToJSONTyped: () => PublicQuestionnaireDtoToJSONTyped,
    PublicResourceDtoFromJSON: () => PublicResourceDtoFromJSON,
    PublicResourceDtoFromJSONTyped: () => PublicResourceDtoFromJSONTyped,
    PublicResourceDtoToJSON: () => PublicResourceDtoToJSON,
    PublicResourceDtoToJSONTyped: () => PublicResourceDtoToJSONTyped,
    PublicResourceMetadataDtoFromJSON: () => PublicResourceMetadataDtoFromJSON,
    PublicResourceMetadataDtoFromJSONTyped: () => PublicResourceMetadataDtoFromJSONTyped,
    PublicResourceMetadataDtoToJSON: () => PublicResourceMetadataDtoToJSON,
    PublicResourceMetadataDtoToJSONTyped: () => PublicResourceMetadataDtoToJSONTyped,
    PublicResourceScheduleDtoFromJSON: () => PublicResourceScheduleDtoFromJSON,
    PublicResourceScheduleDtoFromJSONTyped: () => PublicResourceScheduleDtoFromJSONTyped,
    PublicResourceScheduleDtoToJSON: () => PublicResourceScheduleDtoToJSON,
    PublicResourceScheduleDtoToJSONTyped: () => PublicResourceScheduleDtoToJSONTyped,
    PublishingStatusEnum: () => PublishingStatusEnum,
    PublishingStatusEnumFromJSON: () => PublishingStatusEnumFromJSON,
    PublishingStatusEnumFromJSONTyped: () => PublishingStatusEnumFromJSONTyped,
    PublishingStatusEnumToJSON: () => PublishingStatusEnumToJSON,
    PublishingStatusEnumToJSONTyped: () => PublishingStatusEnumToJSONTyped,
    PurchaseResourceDtoFromJSON: () => PurchaseResourceDtoFromJSON,
    PurchaseResourceDtoFromJSONTyped: () => PurchaseResourceDtoFromJSONTyped,
    PurchaseResourceDtoToJSON: () => PurchaseResourceDtoToJSON,
    PurchaseResourceDtoToJSONTyped: () => PurchaseResourceDtoToJSONTyped,
    QuestionAnswersDtoFromJSON: () => QuestionAnswersDtoFromJSON,
    QuestionAnswersDtoFromJSONTyped: () => QuestionAnswersDtoFromJSONTyped,
    QuestionAnswersDtoToJSON: () => QuestionAnswersDtoToJSON,
    QuestionAnswersDtoToJSONTyped: () => QuestionAnswersDtoToJSONTyped,
    QuestionCustomTypeEnum: () => QuestionCustomTypeEnum,
    QuestionCustomTypeEnumFromJSON: () => QuestionCustomTypeEnumFromJSON,
    QuestionCustomTypeEnumFromJSONTyped: () => QuestionCustomTypeEnumFromJSONTyped,
    QuestionCustomTypeEnumToJSON: () => QuestionCustomTypeEnumToJSON,
    QuestionCustomTypeEnumToJSONTyped: () => QuestionCustomTypeEnumToJSONTyped,
    QuestionMetaDataDtoFromJSON: () => QuestionMetaDataDtoFromJSON,
    QuestionMetaDataDtoFromJSONTyped: () => QuestionMetaDataDtoFromJSONTyped,
    QuestionMetaDataDtoToJSON: () => QuestionMetaDataDtoToJSON,
    QuestionMetaDataDtoToJSONTyped: () => QuestionMetaDataDtoToJSONTyped,
    QuestionnairesPublicApiApi: () => QuestionnairesPublicApiApi,
    ReasonDtoFromJSON: () => ReasonDtoFromJSON,
    ReasonDtoFromJSONTyped: () => ReasonDtoFromJSONTyped,
    ReasonDtoToJSON: () => ReasonDtoToJSON,
    ReasonDtoToJSONTyped: () => ReasonDtoToJSONTyped,
    ReasonTypeEnum: () => ReasonTypeEnum,
    ReasonTypeEnumFromJSON: () => ReasonTypeEnumFromJSON,
    ReasonTypeEnumFromJSONTyped: () => ReasonTypeEnumFromJSONTyped,
    ReasonTypeEnumToJSON: () => ReasonTypeEnumToJSON,
    ReasonTypeEnumToJSONTyped: () => ReasonTypeEnumToJSONTyped,
    ReferableType: () => ReferableType,
    ReferableTypeFromJSON: () => ReferableTypeFromJSON,
    ReferableTypeFromJSONTyped: () => ReferableTypeFromJSONTyped,
    ReferableTypeToJSON: () => ReferableTypeToJSON,
    ReferableTypeToJSONTyped: () => ReferableTypeToJSONTyped,
    RegistrationWindowStatusEnum: () => RegistrationWindowStatusEnum,
    RegistrationWindowStatusEnumFromJSON: () => RegistrationWindowStatusEnumFromJSON,
    RegistrationWindowStatusEnumFromJSONTyped: () => RegistrationWindowStatusEnumFromJSONTyped,
    RegistrationWindowStatusEnumToJSON: () => RegistrationWindowStatusEnumToJSON,
    RegistrationWindowStatusEnumToJSONTyped: () => RegistrationWindowStatusEnumToJSONTyped,
    RepetitionUnit: () => RepetitionUnit,
    RepetitionUnitFromJSON: () => RepetitionUnitFromJSON,
    RepetitionUnitFromJSONTyped: () => RepetitionUnitFromJSONTyped,
    RepetitionUnitToJSON: () => RepetitionUnitToJSON,
    RepetitionUnitToJSONTyped: () => RepetitionUnitToJSONTyped,
    RequiredError: () => RequiredError,
    ReservationProductCategoryDtoFromJSON: () => ReservationProductCategoryDtoFromJSON,
    ReservationProductCategoryDtoFromJSONTyped: () => ReservationProductCategoryDtoFromJSONTyped,
    ReservationProductCategoryDtoToJSON: () => ReservationProductCategoryDtoToJSON,
    ReservationProductCategoryDtoToJSONTyped: () => ReservationProductCategoryDtoToJSONTyped,
    ResourceExpandEnum: () => ResourceExpandEnum,
    ResourceExpandEnumFromJSON: () => ResourceExpandEnumFromJSON,
    ResourceExpandEnumFromJSONTyped: () => ResourceExpandEnumFromJSONTyped,
    ResourceExpandEnumToJSON: () => ResourceExpandEnumToJSON,
    ResourceExpandEnumToJSONTyped: () => ResourceExpandEnumToJSONTyped,
    ResourceGlDtoFromJSON: () => ResourceGlDtoFromJSON,
    ResourceGlDtoFromJSONTyped: () => ResourceGlDtoFromJSONTyped,
    ResourceGlDtoToJSON: () => ResourceGlDtoToJSON,
    ResourceGlDtoToJSONTyped: () => ResourceGlDtoToJSONTyped,
    ResourceNameTypeEnum: () => ResourceNameTypeEnum,
    ResourceNameTypeEnumFromJSON: () => ResourceNameTypeEnumFromJSON,
    ResourceNameTypeEnumFromJSONTyped: () => ResourceNameTypeEnumFromJSONTyped,
    ResourceNameTypeEnumToJSON: () => ResourceNameTypeEnumToJSON,
    ResourceNameTypeEnumToJSONTyped: () => ResourceNameTypeEnumToJSONTyped,
    ResourceSubTypeEnum: () => ResourceSubTypeEnum,
    ResourceSubTypeEnumFromJSON: () => ResourceSubTypeEnumFromJSON,
    ResourceSubTypeEnumFromJSONTyped: () => ResourceSubTypeEnumFromJSONTyped,
    ResourceSubTypeEnumToJSON: () => ResourceSubTypeEnumToJSON,
    ResourceSubTypeEnumToJSONTyped: () => ResourceSubTypeEnumToJSONTyped,
    ResourceTypeEnum: () => ResourceTypeEnum,
    ResourceTypeEnumFromJSON: () => ResourceTypeEnumFromJSON,
    ResourceTypeEnumFromJSONTyped: () => ResourceTypeEnumFromJSONTyped,
    ResourceTypeEnumToJSON: () => ResourceTypeEnumToJSON,
    ResourceTypeEnumToJSONTyped: () => ResourceTypeEnumToJSONTyped,
    ResponseError: () => ResponseError,
    SchedulePublicApiApi: () => SchedulePublicApiApi,
    ScheduleTimeSlotDtoFromJSON: () => ScheduleTimeSlotDtoFromJSON,
    ScheduleTimeSlotDtoFromJSONTyped: () => ScheduleTimeSlotDtoFromJSONTyped,
    ScheduleTimeSlotDtoToJSON: () => ScheduleTimeSlotDtoToJSON,
    ScheduleTimeSlotDtoToJSONTyped: () => ScheduleTimeSlotDtoToJSONTyped,
    SegmentExpandEnum: () => SegmentExpandEnum,
    SegmentExpandEnumFromJSON: () => SegmentExpandEnumFromJSON,
    SegmentExpandEnumFromJSONTyped: () => SegmentExpandEnumFromJSONTyped,
    SegmentExpandEnumToJSON: () => SegmentExpandEnumToJSON,
    SegmentExpandEnumToJSONTyped: () => SegmentExpandEnumToJSONTyped,
    SessionDtoFromJSON: () => SessionDtoFromJSON,
    SessionDtoFromJSONTyped: () => SessionDtoFromJSONTyped,
    SessionDtoToJSON: () => SessionDtoToJSON,
    SessionDtoToJSONTyped: () => SessionDtoToJSONTyped,
    SessionExpandEnum: () => SessionExpandEnum,
    SessionExpandEnumFromJSON: () => SessionExpandEnumFromJSON,
    SessionExpandEnumFromJSONTyped: () => SessionExpandEnumFromJSONTyped,
    SessionExpandEnumToJSON: () => SessionExpandEnumToJSON,
    SessionExpandEnumToJSONTyped: () => SessionExpandEnumToJSONTyped,
    SessionSegmentPublicDtoFromJSON: () => SessionSegmentPublicDtoFromJSON,
    SessionSegmentPublicDtoFromJSONTyped: () => SessionSegmentPublicDtoFromJSONTyped,
    SessionSegmentPublicDtoToJSON: () => SessionSegmentPublicDtoToJSON,
    SessionSegmentPublicDtoToJSONTyped: () => SessionSegmentPublicDtoToJSONTyped,
    SimpleActivityTimesDtoDayOfWeekEnum: () => SimpleActivityTimesDtoDayOfWeekEnum,
    SimpleActivityTimesDtoFromJSON: () => SimpleActivityTimesDtoFromJSON,
    SimpleActivityTimesDtoFromJSONTyped: () => SimpleActivityTimesDtoFromJSONTyped,
    SimpleActivityTimesDtoToJSON: () => SimpleActivityTimesDtoToJSON,
    SimpleActivityTimesDtoToJSONTyped: () => SimpleActivityTimesDtoToJSONTyped,
    SimpleCustomerDtoFromJSON: () => SimpleCustomerDtoFromJSON,
    SimpleCustomerDtoFromJSONTyped: () => SimpleCustomerDtoFromJSONTyped,
    SimpleCustomerDtoToJSON: () => SimpleCustomerDtoToJSON,
    SimpleCustomerDtoToJSONTyped: () => SimpleCustomerDtoToJSONTyped,
    SimpleDiscountDtoFromJSON: () => SimpleDiscountDtoFromJSON,
    SimpleDiscountDtoFromJSONTyped: () => SimpleDiscountDtoFromJSONTyped,
    SimpleDiscountDtoToJSON: () => SimpleDiscountDtoToJSON,
    SimpleDiscountDtoToJSONTyped: () => SimpleDiscountDtoToJSONTyped,
    SimpleInvoiceDtoFromJSON: () => SimpleInvoiceDtoFromJSON,
    SimpleInvoiceDtoFromJSONTyped: () => SimpleInvoiceDtoFromJSONTyped,
    SimpleInvoiceDtoToJSON: () => SimpleInvoiceDtoToJSON,
    SimpleInvoiceDtoToJSONTyped: () => SimpleInvoiceDtoToJSONTyped,
    SimpleMediaDtoFromJSON: () => SimpleMediaDtoFromJSON,
    SimpleMediaDtoFromJSONTyped: () => SimpleMediaDtoFromJSONTyped,
    SimpleMediaDtoToJSON: () => SimpleMediaDtoToJSON,
    SimpleMediaDtoToJSONTyped: () => SimpleMediaDtoToJSONTyped,
    SimpleMembershipDtoFromJSON: () => SimpleMembershipDtoFromJSON,
    SimpleMembershipDtoFromJSONTyped: () => SimpleMembershipDtoFromJSONTyped,
    SimpleMembershipDtoToJSON: () => SimpleMembershipDtoToJSON,
    SimpleMembershipDtoToJSONTyped: () => SimpleMembershipDtoToJSONTyped,
    SimplePriceDtoFromJSON: () => SimplePriceDtoFromJSON,
    SimplePriceDtoFromJSONTyped: () => SimplePriceDtoFromJSONTyped,
    SimplePriceDtoToJSON: () => SimplePriceDtoToJSON,
    SimplePriceDtoToJSONTyped: () => SimplePriceDtoToJSONTyped,
    SimpleProductDtoFromJSON: () => SimpleProductDtoFromJSON,
    SimpleProductDtoFromJSONTyped: () => SimpleProductDtoFromJSONTyped,
    SimpleProductDtoToJSON: () => SimpleProductDtoToJSON,
    SimpleProductDtoToJSONTyped: () => SimpleProductDtoToJSONTyped,
    SimpleProgramDtoFromJSON: () => SimpleProgramDtoFromJSON,
    SimpleProgramDtoFromJSONTyped: () => SimpleProgramDtoFromJSONTyped,
    SimpleProgramDtoToJSON: () => SimpleProgramDtoToJSON,
    SimpleProgramDtoToJSONTyped: () => SimpleProgramDtoToJSONTyped,
    SimpleResourceDtoFromJSON: () => SimpleResourceDtoFromJSON,
    SimpleResourceDtoFromJSONTyped: () => SimpleResourceDtoFromJSONTyped,
    SimpleResourceDtoToJSON: () => SimpleResourceDtoToJSON,
    SimpleResourceDtoToJSONTyped: () => SimpleResourceDtoToJSONTyped,
    SimpleSessionDtoFromJSON: () => SimpleSessionDtoFromJSON,
    SimpleSessionDtoFromJSONTyped: () => SimpleSessionDtoFromJSONTyped,
    SimpleSessionDtoToJSON: () => SimpleSessionDtoToJSON,
    SimpleSessionDtoToJSONTyped: () => SimpleSessionDtoToJSONTyped,
    SimpleUserDtoFromJSON: () => SimpleUserDtoFromJSON,
    SimpleUserDtoFromJSONTyped: () => SimpleUserDtoFromJSONTyped,
    SimpleUserDtoToJSON: () => SimpleUserDtoToJSON,
    SimpleUserDtoToJSONTyped: () => SimpleUserDtoToJSONTyped,
    SpacePropertiesEnum: () => SpacePropertiesEnum,
    SpacePropertiesEnumFromJSON: () => SpacePropertiesEnumFromJSON,
    SpacePropertiesEnumFromJSONTyped: () => SpacePropertiesEnumFromJSONTyped,
    SpacePropertiesEnumToJSON: () => SpacePropertiesEnumToJSON,
    SpacePropertiesEnumToJSONTyped: () => SpacePropertiesEnumToJSONTyped,
    SportNameEnum: () => SportNameEnum,
    SportNameEnumFromJSON: () => SportNameEnumFromJSON,
    SportNameEnumFromJSONTyped: () => SportNameEnumFromJSONTyped,
    SportNameEnumToJSON: () => SportNameEnumToJSON,
    SportNameEnumToJSONTyped: () => SportNameEnumToJSONTyped,
    SportsEnum: () => SportsEnum,
    SportsEnumFromJSON: () => SportsEnumFromJSON,
    SportsEnumFromJSONTyped: () => SportsEnumFromJSONTyped,
    SportsEnumToJSON: () => SportsEnumToJSON,
    SportsEnumToJSONTyped: () => SportsEnumToJSONTyped,
    SurfacesEnum: () => SurfacesEnum,
    SurfacesEnumFromJSON: () => SurfacesEnumFromJSON,
    SurfacesEnumFromJSONTyped: () => SurfacesEnumFromJSONTyped,
    SurfacesEnumToJSON: () => SurfacesEnumToJSON,
    SurfacesEnumToJSONTyped: () => SurfacesEnumToJSONTyped,
    TaxDtoFromJSON: () => TaxDtoFromJSON,
    TaxDtoFromJSONTyped: () => TaxDtoFromJSONTyped,
    TaxDtoToJSON: () => TaxDtoToJSON,
    TaxDtoToJSONTyped: () => TaxDtoToJSONTyped,
    TextApiResponse: () => TextApiResponse,
    TimeUnit: () => TimeUnit,
    TimeUnitFromJSON: () => TimeUnitFromJSON,
    TimeUnitFromJSONTyped: () => TimeUnitFromJSONTyped,
    TimeUnitToJSON: () => TimeUnitToJSON,
    TimeUnitToJSONTyped: () => TimeUnitToJSONTyped,
    UserAnswersDtoFromJSON: () => UserAnswersDtoFromJSON,
    UserAnswersDtoFromJSONTyped: () => UserAnswersDtoFromJSONTyped,
    UserAnswersDtoToJSON: () => UserAnswersDtoToJSON,
    UserAnswersDtoToJSONTyped: () => UserAnswersDtoToJSONTyped,
    UserBookingInformationDtoFromJSON: () => UserBookingInformationDtoFromJSON,
    UserBookingInformationDtoFromJSONTyped: () => UserBookingInformationDtoFromJSONTyped,
    UserBookingInformationDtoToJSON: () => UserBookingInformationDtoToJSON,
    UserBookingInformationDtoToJSONTyped: () => UserBookingInformationDtoToJSONTyped,
    UserGender: () => UserGenderEnum,
    UserGenderEnum: () => UserGenderEnum,
    UsersPublicApiApi: () => UsersPublicApiApi,
    VoidApiResponse: () => VoidApiResponse,
    canConsumeForm: () => canConsumeForm,
    exists: () => exists,
    instanceOfAccountingCodeDto: () => instanceOfAccountingCodeDto,
    instanceOfActivityEnum: () => instanceOfActivityEnum,
    instanceOfActivityTimeDto: () => instanceOfActivityTimeDto,
    instanceOfAddCartItemDto: () => instanceOfAddCartItemDto,
    instanceOfAddonTimePeriodEnum: () => instanceOfAddonTimePeriodEnum,
    instanceOfAddressDto: () => instanceOfAddressDto,
    instanceOfAmenitiesNameEnum: () => instanceOfAmenitiesNameEnum,
    instanceOfAuthTokensDto: () => instanceOfAuthTokensDto,
    instanceOfAvailabilityStatusEnum: () => instanceOfAvailabilityStatusEnum,
    instanceOfBasicCustomerDto: () => instanceOfBasicCustomerDto,
    instanceOfBasicFacilityDto: () => instanceOfBasicFacilityDto,
    instanceOfBasicMembershipMemberDto: () => instanceOfBasicMembershipMemberDto,
    instanceOfBasicProductDto: () => instanceOfBasicProductDto,
    instanceOfBasicProductPackageDto: () => instanceOfBasicProductPackageDto,
    instanceOfBasicPurchaseDto: () => instanceOfBasicPurchaseDto,
    instanceOfBasicTimeSlotDto: () => instanceOfBasicTimeSlotDto,
    instanceOfBookingScheduleDto: () => instanceOfBookingScheduleDto,
    instanceOfBookingScheduleSettingsDto: () => instanceOfBookingScheduleSettingsDto,
    instanceOfCartDiscountDto: () => instanceOfCartDiscountDto,
    instanceOfCartItemDescriptionEnum: () => instanceOfCartItemDescriptionEnum,
    instanceOfCartItemDto: () => instanceOfCartItemDto,
    instanceOfCartItemMetadataDto: () => instanceOfCartItemMetadataDto,
    instanceOfCartPurchaseTypeEnum: () => instanceOfCartPurchaseTypeEnum,
    instanceOfCartStateEnum: () => instanceOfCartStateEnum,
    instanceOfCartStatusEnum: () => instanceOfCartStatusEnum,
    instanceOfCartTaxDto: () => instanceOfCartTaxDto,
    instanceOfCloneFolderDto: () => instanceOfCloneFolderDto,
    instanceOfCreateBookingAddonDto: () => instanceOfCreateBookingAddonDto,
    instanceOfCreateBookingDto: () => instanceOfCreateBookingDto,
    instanceOfCreateBookingSegmentDto: () => instanceOfCreateBookingSegmentDto,
    instanceOfCreateBookingTimeSlotDto: () => instanceOfCreateBookingTimeSlotDto,
    instanceOfCreateFolderDto: () => instanceOfCreateFolderDto,
    instanceOfCurrencyEnum: () => instanceOfCurrencyEnum,
    instanceOfCustomerFamilyStatusEnum: () => instanceOfCustomerFamilyStatusEnum,
    instanceOfCustomerInMembershipTypeEnum: () => instanceOfCustomerInMembershipTypeEnum,
    instanceOfCustomerTypeEnum: () => instanceOfCustomerTypeEnum,
    instanceOfDateAndTimesDto: () => instanceOfDateAndTimesDto,
    instanceOfDayOfWeekNameEnum: () => instanceOfDayOfWeekNameEnum,
    instanceOfDiscountMethodsEnum: () => instanceOfDiscountMethodsEnum,
    instanceOfDiscountOnEnum: () => instanceOfDiscountOnEnum,
    instanceOfDiscountTypeEnum: () => instanceOfDiscountTypeEnum,
    instanceOfDurationDto: () => instanceOfDurationDto,
    instanceOfEntitlementDiscountDto: () => instanceOfEntitlementDiscountDto,
    instanceOfEntitlementDiscountGroupDto: () => instanceOfEntitlementDiscountGroupDto,
    instanceOfErrorResponsesDto: () => instanceOfErrorResponsesDto,
    instanceOfEventDto: () => instanceOfEventDto,
    instanceOfEventExpandEnum: () => instanceOfEventExpandEnum,
    instanceOfExpandUserEnum: () => instanceOfExpandUserEnum,
    instanceOfExtendedFacilityDto: () => instanceOfExtendedFacilityDto,
    instanceOfExtendedOnlineBookingPortalOptionsDto: () => instanceOfExtendedOnlineBookingPortalOptionsDto,
    instanceOfExtendedProductDto: () => instanceOfExtendedProductDto,
    instanceOfExtendedRequiredProductDto: () => instanceOfExtendedRequiredProductDto,
    instanceOfExtendedUserDto: () => instanceOfExtendedUserDto,
    instanceOfFinalizeCart200Response: () => instanceOfFinalizeCart200Response,
    instanceOfFindOrCreateFolderDto: () => instanceOfFindOrCreateFolderDto,
    instanceOfFolderContentRestrictionsDto: () => instanceOfFolderContentRestrictionsDto,
    instanceOfFolderRestrictionsDto: () => instanceOfFolderRestrictionsDto,
    instanceOfGenderEnum: () => instanceOfGenderEnum,
    instanceOfGenderNameEnum: () => instanceOfGenderNameEnum,
    instanceOfGenericResponseDto: () => instanceOfGenericResponseDto,
    instanceOfGetCheckoutQuestionnaires200Response: () => instanceOfGetCheckoutQuestionnaires200Response,
    instanceOfGetOrganizationPrograms200Response: () => instanceOfGetOrganizationPrograms200Response,
    instanceOfGetPaginatedCategoryProducts200Response: () => instanceOfGetPaginatedCategoryProducts200Response,
    instanceOfGetPopulatedSessionsByProgramId200Response: () => instanceOfGetPopulatedSessionsByProgramId200Response,
    instanceOfGetSegmentEvents200Response: () => instanceOfGetSegmentEvents200Response,
    instanceOfGetSessionProducts200Response: () => instanceOfGetSessionProducts200Response,
    instanceOfGetSessionSegments200Response: () => instanceOfGetSessionSegments200Response,
    instanceOfGlResourceTypeEnum: () => instanceOfGlResourceTypeEnum,
    instanceOfGlTypeDto: () => instanceOfGlTypeDto,
    instanceOfInvoiceStatusEnum: () => instanceOfInvoiceStatusEnum,
    instanceOfLevelOfPlayEnum: () => instanceOfLevelOfPlayEnum,
    instanceOfLevelOfPlayNameEnum: () => instanceOfLevelOfPlayNameEnum,
    instanceOfMediaDto: () => instanceOfMediaDto,
    instanceOfMediaTypesEnum: () => instanceOfMediaTypesEnum,
    instanceOfMembershipStatusEnum: () => instanceOfMembershipStatusEnum,
    instanceOfMembershipTypeEnum: () => instanceOfMembershipTypeEnum,
    instanceOfMetaSelectOptionDto: () => instanceOfMetaSelectOptionDto,
    instanceOfMetaType: () => instanceOfMetaType,
    instanceOfMetaTypeEnum: () => instanceOfMetaTypeEnum,
    instanceOfOnlineBookingSettingsDto: () => instanceOfOnlineBookingSettingsDto,
    instanceOfOnlineBookingViewsEnum: () => instanceOfOnlineBookingViewsEnum,
    instanceOfOpeningTimeDto: () => instanceOfOpeningTimeDto,
    instanceOfOrderByProgramEnum: () => instanceOfOrderByProgramEnum,
    instanceOfOrganizationCartDto: () => instanceOfOrganizationCartDto,
    instanceOfPackageProductsRelationTypeEnum: () => instanceOfPackageProductsRelationTypeEnum,
    instanceOfPaginatedProductsDto: () => instanceOfPaginatedProductsDto,
    instanceOfPaginatedSessionsDto: () => instanceOfPaginatedSessionsDto,
    instanceOfPaginationMetaDto: () => instanceOfPaginationMetaDto,
    instanceOfPaginationResultDto: () => instanceOfPaginationResultDto,
    instanceOfPaginationTypeEnum: () => instanceOfPaginationTypeEnum,
    instanceOfParentResourceDto: () => instanceOfParentResourceDto,
    instanceOfPaymentPlanDto: () => instanceOfPaymentPlanDto,
    instanceOfPaymentPlanScheduleDto: () => instanceOfPaymentPlanScheduleDto,
    instanceOfPaymentPlanStatusEnum: () => instanceOfPaymentPlanStatusEnum,
    instanceOfPaymentPlanTypeEnum: () => instanceOfPaymentPlanTypeEnum,
    instanceOfPaymentStatusEnum: () => instanceOfPaymentStatusEnum,
    instanceOfPlatformsEnum: () => instanceOfPlatformsEnum,
    instanceOfPricingScheduleDto: () => instanceOfPricingScheduleDto,
    instanceOfProductExpandEnum: () => instanceOfProductExpandEnum,
    instanceOfProductPackageLevelEnum: () => instanceOfProductPackageLevelEnum,
    instanceOfProductResourceDto: () => instanceOfProductResourceDto,
    instanceOfProductSubTypesEnum: () => instanceOfProductSubTypesEnum,
    instanceOfProductTypesEnum: () => instanceOfProductTypesEnum,
    instanceOfProgramDto: () => instanceOfProgramDto,
    instanceOfProgramExpandEnum: () => instanceOfProgramExpandEnum,
    instanceOfProgramTypeNameEnum: () => instanceOfProgramTypeNameEnum,
    instanceOfProgramTypesEnum: () => instanceOfProgramTypesEnum,
    instanceOfPublicAuthRefreshSuccessDto: () => instanceOfPublicAuthRefreshSuccessDto,
    instanceOfPublicCheckoutQuestionnaireDto: () => instanceOfPublicCheckoutQuestionnaireDto,
    instanceOfPublicOnlineBookingPortalDto: () => instanceOfPublicOnlineBookingPortalDto,
    instanceOfPublicQuestionDto: () => instanceOfPublicQuestionDto,
    instanceOfPublicQuestionnaireDto: () => instanceOfPublicQuestionnaireDto,
    instanceOfPublicResourceDto: () => instanceOfPublicResourceDto,
    instanceOfPublicResourceMetadataDto: () => instanceOfPublicResourceMetadataDto,
    instanceOfPublicResourceScheduleDto: () => instanceOfPublicResourceScheduleDto,
    instanceOfPublishingStatusEnum: () => instanceOfPublishingStatusEnum,
    instanceOfPurchaseResourceDto: () => instanceOfPurchaseResourceDto,
    instanceOfQuestionAnswersDto: () => instanceOfQuestionAnswersDto,
    instanceOfQuestionCustomTypeEnum: () => instanceOfQuestionCustomTypeEnum,
    instanceOfQuestionMetaDataDto: () => instanceOfQuestionMetaDataDto,
    instanceOfReasonDto: () => instanceOfReasonDto,
    instanceOfReasonTypeEnum: () => instanceOfReasonTypeEnum,
    instanceOfReferableType: () => instanceOfReferableType,
    instanceOfRegistrationWindowStatusEnum: () => instanceOfRegistrationWindowStatusEnum,
    instanceOfRepetitionUnit: () => instanceOfRepetitionUnit,
    instanceOfReservationProductCategoryDto: () => instanceOfReservationProductCategoryDto,
    instanceOfResourceExpandEnum: () => instanceOfResourceExpandEnum,
    instanceOfResourceGlDto: () => instanceOfResourceGlDto,
    instanceOfResourceNameTypeEnum: () => instanceOfResourceNameTypeEnum,
    instanceOfResourceSubTypeEnum: () => instanceOfResourceSubTypeEnum,
    instanceOfResourceTypeEnum: () => instanceOfResourceTypeEnum,
    instanceOfScheduleTimeSlotDto: () => instanceOfScheduleTimeSlotDto,
    instanceOfSegmentExpandEnum: () => instanceOfSegmentExpandEnum,
    instanceOfSessionDto: () => instanceOfSessionDto,
    instanceOfSessionExpandEnum: () => instanceOfSessionExpandEnum,
    instanceOfSessionSegmentPublicDto: () => instanceOfSessionSegmentPublicDto,
    instanceOfSimpleActivityTimesDto: () => instanceOfSimpleActivityTimesDto,
    instanceOfSimpleCustomerDto: () => instanceOfSimpleCustomerDto,
    instanceOfSimpleDiscountDto: () => instanceOfSimpleDiscountDto,
    instanceOfSimpleInvoiceDto: () => instanceOfSimpleInvoiceDto,
    instanceOfSimpleMediaDto: () => instanceOfSimpleMediaDto,
    instanceOfSimpleMembershipDto: () => instanceOfSimpleMembershipDto,
    instanceOfSimplePriceDto: () => instanceOfSimplePriceDto,
    instanceOfSimpleProductDto: () => instanceOfSimpleProductDto,
    instanceOfSimpleProgramDto: () => instanceOfSimpleProgramDto,
    instanceOfSimpleResourceDto: () => instanceOfSimpleResourceDto,
    instanceOfSimpleSessionDto: () => instanceOfSimpleSessionDto,
    instanceOfSimpleUserDto: () => instanceOfSimpleUserDto,
    instanceOfSpacePropertiesEnum: () => instanceOfSpacePropertiesEnum,
    instanceOfSportNameEnum: () => instanceOfSportNameEnum,
    instanceOfSportsEnum: () => instanceOfSportsEnum,
    instanceOfSurfacesEnum: () => instanceOfSurfacesEnum,
    instanceOfTaxDto: () => instanceOfTaxDto,
    instanceOfTimeUnit: () => instanceOfTimeUnit,
    instanceOfUserAnswersDto: () => instanceOfUserAnswersDto,
    instanceOfUserBookingInformationDto: () => instanceOfUserBookingInformationDto,
    mapValues: () => mapValues,
    querystring: () => querystring
  });

  // src/.source-sdk/runtime.ts
  var BASE_PATH = "https://public.api.squad-c.bondsports.co".replace(/\/+$/, "");
  var Configuration = class {
    constructor(configuration = {}) {
      this.configuration = configuration;
    }
    set config(configuration) {
      this.configuration = configuration;
    }
    get basePath() {
      return this.configuration.basePath != null ? this.configuration.basePath : BASE_PATH;
    }
    get fetchApi() {
      return this.configuration.fetchApi;
    }
    get middleware() {
      return this.configuration.middleware || [];
    }
    get queryParamsStringify() {
      return this.configuration.queryParamsStringify || querystring;
    }
    get username() {
      return this.configuration.username;
    }
    get password() {
      return this.configuration.password;
    }
    get apiKey() {
      const apiKey = this.configuration.apiKey;
      if (apiKey) {
        return typeof apiKey === "function" ? apiKey : () => apiKey;
      }
      return void 0;
    }
    get accessToken() {
      const accessToken = this.configuration.accessToken;
      if (accessToken) {
        return typeof accessToken === "function" ? accessToken : async () => accessToken;
      }
      return void 0;
    }
    get headers() {
      return this.configuration.headers;
    }
    get credentials() {
      return this.configuration.credentials;
    }
  };
  var DefaultConfig = new Configuration();
  var BaseAPI = class _BaseAPI {
    constructor(configuration = DefaultConfig) {
      this.configuration = configuration;
      this.fetchApi = async (url, init) => {
        let fetchParams = { url, init };
        for (const middleware of this.middleware) {
          if (middleware.pre) {
            fetchParams = await middleware.pre({
              fetch: this.fetchApi,
              ...fetchParams
            }) || fetchParams;
          }
        }
        let response = void 0;
        try {
          response = await (this.configuration.fetchApi || fetch)(fetchParams.url, fetchParams.init);
        } catch (e) {
          for (const middleware of this.middleware) {
            if (middleware.onError) {
              response = await middleware.onError({
                fetch: this.fetchApi,
                url: fetchParams.url,
                init: fetchParams.init,
                error: e,
                response: response ? response.clone() : void 0
              }) || response;
            }
          }
          if (response === void 0) {
            if (e instanceof Error) {
              throw new FetchError(e, "The request failed and the interceptors did not return an alternative response");
            } else {
              throw e;
            }
          }
        }
        for (const middleware of this.middleware) {
          if (middleware.post) {
            response = await middleware.post({
              fetch: this.fetchApi,
              url: fetchParams.url,
              init: fetchParams.init,
              response: response.clone()
            }) || response;
          }
        }
        return response;
      };
      this.middleware = configuration.middleware;
    }
    static {
      this.jsonRegex = /^(:?application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(:?;.*)?$/i;
    }
    withMiddleware(...middlewares) {
      const next = this.clone();
      next.middleware = next.middleware.concat(...middlewares);
      return next;
    }
    withPreMiddleware(...preMiddlewares) {
      const middlewares = preMiddlewares.map((pre) => ({ pre }));
      return this.withMiddleware(...middlewares);
    }
    withPostMiddleware(...postMiddlewares) {
      const middlewares = postMiddlewares.map((post) => ({ post }));
      return this.withMiddleware(...middlewares);
    }
    /**
     * Check if the given MIME is a JSON MIME.
     * JSON MIME examples:
     *   application/json
     *   application/json; charset=UTF8
     *   APPLICATION/JSON
     *   application/vnd.company+json
     * @param mime - MIME (Multipurpose Internet Mail Extensions)
     * @return True if the given MIME is JSON, false otherwise.
     */
    isJsonMime(mime) {
      if (!mime) {
        return false;
      }
      return _BaseAPI.jsonRegex.test(mime);
    }
    async request(context, initOverrides) {
      const { url, init } = await this.createFetchParams(context, initOverrides);
      const response = await this.fetchApi(url, init);
      if (response && (response.status >= 200 && response.status < 300)) {
        return response;
      }
      throw new ResponseError(response, "Response returned an error code");
    }
    async createFetchParams(context, initOverrides) {
      let url = this.configuration.basePath + context.path;
      if (context.query !== void 0 && Object.keys(context.query).length !== 0) {
        url += "?" + this.configuration.queryParamsStringify(context.query);
      }
      const headers = Object.assign({}, this.configuration.headers, context.headers);
      Object.keys(headers).forEach((key) => headers[key] === void 0 ? delete headers[key] : {});
      const initOverrideFn = typeof initOverrides === "function" ? initOverrides : async () => initOverrides;
      const initParams = {
        method: context.method,
        headers,
        body: context.body,
        credentials: this.configuration.credentials
      };
      const overriddenInit = {
        ...initParams,
        ...await initOverrideFn({
          init: initParams,
          context
        })
      };
      let body;
      if (isFormData(overriddenInit.body) || overriddenInit.body instanceof URLSearchParams || isBlob(overriddenInit.body)) {
        body = overriddenInit.body;
      } else if (this.isJsonMime(headers["Content-Type"])) {
        body = JSON.stringify(overriddenInit.body);
      } else {
        body = overriddenInit.body;
      }
      const init = {
        ...overriddenInit,
        body
      };
      return { url, init };
    }
    /**
     * Create a shallow clone of `this` by constructing a new instance
     * and then shallow cloning data members.
     */
    clone() {
      const constructor = this.constructor;
      const next = new constructor(this.configuration);
      next.middleware = this.middleware.slice();
      return next;
    }
  };
  function isBlob(value) {
    return typeof Blob !== "undefined" && value instanceof Blob;
  }
  function isFormData(value) {
    return typeof FormData !== "undefined" && value instanceof FormData;
  }
  var ResponseError = class extends Error {
    constructor(response, msg) {
      super(msg);
      this.response = response;
      this.name = "ResponseError";
      const actualProto = new.target.prototype;
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(this, actualProto);
      }
    }
  };
  var FetchError = class extends Error {
    constructor(cause, msg) {
      super(msg);
      this.cause = cause;
      this.name = "FetchError";
      const actualProto = new.target.prototype;
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(this, actualProto);
      }
    }
  };
  var RequiredError = class extends Error {
    constructor(field, msg) {
      super(msg);
      this.field = field;
      this.name = "RequiredError";
      const actualProto = new.target.prototype;
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(this, actualProto);
      }
    }
  };
  var COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "	",
    pipes: "|"
  };
  function querystring(params, prefix = "") {
    return Object.keys(params).map((key) => querystringSingleKey(key, params[key], prefix)).filter((part) => part.length > 0).join("&");
  }
  function querystringSingleKey(key, value, keyPrefix = "") {
    const fullKey = keyPrefix + (keyPrefix.length ? `[${key}]` : key);
    if (value instanceof Array) {
      const multiValue = value.map((singleValue) => encodeURIComponent(String(singleValue))).join(`&${encodeURIComponent(fullKey)}=`);
      return `${encodeURIComponent(fullKey)}=${multiValue}`;
    }
    if (value instanceof Set) {
      const valueAsArray = Array.from(value);
      return querystringSingleKey(key, valueAsArray, keyPrefix);
    }
    if (value instanceof Date) {
      return `${encodeURIComponent(fullKey)}=${encodeURIComponent(value.toISOString())}`;
    }
    if (value instanceof Object) {
      return querystring(value, fullKey);
    }
    return `${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`;
  }
  function exists(json, key) {
    const value = json[key];
    return value !== null && value !== void 0;
  }
  function mapValues(data, fn) {
    const result = {};
    for (const key of Object.keys(data)) {
      result[key] = fn(data[key]);
    }
    return result;
  }
  function canConsumeForm(consumes) {
    for (const consume of consumes) {
      if ("multipart/form-data" === consume.contentType) {
        return true;
      }
    }
    return false;
  }
  var JSONApiResponse = class {
    constructor(raw, transformer = (jsonValue) => jsonValue) {
      this.raw = raw;
      this.transformer = transformer;
    }
    async value() {
      return this.transformer(await this.raw.json());
    }
  };
  var VoidApiResponse = class {
    constructor(raw) {
      this.raw = raw;
    }
    async value() {
      return void 0;
    }
  };
  var BlobApiResponse = class {
    constructor(raw) {
      this.raw = raw;
    }
    async value() {
      return await this.raw.blob();
    }
  };
  var TextApiResponse = class {
    constructor(raw) {
      this.raw = raw;
    }
    async value() {
      return await this.raw.text();
    }
  };

  // src/.source-sdk/models/GenericResponseDto.ts
  function instanceOfGenericResponseDto(value) {
    if (!("succeeded" in value) || value["succeeded"] === void 0) return false;
    return true;
  }
  function GenericResponseDtoFromJSON(json) {
    return GenericResponseDtoFromJSONTyped(json, false);
  }
  function GenericResponseDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "succeeded": json["succeeded"],
      "data": json["data"] == null ? void 0 : json["data"],
      "message": json["message"] == null ? void 0 : json["message"]
    };
  }
  function GenericResponseDtoToJSON(json) {
    return GenericResponseDtoToJSONTyped(json, false);
  }
  function GenericResponseDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "succeeded": value["succeeded"],
      "data": value["data"],
      "message": value["message"]
    };
  }

  // src/.source-sdk/models/AuthTokensDto.ts
  function instanceOfAuthTokensDto(value) {
    if (!("accessToken" in value) || value["accessToken"] === void 0) return false;
    if (!("refreshToken" in value) || value["refreshToken"] === void 0) return false;
    return true;
  }
  function AuthTokensDtoFromJSON(json) {
    return AuthTokensDtoFromJSONTyped(json, false);
  }
  function AuthTokensDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "accessToken": json["accessToken"],
      "refreshToken": json["refreshToken"],
      "userIdToken": json["userIdToken"] == null ? void 0 : json["userIdToken"],
      "username": json["username"] == null ? void 0 : json["username"]
    };
  }
  function AuthTokensDtoToJSON(json) {
    return AuthTokensDtoToJSONTyped(json, false);
  }
  function AuthTokensDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "accessToken": value["accessToken"],
      "refreshToken": value["refreshToken"],
      "userIdToken": value["userIdToken"],
      "username": value["username"]
    };
  }

  // src/.source-sdk/models/PublicAuthRefreshSuccessDto.ts
  function instanceOfPublicAuthRefreshSuccessDto(value) {
    if (!("credentials" in value) || value["credentials"] === void 0) return false;
    return true;
  }
  function PublicAuthRefreshSuccessDtoFromJSON(json) {
    return PublicAuthRefreshSuccessDtoFromJSONTyped(json, false);
  }
  function PublicAuthRefreshSuccessDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "credentials": AuthTokensDtoFromJSON(json["credentials"])
    };
  }
  function PublicAuthRefreshSuccessDtoToJSON(json) {
    return PublicAuthRefreshSuccessDtoToJSONTyped(json, false);
  }
  function PublicAuthRefreshSuccessDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "credentials": AuthTokensDtoToJSON(value["credentials"])
    };
  }

  // src/.source-sdk/apis/AuthPublicApiApi.ts
  var AuthPublicApiApi = class extends BaseAPI {
    /**
     * Creates request options for publicLogout without sending the request
     */
    async publicLogoutRequestOpts(requestParameters) {
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling publicLogout().'
        );
      }
      const queryParameters = {};
      const headerParameters = {};
      if (requestParameters["xBondUserRefreshToken"] != null) {
        headerParameters["X-BondUserRefreshToken"] = String(requestParameters["xBondUserRefreshToken"]);
      }
      if (requestParameters["xBondUserUsername"] != null) {
        headerParameters["X-BondUserUsername"] = String(requestParameters["xBondUserUsername"]);
      }
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/auth/logout`;
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "DELETE",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Logout a public user and invalidate their tokens
     * 
     */
    async publicLogoutRaw(requestParameters, initOverrides) {
      const requestOptions = await this.publicLogoutRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => GenericResponseDtoFromJSON(jsonValue));
    }
    /**
     * Logout a public user and invalidate their tokens
     * 
     */
    async publicLogout(requestParameters, initOverrides) {
      const response = await this.publicLogoutRaw(requestParameters, initOverrides);
      return await response.value();
    }
    /**
     * Creates request options for publicRefresh without sending the request
     */
    async publicRefreshRequestOpts(requestParameters) {
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling publicRefresh().'
        );
      }
      const queryParameters = {};
      const headerParameters = {};
      if (requestParameters["xBondUserRefreshToken"] != null) {
        headerParameters["X-BondUserRefreshToken"] = String(requestParameters["xBondUserRefreshToken"]);
      }
      if (requestParameters["xBondUserUsername"] != null) {
        headerParameters["X-BondUserUsername"] = String(requestParameters["xBondUserUsername"]);
      }
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/auth/refresh`;
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Refresh auth tokens using a valid refresh token
     * 
     */
    async publicRefreshRaw(requestParameters, initOverrides) {
      const requestOptions = await this.publicRefreshRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => PublicAuthRefreshSuccessDtoFromJSON(jsonValue));
    }
    /**
     * Refresh auth tokens using a valid refresh token
     * 
     */
    async publicRefresh(requestParameters, initOverrides) {
      const response = await this.publicRefreshRaw(requestParameters, initOverrides);
      return await response.value();
    }
  };

  // src/.source-sdk/models/BasicPurchaseDto.ts
  function instanceOfBasicPurchaseDto(value) {
    return true;
  }
  function BasicPurchaseDtoFromJSON(json) {
    return BasicPurchaseDtoFromJSONTyped(json, false);
  }
  function BasicPurchaseDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "paymentMethodId": json["paymentMethodId"] == null ? void 0 : json["paymentMethodId"],
      "amountToPay": json["amountToPay"] == null ? void 0 : json["amountToPay"]
    };
  }
  function BasicPurchaseDtoToJSON(json) {
    return BasicPurchaseDtoToJSONTyped(json, false);
  }
  function BasicPurchaseDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "paymentMethodId": value["paymentMethodId"],
      "amountToPay": value["amountToPay"]
    };
  }

  // src/.source-sdk/models/PaymentStatusEnum.ts
  var PaymentStatusEnum = {
    NotPaid: "not_paid",
    Partial: "partial",
    Paid: "paid",
    Refunded: "refunded",
    Disputed: "disputed",
    Chargeback: "chargeback",
    Void: "void",
    Discount: "discount",
    RevertDiscount: "revert_discount",
    Revert: "revert",
    Pending: "pending",
    RetryInProgress: "retry_in_progress"
  };
  function instanceOfPaymentStatusEnum(value) {
    for (const key in PaymentStatusEnum) {
      if (Object.prototype.hasOwnProperty.call(PaymentStatusEnum, key)) {
        if (PaymentStatusEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function PaymentStatusEnumFromJSON(json) {
    return PaymentStatusEnumFromJSONTyped(json, false);
  }
  function PaymentStatusEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function PaymentStatusEnumToJSON(value) {
    return value;
  }
  function PaymentStatusEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/PlatformsEnum.ts
  var PlatformsEnum = {
    Consumer: "consumer",
    ConsumerCheckout: "consumer_checkout",
    Backoffice: "backoffice",
    Mobile: "mobile",
    Cron: "cron",
    Import: "import",
    Other: "other"
  };
  function instanceOfPlatformsEnum(value) {
    for (const key in PlatformsEnum) {
      if (Object.prototype.hasOwnProperty.call(PlatformsEnum, key)) {
        if (PlatformsEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function PlatformsEnumFromJSON(json) {
    return PlatformsEnumFromJSONTyped(json, false);
  }
  function PlatformsEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function PlatformsEnumToJSON(value) {
    return value;
  }
  function PlatformsEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/InvoiceStatusEnum.ts
  var InvoiceStatusEnum = {
    Active: "active",
    WaitingAdmin: "waitingAdmin",
    WaitingClient: "waitingClient",
    Canceled: "canceled",
    Draft: "draft"
  };
  function instanceOfInvoiceStatusEnum(value) {
    for (const key in InvoiceStatusEnum) {
      if (Object.prototype.hasOwnProperty.call(InvoiceStatusEnum, key)) {
        if (InvoiceStatusEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function InvoiceStatusEnumFromJSON(json) {
    return InvoiceStatusEnumFromJSONTyped(json, false);
  }
  function InvoiceStatusEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function InvoiceStatusEnumToJSON(value) {
    return value;
  }
  function InvoiceStatusEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/CurrencyEnum.ts
  var CurrencyEnum = {
    Usd: "USD",
    Cad: "CAD"
  };
  function instanceOfCurrencyEnum(value) {
    for (const key in CurrencyEnum) {
      if (Object.prototype.hasOwnProperty.call(CurrencyEnum, key)) {
        if (CurrencyEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function CurrencyEnumFromJSON(json) {
    return CurrencyEnumFromJSONTyped(json, false);
  }
  function CurrencyEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function CurrencyEnumToJSON(value) {
    return value;
  }
  function CurrencyEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/SimpleInvoiceDto.ts
  function instanceOfSimpleInvoiceDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("invoiceId" in value) || value["invoiceId"] === void 0) return false;
    if (!("price" in value) || value["price"] === void 0) return false;
    if (!("paidAmount" in value) || value["paidAmount"] === void 0) return false;
    if (!("payingUserId" in value) || value["payingUserId"] === void 0) return false;
    if (!("currency" in value) || value["currency"] === void 0) return false;
    if (!("isScheduled" in value) || value["isScheduled"] === void 0) return false;
    if (!("paymentStatus" in value) || value["paymentStatus"] === void 0) return false;
    return true;
  }
  function SimpleInvoiceDtoFromJSON(json) {
    return SimpleInvoiceDtoFromJSONTyped(json, false);
  }
  function SimpleInvoiceDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "invoiceId": json["invoiceId"],
      "price": json["price"],
      "paidAmount": json["paidAmount"],
      "payingUserId": json["payingUserId"],
      "currency": CurrencyEnumFromJSON(json["currency"]),
      "isScheduled": json["isScheduled"],
      "platform": json["platform"] == null ? void 0 : PlatformsEnumFromJSON(json["platform"]),
      "shiftId": json["shiftId"] == null ? void 0 : json["shiftId"],
      "paymentStatus": PaymentStatusEnumFromJSON(json["paymentStatus"]),
      "status": json["status"] == null ? void 0 : InvoiceStatusEnumFromJSON(json["status"]),
      "totalFeesAmount": json["totalFeesAmount"] == null ? void 0 : json["totalFeesAmount"],
      "discountAmount": json["discountAmount"] == null ? void 0 : json["discountAmount"],
      "discountSubtotal": json["discountSubtotal"] == null ? void 0 : json["discountSubtotal"],
      "subtotal": json["subtotal"] == null ? void 0 : json["subtotal"],
      "subtotalBalance": json["subtotalBalance"] == null ? void 0 : json["subtotalBalance"],
      "isPublic": json["isPublic"] == null ? void 0 : json["isPublic"],
      "dueDate": json["dueDate"] == null ? void 0 : new Date(json["dueDate"]),
      "dueDateType": json["dueDateType"] == null ? void 0 : json["dueDateType"],
      "isOverdue": json["isOverdue"] == null ? void 0 : json["isOverdue"]
    };
  }
  function SimpleInvoiceDtoToJSON(json) {
    return SimpleInvoiceDtoToJSONTyped(json, false);
  }
  function SimpleInvoiceDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "invoiceId": value["invoiceId"],
      "price": value["price"],
      "paidAmount": value["paidAmount"],
      "payingUserId": value["payingUserId"],
      "currency": CurrencyEnumToJSON(value["currency"]),
      "isScheduled": value["isScheduled"],
      "platform": PlatformsEnumToJSON(value["platform"]),
      "shiftId": value["shiftId"],
      "paymentStatus": PaymentStatusEnumToJSON(value["paymentStatus"]),
      "status": InvoiceStatusEnumToJSON(value["status"]),
      "totalFeesAmount": value["totalFeesAmount"],
      "discountAmount": value["discountAmount"],
      "discountSubtotal": value["discountSubtotal"],
      "subtotal": value["subtotal"],
      "subtotalBalance": value["subtotalBalance"],
      "isPublic": value["isPublic"],
      "dueDate": value["dueDate"] == null ? value["dueDate"] : value["dueDate"].toISOString(),
      "dueDateType": value["dueDateType"],
      "isOverdue": value["isOverdue"]
    };
  }

  // src/.source-sdk/models/FinalizeCart200Response.ts
  function instanceOfFinalizeCart200Response(value) {
    if (!("succeeded" in value) || value["succeeded"] === void 0) return false;
    return true;
  }
  function FinalizeCart200ResponseFromJSON(json) {
    return FinalizeCart200ResponseFromJSONTyped(json, false);
  }
  function FinalizeCart200ResponseFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "succeeded": json["succeeded"],
      "data": json["data"] == null ? void 0 : SimpleInvoiceDtoFromJSON(json["data"]),
      "message": json["message"] == null ? void 0 : json["message"]
    };
  }
  function FinalizeCart200ResponseToJSON(json) {
    return FinalizeCart200ResponseToJSONTyped(json, false);
  }
  function FinalizeCart200ResponseToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "succeeded": value["succeeded"],
      "data": SimpleInvoiceDtoToJSON(value["data"]),
      "message": value["message"]
    };
  }

  // src/.source-sdk/models/GenderEnum.ts
  var GenderEnum = {
    Other: "OTHER",
    Male: "MALE",
    Female: "FEMALE"
  };
  function instanceOfGenderEnum(value) {
    for (const key in GenderEnum) {
      if (Object.prototype.hasOwnProperty.call(GenderEnum, key)) {
        if (GenderEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function GenderEnumFromJSON(json) {
    return GenderEnumFromJSONTyped(json, false);
  }
  function GenderEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function GenderEnumToJSON(value) {
    return value;
  }
  function GenderEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/SimpleUserDto.ts
  function instanceOfSimpleUserDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("firstName" in value) || value["firstName"] === void 0) return false;
    if (!("lastName" in value) || value["lastName"] === void 0) return false;
    return true;
  }
  function SimpleUserDtoFromJSON(json) {
    return SimpleUserDtoFromJSONTyped(json, false);
  }
  function SimpleUserDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "firstName": json["firstName"],
      "lastName": json["lastName"],
      "email": json["email"] == null ? void 0 : json["email"],
      "gender": json["gender"] == null ? void 0 : GenderEnumFromJSON(json["gender"]),
      "birthDate": json["birthDate"] == null ? void 0 : new Date(json["birthDate"])
    };
  }
  function SimpleUserDtoToJSON(json) {
    return SimpleUserDtoToJSONTyped(json, false);
  }
  function SimpleUserDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "firstName": value["firstName"],
      "lastName": value["lastName"],
      "email": value["email"],
      "gender": GenderEnumToJSON(value["gender"]),
      "birthDate": value["birthDate"] == null ? value["birthDate"] : value["birthDate"].toISOString()
    };
  }

  // src/.source-sdk/models/CartTaxDto.ts
  function instanceOfCartTaxDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("cartId" in value) || value["cartId"] === void 0) return false;
    if (!("productId" in value) || value["productId"] === void 0) return false;
    if (!("price" in value) || value["price"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    return true;
  }
  function CartTaxDtoFromJSON(json) {
    return CartTaxDtoFromJSONTyped(json, false);
  }
  function CartTaxDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "cartId": json["cartId"],
      "productId": json["productId"],
      "price": json["price"],
      "name": json["name"],
      "rate": json["rate"] == null ? void 0 : json["rate"],
      "isInclusive": json["isInclusive"] == null ? void 0 : json["isInclusive"]
    };
  }
  function CartTaxDtoToJSON(json) {
    return CartTaxDtoToJSONTyped(json, false);
  }
  function CartTaxDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "cartId": value["cartId"],
      "productId": value["productId"],
      "price": value["price"],
      "name": value["name"],
      "rate": value["rate"],
      "isInclusive": value["isInclusive"]
    };
  }

  // src/.source-sdk/models/CartStateEnum.ts
  var CartStateEnum = {
    Active: "active",
    Canceled: "canceled",
    Cleared: "cleared",
    Invoiced: "invoiced"
  };
  function instanceOfCartStateEnum(value) {
    for (const key in CartStateEnum) {
      if (Object.prototype.hasOwnProperty.call(CartStateEnum, key)) {
        if (CartStateEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function CartStateEnumFromJSON(json) {
    return CartStateEnumFromJSONTyped(json, false);
  }
  function CartStateEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function CartStateEnumToJSON(value) {
    return value;
  }
  function CartStateEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/CartStatusEnum.ts
  var CartStatusEnum = {
    Valid: "valid",
    Invalid: "invalid",
    Unknown: "unknown",
    Processing: "processing"
  };
  function instanceOfCartStatusEnum(value) {
    for (const key in CartStatusEnum) {
      if (Object.prototype.hasOwnProperty.call(CartStatusEnum, key)) {
        if (CartStatusEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function CartStatusEnumFromJSON(json) {
    return CartStatusEnumFromJSONTyped(json, false);
  }
  function CartStatusEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function CartStatusEnumToJSON(value) {
    return value;
  }
  function CartStatusEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/ReasonTypeEnum.ts
  var ReasonTypeEnum = {
    Refund: "refund",
    Discount: "discount",
    PromoCode: "promo_code",
    MembershipPause: "membership_pause"
  };
  function instanceOfReasonTypeEnum(value) {
    for (const key in ReasonTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(ReasonTypeEnum, key)) {
        if (ReasonTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ReasonTypeEnumFromJSON(json) {
    return ReasonTypeEnumFromJSONTyped(json, false);
  }
  function ReasonTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ReasonTypeEnumToJSON(value) {
    return value;
  }
  function ReasonTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/ReasonDto.ts
  function instanceOfReasonDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("reason" in value) || value["reason"] === void 0) return false;
    if (!("type" in value) || value["type"] === void 0) return false;
    if (!("ordinal" in value) || value["ordinal"] === void 0) return false;
    return true;
  }
  function ReasonDtoFromJSON(json) {
    return ReasonDtoFromJSONTyped(json, false);
  }
  function ReasonDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "reason": json["reason"],
      "type": ReasonTypeEnumFromJSON(json["type"]),
      "ordinal": json["ordinal"]
    };
  }
  function ReasonDtoToJSON(json) {
    return ReasonDtoToJSONTyped(json, false);
  }
  function ReasonDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "reason": value["reason"],
      "type": ReasonTypeEnumToJSON(value["type"]),
      "ordinal": value["ordinal"]
    };
  }

  // src/.source-sdk/models/DiscountTypeEnum.ts
  var DiscountTypeEnum = {
    Manual: "manual",
    Fixed: "fixed",
    EntitlementGroup: "entitlement_group"
  };
  function instanceOfDiscountTypeEnum(value) {
    for (const key in DiscountTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(DiscountTypeEnum, key)) {
        if (DiscountTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function DiscountTypeEnumFromJSON(json) {
    return DiscountTypeEnumFromJSONTyped(json, false);
  }
  function DiscountTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function DiscountTypeEnumToJSON(value) {
    return value;
  }
  function DiscountTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/SimpleDiscountDto.ts
  function instanceOfSimpleDiscountDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("type" in value) || value["type"] === void 0) return false;
    return true;
  }
  function SimpleDiscountDtoFromJSON(json) {
    return SimpleDiscountDtoFromJSONTyped(json, false);
  }
  function SimpleDiscountDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "name": json["name"],
      "type": DiscountTypeEnumFromJSON(json["type"]),
      "percentageValue": json["percentageValue"] == null ? void 0 : json["percentageValue"],
      "fixValue": json["fixValue"] == null ? void 0 : json["fixValue"]
    };
  }
  function SimpleDiscountDtoToJSON(json) {
    return SimpleDiscountDtoToJSONTyped(json, false);
  }
  function SimpleDiscountDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "name": value["name"],
      "type": DiscountTypeEnumToJSON(value["type"]),
      "percentageValue": value["percentageValue"],
      "fixValue": value["fixValue"]
    };
  }

  // src/.source-sdk/models/DiscountOnEnum.ts
  var DiscountOnEnum = {
    All: "all",
    Item: "item"
  };
  function instanceOfDiscountOnEnum(value) {
    for (const key in DiscountOnEnum) {
      if (Object.prototype.hasOwnProperty.call(DiscountOnEnum, key)) {
        if (DiscountOnEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function DiscountOnEnumFromJSON(json) {
    return DiscountOnEnumFromJSONTyped(json, false);
  }
  function DiscountOnEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function DiscountOnEnumToJSON(value) {
    return value;
  }
  function DiscountOnEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/CartDiscountDto.ts
  function instanceOfCartDiscountDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("cartId" in value) || value["cartId"] === void 0) return false;
    if (!("discountId" in value) || value["discountId"] === void 0) return false;
    if (!("discount" in value) || value["discount"] === void 0) return false;
    if (!("discountOn" in value) || value["discountOn"] === void 0) return false;
    if (!("discountAmount" in value) || value["discountAmount"] === void 0) return false;
    return true;
  }
  function CartDiscountDtoFromJSON(json) {
    return CartDiscountDtoFromJSONTyped(json, false);
  }
  function CartDiscountDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "cartId": json["cartId"],
      "cartItemsIds": json["cartItemsIds"] == null ? void 0 : json["cartItemsIds"],
      "discountId": json["discountId"],
      "discount": SimpleDiscountDtoFromJSON(json["discount"]),
      "reasonId": json["reasonId"] == null ? void 0 : json["reasonId"],
      "reason": json["reason"] == null ? void 0 : ReasonDtoFromJSON(json["reason"]),
      "percentage": json["percentage"] == null ? void 0 : json["percentage"],
      "discountOn": DiscountOnEnumFromJSON(json["discountOn"]),
      "discountAmount": json["discountAmount"],
      "actionId": json["actionId"] == null ? void 0 : json["actionId"],
      "parentId": json["parentId"] == null ? void 0 : json["parentId"]
    };
  }
  function CartDiscountDtoToJSON(json) {
    return CartDiscountDtoToJSONTyped(json, false);
  }
  function CartDiscountDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "cartId": value["cartId"],
      "cartItemsIds": value["cartItemsIds"],
      "discountId": value["discountId"],
      "discount": SimpleDiscountDtoToJSON(value["discount"]),
      "reasonId": value["reasonId"],
      "reason": ReasonDtoToJSON(value["reason"]),
      "percentage": value["percentage"],
      "discountOn": DiscountOnEnumToJSON(value["discountOn"]),
      "discountAmount": value["discountAmount"],
      "actionId": value["actionId"],
      "parentId": value["parentId"]
    };
  }

  // src/.source-sdk/models/CartPurchaseTypeEnum.ts
  var CartPurchaseTypeEnum = {
    Order: "order",
    Purchase: "purchase"
  };
  function instanceOfCartPurchaseTypeEnum(value) {
    for (const key in CartPurchaseTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(CartPurchaseTypeEnum, key)) {
        if (CartPurchaseTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function CartPurchaseTypeEnumFromJSON(json) {
    return CartPurchaseTypeEnumFromJSONTyped(json, false);
  }
  function CartPurchaseTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function CartPurchaseTypeEnumToJSON(value) {
    return value;
  }
  function CartPurchaseTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/ResourceNameTypeEnum.ts
  var ResourceNameTypeEnum = {
    Event: "event",
    Venue: "venue",
    Team: "team",
    League: "league",
    User: "user",
    Organization: "organization",
    App: "app",
    Feed: "feed",
    Match: "match",
    Round: "round",
    Portal: "portal",
    Season: "season",
    Tournament: "tournament",
    Membership: "membership",
    Division: "division",
    Gameslot: "gameslot",
    Space: "space",
    Reservation: "reservation",
    Invoice: "invoice",
    Customer: "customer",
    Package: "package",
    Facility: "facility",
    Program: "program",
    ProgramSeason: "program_season",
    Product: "product",
    Group: "group",
    Variant: "variant",
    Slot: "slot",
    Addon: "addon",
    Goods: "goods",
    Fee: "fee",
    PaymentMethod: "payment_method",
    Discount: "discount",
    Activity: "activity",
    ProgramType: "program_type",
    Tax: "tax",
    PunchPass: "punch_pass",
    Application: "application",
    Instructor: "instructor",
    Price: "price",
    Segment: "segment"
  };
  function instanceOfResourceNameTypeEnum(value) {
    for (const key in ResourceNameTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(ResourceNameTypeEnum, key)) {
        if (ResourceNameTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ResourceNameTypeEnumFromJSON(json) {
    return ResourceNameTypeEnumFromJSONTyped(json, false);
  }
  function ResourceNameTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ResourceNameTypeEnumToJSON(value) {
    return value;
  }
  function ResourceNameTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/CartItemDescriptionEnum.ts
  var CartItemDescriptionEnum = {
    ReservationAddon: "reservation_addon",
    SlotAddon: "slot_addon",
    HourAddon: "hour_addon",
    ReservationTypeRental: "reservation_type_rental",
    ReservationTypeLesson: "reservation_type_lesson",
    PerEventAddon: "per_event_addon",
    PerSegmentAddon: "per_segment_addon",
    GeneralAddon: "general_addon",
    Goods: "goods",
    PunchPass: "punch_pass",
    Membership: "membership",
    MembershipPackageChildItem: "membership_package_child_item",
    LeagueRegistration: "league_registration"
  };
  function instanceOfCartItemDescriptionEnum(value) {
    for (const key in CartItemDescriptionEnum) {
      if (Object.prototype.hasOwnProperty.call(CartItemDescriptionEnum, key)) {
        if (CartItemDescriptionEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function CartItemDescriptionEnumFromJSON(json) {
    return CartItemDescriptionEnumFromJSONTyped(json, false);
  }
  function CartItemDescriptionEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function CartItemDescriptionEnumToJSON(value) {
    return value;
  }
  function CartItemDescriptionEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/CartItemMetadataDto.ts
  function instanceOfCartItemMetadataDto(value) {
    return true;
  }
  function CartItemMetadataDtoFromJSON(json) {
    return CartItemMetadataDtoFromJSONTyped(json, false);
  }
  function CartItemMetadataDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "description": json["description"] == null ? void 0 : CartItemDescriptionEnumFromJSON(json["description"]),
      "isAddon": json["isAddon"] == null ? void 0 : json["isAddon"],
      "purchaseType": json["purchaseType"] == null ? void 0 : CartPurchaseTypeEnumFromJSON(json["purchaseType"])
    };
  }
  function CartItemMetadataDtoToJSON(json) {
    return CartItemMetadataDtoToJSONTyped(json, false);
  }
  function CartItemMetadataDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "description": CartItemDescriptionEnumToJSON(value["description"]),
      "isAddon": value["isAddon"],
      "purchaseType": CartPurchaseTypeEnumToJSON(value["purchaseType"])
    };
  }

  // src/.source-sdk/models/ProductSubTypesEnum.ts
  var ProductSubTypesEnum = {
    SeasonIndividual: "season_individual",
    SeasonTeam: "season_team",
    SeasonPerPlayer: "season_per_player",
    GroupRental: "group_rental",
    PerParticipantRental: "per_participant_rental",
    Rental: "rental",
    GatingMembership: "gating_membership",
    LeagueV2Captain: "league_v2_captain",
    LeagueV2InvitedPlayer: "league_v2_invited_player",
    LeagueV2Player: "league_v2_player",
    LeagueV2FreeAgent: "league_v2_free_agent",
    LeagueV2Organizer: "league_v2_organizer",
    LeagueV2Coach: "league_v2_coach"
  };
  function instanceOfProductSubTypesEnum(value) {
    for (const key in ProductSubTypesEnum) {
      if (Object.prototype.hasOwnProperty.call(ProductSubTypesEnum, key)) {
        if (ProductSubTypesEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ProductSubTypesEnumFromJSON(json) {
    return ProductSubTypesEnumFromJSONTyped(json, false);
  }
  function ProductSubTypesEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ProductSubTypesEnumToJSON(value) {
    return value;
  }
  function ProductSubTypesEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/MetaTypeEnum.ts
  var MetaTypeEnum = {
    Unspecified: "UNSPECIFIED",
    Group: "GROUP",
    Team: "TEAM"
  };
  function instanceOfMetaTypeEnum(value) {
    for (const key in MetaTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(MetaTypeEnum, key)) {
        if (MetaTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function MetaTypeEnumFromJSON(json) {
    return MetaTypeEnumFromJSONTyped(json, false);
  }
  function MetaTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function MetaTypeEnumToJSON(value) {
    return value;
  }
  function MetaTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/FolderContentRestrictionsDto.ts
  function instanceOfFolderContentRestrictionsDto(value) {
    return true;
  }
  function FolderContentRestrictionsDtoFromJSON(json) {
    return FolderContentRestrictionsDtoFromJSONTyped(json, false);
  }
  function FolderContentRestrictionsDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "maxSubfolderCount": json["maxSubfolderCount"] == null ? void 0 : json["maxSubfolderCount"],
      "maxSubfolderCountExemptionMetatypes": json["maxSubfolderCountExemptionMetatypes"] == null ? void 0 : json["maxSubfolderCountExemptionMetatypes"].map(MetaTypeEnumFromJSON),
      "maxUserCount": json["maxUserCount"] == null ? void 0 : json["maxUserCount"],
      "maxMaleUserCount": json["maxMaleUserCount"] == null ? void 0 : json["maxMaleUserCount"],
      "maxFemaleUserCount": json["maxFemaleUserCount"] == null ? void 0 : json["maxFemaleUserCount"],
      "maxUserCountExemptionParticipantTypes": json["maxUserCountExemptionParticipantTypes"] == null ? void 0 : json["maxUserCountExemptionParticipantTypes"].map(ProductSubTypesEnumFromJSON),
      "userBornOnOrBefore": json["userBornOnOrBefore"] == null ? void 0 : new Date(json["userBornOnOrBefore"]),
      "userBornOnOrAfter": json["userBornOnOrAfter"] == null ? void 0 : new Date(json["userBornOnOrAfter"]),
      "userMaxAgeAtRegistration": json["userMaxAgeAtRegistration"] == null ? void 0 : json["userMaxAgeAtRegistration"],
      "userMinAgeAtRegistration": json["userMinAgeAtRegistration"] == null ? void 0 : json["userMinAgeAtRegistration"],
      "userAgeRestrictionExemptionParticipantTypes": json["userAgeRestrictionExemptionParticipantTypes"] == null ? void 0 : json["userAgeRestrictionExemptionParticipantTypes"].map(ProductSubTypesEnumFromJSON),
      "userAllowedGenders": json["userAllowedGenders"] == null ? void 0 : json["userAllowedGenders"].map(GenderEnumFromJSON),
      "userAllowedGendersExemptionParticipantTypes": json["userAllowedGendersExemptionParticipantTypes"] == null ? void 0 : json["userAllowedGendersExemptionParticipantTypes"].map(ProductSubTypesEnumFromJSON)
    };
  }
  function FolderContentRestrictionsDtoToJSON(json) {
    return FolderContentRestrictionsDtoToJSONTyped(json, false);
  }
  function FolderContentRestrictionsDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "maxSubfolderCount": value["maxSubfolderCount"],
      "maxSubfolderCountExemptionMetatypes": value["maxSubfolderCountExemptionMetatypes"] == null ? void 0 : value["maxSubfolderCountExemptionMetatypes"].map(MetaTypeEnumToJSON),
      "maxUserCount": value["maxUserCount"],
      "maxMaleUserCount": value["maxMaleUserCount"],
      "maxFemaleUserCount": value["maxFemaleUserCount"],
      "maxUserCountExemptionParticipantTypes": value["maxUserCountExemptionParticipantTypes"] == null ? void 0 : value["maxUserCountExemptionParticipantTypes"].map(ProductSubTypesEnumToJSON),
      "userBornOnOrBefore": value["userBornOnOrBefore"] == null ? value["userBornOnOrBefore"] : value["userBornOnOrBefore"].toISOString(),
      "userBornOnOrAfter": value["userBornOnOrAfter"] == null ? value["userBornOnOrAfter"] : value["userBornOnOrAfter"].toISOString(),
      "userMaxAgeAtRegistration": value["userMaxAgeAtRegistration"],
      "userMinAgeAtRegistration": value["userMinAgeAtRegistration"],
      "userAgeRestrictionExemptionParticipantTypes": value["userAgeRestrictionExemptionParticipantTypes"] == null ? void 0 : value["userAgeRestrictionExemptionParticipantTypes"].map(ProductSubTypesEnumToJSON),
      "userAllowedGenders": value["userAllowedGenders"] == null ? void 0 : value["userAllowedGenders"].map(GenderEnumToJSON),
      "userAllowedGendersExemptionParticipantTypes": value["userAllowedGendersExemptionParticipantTypes"] == null ? void 0 : value["userAllowedGendersExemptionParticipantTypes"].map(ProductSubTypesEnumToJSON)
    };
  }

  // src/.source-sdk/models/FolderRestrictionsDto.ts
  function instanceOfFolderRestrictionsDto(value) {
    if (!("policyVersion" in value) || value["policyVersion"] === void 0) return false;
    return true;
  }
  function FolderRestrictionsDtoFromJSON(json) {
    return FolderRestrictionsDtoFromJSONTyped(json, false);
  }
  function FolderRestrictionsDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "policyVersion": json["policyVersion"],
      "folderContentRestrictions": json["folderContentRestrictions"] == null ? void 0 : FolderContentRestrictionsDtoFromJSON(json["folderContentRestrictions"]),
      "subfolderDefaultFolderContentRestrictions": json["subfolderDefaultFolderContentRestrictions"] == null ? void 0 : FolderContentRestrictionsDtoFromJSON(json["subfolderDefaultFolderContentRestrictions"])
    };
  }
  function FolderRestrictionsDtoToJSON(json) {
    return FolderRestrictionsDtoToJSONTyped(json, false);
  }
  function FolderRestrictionsDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "policyVersion": value["policyVersion"],
      "folderContentRestrictions": FolderContentRestrictionsDtoToJSON(value["folderContentRestrictions"]),
      "subfolderDefaultFolderContentRestrictions": FolderContentRestrictionsDtoToJSON(value["subfolderDefaultFolderContentRestrictions"])
    };
  }

  // src/.source-sdk/models/MediaTypesEnum.ts
  var MediaTypesEnum = {
    Image: "IMAGE",
    Video: "VIDEO",
    Gif: "GIF",
    Pdf: "PDF"
  };
  function instanceOfMediaTypesEnum(value) {
    for (const key in MediaTypesEnum) {
      if (Object.prototype.hasOwnProperty.call(MediaTypesEnum, key)) {
        if (MediaTypesEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function MediaTypesEnumFromJSON(json) {
    return MediaTypesEnumFromJSONTyped(json, false);
  }
  function MediaTypesEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function MediaTypesEnumToJSON(value) {
    return value;
  }
  function MediaTypesEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/MediaDto.ts
  function instanceOfMediaDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("url" in value) || value["url"] === void 0) return false;
    if (!("mediaType" in value) || value["mediaType"] === void 0) return false;
    return true;
  }
  function MediaDtoFromJSON(json) {
    return MediaDtoFromJSONTyped(json, false);
  }
  function MediaDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "url": json["url"],
      "mediaType": MediaTypesEnumFromJSON(json["mediaType"]),
      "fileType": json["fileType"] == null ? void 0 : json["fileType"],
      "name": json["name"] == null ? void 0 : json["name"],
      "title": json["title"] == null ? void 0 : json["title"],
      "mediaKey": json["mediaKey"] == null ? void 0 : json["mediaKey"],
      "description": json["description"] == null ? void 0 : json["description"],
      "provider": json["provider"] == null ? void 0 : json["provider"],
      "isDefault": json["isDefault"] == null ? void 0 : json["isDefault"],
      "creatorId": json["creatorId"] == null ? void 0 : json["creatorId"],
      "creatorType": json["creatorType"] == null ? void 0 : json["creatorType"],
      "userCreatorId": json["userCreatorId"] == null ? void 0 : json["userCreatorId"],
      "ownerId": json["ownerId"] == null ? void 0 : json["ownerId"],
      "createdBy": json["createdBy"] == null ? void 0 : json["createdBy"]
    };
  }
  function MediaDtoToJSON(json) {
    return MediaDtoToJSONTyped(json, false);
  }
  function MediaDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "url": value["url"],
      "mediaType": MediaTypesEnumToJSON(value["mediaType"]),
      "fileType": value["fileType"],
      "name": value["name"],
      "title": value["title"],
      "mediaKey": value["mediaKey"],
      "description": value["description"],
      "provider": value["provider"],
      "isDefault": value["isDefault"],
      "creatorId": value["creatorId"],
      "creatorType": value["creatorType"],
      "userCreatorId": value["userCreatorId"],
      "ownerId": value["ownerId"],
      "createdBy": value["createdBy"]
    };
  }

  // src/.source-sdk/models/ReferableType.ts
  var ReferableType = {
    ProgramSeason: "PROGRAM_SEASON"
  };
  function instanceOfReferableType(value) {
    for (const key in ReferableType) {
      if (Object.prototype.hasOwnProperty.call(ReferableType, key)) {
        if (ReferableType[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ReferableTypeFromJSON(json) {
    return ReferableTypeFromJSONTyped(json, false);
  }
  function ReferableTypeFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ReferableTypeToJSON(value) {
    return value;
  }
  function ReferableTypeToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/MetaType.ts
  var MetaType = {
    Unspecified: "UNSPECIFIED",
    Group: "GROUP",
    Team: "TEAM"
  };
  function instanceOfMetaType(value) {
    for (const key in MetaType) {
      if (Object.prototype.hasOwnProperty.call(MetaType, key)) {
        if (MetaType[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function MetaTypeFromJSON(json) {
    return MetaTypeFromJSONTyped(json, false);
  }
  function MetaTypeFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function MetaTypeToJSON(value) {
    return value;
  }
  function MetaTypeToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/CreateFolderDto.ts
  function instanceOfCreateFolderDto(value) {
    if (!("parentFolderId" in value) || value["parentFolderId"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    return true;
  }
  function CreateFolderDtoFromJSON(json) {
    return CreateFolderDtoFromJSONTyped(json, false);
  }
  function CreateFolderDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "parentFolderId": json["parentFolderId"],
      "name": json["name"],
      "category": json["category"] == null ? void 0 : json["category"],
      "organizationId": json["organizationId"] == null ? void 0 : json["organizationId"],
      "facilityId": json["facilityId"] == null ? void 0 : json["facilityId"],
      "referableType": json["referableType"] == null ? void 0 : ReferableTypeFromJSON(json["referableType"]),
      "referableId": json["referableId"] == null ? void 0 : json["referableId"],
      "mainMedia": json["mainMedia"] == null ? void 0 : MediaDtoFromJSON(json["mainMedia"]),
      "registrationAccess": json["registrationAccess"] == null ? void 0 : json["registrationAccess"],
      "metaType": json["metaType"] == null ? void 0 : MetaTypeFromJSON(json["metaType"]),
      "restrictions": json["restrictions"] == null ? void 0 : FolderRestrictionsDtoFromJSON(json["restrictions"])
    };
  }
  function CreateFolderDtoToJSON(json) {
    return CreateFolderDtoToJSONTyped(json, false);
  }
  function CreateFolderDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "parentFolderId": value["parentFolderId"],
      "name": value["name"],
      "category": value["category"],
      "organizationId": value["organizationId"],
      "facilityId": value["facilityId"],
      "referableType": ReferableTypeToJSON(value["referableType"]),
      "referableId": value["referableId"],
      "mainMedia": MediaDtoToJSON(value["mainMedia"]),
      "registrationAccess": value["registrationAccess"],
      "metaType": MetaTypeToJSON(value["metaType"]),
      "restrictions": FolderRestrictionsDtoToJSON(value["restrictions"])
    };
  }

  // src/.source-sdk/models/CloneFolderDto.ts
  function instanceOfCloneFolderDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("parentFolderId" in value) || value["parentFolderId"] === void 0) return false;
    return true;
  }
  function CloneFolderDtoFromJSON(json) {
    return CloneFolderDtoFromJSONTyped(json, false);
  }
  function CloneFolderDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "parentFolderId": json["parentFolderId"]
    };
  }
  function CloneFolderDtoToJSON(json) {
    return CloneFolderDtoToJSONTyped(json, false);
  }
  function CloneFolderDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "parentFolderId": value["parentFolderId"]
    };
  }

  // src/.source-sdk/models/FindOrCreateFolderDto.ts
  function instanceOfFindOrCreateFolderDto(value) {
    return true;
  }
  function FindOrCreateFolderDtoFromJSON(json) {
    return FindOrCreateFolderDtoFromJSONTyped(json, false);
  }
  function FindOrCreateFolderDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "folderId": json["folderId"] == null ? void 0 : json["folderId"],
      "cloneFolder": json["cloneFolder"] == null ? void 0 : CloneFolderDtoFromJSON(json["cloneFolder"]),
      "createFolder": json["createFolder"] == null ? void 0 : CreateFolderDtoFromJSON(json["createFolder"])
    };
  }
  function FindOrCreateFolderDtoToJSON(json) {
    return FindOrCreateFolderDtoToJSONTyped(json, false);
  }
  function FindOrCreateFolderDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "folderId": value["folderId"],
      "cloneFolder": CloneFolderDtoToJSON(value["cloneFolder"]),
      "createFolder": CreateFolderDtoToJSON(value["createFolder"])
    };
  }

  // src/.source-sdk/models/PurchaseResourceDto.ts
  function instanceOfPurchaseResourceDto(value) {
    if (!("type" in value) || value["type"] === void 0) return false;
    if (!("startDate" in value) || value["startDate"] === void 0) return false;
    return true;
  }
  function PurchaseResourceDtoFromJSON(json) {
    return PurchaseResourceDtoFromJSONTyped(json, false);
  }
  function PurchaseResourceDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"] == null ? void 0 : json["id"],
      "type": ResourceNameTypeEnumFromJSON(json["type"]),
      "startDate": new Date(json["startDate"]),
      "resourceIdToRenew": json["resourceIdToRenew"] == null ? void 0 : json["resourceIdToRenew"],
      "isAll": json["isAll"] == null ? void 0 : json["isAll"],
      "includedIds": json["includedIds"] == null ? void 0 : json["includedIds"],
      "excludedIds": json["excludedIds"] == null ? void 0 : json["excludedIds"],
      "findOrCreateFolder": json["findOrCreateFolder"] == null ? void 0 : FindOrCreateFolderDtoFromJSON(json["findOrCreateFolder"])
    };
  }
  function PurchaseResourceDtoToJSON(json) {
    return PurchaseResourceDtoToJSONTyped(json, false);
  }
  function PurchaseResourceDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "type": ResourceNameTypeEnumToJSON(value["type"]),
      "startDate": value["startDate"].toISOString(),
      "resourceIdToRenew": value["resourceIdToRenew"],
      "isAll": value["isAll"],
      "includedIds": value["includedIds"],
      "excludedIds": value["excludedIds"],
      "findOrCreateFolder": FindOrCreateFolderDtoToJSON(value["findOrCreateFolder"])
    };
  }

  // src/.source-sdk/models/ProductTypesEnum.ts
  var ProductTypesEnum = {
    Reservation: "reservation",
    Registration: "registration",
    Membership: "membership",
    Goods: "goods",
    Package: "package",
    Refund: "refund",
    CashOverShort: "cash_over_short",
    PettyCash: "petty_cash",
    LeagueRegistration: "league_registration",
    FolderedRegistration: "foldered_registration",
    Tax: "tax",
    ExtraParticipant: "extra_participant",
    Participant: "participant"
  };
  function instanceOfProductTypesEnum(value) {
    for (const key in ProductTypesEnum) {
      if (Object.prototype.hasOwnProperty.call(ProductTypesEnum, key)) {
        if (ProductTypesEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ProductTypesEnumFromJSON(json) {
    return ProductTypesEnumFromJSONTyped(json, false);
  }
  function ProductTypesEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ProductTypesEnumToJSON(value) {
    return value;
  }
  function ProductTypesEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/SportsEnum.ts
  var SportsEnum = {
    Softball: "SOFTBALL",
    Basketball: "BASKETBALL",
    Football: "FOOTBALL",
    Soccer: "SOCCER",
    Bowling: "BOWLING",
    Bocceball: "BOCCEBALL",
    Cornhole: "CORNHOLE",
    Dodgeball: "DODGEBALL",
    Frisbee: "FRISBEE",
    Hockey: "HOCKEY",
    Kickball: "KICKBALL",
    Lacrosse: "LACROSSE",
    Pingpong: "PINGPONG",
    Rugby: "RUGBY",
    Skeeball: "SKEEBALL",
    Tennis: "TENNIS",
    Volleyball: "VOLLEYBALL",
    Wiffleball: "WIFFLEBALL",
    Badminton: "BADMINTON",
    Fitness: "FITNESS",
    Golf: "GOLF",
    Pilates: "PILATES",
    Running: "RUNNING",
    Skiing: "SKIING",
    Snowboarding: "SNOWBOARDING",
    Yoga: "YOGA",
    Broomball: "BROOMBALL",
    Cricket: "CRICKET",
    Crossfit: "CROSSFIT",
    Cycling: "CYCLING",
    FieldHockey: "FIELD_HOCKEY",
    Racquetball: "RACQUETBALL",
    Spinning: "SPINNING",
    Squash: "SQUASH",
    Surfing: "SURFING",
    Swimming: "SWIMMING",
    WindSurfing: "WIND_SURFING",
    Adventure: "ADVENTURE",
    Boxing: "BOXING",
    Baseball: "BASEBALL",
    Dance: "DANCE",
    Kickboxing: "KICKBOXING",
    MartialArts: "MARTIAL_ARTS",
    Outdoors: "OUTDOORS",
    Rowing: "ROWING",
    Sailing: "SAILING",
    Sup: "SUP",
    Triathlon: "TRIATHLON",
    Handball: "HANDBALL",
    Catchball: "CATCHBALL",
    Blitzball: "BLITZBALL",
    RollerDerby: "ROLLER_DERBY",
    IceSkating: "ICE_SKATING",
    Pickleball: "PICKLEBALL",
    AxeThrowing: "AXE_THROWING",
    Futsal: "FUTSAL",
    Birthday: "BIRTHDAY",
    CorporateEvents: "CORPORATE_EVENTS",
    Curling: "CURLING",
    Gymnastics: "GYMNASTICS",
    FigureSkating: "FIGURE_SKATING",
    Cheer: "CHEER",
    Other: "OTHER"
  };
  function instanceOfSportsEnum(value) {
    for (const key in SportsEnum) {
      if (Object.prototype.hasOwnProperty.call(SportsEnum, key)) {
        if (SportsEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function SportsEnumFromJSON(json) {
    return SportsEnumFromJSONTyped(json, false);
  }
  function SportsEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function SportsEnumToJSON(value) {
    return value;
  }
  function SportsEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/ProgramTypesEnum.ts
  var ProgramTypesEnum = {
    League: "LEAGUE",
    Tournament: "TOURNAMENT",
    Class: "CLASS",
    Clinic: "CLINIC",
    Camp: "CAMP",
    Lesson: "LESSON",
    ClubTeam: "CLUB_TEAM",
    LeagueV2: "LEAGUE_V2",
    TournamentV2: "TOURNAMENT_V2"
  };
  function instanceOfProgramTypesEnum(value) {
    for (const key in ProgramTypesEnum) {
      if (Object.prototype.hasOwnProperty.call(ProgramTypesEnum, key)) {
        if (ProgramTypesEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ProgramTypesEnumFromJSON(json) {
    return ProgramTypesEnumFromJSONTyped(json, false);
  }
  function ProgramTypesEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ProgramTypesEnumToJSON(value) {
    return value;
  }
  function ProgramTypesEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/LevelOfPlayEnum.ts
  var LevelOfPlayEnum = {
    Beginner: "BEGINNER",
    Intermediate: "INTERMEDIATE",
    Advanced: "ADVANCED",
    Semipro: "SEMIPRO",
    Spectator: "SPECTATOR"
  };
  function instanceOfLevelOfPlayEnum(value) {
    for (const key in LevelOfPlayEnum) {
      if (Object.prototype.hasOwnProperty.call(LevelOfPlayEnum, key)) {
        if (LevelOfPlayEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function LevelOfPlayEnumFromJSON(json) {
    return LevelOfPlayEnumFromJSONTyped(json, false);
  }
  function LevelOfPlayEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function LevelOfPlayEnumToJSON(value) {
    return value;
  }
  function LevelOfPlayEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/PublishingStatusEnum.ts
  var PublishingStatusEnum = {
    Draft: "DRAFT",
    Published: "PUBLISHED",
    Closed: "CLOSED",
    Cancelled: "CANCELLED",
    Archive: "ARCHIVE",
    Unpublished: "UNPUBLISHED"
  };
  function instanceOfPublishingStatusEnum(value) {
    for (const key in PublishingStatusEnum) {
      if (Object.prototype.hasOwnProperty.call(PublishingStatusEnum, key)) {
        if (PublishingStatusEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function PublishingStatusEnumFromJSON(json) {
    return PublishingStatusEnumFromJSONTyped(json, false);
  }
  function PublishingStatusEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function PublishingStatusEnumToJSON(value) {
    return value;
  }
  function PublishingStatusEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/SimpleProgramDto.ts
  function instanceOfSimpleProgramDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    return true;
  }
  function SimpleProgramDtoFromJSON(json) {
    return SimpleProgramDtoFromJSONTyped(json, false);
  }
  function SimpleProgramDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "name": json["name"],
      "sport": json["sport"] == null ? void 0 : SportsEnumFromJSON(json["sport"]),
      "type": json["type"] == null ? void 0 : ProgramTypesEnumFromJSON(json["type"]),
      "status": json["status"] == null ? void 0 : PublishingStatusEnumFromJSON(json["status"]),
      "gender": json["gender"] == null ? void 0 : GenderEnumFromJSON(json["gender"]),
      "level": json["level"] == null ? void 0 : LevelOfPlayEnumFromJSON(json["level"]),
      "minAge": json["minAge"] == null ? void 0 : json["minAge"],
      "maxAge": json["maxAge"] == null ? void 0 : json["maxAge"]
    };
  }
  function SimpleProgramDtoToJSON(json) {
    return SimpleProgramDtoToJSONTyped(json, false);
  }
  function SimpleProgramDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "name": value["name"],
      "sport": SportsEnumToJSON(value["sport"]),
      "type": ProgramTypesEnumToJSON(value["type"]),
      "status": PublishingStatusEnumToJSON(value["status"]),
      "gender": GenderEnumToJSON(value["gender"]),
      "level": LevelOfPlayEnumToJSON(value["level"]),
      "minAge": value["minAge"],
      "maxAge": value["maxAge"]
    };
  }

  // src/.source-sdk/models/MembershipTypeEnum.ts
  var MembershipTypeEnum = {
    FixMembership: "fix_membership",
    RollingMembership: "rolling_membership"
  };
  function instanceOfMembershipTypeEnum(value) {
    for (const key in MembershipTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(MembershipTypeEnum, key)) {
        if (MembershipTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function MembershipTypeEnumFromJSON(json) {
    return MembershipTypeEnumFromJSONTyped(json, false);
  }
  function MembershipTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function MembershipTypeEnumToJSON(value) {
    return value;
  }
  function MembershipTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/CustomerInMembershipTypeEnum.ts
  var CustomerInMembershipTypeEnum = {
    Individual: "individual",
    Family: "family",
    Organization: "organization"
  };
  function instanceOfCustomerInMembershipTypeEnum(value) {
    for (const key in CustomerInMembershipTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(CustomerInMembershipTypeEnum, key)) {
        if (CustomerInMembershipTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function CustomerInMembershipTypeEnumFromJSON(json) {
    return CustomerInMembershipTypeEnumFromJSONTyped(json, false);
  }
  function CustomerInMembershipTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function CustomerInMembershipTypeEnumToJSON(value) {
    return value;
  }
  function CustomerInMembershipTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/SimpleMembershipDto.ts
  function instanceOfSimpleMembershipDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("customerTypes" in value) || value["customerTypes"] === void 0) return false;
    if (!("membershipType" in value) || value["membershipType"] === void 0) return false;
    if (!("importedId" in value) || value["importedId"] === void 0) return false;
    return true;
  }
  function SimpleMembershipDtoFromJSON(json) {
    return SimpleMembershipDtoFromJSONTyped(json, false);
  }
  function SimpleMembershipDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "name": json["name"],
      "description": json["description"] == null ? void 0 : json["description"],
      "tagline": json["tagline"] == null ? void 0 : json["tagline"],
      "customerTypes": json["customerTypes"].map(CustomerInMembershipTypeEnumFromJSON),
      "activity": json["activity"] == null ? void 0 : SportsEnumFromJSON(json["activity"]),
      "membershipType": MembershipTypeEnumFromJSON(json["membershipType"]),
      "importedId": json["importedId"],
      "relatedProductsIds": json["relatedProductsIds"] == null ? void 0 : json["relatedProductsIds"],
      "durationMonths": json["durationMonths"] == null ? void 0 : json["durationMonths"]
    };
  }
  function SimpleMembershipDtoToJSON(json) {
    return SimpleMembershipDtoToJSONTyped(json, false);
  }
  function SimpleMembershipDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "name": value["name"],
      "description": value["description"],
      "tagline": value["tagline"],
      "customerTypes": value["customerTypes"].map(CustomerInMembershipTypeEnumToJSON),
      "activity": SportsEnumToJSON(value["activity"]),
      "membershipType": MembershipTypeEnumToJSON(value["membershipType"]),
      "importedId": value["importedId"],
      "relatedProductsIds": value["relatedProductsIds"],
      "durationMonths": value["durationMonths"]
    };
  }

  // src/.source-sdk/models/SimpleResourceDto.ts
  function instanceOfSimpleResourceDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    return true;
  }
  function SimpleResourceDtoFromJSON(json) {
    return SimpleResourceDtoFromJSONTyped(json, false);
  }
  function SimpleResourceDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "name": json["name"],
      "type": json["type"] == null ? void 0 : ResourceNameTypeEnumFromJSON(json["type"])
    };
  }
  function SimpleResourceDtoToJSON(json) {
    return SimpleResourceDtoToJSONTyped(json, false);
  }
  function SimpleResourceDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "name": value["name"],
      "type": ResourceNameTypeEnumToJSON(value["type"])
    };
  }

  // src/.source-sdk/models/SimpleSessionDto.ts
  function instanceOfSimpleSessionDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("programId" in value) || value["programId"] === void 0) return false;
    if (!("status" in value) || value["status"] === void 0) return false;
    if (!("startDate" in value) || value["startDate"] === void 0) return false;
    if (!("endDate" in value) || value["endDate"] === void 0) return false;
    return true;
  }
  function SimpleSessionDtoFromJSON(json) {
    return SimpleSessionDtoFromJSONTyped(json, false);
  }
  function SimpleSessionDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "name": json["name"],
      "programId": json["programId"],
      "status": PublishingStatusEnumFromJSON(json["status"]),
      "startDate": new Date(json["startDate"]),
      "endDate": new Date(json["endDate"]),
      "programType": json["programType"] == null ? void 0 : ProgramTypesEnumFromJSON(json["programType"]),
      "productCount": json["productCount"] == null ? void 0 : json["productCount"],
      "gender": json["gender"] == null ? void 0 : GenderEnumFromJSON(json["gender"]),
      "level": json["level"] == null ? void 0 : LevelOfPlayEnumFromJSON(json["level"]),
      "minAge": json["minAge"] == null ? void 0 : json["minAge"],
      "maxAge": json["maxAge"] == null ? void 0 : json["maxAge"],
      "resources": json["resources"] == null ? void 0 : json["resources"].map(SimpleResourceDtoFromJSON)
    };
  }
  function SimpleSessionDtoToJSON(json) {
    return SimpleSessionDtoToJSONTyped(json, false);
  }
  function SimpleSessionDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "name": value["name"],
      "programId": value["programId"],
      "status": PublishingStatusEnumToJSON(value["status"]),
      "startDate": value["startDate"].toISOString(),
      "endDate": value["endDate"].toISOString(),
      "programType": ProgramTypesEnumToJSON(value["programType"]),
      "productCount": value["productCount"],
      "gender": GenderEnumToJSON(value["gender"]),
      "level": LevelOfPlayEnumToJSON(value["level"]),
      "minAge": value["minAge"],
      "maxAge": value["maxAge"],
      "resources": value["resources"] == null ? void 0 : value["resources"].map(SimpleResourceDtoToJSON)
    };
  }

  // src/.source-sdk/models/ProductResourceDto.ts
  function instanceOfProductResourceDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("type" in value) || value["type"] === void 0) return false;
    return true;
  }
  function ProductResourceDtoFromJSON(json) {
    return ProductResourceDtoFromJSONTyped(json, false);
  }
  function ProductResourceDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "name": json["name"],
      "type": ResourceNameTypeEnumFromJSON(json["type"]),
      "program": json["program"] == null ? void 0 : SimpleProgramDtoFromJSON(json["program"]),
      "parentSession": json["parentSession"] == null ? void 0 : SimpleSessionDtoFromJSON(json["parentSession"]),
      "membership": json["membership"] == null ? void 0 : SimpleMembershipDtoFromJSON(json["membership"])
    };
  }
  function ProductResourceDtoToJSON(json) {
    return ProductResourceDtoToJSONTyped(json, false);
  }
  function ProductResourceDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "name": value["name"],
      "type": ResourceNameTypeEnumToJSON(value["type"]),
      "program": SimpleProgramDtoToJSON(value["program"]),
      "parentSession": SimpleSessionDtoToJSON(value["parentSession"]),
      "membership": SimpleMembershipDtoToJSON(value["membership"])
    };
  }

  // src/.source-sdk/models/PaymentPlanStatusEnum.ts
  var PaymentPlanStatusEnum = {
    Active: "active",
    Inactive: "inactive"
  };
  function instanceOfPaymentPlanStatusEnum(value) {
    for (const key in PaymentPlanStatusEnum) {
      if (Object.prototype.hasOwnProperty.call(PaymentPlanStatusEnum, key)) {
        if (PaymentPlanStatusEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function PaymentPlanStatusEnumFromJSON(json) {
    return PaymentPlanStatusEnumFromJSONTyped(json, false);
  }
  function PaymentPlanStatusEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function PaymentPlanStatusEnumToJSON(value) {
    return value;
  }
  function PaymentPlanStatusEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/PaymentPlanScheduleDto.ts
  function instanceOfPaymentPlanScheduleDto(value) {
    if (!("date" in value) || value["date"] === void 0) return false;
    return true;
  }
  function PaymentPlanScheduleDtoFromJSON(json) {
    return PaymentPlanScheduleDtoFromJSONTyped(json, false);
  }
  function PaymentPlanScheduleDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "date": new Date(json["date"]),
      "percent": json["percent"] == null ? void 0 : json["percent"],
      "fixed": json["fixed"] == null ? void 0 : json["fixed"],
      "paymentDate": json["paymentDate"] == null ? void 0 : new Date(json["paymentDate"])
    };
  }
  function PaymentPlanScheduleDtoToJSON(json) {
    return PaymentPlanScheduleDtoToJSONTyped(json, false);
  }
  function PaymentPlanScheduleDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "date": value["date"].toISOString(),
      "percent": value["percent"],
      "fixed": value["fixed"],
      "paymentDate": value["paymentDate"] == null ? value["paymentDate"] : value["paymentDate"].toISOString()
    };
  }

  // src/.source-sdk/models/RepetitionUnit.ts
  var RepetitionUnit = {
    Day: "day",
    Week: "week",
    Month: "month",
    Quarter: "quarter",
    Year: "year"
  };
  function instanceOfRepetitionUnit(value) {
    for (const key in RepetitionUnit) {
      if (Object.prototype.hasOwnProperty.call(RepetitionUnit, key)) {
        if (RepetitionUnit[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function RepetitionUnitFromJSON(json) {
    return RepetitionUnitFromJSONTyped(json, false);
  }
  function RepetitionUnitFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function RepetitionUnitToJSON(value) {
    return value;
  }
  function RepetitionUnitToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/PaymentPlanTypeEnum.ts
  var PaymentPlanTypeEnum = {
    NoPlan: "no_plan",
    PaymentDate: "payment_date",
    Schedule: "schedule",
    Rolling: "rolling",
    Custom: "custom"
  };
  function instanceOfPaymentPlanTypeEnum(value) {
    for (const key in PaymentPlanTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(PaymentPlanTypeEnum, key)) {
        if (PaymentPlanTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function PaymentPlanTypeEnumFromJSON(json) {
    return PaymentPlanTypeEnumFromJSONTyped(json, false);
  }
  function PaymentPlanTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function PaymentPlanTypeEnumToJSON(value) {
    return value;
  }
  function PaymentPlanTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/PaymentPlanDto.ts
  function instanceOfPaymentPlanDto(value) {
    return true;
  }
  function PaymentPlanDtoFromJSON(json) {
    return PaymentPlanDtoFromJSONTyped(json, false);
  }
  function PaymentPlanDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "months": json["months"] == null ? void 0 : json["months"],
      "maxInstallments": json["maxInstallments"] == null ? void 0 : json["maxInstallments"],
      "dayOfMonth": json["dayOfMonth"] == null ? void 0 : json["dayOfMonth"],
      "schedule": json["schedule"] == null ? void 0 : json["schedule"].map(PaymentPlanScheduleDtoFromJSON),
      "status": json["status"] == null ? void 0 : PaymentPlanStatusEnumFromJSON(json["status"]),
      "paymentPlanType": json["paymentPlanType"] == null ? void 0 : PaymentPlanTypeEnumFromJSON(json["paymentPlanType"]),
      "startsInMonths": json["startsInMonths"] == null ? void 0 : json["startsInMonths"],
      "installmentRepeat": json["installmentRepeat"] == null ? void 0 : RepetitionUnitFromJSON(json["installmentRepeat"])
    };
  }
  function PaymentPlanDtoToJSON(json) {
    return PaymentPlanDtoToJSONTyped(json, false);
  }
  function PaymentPlanDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "months": value["months"],
      "maxInstallments": value["maxInstallments"],
      "dayOfMonth": value["dayOfMonth"],
      "schedule": value["schedule"] == null ? void 0 : value["schedule"].map(PaymentPlanScheduleDtoToJSON),
      "status": PaymentPlanStatusEnumToJSON(value["status"]),
      "paymentPlanType": PaymentPlanTypeEnumToJSON(value["paymentPlanType"]),
      "startsInMonths": value["startsInMonths"],
      "installmentRepeat": RepetitionUnitToJSON(value["installmentRepeat"])
    };
  }

  // src/.source-sdk/models/SimpleProductDto.ts
  function instanceOfSimpleProductDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    return true;
  }
  function SimpleProductDtoFromJSON(json) {
    return SimpleProductDtoFromJSONTyped(json, false);
  }
  function SimpleProductDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "name": json["name"],
      "productType": json["productType"] == null ? void 0 : ProductTypesEnumFromJSON(json["productType"]),
      "productSubType": json["productSubType"] == null ? void 0 : ProductSubTypesEnumFromJSON(json["productSubType"]),
      "productCategoryName": json["productCategoryName"] == null ? void 0 : json["productCategoryName"],
      "resource": json["resource"] == null ? void 0 : ProductResourceDtoFromJSON(json["resource"]),
      "productPaymentPlans": json["productPaymentPlans"] == null ? void 0 : json["productPaymentPlans"].map(PaymentPlanDtoFromJSON)
    };
  }
  function SimpleProductDtoToJSON(json) {
    return SimpleProductDtoToJSONTyped(json, false);
  }
  function SimpleProductDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "name": value["name"],
      "productType": ProductTypesEnumToJSON(value["productType"]),
      "productSubType": ProductSubTypesEnumToJSON(value["productSubType"]),
      "productCategoryName": value["productCategoryName"],
      "resource": ProductResourceDtoToJSON(value["resource"]),
      "productPaymentPlans": value["productPaymentPlans"] == null ? void 0 : value["productPaymentPlans"].map(PaymentPlanDtoToJSON)
    };
  }

  // src/.source-sdk/models/ParentResourceDto.ts
  function instanceOfParentResourceDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("type" in value) || value["type"] === void 0) return false;
    return true;
  }
  function ParentResourceDtoFromJSON(json) {
    return ParentResourceDtoFromJSONTyped(json, false);
  }
  function ParentResourceDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "name": json["name"],
      "type": ResourceNameTypeEnumFromJSON(json["type"])
    };
  }
  function ParentResourceDtoToJSON(json) {
    return ParentResourceDtoToJSONTyped(json, false);
  }
  function ParentResourceDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "name": value["name"],
      "type": ResourceNameTypeEnumToJSON(value["type"])
    };
  }

  // src/.source-sdk/models/CustomerFamilyStatusEnum.ts
  var CustomerFamilyStatusEnum = {
    Dependent: "dependent",
    Independent: "independent",
    Primary: "primary"
  };
  function instanceOfCustomerFamilyStatusEnum(value) {
    for (const key in CustomerFamilyStatusEnum) {
      if (Object.prototype.hasOwnProperty.call(CustomerFamilyStatusEnum, key)) {
        if (CustomerFamilyStatusEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function CustomerFamilyStatusEnumFromJSON(json) {
    return CustomerFamilyStatusEnumFromJSONTyped(json, false);
  }
  function CustomerFamilyStatusEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function CustomerFamilyStatusEnumToJSON(value) {
    return value;
  }
  function CustomerFamilyStatusEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/CustomerTypeEnum.ts
  var CustomerTypeEnum = {
    User: "user",
    Family: "family",
    Organization: "organization"
  };
  function instanceOfCustomerTypeEnum(value) {
    for (const key in CustomerTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(CustomerTypeEnum, key)) {
        if (CustomerTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function CustomerTypeEnumFromJSON(json) {
    return CustomerTypeEnumFromJSONTyped(json, false);
  }
  function CustomerTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function CustomerTypeEnumToJSON(value) {
    return value;
  }
  function CustomerTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/SimpleCustomerDto.ts
  function instanceOfSimpleCustomerDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("firstName" in value) || value["firstName"] === void 0) return false;
    if (!("lastName" in value) || value["lastName"] === void 0) return false;
    if (!("email" in value) || value["email"] === void 0) return false;
    if (!("entityId" in value) || value["entityId"] === void 0) return false;
    if (!("entityType" in value) || value["entityType"] === void 0) return false;
    if (!("colorCodeId" in value) || value["colorCodeId"] === void 0) return false;
    if (!("isAnonymous" in value) || value["isAnonymous"] === void 0) return false;
    return true;
  }
  function SimpleCustomerDtoFromJSON(json) {
    return SimpleCustomerDtoFromJSONTyped(json, false);
  }
  function SimpleCustomerDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "firstName": json["firstName"],
      "lastName": json["lastName"],
      "name": json["name"] == null ? void 0 : json["name"],
      "email": json["email"],
      "phone": json["phone"] == null ? void 0 : json["phone"],
      "entityId": json["entityId"],
      "entityType": CustomerTypeEnumFromJSON(json["entityType"]),
      "colorCodeId": json["colorCodeId"],
      "isAnonymous": json["isAnonymous"],
      "storedCredit": json["storedCredit"] == null ? void 0 : json["storedCredit"],
      "profilePicture": json["profilePicture"] == null ? void 0 : MediaDtoFromJSON(json["profilePicture"]),
      "familyStatus": json["familyStatus"] == null ? void 0 : CustomerFamilyStatusEnumFromJSON(json["familyStatus"])
    };
  }
  function SimpleCustomerDtoToJSON(json) {
    return SimpleCustomerDtoToJSONTyped(json, false);
  }
  function SimpleCustomerDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "firstName": value["firstName"],
      "lastName": value["lastName"],
      "name": value["name"],
      "email": value["email"],
      "phone": value["phone"],
      "entityId": value["entityId"],
      "entityType": CustomerTypeEnumToJSON(value["entityType"]),
      "colorCodeId": value["colorCodeId"],
      "isAnonymous": value["isAnonymous"],
      "storedCredit": value["storedCredit"],
      "profilePicture": MediaDtoToJSON(value["profilePicture"]),
      "familyStatus": CustomerFamilyStatusEnumToJSON(value["familyStatus"])
    };
  }

  // src/.source-sdk/models/CartItemDto.ts
  function instanceOfCartItemDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("cartId" in value) || value["cartId"] === void 0) return false;
    if (!("productId" in value) || value["productId"] === void 0) return false;
    if (!("price" in value) || value["price"] === void 0) return false;
    if (!("status" in value) || value["status"] === void 0) return false;
    return true;
  }
  function CartItemDtoFromJSON(json) {
    return CartItemDtoFromJSONTyped(json, false);
  }
  function CartItemDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "product": json["product"] == null ? void 0 : SimpleProductDtoFromJSON(json["product"]),
      "quantity": json["quantity"] == null ? void 0 : json["quantity"],
      "cartId": json["cartId"],
      "userId": json["userId"] == null ? void 0 : json["userId"],
      "customer": json["customer"] == null ? void 0 : SimpleCustomerDtoFromJSON(json["customer"]),
      "user": json["user"] == null ? void 0 : SimpleUserDtoFromJSON(json["user"]),
      "productId": json["productId"],
      "parentId": json["parentId"] == null ? void 0 : json["parentId"],
      "price": json["price"],
      "subtotal": json["subtotal"] == null ? void 0 : json["subtotal"],
      "unitPrice": json["unitPrice"] == null ? void 0 : json["unitPrice"],
      "status": CartStatusEnumFromJSON(json["status"]),
      "errors": json["errors"] == null ? void 0 : json["errors"],
      "ordinal": json["ordinal"] == null ? void 0 : json["ordinal"],
      "taxId": json["taxId"] == null ? void 0 : json["taxId"],
      "taxItems": json["taxItems"] == null ? void 0 : json["taxItems"].map(CartTaxDtoFromJSON),
      "discounts": json["discounts"] == null ? void 0 : json["discounts"].map(CartDiscountDtoFromJSON),
      "discountSubtotal": json["discountSubtotal"] == null ? void 0 : json["discountSubtotal"],
      "children": json["children"] == null ? void 0 : json["children"].map(CartItemDtoFromJSON),
      "resources": json["resources"] == null ? void 0 : json["resources"].map(PurchaseResourceDtoFromJSON),
      "parentResource": json["parentResource"] == null ? void 0 : ParentResourceDtoFromJSON(json["parentResource"]),
      "parentResourceType": json["parentResourceType"] == null ? void 0 : ResourceNameTypeEnumFromJSON(json["parentResourceType"]),
      "parentResourceId": json["parentResourceId"] == null ? void 0 : json["parentResourceId"],
      "metadata": json["metadata"] == null ? void 0 : CartItemMetadataDtoFromJSON(json["metadata"])
    };
  }
  function CartItemDtoToJSON(json) {
    return CartItemDtoToJSONTyped(json, false);
  }
  function CartItemDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "product": SimpleProductDtoToJSON(value["product"]),
      "quantity": value["quantity"],
      "cartId": value["cartId"],
      "userId": value["userId"],
      "customer": SimpleCustomerDtoToJSON(value["customer"]),
      "user": SimpleUserDtoToJSON(value["user"]),
      "productId": value["productId"],
      "parentId": value["parentId"],
      "price": value["price"],
      "subtotal": value["subtotal"],
      "unitPrice": value["unitPrice"],
      "status": CartStatusEnumToJSON(value["status"]),
      "errors": value["errors"],
      "ordinal": value["ordinal"],
      "taxId": value["taxId"],
      "taxItems": value["taxItems"] == null ? void 0 : value["taxItems"].map(CartTaxDtoToJSON),
      "discounts": value["discounts"] == null ? void 0 : value["discounts"].map(CartDiscountDtoToJSON),
      "discountSubtotal": value["discountSubtotal"],
      "children": value["children"] == null ? void 0 : value["children"].map(CartItemDtoToJSON),
      "resources": value["resources"] == null ? void 0 : value["resources"].map(PurchaseResourceDtoToJSON),
      "parentResource": ParentResourceDtoToJSON(value["parentResource"]),
      "parentResourceType": ResourceNameTypeEnumToJSON(value["parentResourceType"]),
      "parentResourceId": value["parentResourceId"],
      "metadata": CartItemMetadataDtoToJSON(value["metadata"])
    };
  }

  // src/.source-sdk/models/QuestionAnswersDto.ts
  function instanceOfQuestionAnswersDto(value) {
    if (!("questionId" in value) || value["questionId"] === void 0) return false;
    if (!("value" in value) || value["value"] === void 0) return false;
    return true;
  }
  function QuestionAnswersDtoFromJSON(json) {
    return QuestionAnswersDtoFromJSONTyped(json, false);
  }
  function QuestionAnswersDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "questionId": json["questionId"],
      "value": json["value"]
    };
  }
  function QuestionAnswersDtoToJSON(json) {
    return QuestionAnswersDtoToJSONTyped(json, false);
  }
  function QuestionAnswersDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "questionId": value["questionId"],
      "value": value["value"]
    };
  }

  // src/.source-sdk/models/UserAnswersDto.ts
  function instanceOfUserAnswersDto(value) {
    if (!("userId" in value) || value["userId"] === void 0) return false;
    if (!("answers" in value) || value["answers"] === void 0) return false;
    return true;
  }
  function UserAnswersDtoFromJSON(json) {
    return UserAnswersDtoFromJSONTyped(json, false);
  }
  function UserAnswersDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "userId": json["userId"],
      "answers": json["answers"].map(QuestionAnswersDtoFromJSON)
    };
  }
  function UserAnswersDtoToJSON(json) {
    return UserAnswersDtoToJSONTyped(json, false);
  }
  function UserAnswersDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "userId": value["userId"],
      "answers": value["answers"].map(QuestionAnswersDtoToJSON)
    };
  }

  // src/.source-sdk/models/OrganizationCartDto.ts
  function instanceOfOrganizationCartDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("price" in value) || value["price"] === void 0) return false;
    if (!("status" in value) || value["status"] === void 0) return false;
    if (!("ownerId" in value) || value["ownerId"] === void 0) return false;
    if (!("createdAt" in value) || value["createdAt"] === void 0) return false;
    if (!("state" in value) || value["state"] === void 0) return false;
    if (!("creatorId" in value) || value["creatorId"] === void 0) return false;
    if (!("owner" in value) || value["owner"] === void 0) return false;
    if (!("currency" in value) || value["currency"] === void 0) return false;
    if (!("platform" in value) || value["platform"] === void 0) return false;
    if (!("lastActiveTime" in value) || value["lastActiveTime"] === void 0) return false;
    if (!("lastFetchedTime" in value) || value["lastFetchedTime"] === void 0) return false;
    if (!("cartItems" in value) || value["cartItems"] === void 0) return false;
    if (!("taxes" in value) || value["taxes"] === void 0) return false;
    if (!("discounts" in value) || value["discounts"] === void 0) return false;
    return true;
  }
  function OrganizationCartDtoFromJSON(json) {
    return OrganizationCartDtoFromJSONTyped(json, false);
  }
  function OrganizationCartDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "price": json["price"],
      "status": CartStatusEnumFromJSON(json["status"]),
      "ownerId": json["ownerId"],
      "discountAmount": json["discountAmount"] == null ? void 0 : json["discountAmount"],
      "createdAt": new Date(json["createdAt"]),
      "state": CartStateEnumFromJSON(json["state"]),
      "creatorId": json["creatorId"],
      "owner": SimpleUserDtoFromJSON(json["owner"]),
      "customer": json["customer"] == null ? void 0 : SimpleCustomerDtoFromJSON(json["customer"]),
      "currency": CurrencyEnumFromJSON(json["currency"]),
      "shiftId": json["shiftId"] == null ? void 0 : json["shiftId"],
      "platform": PlatformsEnumFromJSON(json["platform"]),
      "answers": json["answers"] == null ? void 0 : json["answers"].map(UserAnswersDtoFromJSON),
      "lastActiveTime": new Date(json["lastActiveTime"]),
      "lastFetchedTime": new Date(json["lastFetchedTime"]),
      "cartItems": json["cartItems"].map(CartItemDtoFromJSON),
      "taxes": json["taxes"].map(CartTaxDtoFromJSON),
      "taxAmount": json["taxAmount"] == null ? void 0 : json["taxAmount"],
      "discounts": json["discounts"].map(CartDiscountDtoFromJSON),
      "discountSubtotal": json["discountSubtotal"] == null ? void 0 : json["discountSubtotal"],
      "subtotal": json["subtotal"] == null ? void 0 : json["subtotal"],
      "tippableAmount": json["tippableAmount"] == null ? void 0 : json["tippableAmount"],
      "downpayment": json["downpayment"] == null ? void 0 : json["downpayment"],
      "purchaseType": json["purchaseType"] == null ? void 0 : CartPurchaseTypeEnumFromJSON(json["purchaseType"]),
      "minimumPrice": json["minimumPrice"] == null ? void 0 : json["minimumPrice"],
      "minimumDownpayment": json["minimumDownpayment"] == null ? void 0 : json["minimumDownpayment"]
    };
  }
  function OrganizationCartDtoToJSON(json) {
    return OrganizationCartDtoToJSONTyped(json, false);
  }
  function OrganizationCartDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "price": value["price"],
      "status": CartStatusEnumToJSON(value["status"]),
      "ownerId": value["ownerId"],
      "discountAmount": value["discountAmount"],
      "createdAt": value["createdAt"].toISOString(),
      "state": CartStateEnumToJSON(value["state"]),
      "creatorId": value["creatorId"],
      "owner": SimpleUserDtoToJSON(value["owner"]),
      "customer": SimpleCustomerDtoToJSON(value["customer"]),
      "currency": CurrencyEnumToJSON(value["currency"]),
      "shiftId": value["shiftId"],
      "platform": PlatformsEnumToJSON(value["platform"]),
      "answers": value["answers"] == null ? void 0 : value["answers"].map(UserAnswersDtoToJSON),
      "lastActiveTime": value["lastActiveTime"].toISOString(),
      "lastFetchedTime": value["lastFetchedTime"].toISOString(),
      "cartItems": value["cartItems"].map(CartItemDtoToJSON),
      "taxes": value["taxes"].map(CartTaxDtoToJSON),
      "taxAmount": value["taxAmount"],
      "discounts": value["discounts"].map(CartDiscountDtoToJSON),
      "discountSubtotal": value["discountSubtotal"],
      "subtotal": value["subtotal"],
      "tippableAmount": value["tippableAmount"],
      "downpayment": value["downpayment"],
      "purchaseType": CartPurchaseTypeEnumToJSON(value["purchaseType"]),
      "minimumPrice": value["minimumPrice"],
      "minimumDownpayment": value["minimumDownpayment"]
    };
  }

  // src/.source-sdk/apis/CartsPublicApiApi.ts
  var CartsPublicApiApi = class extends BaseAPI {
    /**
     * Creates request options for closeCart without sending the request
     */
    async closeCartRequestOpts(requestParameters) {
      if (requestParameters["cartId"] == null) {
        throw new RequiredError(
          "cartId",
          'Required parameter "cartId" was null or undefined when calling closeCart().'
        );
      }
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling closeCart().'
        );
      }
      const queryParameters = {};
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/cart/{cartId}`;
      urlPath = urlPath.replace("{cartId}", encodeURIComponent(String(requestParameters["cartId"])));
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "DELETE",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Close cart
     * 
     */
    async closeCartRaw(requestParameters, initOverrides) {
      const requestOptions = await this.closeCartRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => GenericResponseDtoFromJSON(jsonValue));
    }
    /**
     * Close cart
     * 
     */
    async closeCart(requestParameters, initOverrides) {
      const response = await this.closeCartRaw(requestParameters, initOverrides);
      return await response.value();
    }
    /**
     * Creates request options for finalizeCart without sending the request
     */
    async finalizeCartRequestOpts(requestParameters) {
      if (requestParameters["cartId"] == null) {
        throw new RequiredError(
          "cartId",
          'Required parameter "cartId" was null or undefined when calling finalizeCart().'
        );
      }
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling finalizeCart().'
        );
      }
      if (requestParameters["basicPurchaseDto"] == null) {
        throw new RequiredError(
          "basicPurchaseDto",
          'Required parameter "basicPurchaseDto" was null or undefined when calling finalizeCart().'
        );
      }
      const queryParameters = {};
      const headerParameters = {};
      headerParameters["Content-Type"] = "application/json";
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/cart/{cartId}/finalize`;
      urlPath = urlPath.replace("{cartId}", encodeURIComponent(String(requestParameters["cartId"])));
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "POST",
        headers: headerParameters,
        query: queryParameters,
        body: BasicPurchaseDtoToJSON(requestParameters["basicPurchaseDto"])
      };
    }
    /**
     * Finalize cart
     * 
     */
    async finalizeCartRaw(requestParameters, initOverrides) {
      const requestOptions = await this.finalizeCartRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => FinalizeCart200ResponseFromJSON(jsonValue));
    }
    /**
     * Finalize cart
     * 
     */
    async finalizeCart(requestParameters, initOverrides) {
      const response = await this.finalizeCartRaw(requestParameters, initOverrides);
      return await response.value();
    }
    /**
     * Creates request options for getCart without sending the request
     */
    async getCartRequestOpts(requestParameters) {
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getCart().'
        );
      }
      if (requestParameters["cartId"] == null) {
        throw new RequiredError(
          "cartId",
          'Required parameter "cartId" was null or undefined when calling getCart().'
        );
      }
      const queryParameters = {};
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/cart/{cartId}`;
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      urlPath = urlPath.replace("{cartId}", encodeURIComponent(String(requestParameters["cartId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get user cart by Id
     * 
     */
    async getCartRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getCartRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => OrganizationCartDtoFromJSON(jsonValue));
    }
    /**
     * Get user cart by Id
     * 
     */
    async getCart(requestParameters, initOverrides) {
      const response = await this.getCartRaw(requestParameters, initOverrides);
      return await response.value();
    }
    /**
     * Creates request options for removeCartItem without sending the request
     */
    async removeCartItemRequestOpts(requestParameters) {
      if (requestParameters["cartItemId"] == null) {
        throw new RequiredError(
          "cartItemId",
          'Required parameter "cartItemId" was null or undefined when calling removeCartItem().'
        );
      }
      if (requestParameters["cartId"] == null) {
        throw new RequiredError(
          "cartId",
          'Required parameter "cartId" was null or undefined when calling removeCartItem().'
        );
      }
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling removeCartItem().'
        );
      }
      const queryParameters = {};
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/cart/{cartId}/cart-item/{cartItemId}`;
      urlPath = urlPath.replace("{cartItemId}", encodeURIComponent(String(requestParameters["cartItemId"])));
      urlPath = urlPath.replace("{cartId}", encodeURIComponent(String(requestParameters["cartId"])));
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "DELETE",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Remove cart-item from cart
     * 
     */
    async removeCartItemRaw(requestParameters, initOverrides) {
      const requestOptions = await this.removeCartItemRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => OrganizationCartDtoFromJSON(jsonValue));
    }
    /**
     * Remove cart-item from cart
     * 
     */
    async removeCartItem(requestParameters, initOverrides) {
      const response = await this.removeCartItemRaw(requestParameters, initOverrides);
      return await response.value();
    }
  };

  // src/.source-sdk/models/CreateBookingAddonDto.ts
  function instanceOfCreateBookingAddonDto(value) {
    if (!("productId" in value) || value["productId"] === void 0) return false;
    if (!("quantity" in value) || value["quantity"] === void 0) return false;
    return true;
  }
  function CreateBookingAddonDtoFromJSON(json) {
    return CreateBookingAddonDtoFromJSONTyped(json, false);
  }
  function CreateBookingAddonDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "productId": json["productId"],
      "quantity": json["quantity"]
    };
  }
  function CreateBookingAddonDtoToJSON(json) {
    return CreateBookingAddonDtoToJSONTyped(json, false);
  }
  function CreateBookingAddonDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "productId": value["productId"],
      "quantity": value["quantity"]
    };
  }

  // src/.source-sdk/models/CreateBookingTimeSlotDto.ts
  function instanceOfCreateBookingTimeSlotDto(value) {
    if (!("startDate" in value) || value["startDate"] === void 0) return false;
    if (!("startTime" in value) || value["startTime"] === void 0) return false;
    if (!("endDate" in value) || value["endDate"] === void 0) return false;
    if (!("endTime" in value) || value["endTime"] === void 0) return false;
    return true;
  }
  function CreateBookingTimeSlotDtoFromJSON(json) {
    return CreateBookingTimeSlotDtoFromJSONTyped(json, false);
  }
  function CreateBookingTimeSlotDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "startDate": json["startDate"],
      "startTime": json["startTime"],
      "endDate": json["endDate"],
      "endTime": json["endTime"]
    };
  }
  function CreateBookingTimeSlotDtoToJSON(json) {
    return CreateBookingTimeSlotDtoToJSONTyped(json, false);
  }
  function CreateBookingTimeSlotDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "startDate": value["startDate"],
      "startTime": value["startTime"],
      "endDate": value["endDate"],
      "endTime": value["endTime"]
    };
  }

  // src/.source-sdk/models/SportNameEnum.ts
  var SportNameEnum = {
    Softball: "softball",
    Basketball: "basketball",
    Football: "football",
    Soccer: "soccer",
    Bowling: "bowling",
    Bocceball: "bocceball",
    Cornhole: "cornhole",
    Dodgeball: "dodgeball",
    Frisbee: "frisbee",
    Hockey: "hockey",
    Kickball: "kickball",
    Lacrosse: "lacrosse",
    Pingpong: "pingpong",
    Rugby: "rugby",
    Skeeball: "skeeball",
    Tennis: "tennis",
    Volleyball: "volleyball",
    Wiffleball: "wiffleball",
    Badminton: "badminton",
    Fitness: "fitness",
    Golf: "golf",
    Pilates: "pilates",
    Running: "running",
    Skiing: "skiing",
    Snowboarding: "snowboarding",
    Yoga: "yoga",
    Broomball: "broomball",
    Cricket: "cricket",
    Crossfit: "crossfit",
    Cycling: "cycling",
    FieldHockey: "field_hockey",
    Racquetball: "racquetball",
    Spinning: "spinning",
    Squash: "squash",
    Surfing: "surfing",
    Swimming: "swimming",
    WindSurfing: "wind_surfing",
    Adventure: "adventure",
    Boxing: "boxing",
    Baseball: "baseball",
    Dance: "dance",
    Kickboxing: "kickboxing",
    MartialArts: "martial_arts",
    Outdoors: "outdoors",
    Rowing: "rowing",
    Sailing: "sailing",
    Sup: "sup",
    Triathlon: "triathlon",
    Handball: "handball",
    Catchball: "catchball",
    Blitzball: "blitzball",
    RollerDerby: "roller_derby",
    IceSkating: "ice_skating",
    Pickleball: "pickleball",
    AxeThrowing: "axe_throwing",
    Futsal: "futsal",
    Birthday: "birthday",
    CorporateEvents: "corporate_events",
    Curling: "curling",
    Gymnastics: "gymnastics",
    FigureSkating: "figure_skating",
    Cheer: "cheer",
    Other: "other"
  };
  function instanceOfSportNameEnum(value) {
    for (const key in SportNameEnum) {
      if (Object.prototype.hasOwnProperty.call(SportNameEnum, key)) {
        if (SportNameEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function SportNameEnumFromJSON(json) {
    return SportNameEnumFromJSONTyped(json, false);
  }
  function SportNameEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function SportNameEnumToJSON(value) {
    return value;
  }
  function SportNameEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/CreateBookingSegmentDto.ts
  function instanceOfCreateBookingSegmentDto(value) {
    if (!("spaceId" in value) || value["spaceId"] === void 0) return false;
    if (!("activity" in value) || value["activity"] === void 0) return false;
    if (!("facilityId" in value) || value["facilityId"] === void 0) return false;
    if (!("productId" in value) || value["productId"] === void 0) return false;
    if (!("slots" in value) || value["slots"] === void 0) return false;
    return true;
  }
  function CreateBookingSegmentDtoFromJSON(json) {
    return CreateBookingSegmentDtoFromJSONTyped(json, false);
  }
  function CreateBookingSegmentDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "name": json["name"] == null ? void 0 : json["name"],
      "spaceId": json["spaceId"],
      "activity": SportNameEnumFromJSON(json["activity"]),
      "instructorId": json["instructorId"] == null ? void 0 : json["instructorId"],
      "facilityId": json["facilityId"],
      "productId": json["productId"],
      "slots": json["slots"].map(CreateBookingTimeSlotDtoFromJSON),
      "addons": json["addons"] == null ? void 0 : json["addons"].map(CreateBookingAddonDtoFromJSON)
    };
  }
  function CreateBookingSegmentDtoToJSON(json) {
    return CreateBookingSegmentDtoToJSONTyped(json, false);
  }
  function CreateBookingSegmentDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "name": value["name"],
      "spaceId": value["spaceId"],
      "activity": SportNameEnumToJSON(value["activity"]),
      "instructorId": value["instructorId"],
      "facilityId": value["facilityId"],
      "productId": value["productId"],
      "slots": value["slots"].map(CreateBookingTimeSlotDtoToJSON),
      "addons": value["addons"] == null ? void 0 : value["addons"].map(CreateBookingAddonDtoToJSON)
    };
  }

  // src/.source-sdk/models/AddCartItemDto.ts
  function instanceOfAddCartItemDto(value) {
    if (!("productId" in value) || value["productId"] === void 0) return false;
    return true;
  }
  function AddCartItemDtoFromJSON(json) {
    return AddCartItemDtoFromJSONTyped(json, false);
  }
  function AddCartItemDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "quantity": json["quantity"] == null ? void 0 : json["quantity"],
      "userId": json["userId"] == null ? void 0 : json["userId"],
      "resources": json["resources"] == null ? void 0 : json["resources"].map(PurchaseResourceDtoFromJSON),
      "productId": json["productId"],
      "unitPrice": json["unitPrice"] == null ? void 0 : json["unitPrice"],
      "parentResourceType": json["parentResourceType"] == null ? void 0 : ResourceNameTypeEnumFromJSON(json["parentResourceType"]),
      "parentResourceId": json["parentResourceId"] == null ? void 0 : json["parentResourceId"],
      "children": json["children"] == null ? void 0 : json["children"].map(AddCartItemDtoFromJSON)
    };
  }
  function AddCartItemDtoToJSON(json) {
    return AddCartItemDtoToJSONTyped(json, false);
  }
  function AddCartItemDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "quantity": value["quantity"],
      "userId": value["userId"],
      "resources": value["resources"] == null ? void 0 : value["resources"].map(PurchaseResourceDtoToJSON),
      "productId": value["productId"],
      "unitPrice": value["unitPrice"],
      "parentResourceType": ResourceNameTypeEnumToJSON(value["parentResourceType"]),
      "parentResourceId": value["parentResourceId"],
      "children": value["children"] == null ? void 0 : value["children"].map(AddCartItemDtoToJSON)
    };
  }

  // src/.source-sdk/models/CreateBookingDto.ts
  function instanceOfCreateBookingDto(value) {
    if (!("userId" in value) || value["userId"] === void 0) return false;
    if (!("segments" in value) || value["segments"] === void 0) return false;
    return true;
  }
  function CreateBookingDtoFromJSON(json) {
    return CreateBookingDtoFromJSONTyped(json, false);
  }
  function CreateBookingDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "name": json["name"] == null ? void 0 : json["name"],
      "userId": json["userId"],
      "segments": json["segments"].map(CreateBookingSegmentDtoFromJSON),
      "addons": json["addons"] == null ? void 0 : json["addons"].map(CreateBookingAddonDtoFromJSON),
      "cartId": json["cartId"] == null ? void 0 : json["cartId"],
      "answers": json["answers"] == null ? void 0 : json["answers"].map(UserAnswersDtoFromJSON),
      "requiredProducts": json["requiredProducts"] == null ? void 0 : json["requiredProducts"].map(AddCartItemDtoFromJSON)
    };
  }
  function CreateBookingDtoToJSON(json) {
    return CreateBookingDtoToJSONTyped(json, false);
  }
  function CreateBookingDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "name": value["name"],
      "userId": value["userId"],
      "segments": value["segments"].map(CreateBookingSegmentDtoToJSON),
      "addons": value["addons"] == null ? void 0 : value["addons"].map(CreateBookingAddonDtoToJSON),
      "cartId": value["cartId"],
      "answers": value["answers"] == null ? void 0 : value["answers"].map(UserAnswersDtoToJSON),
      "requiredProducts": value["requiredProducts"] == null ? void 0 : value["requiredProducts"].map(AddCartItemDtoToJSON)
    };
  }

  // src/.source-sdk/models/BasicTimeSlotDto.ts
  function instanceOfBasicTimeSlotDto(value) {
    if (!("startDate" in value) || value["startDate"] === void 0) return false;
    if (!("startTime" in value) || value["startTime"] === void 0) return false;
    if (!("endDate" in value) || value["endDate"] === void 0) return false;
    if (!("endTime" in value) || value["endTime"] === void 0) return false;
    return true;
  }
  function BasicTimeSlotDtoFromJSON(json) {
    return BasicTimeSlotDtoFromJSONTyped(json, false);
  }
  function BasicTimeSlotDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "resourceId": json["resourceId"] == null ? void 0 : json["resourceId"],
      "startDate": json["startDate"],
      "startTime": json["startTime"],
      "endDate": json["endDate"],
      "endTime": json["endTime"]
    };
  }
  function BasicTimeSlotDtoToJSON(json) {
    return BasicTimeSlotDtoToJSONTyped(json, false);
  }
  function BasicTimeSlotDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "resourceId": value["resourceId"],
      "startDate": value["startDate"],
      "startTime": value["startTime"],
      "endDate": value["endDate"],
      "endTime": value["endTime"]
    };
  }

  // src/.source-sdk/models/MembershipStatusEnum.ts
  var MembershipStatusEnum = {
    Active: "active",
    ActiveCancelled: "active_cancelled",
    PausedCancelled: "paused_cancelled",
    Cancelled: "cancelled",
    Expired: "expired",
    Paused: "paused",
    PausePending: "pause_pending",
    Pending: "pending",
    None: "none"
  };
  function instanceOfMembershipStatusEnum(value) {
    for (const key in MembershipStatusEnum) {
      if (Object.prototype.hasOwnProperty.call(MembershipStatusEnum, key)) {
        if (MembershipStatusEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function MembershipStatusEnumFromJSON(json) {
    return MembershipStatusEnumFromJSONTyped(json, false);
  }
  function MembershipStatusEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function MembershipStatusEnumToJSON(value) {
    return value;
  }
  function MembershipStatusEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/BasicMembershipMemberDto.ts
  function instanceOfBasicMembershipMemberDto(value) {
    if (!("userId" in value) || value["userId"] === void 0) return false;
    if (!("membershipId" in value) || value["membershipId"] === void 0) return false;
    if (!("status" in value) || value["status"] === void 0) return false;
    return true;
  }
  function BasicMembershipMemberDtoFromJSON(json) {
    return BasicMembershipMemberDtoFromJSONTyped(json, false);
  }
  function BasicMembershipMemberDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "userId": json["userId"],
      "membershipId": json["membershipId"],
      "status": MembershipStatusEnumFromJSON(json["status"])
    };
  }
  function BasicMembershipMemberDtoToJSON(json) {
    return BasicMembershipMemberDtoToJSONTyped(json, false);
  }
  function BasicMembershipMemberDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "userId": value["userId"],
      "membershipId": value["membershipId"],
      "status": MembershipStatusEnumToJSON(value["status"])
    };
  }

  // src/.source-sdk/models/TimeUnit.ts
  var TimeUnit = {
    Day: "day",
    Week: "week",
    Month: "month",
    Year: "year",
    Minute: "minute",
    Hour: "hour",
    Second: "second"
  };
  function instanceOfTimeUnit(value) {
    for (const key in TimeUnit) {
      if (Object.prototype.hasOwnProperty.call(TimeUnit, key)) {
        if (TimeUnit[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function TimeUnitFromJSON(json) {
    return TimeUnitFromJSONTyped(json, false);
  }
  function TimeUnitFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function TimeUnitToJSON(value) {
    return value;
  }
  function TimeUnitToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/DurationDto.ts
  function instanceOfDurationDto(value) {
    if (!("amount" in value) || value["amount"] === void 0) return false;
    if (!("unit" in value) || value["unit"] === void 0) return false;
    return true;
  }
  function DurationDtoFromJSON(json) {
    return DurationDtoFromJSONTyped(json, false);
  }
  function DurationDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "amount": json["amount"],
      "unit": TimeUnitFromJSON(json["unit"])
    };
  }
  function DurationDtoToJSON(json) {
    return DurationDtoToJSONTyped(json, false);
  }
  function DurationDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "amount": value["amount"],
      "unit": TimeUnitToJSON(value["unit"])
    };
  }

  // src/.source-sdk/models/OnlineBookingSettingsDto.ts
  function instanceOfOnlineBookingSettingsDto(value) {
    if (!("advanceBookingWindow" in value) || value["advanceBookingWindow"] === void 0) return false;
    if (!("minimumBookingNotice" in value) || value["minimumBookingNotice"] === void 0) return false;
    return true;
  }
  function OnlineBookingSettingsDtoFromJSON(json) {
    return OnlineBookingSettingsDtoFromJSONTyped(json, false);
  }
  function OnlineBookingSettingsDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "advanceBookingWindow": DurationDtoFromJSON(json["advanceBookingWindow"]),
      "maxSequentialBookings": json["maxSequentialBookings"] == null ? void 0 : DurationDtoFromJSON(json["maxSequentialBookings"]),
      "minimumBookingNotice": DurationDtoFromJSON(json["minimumBookingNotice"]),
      "maxBookingHours": json["maxBookingHours"] == null ? void 0 : DurationDtoFromJSON(json["maxBookingHours"])
    };
  }
  function OnlineBookingSettingsDtoToJSON(json) {
    return OnlineBookingSettingsDtoToJSONTyped(json, false);
  }
  function OnlineBookingSettingsDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "advanceBookingWindow": DurationDtoToJSON(value["advanceBookingWindow"]),
      "maxSequentialBookings": DurationDtoToJSON(value["maxSequentialBookings"]),
      "minimumBookingNotice": DurationDtoToJSON(value["minimumBookingNotice"]),
      "maxBookingHours": DurationDtoToJSON(value["maxBookingHours"])
    };
  }

  // src/.source-sdk/models/UserBookingInformationDto.ts
  function instanceOfUserBookingInformationDto(value) {
    if (!("slots" in value) || value["slots"] === void 0) return false;
    if (!("members" in value) || value["members"] === void 0) return false;
    if (!("settings" in value) || value["settings"] === void 0) return false;
    return true;
  }
  function UserBookingInformationDtoFromJSON(json) {
    return UserBookingInformationDtoFromJSONTyped(json, false);
  }
  function UserBookingInformationDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "slots": json["slots"].map(BasicTimeSlotDtoFromJSON),
      "members": json["members"].map(BasicMembershipMemberDtoFromJSON),
      "settings": OnlineBookingSettingsDtoFromJSON(json["settings"])
    };
  }
  function UserBookingInformationDtoToJSON(json) {
    return UserBookingInformationDtoToJSONTyped(json, false);
  }
  function UserBookingInformationDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "slots": value["slots"].map(BasicTimeSlotDtoToJSON),
      "members": value["members"].map(BasicMembershipMemberDtoToJSON),
      "settings": OnlineBookingSettingsDtoToJSON(value["settings"])
    };
  }

  // src/.source-sdk/apis/OnlineBookingPublicApiApi.ts
  var OnlineBookingPublicApiApi = class extends BaseAPI {
    /**
     * Creates request options for cartReservation without sending the request
     */
    async cartReservationRequestOpts(requestParameters) {
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling cartReservation().'
        );
      }
      if (requestParameters["createBookingDto"] == null) {
        throw new RequiredError(
          "createBookingDto",
          'Required parameter "createBookingDto" was null or undefined when calling cartReservation().'
        );
      }
      const queryParameters = {};
      const headerParameters = {};
      headerParameters["Content-Type"] = "application/json";
      if (requestParameters["xBondUserIdToken"] != null) {
        headerParameters["X-BondUserIdToken"] = String(requestParameters["xBondUserIdToken"]);
      }
      if (requestParameters["xBondUserAccessToken"] != null) {
        headerParameters["X-BondUserAccessToken"] = String(requestParameters["xBondUserAccessToken"]);
      }
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/online-booking/create`;
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "POST",
        headers: headerParameters,
        query: queryParameters,
        body: CreateBookingDtoToJSON(requestParameters["createBookingDto"])
      };
    }
    /**
     * Create reservation and cart
     * 
     */
    async cartReservationRaw(requestParameters, initOverrides) {
      const requestOptions = await this.cartReservationRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => OrganizationCartDtoFromJSON(jsonValue));
    }
    /**
     * Create reservation and cart
     * 
     */
    async cartReservation(requestParameters, initOverrides) {
      const response = await this.cartReservationRaw(requestParameters, initOverrides);
      return await response.value();
    }
    /**
     * Creates request options for getUserBookingInformation without sending the request
     */
    async getUserBookingInformationRequestOpts(requestParameters) {
      if (requestParameters["userId"] == null) {
        throw new RequiredError(
          "userId",
          'Required parameter "userId" was null or undefined when calling getUserBookingInformation().'
        );
      }
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getUserBookingInformation().'
        );
      }
      if (requestParameters["startDate"] == null) {
        throw new RequiredError(
          "startDate",
          'Required parameter "startDate" was null or undefined when calling getUserBookingInformation().'
        );
      }
      if (requestParameters["endDate"] == null) {
        throw new RequiredError(
          "endDate",
          'Required parameter "endDate" was null or undefined when calling getUserBookingInformation().'
        );
      }
      if (requestParameters["categoryId"] == null) {
        throw new RequiredError(
          "categoryId",
          'Required parameter "categoryId" was null or undefined when calling getUserBookingInformation().'
        );
      }
      if (requestParameters["facilityId"] == null) {
        throw new RequiredError(
          "facilityId",
          'Required parameter "facilityId" was null or undefined when calling getUserBookingInformation().'
        );
      }
      const queryParameters = {};
      if (requestParameters["startDate"] != null) {
        queryParameters["startDate"] = requestParameters["startDate"];
      }
      if (requestParameters["endDate"] != null) {
        queryParameters["endDate"] = requestParameters["endDate"];
      }
      if (requestParameters["categoryId"] != null) {
        queryParameters["categoryId"] = requestParameters["categoryId"];
      }
      if (requestParameters["facilityId"] != null) {
        queryParameters["facilityId"] = requestParameters["facilityId"];
      }
      const headerParameters = {};
      if (requestParameters["xBondUserIdToken"] != null) {
        headerParameters["X-BondUserIdToken"] = String(requestParameters["xBondUserIdToken"]);
      }
      if (requestParameters["xBondUserAccessToken"] != null) {
        headerParameters["X-BondUserAccessToken"] = String(requestParameters["xBondUserAccessToken"]);
      }
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/online-booking/user/{userId}/booking-information`;
      urlPath = urlPath.replace("{userId}", encodeURIComponent(String(requestParameters["userId"])));
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get user booking information
     * 
     */
    async getUserBookingInformationRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getUserBookingInformationRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => UserBookingInformationDtoFromJSON(jsonValue));
    }
    /**
     * Get user booking information
     * 
     */
    async getUserBookingInformation(requestParameters, initOverrides) {
      const response = await this.getUserBookingInformationRaw(requestParameters, initOverrides);
      return await response.value();
    }
  };

  // src/.source-sdk/models/OnlineBookingViewsEnum.ts
  var OnlineBookingViewsEnum = {
    List: "list",
    Calendar: "calendar",
    Matrix: "matrix"
  };
  function instanceOfOnlineBookingViewsEnum(value) {
    for (const key in OnlineBookingViewsEnum) {
      if (Object.prototype.hasOwnProperty.call(OnlineBookingViewsEnum, key)) {
        if (OnlineBookingViewsEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function OnlineBookingViewsEnumFromJSON(json) {
    return OnlineBookingViewsEnumFromJSONTyped(json, false);
  }
  function OnlineBookingViewsEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function OnlineBookingViewsEnumToJSON(value) {
    return value;
  }
  function OnlineBookingViewsEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/ReservationProductCategoryDto.ts
  function instanceOfReservationProductCategoryDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("productType" in value) || value["productType"] === void 0) return false;
    return true;
  }
  function ReservationProductCategoryDtoFromJSON(json) {
    return ReservationProductCategoryDtoFromJSONTyped(json, false);
  }
  function ReservationProductCategoryDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "name": json["name"] == null ? void 0 : json["name"],
      "description": json["description"] == null ? void 0 : json["description"],
      "productType": ProductTypesEnumFromJSON(json["productType"]),
      "settings": json["settings"] == null ? void 0 : json["settings"]
    };
  }
  function ReservationProductCategoryDtoToJSON(json) {
    return ReservationProductCategoryDtoToJSONTyped(json, false);
  }
  function ReservationProductCategoryDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "name": value["name"],
      "description": value["description"],
      "productType": ProductTypesEnumToJSON(value["productType"]),
      "settings": value["settings"]
    };
  }

  // src/.source-sdk/models/SimpleMediaDto.ts
  function instanceOfSimpleMediaDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("url" in value) || value["url"] === void 0) return false;
    if (!("mediaType" in value) || value["mediaType"] === void 0) return false;
    return true;
  }
  function SimpleMediaDtoFromJSON(json) {
    return SimpleMediaDtoFromJSONTyped(json, false);
  }
  function SimpleMediaDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "url": json["url"],
      "mediaType": MediaTypesEnumFromJSON(json["mediaType"]),
      "fileType": json["fileType"] == null ? void 0 : json["fileType"],
      "name": json["name"] == null ? void 0 : json["name"]
    };
  }
  function SimpleMediaDtoToJSON(json) {
    return SimpleMediaDtoToJSONTyped(json, false);
  }
  function SimpleMediaDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "url": value["url"],
      "mediaType": MediaTypesEnumToJSON(value["mediaType"]),
      "fileType": value["fileType"],
      "name": value["name"]
    };
  }

  // src/.source-sdk/models/OpeningTimeDto.ts
  function instanceOfOpeningTimeDto(value) {
    if (!("open" in value) || value["open"] === void 0) return false;
    if (!("close" in value) || value["close"] === void 0) return false;
    if (!("dayOfWeek" in value) || value["dayOfWeek"] === void 0) return false;
    return true;
  }
  function OpeningTimeDtoFromJSON(json) {
    return OpeningTimeDtoFromJSONTyped(json, false);
  }
  function OpeningTimeDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "open": json["open"],
      "close": json["close"],
      "dayOfWeek": json["dayOfWeek"]
    };
  }
  function OpeningTimeDtoToJSON(json) {
    return OpeningTimeDtoToJSONTyped(json, false);
  }
  function OpeningTimeDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "open": value["open"],
      "close": value["close"],
      "dayOfWeek": value["dayOfWeek"]
    };
  }

  // src/.source-sdk/models/ExtendedFacilityDto.ts
  function instanceOfExtendedFacilityDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    return true;
  }
  function ExtendedFacilityDtoFromJSON(json) {
    return ExtendedFacilityDtoFromJSONTyped(json, false);
  }
  function ExtendedFacilityDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "name": json["name"],
      "timezone": json["timezone"] == null ? void 0 : json["timezone"],
      "mainMedia": json["mainMedia"] == null ? void 0 : SimpleMediaDtoFromJSON(json["mainMedia"]),
      "description": json["description"] == null ? void 0 : json["description"],
      "openingTimes": json["openingTimes"] == null ? void 0 : json["openingTimes"].map(OpeningTimeDtoFromJSON),
      "linkSEO": json["linkSEO"] == null ? void 0 : json["linkSEO"]
    };
  }
  function ExtendedFacilityDtoToJSON(json) {
    return ExtendedFacilityDtoToJSONTyped(json, false);
  }
  function ExtendedFacilityDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "name": value["name"],
      "timezone": value["timezone"],
      "mainMedia": SimpleMediaDtoToJSON(value["mainMedia"]),
      "description": value["description"],
      "openingTimes": value["openingTimes"] == null ? void 0 : value["openingTimes"].map(OpeningTimeDtoToJSON),
      "linkSEO": value["linkSEO"]
    };
  }

  // src/.source-sdk/models/ExtendedOnlineBookingPortalOptionsDto.ts
  function instanceOfExtendedOnlineBookingPortalOptionsDto(value) {
    if (!("defaultFacility" in value) || value["defaultFacility"] === void 0) return false;
    if (!("facilities" in value) || value["facilities"] === void 0) return false;
    if (!("defaultCategory" in value) || value["defaultCategory"] === void 0) return false;
    if (!("categories" in value) || value["categories"] === void 0) return false;
    if (!("defaultActivity" in value) || value["defaultActivity"] === void 0) return false;
    if (!("activities" in value) || value["activities"] === void 0) return false;
    if (!("defaultView" in value) || value["defaultView"] === void 0) return false;
    if (!("views" in value) || value["views"] === void 0) return false;
    return true;
  }
  function ExtendedOnlineBookingPortalOptionsDtoFromJSON(json) {
    return ExtendedOnlineBookingPortalOptionsDtoFromJSONTyped(json, false);
  }
  function ExtendedOnlineBookingPortalOptionsDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "defaultFacility": ExtendedFacilityDtoFromJSON(json["defaultFacility"]),
      "facilities": json["facilities"].map(ExtendedFacilityDtoFromJSON),
      "defaultCategory": ReservationProductCategoryDtoFromJSON(json["defaultCategory"]),
      "categories": json["categories"].map(ReservationProductCategoryDtoFromJSON),
      "defaultActivity": SportNameEnumFromJSON(json["defaultActivity"]),
      "activities": json["activities"].map(SportNameEnumFromJSON),
      "defaultView": OnlineBookingViewsEnumFromJSON(json["defaultView"]),
      "views": json["views"].map(OnlineBookingViewsEnumFromJSON),
      "enableStartTimeSelection": json["enableStartTimeSelection"] == null ? void 0 : json["enableStartTimeSelection"],
      "startTimeIntervals": json["startTimeIntervals"] == null ? void 0 : json["startTimeIntervals"]
    };
  }
  function ExtendedOnlineBookingPortalOptionsDtoToJSON(json) {
    return ExtendedOnlineBookingPortalOptionsDtoToJSONTyped(json, false);
  }
  function ExtendedOnlineBookingPortalOptionsDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "defaultFacility": ExtendedFacilityDtoToJSON(value["defaultFacility"]),
      "facilities": value["facilities"].map(ExtendedFacilityDtoToJSON),
      "defaultCategory": ReservationProductCategoryDtoToJSON(value["defaultCategory"]),
      "categories": value["categories"].map(ReservationProductCategoryDtoToJSON),
      "defaultActivity": SportNameEnumToJSON(value["defaultActivity"]),
      "activities": value["activities"].map(SportNameEnumToJSON),
      "defaultView": OnlineBookingViewsEnumToJSON(value["defaultView"]),
      "views": value["views"].map(OnlineBookingViewsEnumToJSON),
      "enableStartTimeSelection": value["enableStartTimeSelection"],
      "startTimeIntervals": value["startTimeIntervals"]
    };
  }

  // src/.source-sdk/models/PublicOnlineBookingPortalDto.ts
  function instanceOfPublicOnlineBookingPortalDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("options" in value) || value["options"] === void 0) return false;
    return true;
  }
  function PublicOnlineBookingPortalDtoFromJSON(json) {
    return PublicOnlineBookingPortalDtoFromJSONTyped(json, false);
  }
  function PublicOnlineBookingPortalDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "name": json["name"],
      "options": ExtendedOnlineBookingPortalOptionsDtoFromJSON(json["options"])
    };
  }
  function PublicOnlineBookingPortalDtoToJSON(json) {
    return PublicOnlineBookingPortalDtoToJSONTyped(json, false);
  }
  function PublicOnlineBookingPortalDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "name": value["name"],
      "options": ExtendedOnlineBookingPortalOptionsDtoToJSON(value["options"])
    };
  }

  // src/.source-sdk/apis/PortalsPublicApiApi.ts
  var PortalsPublicApiApi = class extends BaseAPI {
    /**
     * Creates request options for getPublicPortalById without sending the request
     */
    async getPublicPortalByIdRequestOpts(requestParameters) {
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getPublicPortalById().'
        );
      }
      if (requestParameters["portalId"] == null) {
        throw new RequiredError(
          "portalId",
          'Required parameter "portalId" was null or undefined when calling getPublicPortalById().'
        );
      }
      const queryParameters = {};
      if (requestParameters["expand"] != null) {
        queryParameters["expand"] = requestParameters["expand"];
      }
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/online-booking/portals/{portalId}`;
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      urlPath = urlPath.replace("{portalId}", encodeURIComponent(String(requestParameters["portalId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get public online-booking portal by ID
     * 
     */
    async getPublicPortalByIdRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getPublicPortalByIdRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => PublicOnlineBookingPortalDtoFromJSON(jsonValue));
    }
    /**
     * Get public online-booking portal by ID
     * 
     */
    async getPublicPortalById(requestParameters, initOverrides) {
      const response = await this.getPublicPortalByIdRaw(requestParameters, initOverrides);
      return await response.value();
    }
  };
  var GetPublicPortalByIdExpandEnum = {
    Media: "media",
    OpeningTimes: "opening_times",
    Draft: "draft"
  };

  // src/.source-sdk/models/GlTypeDto.ts
  function instanceOfGlTypeDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("isDefaultRevenueType" in value) || value["isDefaultRevenueType"] === void 0) return false;
    if (!("isDefaultTaxType" in value) || value["isDefaultTaxType"] === void 0) return false;
    return true;
  }
  function GlTypeDtoFromJSON(json) {
    return GlTypeDtoFromJSONTyped(json, false);
  }
  function GlTypeDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "name": json["name"],
      "isDefaultRevenueType": json["isDefaultRevenueType"],
      "isDefaultTaxType": json["isDefaultTaxType"]
    };
  }
  function GlTypeDtoToJSON(json) {
    return GlTypeDtoToJSONTyped(json, false);
  }
  function GlTypeDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "name": value["name"],
      "isDefaultRevenueType": value["isDefaultRevenueType"],
      "isDefaultTaxType": value["isDefaultTaxType"]
    };
  }

  // src/.source-sdk/models/ResourceGlDto.ts
  function instanceOfResourceGlDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("glId" in value) || value["glId"] === void 0) return false;
    if (!("code" in value) || value["code"] === void 0) return false;
    if (!("isDefault" in value) || value["isDefault"] === void 0) return false;
    return true;
  }
  function ResourceGlDtoFromJSON(json) {
    return ResourceGlDtoFromJSONTyped(json, false);
  }
  function ResourceGlDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "glId": json["glId"],
      "code": json["code"],
      "label": json["label"] == null ? void 0 : json["label"],
      "isDefault": json["isDefault"],
      "ordinal": json["ordinal"] == null ? void 0 : json["ordinal"],
      "glType": json["glType"] == null ? void 0 : GlTypeDtoFromJSON(json["glType"])
    };
  }
  function ResourceGlDtoToJSON(json) {
    return ResourceGlDtoToJSONTyped(json, false);
  }
  function ResourceGlDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "glId": value["glId"],
      "code": value["code"],
      "label": value["label"],
      "isDefault": value["isDefault"],
      "ordinal": value["ordinal"],
      "glType": GlTypeDtoToJSON(value["glType"])
    };
  }

  // src/.source-sdk/models/TaxDto.ts
  function instanceOfTaxDto(value) {
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("rate" in value) || value["rate"] === void 0) return false;
    if (!("isInclusive" in value) || value["isInclusive"] === void 0) return false;
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("isActive" in value) || value["isActive"] === void 0) return false;
    if (!("updatedAt" in value) || value["updatedAt"] === void 0) return false;
    return true;
  }
  function TaxDtoFromJSON(json) {
    return TaxDtoFromJSONTyped(json, false);
  }
  function TaxDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "name": json["name"],
      "rate": json["rate"],
      "isInclusive": json["isInclusive"],
      "description": json["description"] == null ? void 0 : json["description"],
      "glIds": json["glIds"] == null ? void 0 : json["glIds"],
      "id": json["id"],
      "organizationId": json["organizationId"],
      "isActive": json["isActive"],
      "updatedAt": new Date(json["updatedAt"]),
      "productsCount": json["productsCount"] == null ? void 0 : json["productsCount"],
      "defaultTaxes": json["defaultTaxes"] == null ? void 0 : json["defaultTaxes"].map(ProductTypesEnumFromJSON),
      "glCodes": json["glCodes"] == null ? void 0 : json["glCodes"].map(ResourceGlDtoFromJSON)
    };
  }
  function TaxDtoToJSON(json) {
    return TaxDtoToJSONTyped(json, false);
  }
  function TaxDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "name": value["name"],
      "rate": value["rate"],
      "isInclusive": value["isInclusive"],
      "description": value["description"],
      "glIds": value["glIds"],
      "id": value["id"],
      "organizationId": value["organizationId"],
      "isActive": value["isActive"],
      "updatedAt": value["updatedAt"].toISOString(),
      "productsCount": value["productsCount"],
      "defaultTaxes": value["defaultTaxes"] == null ? void 0 : value["defaultTaxes"].map(ProductTypesEnumToJSON),
      "glCodes": value["glCodes"] == null ? void 0 : value["glCodes"].map(ResourceGlDtoToJSON)
    };
  }

  // src/.source-sdk/models/ActivityEnum.ts
  var ActivityEnum = {
    Active: "active",
    Inactive: "inactive"
  };
  function instanceOfActivityEnum(value) {
    for (const key in ActivityEnum) {
      if (Object.prototype.hasOwnProperty.call(ActivityEnum, key)) {
        if (ActivityEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ActivityEnumFromJSON(json) {
    return ActivityEnumFromJSONTyped(json, false);
  }
  function ActivityEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ActivityEnumToJSON(value) {
    return value;
  }
  function ActivityEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/EntitlementDiscountGroupDto.ts
  function instanceOfEntitlementDiscountGroupDto(value) {
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("status" in value) || value["status"] === void 0) return false;
    return true;
  }
  function EntitlementDiscountGroupDtoFromJSON(json) {
    return EntitlementDiscountGroupDtoFromJSONTyped(json, false);
  }
  function EntitlementDiscountGroupDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "name": json["name"],
      "id": json["id"],
      "status": ActivityEnumFromJSON(json["status"])
    };
  }
  function EntitlementDiscountGroupDtoToJSON(json) {
    return EntitlementDiscountGroupDtoToJSONTyped(json, false);
  }
  function EntitlementDiscountGroupDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "name": value["name"],
      "id": value["id"],
      "status": ActivityEnumToJSON(value["status"])
    };
  }

  // src/.source-sdk/models/DiscountMethodsEnum.ts
  var DiscountMethodsEnum = {
    Percent: "percent",
    Amount: "amount"
  };
  function instanceOfDiscountMethodsEnum(value) {
    for (const key in DiscountMethodsEnum) {
      if (Object.prototype.hasOwnProperty.call(DiscountMethodsEnum, key)) {
        if (DiscountMethodsEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function DiscountMethodsEnumFromJSON(json) {
    return DiscountMethodsEnumFromJSONTyped(json, false);
  }
  function DiscountMethodsEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function DiscountMethodsEnumToJSON(value) {
    return value;
  }
  function DiscountMethodsEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/EntitlementDiscountDto.ts
  function instanceOfEntitlementDiscountDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("groupId" in value) || value["groupId"] === void 0) return false;
    if (!("discountMethod" in value) || value["discountMethod"] === void 0) return false;
    if (!("discountValue" in value) || value["discountValue"] === void 0) return false;
    if (!("status" in value) || value["status"] === void 0) return false;
    if (!("group" in value) || value["group"] === void 0) return false;
    return true;
  }
  function EntitlementDiscountDtoFromJSON(json) {
    return EntitlementDiscountDtoFromJSONTyped(json, false);
  }
  function EntitlementDiscountDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "groupId": json["groupId"],
      "discountMethod": DiscountMethodsEnumFromJSON(json["discountMethod"]),
      "discountValue": json["discountValue"],
      "status": ActivityEnumFromJSON(json["status"]),
      "group": EntitlementDiscountGroupDtoFromJSON(json["group"])
    };
  }
  function EntitlementDiscountDtoToJSON(json) {
    return EntitlementDiscountDtoToJSONTyped(json, false);
  }
  function EntitlementDiscountDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "groupId": value["groupId"],
      "discountMethod": DiscountMethodsEnumToJSON(value["discountMethod"]),
      "discountValue": value["discountValue"],
      "status": ActivityEnumToJSON(value["status"]),
      "group": EntitlementDiscountGroupDtoToJSON(value["group"])
    };
  }

  // src/.source-sdk/models/SimpleActivityTimesDto.ts
  var SimpleActivityTimesDtoDayOfWeekEnum = {
    NUMBER_8: 8,
    NUMBER_2: 2,
    NUMBER_3: 3,
    NUMBER_4: 4,
    NUMBER_5: 5,
    NUMBER_6: 6,
    NUMBER_7: 7
  };
  function instanceOfSimpleActivityTimesDto(value) {
    if (!("dayOfWeek" in value) || value["dayOfWeek"] === void 0) return false;
    if (!("close" in value) || value["close"] === void 0) return false;
    if (!("open" in value) || value["open"] === void 0) return false;
    return true;
  }
  function SimpleActivityTimesDtoFromJSON(json) {
    return SimpleActivityTimesDtoFromJSONTyped(json, false);
  }
  function SimpleActivityTimesDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "dayOfWeek": json["dayOfWeek"],
      "close": json["close"],
      "open": json["open"],
      "availabilityStartDate": json["availabilityStartDate"] == null ? void 0 : json["availabilityStartDate"],
      "availabilityEndDate": json["availabilityEndDate"] == null ? void 0 : json["availabilityEndDate"]
    };
  }
  function SimpleActivityTimesDtoToJSON(json) {
    return SimpleActivityTimesDtoToJSONTyped(json, false);
  }
  function SimpleActivityTimesDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "dayOfWeek": value["dayOfWeek"],
      "close": value["close"],
      "open": value["open"],
      "availabilityStartDate": value["availabilityStartDate"],
      "availabilityEndDate": value["availabilityEndDate"]
    };
  }

  // src/.source-sdk/models/PricingScheduleDto.ts
  function instanceOfPricingScheduleDto(value) {
    if (!("activityTimes" in value) || value["activityTimes"] === void 0) return false;
    if (!("pricesIds" in value) || value["pricesIds"] === void 0) return false;
    return true;
  }
  function PricingScheduleDtoFromJSON(json) {
    return PricingScheduleDtoFromJSONTyped(json, false);
  }
  function PricingScheduleDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "activityTimes": json["activityTimes"].map(SimpleActivityTimesDtoFromJSON),
      "pricesIds": json["pricesIds"]
    };
  }
  function PricingScheduleDtoToJSON(json) {
    return PricingScheduleDtoToJSONTyped(json, false);
  }
  function PricingScheduleDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "activityTimes": value["activityTimes"].map(SimpleActivityTimesDtoToJSON),
      "pricesIds": value["pricesIds"]
    };
  }

  // src/.source-sdk/models/SimplePriceDto.ts
  function instanceOfSimplePriceDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("price" in value) || value["price"] === void 0) return false;
    if (!("currency" in value) || value["currency"] === void 0) return false;
    return true;
  }
  function SimplePriceDtoFromJSON(json) {
    return SimplePriceDtoFromJSONTyped(json, false);
  }
  function SimplePriceDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "productId": json["productId"] == null ? void 0 : json["productId"],
      "packageId": json["packageId"] == null ? void 0 : json["packageId"],
      "name": json["name"] == null ? void 0 : json["name"],
      "price": json["price"],
      "currency": CurrencyEnumFromJSON(json["currency"]),
      "startDate": json["startDate"] == null ? void 0 : json["startDate"],
      "endDate": json["endDate"] == null ? void 0 : json["endDate"]
    };
  }
  function SimplePriceDtoToJSON(json) {
    return SimplePriceDtoToJSONTyped(json, false);
  }
  function SimplePriceDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "productId": value["productId"],
      "packageId": value["packageId"],
      "name": value["name"],
      "price": value["price"],
      "currency": CurrencyEnumToJSON(value["currency"]),
      "startDate": value["startDate"],
      "endDate": value["endDate"]
    };
  }

  // src/.source-sdk/models/GlResourceTypeEnum.ts
  var GlResourceTypeEnum = {
    Event: "event",
    League: "league",
    Membership: "membership",
    Program: "program",
    ProgramSeason: "program_season",
    Product: "product",
    Fee: "fee",
    Discount: "discount",
    Activity: "activity",
    ProgramType: "program_type",
    Tax: "tax",
    Segment: "segment",
    Space: "space",
    Facility: "facility",
    PaymentMethod: "payment_method"
  };
  function instanceOfGlResourceTypeEnum(value) {
    for (const key in GlResourceTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(GlResourceTypeEnum, key)) {
        if (GlResourceTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function GlResourceTypeEnumFromJSON(json) {
    return GlResourceTypeEnumFromJSONTyped(json, false);
  }
  function GlResourceTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function GlResourceTypeEnumToJSON(value) {
    return value;
  }
  function GlResourceTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/AccountingCodeDto.ts
  function instanceOfAccountingCodeDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("code" in value) || value["code"] === void 0) return false;
    if (!("type" in value) || value["type"] === void 0) return false;
    return true;
  }
  function AccountingCodeDtoFromJSON(json) {
    return AccountingCodeDtoFromJSONTyped(json, false);
  }
  function AccountingCodeDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "code": json["code"],
      "type": json["type"],
      "category": json["category"] == null ? void 0 : json["category"],
      "resourceType": json["resourceType"] == null ? void 0 : GlResourceTypeEnumFromJSON(json["resourceType"]),
      "productType": json["productType"] == null ? void 0 : ProductTypesEnumFromJSON(json["productType"])
    };
  }
  function AccountingCodeDtoToJSON(json) {
    return AccountingCodeDtoToJSONTyped(json, false);
  }
  function AccountingCodeDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "code": value["code"],
      "type": value["type"],
      "category": value["category"],
      "resourceType": GlResourceTypeEnumToJSON(value["resourceType"]),
      "productType": ProductTypesEnumToJSON(value["productType"])
    };
  }

  // src/.source-sdk/models/ProductPackageLevelEnum.ts
  var ProductPackageLevelEnum = {
    Hour: "hour",
    Slot: "slot",
    Reservation: "reservation"
  };
  function instanceOfProductPackageLevelEnum(value) {
    for (const key in ProductPackageLevelEnum) {
      if (Object.prototype.hasOwnProperty.call(ProductPackageLevelEnum, key)) {
        if (ProductPackageLevelEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ProductPackageLevelEnumFromJSON(json) {
    return ProductPackageLevelEnumFromJSONTyped(json, false);
  }
  function ProductPackageLevelEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ProductPackageLevelEnumToJSON(value) {
    return value;
  }
  function ProductPackageLevelEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/AddonTimePeriodEnum.ts
  var AddonTimePeriodEnum = {
    Full: "full",
    Session: "session",
    Event: "event"
  };
  function instanceOfAddonTimePeriodEnum(value) {
    for (const key in AddonTimePeriodEnum) {
      if (Object.prototype.hasOwnProperty.call(AddonTimePeriodEnum, key)) {
        if (AddonTimePeriodEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function AddonTimePeriodEnumFromJSON(json) {
    return AddonTimePeriodEnumFromJSONTyped(json, false);
  }
  function AddonTimePeriodEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function AddonTimePeriodEnumToJSON(value) {
    return value;
  }
  function AddonTimePeriodEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/PackageProductsRelationTypeEnum.ts
  var PackageProductsRelationTypeEnum = {
    Child: "child",
    Upsale: "upsale",
    Participant: "participant",
    ExtraParticipant: "extra_participant"
  };
  function instanceOfPackageProductsRelationTypeEnum(value) {
    for (const key in PackageProductsRelationTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(PackageProductsRelationTypeEnum, key)) {
        if (PackageProductsRelationTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function PackageProductsRelationTypeEnumFromJSON(json) {
    return PackageProductsRelationTypeEnumFromJSONTyped(json, false);
  }
  function PackageProductsRelationTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function PackageProductsRelationTypeEnumToJSON(value) {
    return value;
  }
  function PackageProductsRelationTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/BasicProductDto.ts
  function instanceOfBasicProductDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("quantity" in value) || value["quantity"] === void 0) return false;
    if (!("prices" in value) || value["prices"] === void 0) return false;
    if (!("isAll" in value) || value["isAll"] === void 0) return false;
    if (!("isPunchPass" in value) || value["isPunchPass"] === void 0) return false;
    if (!("isProRated" in value) || value["isProRated"] === void 0) return false;
    return true;
  }
  function BasicProductDtoFromJSON(json) {
    return BasicProductDtoFromJSONTyped(json, false);
  }
  function BasicProductDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "name": json["name"],
      "quantity": json["quantity"],
      "description": json["description"] == null ? void 0 : json["description"],
      "downpayment": json["downpayment"] == null ? void 0 : json["downpayment"],
      "startDate": json["startDate"] == null ? void 0 : json["startDate"],
      "endDate": json["endDate"] == null ? void 0 : json["endDate"],
      "prices": json["prices"].map(SimplePriceDtoFromJSON),
      "isAll": json["isAll"],
      "isPunchPass": json["isPunchPass"],
      "requiredProducts": json["requiredProducts"] == null ? void 0 : json["requiredProducts"].map(SimpleProductDtoFromJSON),
      "isProRated": json["isProRated"],
      "taxes": json["taxes"] == null ? void 0 : json["taxes"].map(TaxDtoFromJSON),
      "entitlementDiscounts": json["entitlementDiscounts"] == null ? void 0 : json["entitlementDiscounts"].map(EntitlementDiscountDtoFromJSON),
      "timezone": json["timezone"] == null ? void 0 : json["timezone"],
      "accountingCodes": json["accountingCodes"] == null ? void 0 : json["accountingCodes"].map(AccountingCodeDtoFromJSON)
    };
  }
  function BasicProductDtoToJSON(json) {
    return BasicProductDtoToJSONTyped(json, false);
  }
  function BasicProductDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "name": value["name"],
      "quantity": value["quantity"],
      "description": value["description"],
      "downpayment": value["downpayment"],
      "startDate": value["startDate"],
      "endDate": value["endDate"],
      "prices": value["prices"].map(SimplePriceDtoToJSON),
      "isAll": value["isAll"],
      "isPunchPass": value["isPunchPass"],
      "requiredProducts": value["requiredProducts"] == null ? void 0 : value["requiredProducts"].map(SimpleProductDtoToJSON),
      "isProRated": value["isProRated"],
      "taxes": value["taxes"] == null ? void 0 : value["taxes"].map(TaxDtoToJSON),
      "entitlementDiscounts": value["entitlementDiscounts"] == null ? void 0 : value["entitlementDiscounts"].map(EntitlementDiscountDtoToJSON),
      "timezone": value["timezone"],
      "accountingCodes": value["accountingCodes"] == null ? void 0 : value["accountingCodes"].map(AccountingCodeDtoToJSON)
    };
  }

  // src/.source-sdk/models/BasicProductPackageDto.ts
  function instanceOfBasicProductPackageDto(value) {
    if (!("product" in value) || value["product"] === void 0) return false;
    return true;
  }
  function BasicProductPackageDtoFromJSON(json) {
    return BasicProductPackageDtoFromJSONTyped(json, false);
  }
  function BasicProductPackageDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "price": json["price"] == null ? void 0 : json["price"],
      "product": BasicProductDtoFromJSON(json["product"]),
      "timePeriod": json["timePeriod"] == null ? void 0 : AddonTimePeriodEnumFromJSON(json["timePeriod"]),
      "relationType": json["relationType"] == null ? void 0 : PackageProductsRelationTypeEnumFromJSON(json["relationType"]),
      "level": json["level"] == null ? void 0 : ProductPackageLevelEnumFromJSON(json["level"]),
      "isAddon": json["isAddon"] == null ? void 0 : json["isAddon"]
    };
  }
  function BasicProductPackageDtoToJSON(json) {
    return BasicProductPackageDtoToJSONTyped(json, false);
  }
  function BasicProductPackageDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "price": value["price"],
      "product": BasicProductDtoToJSON(value["product"]),
      "timePeriod": AddonTimePeriodEnumToJSON(value["timePeriod"]),
      "relationType": PackageProductsRelationTypeEnumToJSON(value["relationType"]),
      "level": ProductPackageLevelEnumToJSON(value["level"]),
      "isAddon": value["isAddon"]
    };
  }

  // src/.source-sdk/models/ExtendedProductDto.ts
  function instanceOfExtendedProductDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("quantity" in value) || value["quantity"] === void 0) return false;
    if (!("prices" in value) || value["prices"] === void 0) return false;
    if (!("isAll" in value) || value["isAll"] === void 0) return false;
    if (!("isPunchPass" in value) || value["isPunchPass"] === void 0) return false;
    if (!("isProRated" in value) || value["isProRated"] === void 0) return false;
    if (!("productType" in value) || value["productType"] === void 0) return false;
    if (!("isGated" in value) || value["isGated"] === void 0) return false;
    return true;
  }
  function ExtendedProductDtoFromJSON(json) {
    return ExtendedProductDtoFromJSONTyped(json, false);
  }
  function ExtendedProductDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "name": json["name"],
      "quantity": json["quantity"],
      "description": json["description"] == null ? void 0 : json["description"],
      "downpayment": json["downpayment"] == null ? void 0 : json["downpayment"],
      "startDate": json["startDate"] == null ? void 0 : json["startDate"],
      "endDate": json["endDate"] == null ? void 0 : json["endDate"],
      "prices": json["prices"].map(SimplePriceDtoFromJSON),
      "isAll": json["isAll"],
      "isPunchPass": json["isPunchPass"],
      "requiredProducts": json["requiredProducts"] == null ? void 0 : json["requiredProducts"].map(ExtendedProductDtoFromJSON),
      "isProRated": json["isProRated"],
      "taxes": json["taxes"] == null ? void 0 : json["taxes"].map(TaxDtoFromJSON),
      "entitlementDiscounts": json["entitlementDiscounts"] == null ? void 0 : json["entitlementDiscounts"].map(EntitlementDiscountDtoFromJSON),
      "timezone": json["timezone"] == null ? void 0 : json["timezone"],
      "accountingCodes": json["accountingCodes"] == null ? void 0 : json["accountingCodes"].map(AccountingCodeDtoFromJSON),
      "productType": ProductTypesEnumFromJSON(json["productType"]),
      "duration": json["duration"] == null ? void 0 : DurationDtoFromJSON(json["duration"]),
      "questionnairesIds": json["questionnairesIds"] == null ? void 0 : json["questionnairesIds"],
      "sports": json["sports"] == null ? void 0 : json["sports"],
      "packages": json["packages"] == null ? void 0 : json["packages"].map(BasicProductPackageDtoFromJSON),
      "isGated": json["isGated"],
      "pricingSchedule": json["pricingSchedule"] == null ? void 0 : json["pricingSchedule"].map(PricingScheduleDtoFromJSON),
      "activityTimes": json["activityTimes"] == null ? void 0 : json["activityTimes"].map(SimpleActivityTimesDtoFromJSON),
      "mainMedia": json["mainMedia"] == null ? void 0 : MediaDtoFromJSON(json["mainMedia"]),
      "resource": json["resource"] == null ? void 0 : ProductResourceDtoFromJSON(json["resource"])
    };
  }
  function ExtendedProductDtoToJSON(json) {
    return ExtendedProductDtoToJSONTyped(json, false);
  }
  function ExtendedProductDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "name": value["name"],
      "quantity": value["quantity"],
      "description": value["description"],
      "downpayment": value["downpayment"],
      "startDate": value["startDate"],
      "endDate": value["endDate"],
      "prices": value["prices"].map(SimplePriceDtoToJSON),
      "isAll": value["isAll"],
      "isPunchPass": value["isPunchPass"],
      "requiredProducts": value["requiredProducts"] == null ? void 0 : value["requiredProducts"].map(ExtendedProductDtoToJSON),
      "isProRated": value["isProRated"],
      "taxes": value["taxes"] == null ? void 0 : value["taxes"].map(TaxDtoToJSON),
      "entitlementDiscounts": value["entitlementDiscounts"] == null ? void 0 : value["entitlementDiscounts"].map(EntitlementDiscountDtoToJSON),
      "timezone": value["timezone"],
      "accountingCodes": value["accountingCodes"] == null ? void 0 : value["accountingCodes"].map(AccountingCodeDtoToJSON),
      "productType": ProductTypesEnumToJSON(value["productType"]),
      "duration": DurationDtoToJSON(value["duration"]),
      "questionnairesIds": value["questionnairesIds"],
      "sports": value["sports"],
      "packages": value["packages"] == null ? void 0 : value["packages"].map(BasicProductPackageDtoToJSON),
      "isGated": value["isGated"],
      "pricingSchedule": value["pricingSchedule"] == null ? void 0 : value["pricingSchedule"].map(PricingScheduleDtoToJSON),
      "activityTimes": value["activityTimes"] == null ? void 0 : value["activityTimes"].map(SimpleActivityTimesDtoToJSON),
      "mainMedia": MediaDtoToJSON(value["mainMedia"]),
      "resource": ProductResourceDtoToJSON(value["resource"])
    };
  }

  // src/.source-sdk/models/ExtendedRequiredProductDto.ts
  function instanceOfExtendedRequiredProductDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("quantity" in value) || value["quantity"] === void 0) return false;
    if (!("prices" in value) || value["prices"] === void 0) return false;
    if (!("isAll" in value) || value["isAll"] === void 0) return false;
    if (!("isPunchPass" in value) || value["isPunchPass"] === void 0) return false;
    if (!("isProRated" in value) || value["isProRated"] === void 0) return false;
    if (!("productType" in value) || value["productType"] === void 0) return false;
    if (!("isGated" in value) || value["isGated"] === void 0) return false;
    return true;
  }
  function ExtendedRequiredProductDtoFromJSON(json) {
    return ExtendedRequiredProductDtoFromJSONTyped(json, false);
  }
  function ExtendedRequiredProductDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "name": json["name"],
      "quantity": json["quantity"],
      "description": json["description"] == null ? void 0 : json["description"],
      "downpayment": json["downpayment"] == null ? void 0 : json["downpayment"],
      "startDate": json["startDate"] == null ? void 0 : json["startDate"],
      "endDate": json["endDate"] == null ? void 0 : json["endDate"],
      "prices": json["prices"].map(SimplePriceDtoFromJSON),
      "isAll": json["isAll"],
      "isPunchPass": json["isPunchPass"],
      "requiredProducts": json["requiredProducts"] == null ? void 0 : json["requiredProducts"].map(ExtendedProductDtoFromJSON),
      "isProRated": json["isProRated"],
      "taxes": json["taxes"] == null ? void 0 : json["taxes"].map(TaxDtoFromJSON),
      "entitlementDiscounts": json["entitlementDiscounts"] == null ? void 0 : json["entitlementDiscounts"].map(EntitlementDiscountDtoFromJSON),
      "timezone": json["timezone"] == null ? void 0 : json["timezone"],
      "accountingCodes": json["accountingCodes"] == null ? void 0 : json["accountingCodes"].map(AccountingCodeDtoFromJSON),
      "productType": ProductTypesEnumFromJSON(json["productType"]),
      "duration": json["duration"] == null ? void 0 : DurationDtoFromJSON(json["duration"]),
      "questionnairesIds": json["questionnairesIds"] == null ? void 0 : json["questionnairesIds"],
      "sports": json["sports"] == null ? void 0 : json["sports"],
      "packages": json["packages"] == null ? void 0 : json["packages"].map(BasicProductPackageDtoFromJSON),
      "isGated": json["isGated"],
      "pricingSchedule": json["pricingSchedule"] == null ? void 0 : json["pricingSchedule"].map(PricingScheduleDtoFromJSON),
      "activityTimes": json["activityTimes"] == null ? void 0 : json["activityTimes"].map(SimpleActivityTimesDtoFromJSON),
      "mainMedia": json["mainMedia"] == null ? void 0 : MediaDtoFromJSON(json["mainMedia"]),
      "resource": json["resource"] == null ? void 0 : ProductResourceDtoFromJSON(json["resource"]),
      "required": json["required"] == null ? void 0 : json["required"]
    };
  }
  function ExtendedRequiredProductDtoToJSON(json) {
    return ExtendedRequiredProductDtoToJSONTyped(json, false);
  }
  function ExtendedRequiredProductDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "name": value["name"],
      "quantity": value["quantity"],
      "description": value["description"],
      "downpayment": value["downpayment"],
      "startDate": value["startDate"],
      "endDate": value["endDate"],
      "prices": value["prices"].map(SimplePriceDtoToJSON),
      "isAll": value["isAll"],
      "isPunchPass": value["isPunchPass"],
      "requiredProducts": value["requiredProducts"] == null ? void 0 : value["requiredProducts"].map(ExtendedProductDtoToJSON),
      "isProRated": value["isProRated"],
      "taxes": value["taxes"] == null ? void 0 : value["taxes"].map(TaxDtoToJSON),
      "entitlementDiscounts": value["entitlementDiscounts"] == null ? void 0 : value["entitlementDiscounts"].map(EntitlementDiscountDtoToJSON),
      "timezone": value["timezone"],
      "accountingCodes": value["accountingCodes"] == null ? void 0 : value["accountingCodes"].map(AccountingCodeDtoToJSON),
      "productType": ProductTypesEnumToJSON(value["productType"]),
      "duration": DurationDtoToJSON(value["duration"]),
      "questionnairesIds": value["questionnairesIds"],
      "sports": value["sports"],
      "packages": value["packages"] == null ? void 0 : value["packages"].map(BasicProductPackageDtoToJSON),
      "isGated": value["isGated"],
      "pricingSchedule": value["pricingSchedule"] == null ? void 0 : value["pricingSchedule"].map(PricingScheduleDtoToJSON),
      "activityTimes": value["activityTimes"] == null ? void 0 : value["activityTimes"].map(SimpleActivityTimesDtoToJSON),
      "mainMedia": MediaDtoToJSON(value["mainMedia"]),
      "resource": ProductResourceDtoToJSON(value["resource"]),
      "required": value["required"]
    };
  }

  // src/.source-sdk/models/PaginationTypeEnum.ts
  var PaginationTypeEnum = {
    Offset: "offset",
    Page: "page"
  };
  function instanceOfPaginationTypeEnum(value) {
    for (const key in PaginationTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(PaginationTypeEnum, key)) {
        if (PaginationTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function PaginationTypeEnumFromJSON(json) {
    return PaginationTypeEnumFromJSONTyped(json, false);
  }
  function PaginationTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function PaginationTypeEnumToJSON(value) {
    return value;
  }
  function PaginationTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/PaginationMetaDto.ts
  function instanceOfPaginationMetaDto(value) {
    if (!("totalItems" in value) || value["totalItems"] === void 0) return false;
    if (!("itemsPerPage" in value) || value["itemsPerPage"] === void 0) return false;
    return true;
  }
  function PaginationMetaDtoFromJSON(json) {
    return PaginationMetaDtoFromJSONTyped(json, false);
  }
  function PaginationMetaDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "type": json["type"] == null ? void 0 : PaginationTypeEnumFromJSON(json["type"]),
      "totalItems": json["totalItems"],
      "itemsPerPage": json["itemsPerPage"],
      "totalPages": json["totalPages"] == null ? void 0 : json["totalPages"],
      "currentPage": json["currentPage"] == null ? void 0 : json["currentPage"],
      "offset": json["offset"] == null ? void 0 : json["offset"],
      "nextOffset": json["nextOffset"] == null ? void 0 : json["nextOffset"]
    };
  }
  function PaginationMetaDtoToJSON(json) {
    return PaginationMetaDtoToJSONTyped(json, false);
  }
  function PaginationMetaDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "type": PaginationTypeEnumToJSON(value["type"]),
      "totalItems": value["totalItems"],
      "itemsPerPage": value["itemsPerPage"],
      "totalPages": value["totalPages"],
      "currentPage": value["currentPage"],
      "offset": value["offset"],
      "nextOffset": value["nextOffset"]
    };
  }

  // src/.source-sdk/models/GetPaginatedCategoryProducts200Response.ts
  function instanceOfGetPaginatedCategoryProducts200Response(value) {
    if (!("meta" in value) || value["meta"] === void 0) return false;
    if (!("data" in value) || value["data"] === void 0) return false;
    return true;
  }
  function GetPaginatedCategoryProducts200ResponseFromJSON(json) {
    return GetPaginatedCategoryProducts200ResponseFromJSONTyped(json, false);
  }
  function GetPaginatedCategoryProducts200ResponseFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "meta": PaginationMetaDtoFromJSON(json["meta"]),
      "data": json["data"].map(ExtendedProductDtoFromJSON)
    };
  }
  function GetPaginatedCategoryProducts200ResponseToJSON(json) {
    return GetPaginatedCategoryProducts200ResponseToJSONTyped(json, false);
  }
  function GetPaginatedCategoryProducts200ResponseToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "meta": PaginationMetaDtoToJSON(value["meta"]),
      "data": value["data"].map(ExtendedProductDtoToJSON)
    };
  }

  // src/.source-sdk/apis/ProductsPublicApiApi.ts
  var ProductsPublicApiApi = class extends BaseAPI {
    /**
     * Creates request options for getPaginatedCategoryProducts without sending the request
     */
    async getPaginatedCategoryProductsRequestOpts(requestParameters) {
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getPaginatedCategoryProducts().'
        );
      }
      if (requestParameters["categoryId"] == null) {
        throw new RequiredError(
          "categoryId",
          'Required parameter "categoryId" was null or undefined when calling getPaginatedCategoryProducts().'
        );
      }
      const queryParameters = {};
      if (requestParameters["page"] != null) {
        queryParameters["page"] = requestParameters["page"];
      }
      if (requestParameters["offset"] != null) {
        queryParameters["offset"] = requestParameters["offset"];
      }
      if (requestParameters["itemsPerPage"] != null) {
        queryParameters["itemsPerPage"] = requestParameters["itemsPerPage"];
      }
      if (requestParameters["facilitiesIds"] != null) {
        queryParameters["facilitiesIds"] = requestParameters["facilitiesIds"];
      }
      if (requestParameters["isAvailableOnline"] != null) {
        queryParameters["isAvailableOnline"] = requestParameters["isAvailableOnline"];
      }
      if (requestParameters["sports"] != null) {
        queryParameters["sports"] = requestParameters["sports"];
      }
      if (requestParameters["expand"] != null) {
        queryParameters["expand"] = requestParameters["expand"];
      }
      if (requestParameters["userId"] != null) {
        queryParameters["userId"] = requestParameters["userId"];
      }
      if (requestParameters["search"] != null) {
        queryParameters["search"] = requestParameters["search"];
      }
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/category/{categoryId}/products`;
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      urlPath = urlPath.replace("{categoryId}", encodeURIComponent(String(requestParameters["categoryId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get paginated public products by category
     * 
     */
    async getPaginatedCategoryProductsRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getPaginatedCategoryProductsRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => GetPaginatedCategoryProducts200ResponseFromJSON(jsonValue));
    }
    /**
     * Get paginated public products by category
     * 
     */
    async getPaginatedCategoryProducts(requestParameters, initOverrides) {
      const response = await this.getPaginatedCategoryProductsRaw(requestParameters, initOverrides);
      return await response.value();
    }
    /**
     * Creates request options for getUserRequiredProducts without sending the request
     */
    async getUserRequiredProductsRequestOpts(requestParameters) {
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getUserRequiredProducts().'
        );
      }
      if (requestParameters["productId"] == null) {
        throw new RequiredError(
          "productId",
          'Required parameter "productId" was null or undefined when calling getUserRequiredProducts().'
        );
      }
      if (requestParameters["userId"] == null) {
        throw new RequiredError(
          "userId",
          'Required parameter "userId" was null or undefined when calling getUserRequiredProducts().'
        );
      }
      const queryParameters = {};
      const headerParameters = {};
      if (requestParameters["xBondUserIdToken"] != null) {
        headerParameters["X-BondUserIdToken"] = String(requestParameters["xBondUserIdToken"]);
      }
      if (requestParameters["xBondUserAccessToken"] != null) {
        headerParameters["X-BondUserAccessToken"] = String(requestParameters["xBondUserAccessToken"]);
      }
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/products/{productId}/user/{userId}/required`;
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      urlPath = urlPath.replace("{productId}", encodeURIComponent(String(requestParameters["productId"])));
      urlPath = urlPath.replace("{userId}", encodeURIComponent(String(requestParameters["userId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get user\'s required products by product ID
     * 
     */
    async getUserRequiredProductsRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getUserRequiredProductsRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => jsonValue.map(ExtendedRequiredProductDtoFromJSON));
    }
    /**
     * Get user\'s required products by product ID
     * 
     */
    async getUserRequiredProducts(requestParameters, initOverrides) {
      const response = await this.getUserRequiredProductsRaw(requestParameters, initOverrides);
      return await response.value();
    }
  };

  // src/.source-sdk/models/BasicFacilityDto.ts
  function instanceOfBasicFacilityDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    return true;
  }
  function BasicFacilityDtoFromJSON(json) {
    return BasicFacilityDtoFromJSONTyped(json, false);
  }
  function BasicFacilityDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "name": json["name"],
      "timezone": json["timezone"] == null ? void 0 : json["timezone"]
    };
  }
  function BasicFacilityDtoToJSON(json) {
    return BasicFacilityDtoToJSONTyped(json, false);
  }
  function BasicFacilityDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "name": value["name"],
      "timezone": value["timezone"]
    };
  }

  // src/.source-sdk/models/GenderNameEnum.ts
  var GenderNameEnum = {
    Other: "other",
    Male: "male",
    Female: "female",
    Everyone: "everyone"
  };
  function instanceOfGenderNameEnum(value) {
    for (const key in GenderNameEnum) {
      if (Object.prototype.hasOwnProperty.call(GenderNameEnum, key)) {
        if (GenderNameEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function GenderNameEnumFromJSON(json) {
    return GenderNameEnumFromJSONTyped(json, false);
  }
  function GenderNameEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function GenderNameEnumToJSON(value) {
    return value;
  }
  function GenderNameEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/PaginatedProductsDto.ts
  function instanceOfPaginatedProductsDto(value) {
    if (!("meta" in value) || value["meta"] === void 0) return false;
    if (!("data" in value) || value["data"] === void 0) return false;
    return true;
  }
  function PaginatedProductsDtoFromJSON(json) {
    return PaginatedProductsDtoFromJSONTyped(json, false);
  }
  function PaginatedProductsDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "meta": PaginationMetaDtoFromJSON(json["meta"]),
      "data": json["data"].map(BasicProductDtoFromJSON)
    };
  }
  function PaginatedProductsDtoToJSON(json) {
    return PaginatedProductsDtoToJSONTyped(json, false);
  }
  function PaginatedProductsDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "meta": PaginationMetaDtoToJSON(value["meta"]),
      "data": value["data"].map(BasicProductDtoToJSON)
    };
  }

  // src/.source-sdk/models/LevelOfPlayNameEnum.ts
  var LevelOfPlayNameEnum = {
    Beginner: "beginner",
    Intermediate: "intermediate",
    Advanced: "advanced",
    Semipro: "semipro",
    Spectator: "spectator"
  };
  function instanceOfLevelOfPlayNameEnum(value) {
    for (const key in LevelOfPlayNameEnum) {
      if (Object.prototype.hasOwnProperty.call(LevelOfPlayNameEnum, key)) {
        if (LevelOfPlayNameEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function LevelOfPlayNameEnumFromJSON(json) {
    return LevelOfPlayNameEnumFromJSONTyped(json, false);
  }
  function LevelOfPlayNameEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function LevelOfPlayNameEnumToJSON(value) {
    return value;
  }
  function LevelOfPlayNameEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/AvailabilityStatusEnum.ts
  var AvailabilityStatusEnum = {
    Available: "available",
    Unavailable: "unavailable",
    PartiallyAvailable: "partially_available",
    Expired: "expired",
    PartiallyExpired: "partially_expired"
  };
  function instanceOfAvailabilityStatusEnum(value) {
    for (const key in AvailabilityStatusEnum) {
      if (Object.prototype.hasOwnProperty.call(AvailabilityStatusEnum, key)) {
        if (AvailabilityStatusEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function AvailabilityStatusEnumFromJSON(json) {
    return AvailabilityStatusEnumFromJSONTyped(json, false);
  }
  function AvailabilityStatusEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function AvailabilityStatusEnumToJSON(value) {
    return value;
  }
  function AvailabilityStatusEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/SessionDto.ts
  function instanceOfSessionDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("programId" in value) || value["programId"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("startDate" in value) || value["startDate"] === void 0) return false;
    if (!("endDate" in value) || value["endDate"] === void 0) return false;
    if (!("sport" in value) || value["sport"] === void 0) return false;
    if (!("minAge" in value) || value["minAge"] === void 0) return false;
    if (!("maxAge" in value) || value["maxAge"] === void 0) return false;
    if (!("gender" in value) || value["gender"] === void 0) return false;
    if (!("linkSEO" in value) || value["linkSEO"] === void 0) return false;
    if (!("facility" in value) || value["facility"] === void 0) return false;
    if (!("cutoffDate" in value) || value["cutoffDate"] === void 0) return false;
    if (!("registrationStartDate" in value) || value["registrationStartDate"] === void 0) return false;
    if (!("registrationEndDate" in value) || value["registrationEndDate"] === void 0) return false;
    if (!("availabilityStatus" in value) || value["availabilityStatus"] === void 0) return false;
    return true;
  }
  function SessionDtoFromJSON(json) {
    return SessionDtoFromJSONTyped(json, false);
  }
  function SessionDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "programId": json["programId"],
      "name": json["name"],
      "startDate": new Date(json["startDate"]),
      "endDate": new Date(json["endDate"]),
      "isSegmented": json["isSegmented"] == null ? void 0 : json["isSegmented"],
      "sport": SportNameEnumFromJSON(json["sport"]),
      "minAge": json["minAge"],
      "maxAge": json["maxAge"],
      "gender": GenderNameEnumFromJSON(json["gender"]),
      "levels": json["levels"] == null ? void 0 : json["levels"].map(LevelOfPlayNameEnumFromJSON),
      "description": json["description"] == null ? void 0 : json["description"],
      "longDescription": json["longDescription"] == null ? void 0 : json["longDescription"],
      "linkSEO": json["linkSEO"],
      "accountingCodes": json["accountingCodes"] == null ? void 0 : json["accountingCodes"].map(AccountingCodeDtoFromJSON),
      "facility": BasicFacilityDtoFromJSON(json["facility"]),
      "requiredProducts": json["requiredProducts"] == null ? void 0 : json["requiredProducts"].map(SimpleProductDtoFromJSON),
      "cutoffDate": new Date(json["cutoffDate"]),
      "registrationStartDate": new Date(json["registrationStartDate"]),
      "registrationEndDate": new Date(json["registrationEndDate"]),
      "earlyRegistrationStartDate": json["earlyRegistrationStartDate"] == null ? void 0 : new Date(json["earlyRegistrationStartDate"]),
      "earlyRegistrationEndDate": json["earlyRegistrationEndDate"] == null ? void 0 : new Date(json["earlyRegistrationEndDate"]),
      "lateRegistrationStartDate": json["lateRegistrationStartDate"] == null ? void 0 : new Date(json["lateRegistrationStartDate"]),
      "lateRegistrationEndDate": json["lateRegistrationEndDate"] == null ? void 0 : new Date(json["lateRegistrationEndDate"]),
      "availabilityStatus": AvailabilityStatusEnumFromJSON(json["availabilityStatus"]),
      "maxParticipants": json["maxParticipants"] == null ? void 0 : json["maxParticipants"],
      "maxMaleParticipants": json["maxMaleParticipants"] == null ? void 0 : json["maxMaleParticipants"],
      "maxFemaleParticipants": json["maxFemaleParticipants"] == null ? void 0 : json["maxFemaleParticipants"],
      "isWaitlistEnabled": json["isWaitlistEnabled"] == null ? void 0 : json["isWaitlistEnabled"],
      "products": json["products"] == null ? void 0 : PaginatedProductsDtoFromJSON(json["products"])
    };
  }
  function SessionDtoToJSON(json) {
    return SessionDtoToJSONTyped(json, false);
  }
  function SessionDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "programId": value["programId"],
      "name": value["name"],
      "startDate": value["startDate"].toISOString().substring(0, 10),
      "endDate": value["endDate"].toISOString().substring(0, 10),
      "isSegmented": value["isSegmented"],
      "sport": SportNameEnumToJSON(value["sport"]),
      "minAge": value["minAge"],
      "maxAge": value["maxAge"],
      "gender": GenderNameEnumToJSON(value["gender"]),
      "levels": value["levels"] == null ? void 0 : value["levels"].map(LevelOfPlayNameEnumToJSON),
      "description": value["description"],
      "longDescription": value["longDescription"],
      "linkSEO": value["linkSEO"],
      "accountingCodes": value["accountingCodes"] == null ? void 0 : value["accountingCodes"].map(AccountingCodeDtoToJSON),
      "facility": BasicFacilityDtoToJSON(value["facility"]),
      "requiredProducts": value["requiredProducts"] == null ? void 0 : value["requiredProducts"].map(SimpleProductDtoToJSON),
      "cutoffDate": value["cutoffDate"].toISOString().substring(0, 10),
      "registrationStartDate": value["registrationStartDate"].toISOString().substring(0, 10),
      "registrationEndDate": value["registrationEndDate"].toISOString().substring(0, 10),
      "earlyRegistrationStartDate": value["earlyRegistrationStartDate"] == null ? value["earlyRegistrationStartDate"] : value["earlyRegistrationStartDate"].toISOString().substring(0, 10),
      "earlyRegistrationEndDate": value["earlyRegistrationEndDate"] == null ? value["earlyRegistrationEndDate"] : value["earlyRegistrationEndDate"].toISOString().substring(0, 10),
      "lateRegistrationStartDate": value["lateRegistrationStartDate"] == null ? value["lateRegistrationStartDate"] : value["lateRegistrationStartDate"].toISOString().substring(0, 10),
      "lateRegistrationEndDate": value["lateRegistrationEndDate"] == null ? value["lateRegistrationEndDate"] : value["lateRegistrationEndDate"].toISOString().substring(0, 10),
      "availabilityStatus": AvailabilityStatusEnumToJSON(value["availabilityStatus"]),
      "maxParticipants": value["maxParticipants"],
      "maxMaleParticipants": value["maxMaleParticipants"],
      "maxFemaleParticipants": value["maxFemaleParticipants"],
      "isWaitlistEnabled": value["isWaitlistEnabled"],
      "products": PaginatedProductsDtoToJSON(value["products"])
    };
  }

  // src/.source-sdk/models/PaginatedSessionsDto.ts
  function instanceOfPaginatedSessionsDto(value) {
    if (!("meta" in value) || value["meta"] === void 0) return false;
    if (!("data" in value) || value["data"] === void 0) return false;
    return true;
  }
  function PaginatedSessionsDtoFromJSON(json) {
    return PaginatedSessionsDtoFromJSONTyped(json, false);
  }
  function PaginatedSessionsDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "meta": PaginationMetaDtoFromJSON(json["meta"]),
      "data": json["data"].map(SessionDtoFromJSON)
    };
  }
  function PaginatedSessionsDtoToJSON(json) {
    return PaginatedSessionsDtoToJSONTyped(json, false);
  }
  function PaginatedSessionsDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "meta": PaginationMetaDtoToJSON(value["meta"]),
      "data": value["data"].map(SessionDtoToJSON)
    };
  }

  // src/.source-sdk/models/ProgramTypeNameEnum.ts
  var ProgramTypeNameEnum = {
    League: "league",
    Tournament: "tournament",
    Class: "class",
    Clinic: "clinic",
    Camp: "camp",
    Lesson: "lesson",
    ClubTeam: "club_team"
  };
  function instanceOfProgramTypeNameEnum(value) {
    for (const key in ProgramTypeNameEnum) {
      if (Object.prototype.hasOwnProperty.call(ProgramTypeNameEnum, key)) {
        if (ProgramTypeNameEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ProgramTypeNameEnumFromJSON(json) {
    return ProgramTypeNameEnumFromJSONTyped(json, false);
  }
  function ProgramTypeNameEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ProgramTypeNameEnumToJSON(value) {
    return value;
  }
  function ProgramTypeNameEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/ProgramDto.ts
  function instanceOfProgramDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("type" in value) || value["type"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("sport" in value) || value["sport"] === void 0) return false;
    if (!("minAge" in value) || value["minAge"] === void 0) return false;
    if (!("maxAge" in value) || value["maxAge"] === void 0) return false;
    if (!("gender" in value) || value["gender"] === void 0) return false;
    if (!("linkSEO" in value) || value["linkSEO"] === void 0) return false;
    if (!("publishingStatus" in value) || value["publishingStatus"] === void 0) return false;
    return true;
  }
  function ProgramDtoFromJSON(json) {
    return ProgramDtoFromJSONTyped(json, false);
  }
  function ProgramDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "type": ProgramTypeNameEnumFromJSON(json["type"]),
      "name": json["name"],
      "sport": SportNameEnumFromJSON(json["sport"]),
      "minAge": json["minAge"],
      "maxAge": json["maxAge"],
      "gender": GenderNameEnumFromJSON(json["gender"]),
      "levels": json["levels"] == null ? void 0 : json["levels"].map(LevelOfPlayNameEnumFromJSON),
      "description": json["description"] == null ? void 0 : json["description"],
      "longDescription": json["longDescription"] == null ? void 0 : json["longDescription"],
      "linkSEO": json["linkSEO"],
      "mainMedia": json["mainMedia"] == null ? void 0 : SimpleMediaDtoFromJSON(json["mainMedia"]),
      "accountingCodes": json["accountingCodes"] == null ? void 0 : json["accountingCodes"].map(AccountingCodeDtoFromJSON),
      "sessions": json["sessions"] == null ? void 0 : PaginatedSessionsDtoFromJSON(json["sessions"]),
      "publishingStatus": PublishingStatusEnumFromJSON(json["publishingStatus"])
    };
  }
  function ProgramDtoToJSON(json) {
    return ProgramDtoToJSONTyped(json, false);
  }
  function ProgramDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "type": ProgramTypeNameEnumToJSON(value["type"]),
      "name": value["name"],
      "sport": SportNameEnumToJSON(value["sport"]),
      "minAge": value["minAge"],
      "maxAge": value["maxAge"],
      "gender": GenderNameEnumToJSON(value["gender"]),
      "levels": value["levels"] == null ? void 0 : value["levels"].map(LevelOfPlayNameEnumToJSON),
      "description": value["description"],
      "longDescription": value["longDescription"],
      "linkSEO": value["linkSEO"],
      "mainMedia": SimpleMediaDtoToJSON(value["mainMedia"]),
      "accountingCodes": value["accountingCodes"] == null ? void 0 : value["accountingCodes"].map(AccountingCodeDtoToJSON),
      "sessions": PaginatedSessionsDtoToJSON(value["sessions"]),
      "publishingStatus": PublishingStatusEnumToJSON(value["publishingStatus"])
    };
  }

  // src/.source-sdk/models/GetOrganizationPrograms200Response.ts
  function instanceOfGetOrganizationPrograms200Response(value) {
    if (!("meta" in value) || value["meta"] === void 0) return false;
    if (!("data" in value) || value["data"] === void 0) return false;
    return true;
  }
  function GetOrganizationPrograms200ResponseFromJSON(json) {
    return GetOrganizationPrograms200ResponseFromJSONTyped(json, false);
  }
  function GetOrganizationPrograms200ResponseFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "meta": PaginationMetaDtoFromJSON(json["meta"]),
      "data": json["data"].map(ProgramDtoFromJSON)
    };
  }
  function GetOrganizationPrograms200ResponseToJSON(json) {
    return GetOrganizationPrograms200ResponseToJSONTyped(json, false);
  }
  function GetOrganizationPrograms200ResponseToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "meta": PaginationMetaDtoToJSON(value["meta"]),
      "data": value["data"].map(ProgramDtoToJSON)
    };
  }

  // src/.source-sdk/models/GetPopulatedSessionsByProgramId200Response.ts
  function instanceOfGetPopulatedSessionsByProgramId200Response(value) {
    if (!("meta" in value) || value["meta"] === void 0) return false;
    if (!("data" in value) || value["data"] === void 0) return false;
    return true;
  }
  function GetPopulatedSessionsByProgramId200ResponseFromJSON(json) {
    return GetPopulatedSessionsByProgramId200ResponseFromJSONTyped(json, false);
  }
  function GetPopulatedSessionsByProgramId200ResponseFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "meta": PaginationMetaDtoFromJSON(json["meta"]),
      "data": json["data"].map(SessionDtoFromJSON)
    };
  }
  function GetPopulatedSessionsByProgramId200ResponseToJSON(json) {
    return GetPopulatedSessionsByProgramId200ResponseToJSONTyped(json, false);
  }
  function GetPopulatedSessionsByProgramId200ResponseToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "meta": PaginationMetaDtoToJSON(value["meta"]),
      "data": value["data"].map(SessionDtoToJSON)
    };
  }

  // src/.source-sdk/models/RegistrationWindowStatusEnum.ts
  var RegistrationWindowStatusEnum = {
    NotOpenedYet: "not_opened_yet",
    Open: "open",
    Closed: "closed"
  };
  function instanceOfRegistrationWindowStatusEnum(value) {
    for (const key in RegistrationWindowStatusEnum) {
      if (Object.prototype.hasOwnProperty.call(RegistrationWindowStatusEnum, key)) {
        if (RegistrationWindowStatusEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function RegistrationWindowStatusEnumFromJSON(json) {
    return RegistrationWindowStatusEnumFromJSONTyped(json, false);
  }
  function RegistrationWindowStatusEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function RegistrationWindowStatusEnumToJSON(value) {
    return value;
  }
  function RegistrationWindowStatusEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/EventDto.ts
  function instanceOfEventDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("title" in value) || value["title"] === void 0) return false;
    if (!("startDate" in value) || value["startDate"] === void 0) return false;
    if (!("endDate" in value) || value["endDate"] === void 0) return false;
    if (!("timezone" in value) || value["timezone"] === void 0) return false;
    if (!("registrationWindowStatus" in value) || value["registrationWindowStatus"] === void 0) return false;
    return true;
  }
  function EventDtoFromJSON(json) {
    return EventDtoFromJSONTyped(json, false);
  }
  function EventDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "title": json["title"],
      "startDate": new Date(json["startDate"]),
      "endDate": new Date(json["endDate"]),
      "timezone": json["timezone"],
      "registrationWindowStatus": RegistrationWindowStatusEnumFromJSON(json["registrationWindowStatus"]),
      "maxParticipants": json["maxParticipants"] == null ? void 0 : json["maxParticipants"],
      "participantsNumber": json["participantsNumber"] == null ? void 0 : json["participantsNumber"],
      "spotsLeft": json["spotsLeft"] == null ? void 0 : json["spotsLeft"],
      "isWaitlistEnabled": json["isWaitlistEnabled"] == null ? void 0 : json["isWaitlistEnabled"],
      "resources": json["resources"] == null ? void 0 : json["resources"].map(SimpleResourceDtoFromJSON)
    };
  }
  function EventDtoToJSON(json) {
    return EventDtoToJSONTyped(json, false);
  }
  function EventDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "title": value["title"],
      "startDate": value["startDate"].toISOString().substring(0, 10),
      "endDate": value["endDate"].toISOString().substring(0, 10),
      "timezone": value["timezone"],
      "registrationWindowStatus": RegistrationWindowStatusEnumToJSON(value["registrationWindowStatus"]),
      "maxParticipants": value["maxParticipants"],
      "participantsNumber": value["participantsNumber"],
      "spotsLeft": value["spotsLeft"],
      "isWaitlistEnabled": value["isWaitlistEnabled"],
      "resources": value["resources"] == null ? void 0 : value["resources"].map(SimpleResourceDtoToJSON)
    };
  }

  // src/.source-sdk/models/GetSegmentEvents200Response.ts
  function instanceOfGetSegmentEvents200Response(value) {
    if (!("meta" in value) || value["meta"] === void 0) return false;
    if (!("data" in value) || value["data"] === void 0) return false;
    return true;
  }
  function GetSegmentEvents200ResponseFromJSON(json) {
    return GetSegmentEvents200ResponseFromJSONTyped(json, false);
  }
  function GetSegmentEvents200ResponseFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "meta": PaginationMetaDtoFromJSON(json["meta"]),
      "data": json["data"].map(EventDtoFromJSON)
    };
  }
  function GetSegmentEvents200ResponseToJSON(json) {
    return GetSegmentEvents200ResponseToJSONTyped(json, false);
  }
  function GetSegmentEvents200ResponseToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "meta": PaginationMetaDtoToJSON(value["meta"]),
      "data": value["data"].map(EventDtoToJSON)
    };
  }

  // src/.source-sdk/models/GetSessionProducts200Response.ts
  function instanceOfGetSessionProducts200Response(value) {
    if (!("meta" in value) || value["meta"] === void 0) return false;
    if (!("data" in value) || value["data"] === void 0) return false;
    return true;
  }
  function GetSessionProducts200ResponseFromJSON(json) {
    return GetSessionProducts200ResponseFromJSONTyped(json, false);
  }
  function GetSessionProducts200ResponseFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "meta": PaginationMetaDtoFromJSON(json["meta"]),
      "data": json["data"].map(BasicProductDtoFromJSON)
    };
  }
  function GetSessionProducts200ResponseToJSON(json) {
    return GetSessionProducts200ResponseToJSONTyped(json, false);
  }
  function GetSessionProducts200ResponseToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "meta": PaginationMetaDtoToJSON(value["meta"]),
      "data": value["data"].map(BasicProductDtoToJSON)
    };
  }

  // src/.source-sdk/models/DayOfWeekNameEnum.ts
  var DayOfWeekNameEnum = {
    Monday: "monday",
    Tuesday: "tuesday",
    Wednesday: "wednesday",
    Thursday: "thursday",
    Friday: "friday",
    Saturday: "saturday",
    Sunday: "sunday"
  };
  function instanceOfDayOfWeekNameEnum(value) {
    for (const key in DayOfWeekNameEnum) {
      if (Object.prototype.hasOwnProperty.call(DayOfWeekNameEnum, key)) {
        if (DayOfWeekNameEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function DayOfWeekNameEnumFromJSON(json) {
    return DayOfWeekNameEnumFromJSONTyped(json, false);
  }
  function DayOfWeekNameEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function DayOfWeekNameEnumToJSON(value) {
    return value;
  }
  function DayOfWeekNameEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/ActivityTimeDto.ts
  function instanceOfActivityTimeDto(value) {
    if (!("dayOfWeek" in value) || value["dayOfWeek"] === void 0) return false;
    if (!("close" in value) || value["close"] === void 0) return false;
    if (!("open" in value) || value["open"] === void 0) return false;
    return true;
  }
  function ActivityTimeDtoFromJSON(json) {
    return ActivityTimeDtoFromJSONTyped(json, false);
  }
  function ActivityTimeDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "dayOfWeek": DayOfWeekNameEnumFromJSON(json["dayOfWeek"]),
      "close": json["close"],
      "open": json["open"]
    };
  }
  function ActivityTimeDtoToJSON(json) {
    return ActivityTimeDtoToJSONTyped(json, false);
  }
  function ActivityTimeDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "dayOfWeek": DayOfWeekNameEnumToJSON(value["dayOfWeek"]),
      "close": value["close"],
      "open": value["open"]
    };
  }

  // src/.source-sdk/models/SessionSegmentPublicDto.ts
  function instanceOfSessionSegmentPublicDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("organizationId" in value) || value["organizationId"] === void 0) return false;
    if (!("programId" in value) || value["programId"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("startDate" in value) || value["startDate"] === void 0) return false;
    if (!("endDate" in value) || value["endDate"] === void 0) return false;
    if (!("sport" in value) || value["sport"] === void 0) return false;
    if (!("registrationWindowStatus" in value) || value["registrationWindowStatus"] === void 0) return false;
    if (!("availabilityStatus" in value) || value["availabilityStatus"] === void 0) return false;
    return true;
  }
  function SessionSegmentPublicDtoFromJSON(json) {
    return SessionSegmentPublicDtoFromJSONTyped(json, false);
  }
  function SessionSegmentPublicDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "organizationId": json["organizationId"],
      "programId": json["programId"],
      "name": json["name"],
      "startDate": new Date(json["startDate"]),
      "endDate": new Date(json["endDate"]),
      "sport": SportNameEnumFromJSON(json["sport"]),
      "registrationWindowStatus": RegistrationWindowStatusEnumFromJSON(json["registrationWindowStatus"]),
      "availabilityStatus": AvailabilityStatusEnumFromJSON(json["availabilityStatus"]),
      "maxParticipants": json["maxParticipants"] == null ? void 0 : json["maxParticipants"],
      "participantsNumber": json["participantsNumber"] == null ? void 0 : json["participantsNumber"],
      "spotsLeft": json["spotsLeft"] == null ? void 0 : json["spotsLeft"],
      "isWaitlistEnabled": json["isWaitlistEnabled"] == null ? void 0 : json["isWaitlistEnabled"],
      "activityTimes": json["activityTimes"] == null ? void 0 : json["activityTimes"].map(ActivityTimeDtoFromJSON)
    };
  }
  function SessionSegmentPublicDtoToJSON(json) {
    return SessionSegmentPublicDtoToJSONTyped(json, false);
  }
  function SessionSegmentPublicDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "organizationId": value["organizationId"],
      "programId": value["programId"],
      "name": value["name"],
      "startDate": value["startDate"].toISOString().substring(0, 10),
      "endDate": value["endDate"].toISOString().substring(0, 10),
      "sport": SportNameEnumToJSON(value["sport"]),
      "registrationWindowStatus": RegistrationWindowStatusEnumToJSON(value["registrationWindowStatus"]),
      "availabilityStatus": AvailabilityStatusEnumToJSON(value["availabilityStatus"]),
      "maxParticipants": value["maxParticipants"],
      "participantsNumber": value["participantsNumber"],
      "spotsLeft": value["spotsLeft"],
      "isWaitlistEnabled": value["isWaitlistEnabled"],
      "activityTimes": value["activityTimes"] == null ? void 0 : value["activityTimes"].map(ActivityTimeDtoToJSON)
    };
  }

  // src/.source-sdk/models/GetSessionSegments200Response.ts
  function instanceOfGetSessionSegments200Response(value) {
    if (!("meta" in value) || value["meta"] === void 0) return false;
    if (!("data" in value) || value["data"] === void 0) return false;
    return true;
  }
  function GetSessionSegments200ResponseFromJSON(json) {
    return GetSessionSegments200ResponseFromJSONTyped(json, false);
  }
  function GetSessionSegments200ResponseFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "meta": PaginationMetaDtoFromJSON(json["meta"]),
      "data": json["data"].map(SessionSegmentPublicDtoFromJSON)
    };
  }
  function GetSessionSegments200ResponseToJSON(json) {
    return GetSessionSegments200ResponseToJSONTyped(json, false);
  }
  function GetSessionSegments200ResponseToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "meta": PaginationMetaDtoToJSON(value["meta"]),
      "data": value["data"].map(SessionSegmentPublicDtoToJSON)
    };
  }

  // src/.source-sdk/apis/ProgramsPublicApiApi.ts
  var ProgramsPublicApiApi = class extends BaseAPI {
    /**
     * Creates request options for getOrganizationPrograms without sending the request
     */
    async getOrganizationProgramsRequestOpts(requestParameters) {
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getOrganizationPrograms().'
        );
      }
      const queryParameters = {};
      if (requestParameters["page"] != null) {
        queryParameters["page"] = requestParameters["page"];
      }
      if (requestParameters["offset"] != null) {
        queryParameters["offset"] = requestParameters["offset"];
      }
      if (requestParameters["itemsPerPage"] != null) {
        queryParameters["itemsPerPage"] = requestParameters["itemsPerPage"];
      }
      if (requestParameters["programTypes"] != null) {
        queryParameters["programTypes"] = requestParameters["programTypes"];
      }
      if (requestParameters["sports"] != null) {
        queryParameters["sports"] = requestParameters["sports"];
      }
      if (requestParameters["gender"] != null) {
        queryParameters["gender"] = requestParameters["gender"];
      }
      if (requestParameters["levels"] != null) {
        queryParameters["levels"] = requestParameters["levels"];
      }
      if (requestParameters["search"] != null) {
        queryParameters["search"] = requestParameters["search"];
      }
      if (requestParameters["includePast"] != null) {
        queryParameters["includePast"] = requestParameters["includePast"];
      }
      if (requestParameters["startDate"] != null) {
        queryParameters["startDate"] = requestParameters["startDate"].toISOString().substring(0, 10);
      }
      if (requestParameters["endDate"] != null) {
        queryParameters["endDate"] = requestParameters["endDate"].toISOString().substring(0, 10);
      }
      if (requestParameters["expand"] != null) {
        queryParameters["expand"] = requestParameters["expand"];
      }
      if (requestParameters["facilitiesIds"] != null) {
        queryParameters["facilitiesIds"] = requestParameters["facilitiesIds"];
      }
      if (requestParameters["statuses"] != null) {
        queryParameters["statuses"] = requestParameters["statuses"];
      }
      if (requestParameters["orderBy"] != null) {
        queryParameters["orderBy"] = requestParameters["orderBy"];
      }
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/programs`;
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get programs of an organization by filters
     * 
     */
    async getOrganizationProgramsRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getOrganizationProgramsRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => GetOrganizationPrograms200ResponseFromJSON(jsonValue));
    }
    /**
     * Get programs of an organization by filters
     * 
     */
    async getOrganizationPrograms(requestParameters, initOverrides) {
      const response = await this.getOrganizationProgramsRaw(requestParameters, initOverrides);
      return await response.value();
    }
    /**
     * Creates request options for getPopulatedSessionsByProgramId without sending the request
     */
    async getPopulatedSessionsByProgramIdRequestOpts(requestParameters) {
      if (requestParameters["programId"] == null) {
        throw new RequiredError(
          "programId",
          'Required parameter "programId" was null or undefined when calling getPopulatedSessionsByProgramId().'
        );
      }
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getPopulatedSessionsByProgramId().'
        );
      }
      const queryParameters = {};
      if (requestParameters["page"] != null) {
        queryParameters["page"] = requestParameters["page"];
      }
      if (requestParameters["offset"] != null) {
        queryParameters["offset"] = requestParameters["offset"];
      }
      if (requestParameters["itemsPerPage"] != null) {
        queryParameters["itemsPerPage"] = requestParameters["itemsPerPage"];
      }
      if (requestParameters["gender"] != null) {
        queryParameters["gender"] = requestParameters["gender"];
      }
      if (requestParameters["levels"] != null) {
        queryParameters["levels"] = requestParameters["levels"];
      }
      if (requestParameters["search"] != null) {
        queryParameters["search"] = requestParameters["search"];
      }
      if (requestParameters["includePast"] != null) {
        queryParameters["includePast"] = requestParameters["includePast"];
      }
      if (requestParameters["startDate"] != null) {
        queryParameters["startDate"] = requestParameters["startDate"].toISOString().substring(0, 10);
      }
      if (requestParameters["endDate"] != null) {
        queryParameters["endDate"] = requestParameters["endDate"].toISOString().substring(0, 10);
      }
      if (requestParameters["searchByProgram"] != null) {
        queryParameters["searchByProgram"] = requestParameters["searchByProgram"];
      }
      if (requestParameters["expand"] != null) {
        queryParameters["expand"] = requestParameters["expand"];
      }
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/programs/{programId}/sessions`;
      urlPath = urlPath.replace("{programId}", encodeURIComponent(String(requestParameters["programId"])));
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get sessions of a program by filters
     * 
     */
    async getPopulatedSessionsByProgramIdRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getPopulatedSessionsByProgramIdRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => GetPopulatedSessionsByProgramId200ResponseFromJSON(jsonValue));
    }
    /**
     * Get sessions of a program by filters
     * 
     */
    async getPopulatedSessionsByProgramId(requestParameters, initOverrides) {
      const response = await this.getPopulatedSessionsByProgramIdRaw(requestParameters, initOverrides);
      return await response.value();
    }
    /**
     * Creates request options for getSegmentEvents without sending the request
     */
    async getSegmentEventsRequestOpts(requestParameters) {
      if (requestParameters["segmentId"] == null) {
        throw new RequiredError(
          "segmentId",
          'Required parameter "segmentId" was null or undefined when calling getSegmentEvents().'
        );
      }
      if (requestParameters["sessionId"] == null) {
        throw new RequiredError(
          "sessionId",
          'Required parameter "sessionId" was null or undefined when calling getSegmentEvents().'
        );
      }
      if (requestParameters["programId"] == null) {
        throw new RequiredError(
          "programId",
          'Required parameter "programId" was null or undefined when calling getSegmentEvents().'
        );
      }
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getSegmentEvents().'
        );
      }
      const queryParameters = {};
      if (requestParameters["page"] != null) {
        queryParameters["page"] = requestParameters["page"];
      }
      if (requestParameters["offset"] != null) {
        queryParameters["offset"] = requestParameters["offset"];
      }
      if (requestParameters["itemsPerPage"] != null) {
        queryParameters["itemsPerPage"] = requestParameters["itemsPerPage"];
      }
      if (requestParameters["startDate"] != null) {
        queryParameters["startDate"] = requestParameters["startDate"].toISOString().substring(0, 10);
      }
      if (requestParameters["endDate"] != null) {
        queryParameters["endDate"] = requestParameters["endDate"].toISOString().substring(0, 10);
      }
      if (requestParameters["expand"] != null) {
        queryParameters["expand"] = requestParameters["expand"];
      }
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/programs/{programId}/sessions/{sessionId}/segments/{segmentId}/events`;
      urlPath = urlPath.replace("{segmentId}", encodeURIComponent(String(requestParameters["segmentId"])));
      urlPath = urlPath.replace("{sessionId}", encodeURIComponent(String(requestParameters["sessionId"])));
      urlPath = urlPath.replace("{programId}", encodeURIComponent(String(requestParameters["programId"])));
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get events of a segment
     * 
     */
    async getSegmentEventsRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getSegmentEventsRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => GetSegmentEvents200ResponseFromJSON(jsonValue));
    }
    /**
     * Get events of a segment
     * 
     */
    async getSegmentEvents(requestParameters, initOverrides) {
      const response = await this.getSegmentEventsRaw(requestParameters, initOverrides);
      return await response.value();
    }
    /**
     * Creates request options for getSessionEvents without sending the request
     */
    async getSessionEventsRequestOpts(requestParameters) {
      if (requestParameters["sessionId"] == null) {
        throw new RequiredError(
          "sessionId",
          'Required parameter "sessionId" was null or undefined when calling getSessionEvents().'
        );
      }
      if (requestParameters["programId"] == null) {
        throw new RequiredError(
          "programId",
          'Required parameter "programId" was null or undefined when calling getSessionEvents().'
        );
      }
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getSessionEvents().'
        );
      }
      const queryParameters = {};
      if (requestParameters["page"] != null) {
        queryParameters["page"] = requestParameters["page"];
      }
      if (requestParameters["offset"] != null) {
        queryParameters["offset"] = requestParameters["offset"];
      }
      if (requestParameters["itemsPerPage"] != null) {
        queryParameters["itemsPerPage"] = requestParameters["itemsPerPage"];
      }
      if (requestParameters["startDate"] != null) {
        queryParameters["startDate"] = requestParameters["startDate"].toISOString().substring(0, 10);
      }
      if (requestParameters["endDate"] != null) {
        queryParameters["endDate"] = requestParameters["endDate"].toISOString().substring(0, 10);
      }
      if (requestParameters["expand"] != null) {
        queryParameters["expand"] = requestParameters["expand"];
      }
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/programs/{programId}/sessions/{sessionId}/events`;
      urlPath = urlPath.replace("{sessionId}", encodeURIComponent(String(requestParameters["sessionId"])));
      urlPath = urlPath.replace("{programId}", encodeURIComponent(String(requestParameters["programId"])));
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get events of a session
     * 
     */
    async getSessionEventsRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getSessionEventsRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => GetSegmentEvents200ResponseFromJSON(jsonValue));
    }
    /**
     * Get events of a session
     * 
     */
    async getSessionEvents(requestParameters, initOverrides) {
      const response = await this.getSessionEventsRaw(requestParameters, initOverrides);
      return await response.value();
    }
    /**
     * Creates request options for getSessionProducts without sending the request
     */
    async getSessionProductsRequestOpts(requestParameters) {
      if (requestParameters["sessionId"] == null) {
        throw new RequiredError(
          "sessionId",
          'Required parameter "sessionId" was null or undefined when calling getSessionProducts().'
        );
      }
      if (requestParameters["programId"] == null) {
        throw new RequiredError(
          "programId",
          'Required parameter "programId" was null or undefined when calling getSessionProducts().'
        );
      }
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getSessionProducts().'
        );
      }
      const queryParameters = {};
      if (requestParameters["page"] != null) {
        queryParameters["page"] = requestParameters["page"];
      }
      if (requestParameters["offset"] != null) {
        queryParameters["offset"] = requestParameters["offset"];
      }
      if (requestParameters["itemsPerPage"] != null) {
        queryParameters["itemsPerPage"] = requestParameters["itemsPerPage"];
      }
      if (requestParameters["expand"] != null) {
        queryParameters["expand"] = requestParameters["expand"];
      }
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/programs/{programId}/sessions/{sessionId}/products`;
      urlPath = urlPath.replace("{sessionId}", encodeURIComponent(String(requestParameters["sessionId"])));
      urlPath = urlPath.replace("{programId}", encodeURIComponent(String(requestParameters["programId"])));
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get products of a session
     * 
     */
    async getSessionProductsRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getSessionProductsRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => GetSessionProducts200ResponseFromJSON(jsonValue));
    }
    /**
     * Get products of a session
     * 
     */
    async getSessionProducts(requestParameters, initOverrides) {
      const response = await this.getSessionProductsRaw(requestParameters, initOverrides);
      return await response.value();
    }
    /**
     * Creates request options for getSessionSegments without sending the request
     */
    async getSessionSegmentsRequestOpts(requestParameters) {
      if (requestParameters["sessionId"] == null) {
        throw new RequiredError(
          "sessionId",
          'Required parameter "sessionId" was null or undefined when calling getSessionSegments().'
        );
      }
      if (requestParameters["programId"] == null) {
        throw new RequiredError(
          "programId",
          'Required parameter "programId" was null or undefined when calling getSessionSegments().'
        );
      }
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getSessionSegments().'
        );
      }
      const queryParameters = {};
      if (requestParameters["page"] != null) {
        queryParameters["page"] = requestParameters["page"];
      }
      if (requestParameters["offset"] != null) {
        queryParameters["offset"] = requestParameters["offset"];
      }
      if (requestParameters["itemsPerPage"] != null) {
        queryParameters["itemsPerPage"] = requestParameters["itemsPerPage"];
      }
      if (requestParameters["search"] != null) {
        queryParameters["search"] = requestParameters["search"];
      }
      if (requestParameters["startDate"] != null) {
        queryParameters["startDate"] = requestParameters["startDate"].toISOString().substring(0, 10);
      }
      if (requestParameters["endDate"] != null) {
        queryParameters["endDate"] = requestParameters["endDate"].toISOString().substring(0, 10);
      }
      if (requestParameters["expand"] != null) {
        queryParameters["expand"] = requestParameters["expand"];
      }
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/programs/{programId}/sessions/{sessionId}/segments`;
      urlPath = urlPath.replace("{sessionId}", encodeURIComponent(String(requestParameters["sessionId"])));
      urlPath = urlPath.replace("{programId}", encodeURIComponent(String(requestParameters["programId"])));
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get segments of a session
     * 
     */
    async getSessionSegmentsRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getSessionSegmentsRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => GetSessionSegments200ResponseFromJSON(jsonValue));
    }
    /**
     * Get segments of a session
     * 
     */
    async getSessionSegments(requestParameters, initOverrides) {
      const response = await this.getSessionSegmentsRaw(requestParameters, initOverrides);
      return await response.value();
    }
  };

  // src/.source-sdk/models/QuestionCustomTypeEnum.ts
  var QuestionCustomTypeEnum = {
    Text: "text",
    Numeric: "numeric",
    Date: "date",
    MultipleChoices: "multipleChoices",
    SingleChoice: "singleChoice",
    YesNo: "yesNo",
    FileUpload: "fileUpload",
    CustomWaiver: "customWaiver"
  };
  function instanceOfQuestionCustomTypeEnum(value) {
    for (const key in QuestionCustomTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(QuestionCustomTypeEnum, key)) {
        if (QuestionCustomTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function QuestionCustomTypeEnumFromJSON(json) {
    return QuestionCustomTypeEnumFromJSONTyped(json, false);
  }
  function QuestionCustomTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function QuestionCustomTypeEnumToJSON(value) {
    return value;
  }
  function QuestionCustomTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/MetaSelectOptionDto.ts
  function instanceOfMetaSelectOptionDto(value) {
    return true;
  }
  function MetaSelectOptionDtoFromJSON(json) {
    return MetaSelectOptionDtoFromJSONTyped(json, false);
  }
  function MetaSelectOptionDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "text": json["text"] == null ? void 0 : json["text"]
    };
  }
  function MetaSelectOptionDtoToJSON(json) {
    return MetaSelectOptionDtoToJSONTyped(json, false);
  }
  function MetaSelectOptionDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "text": value["text"]
    };
  }

  // src/.source-sdk/models/QuestionMetaDataDto.ts
  function instanceOfQuestionMetaDataDto(value) {
    return true;
  }
  function QuestionMetaDataDtoFromJSON(json) {
    return QuestionMetaDataDtoFromJSONTyped(json, false);
  }
  function QuestionMetaDataDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "customType": json["customType"] == null ? void 0 : QuestionCustomTypeEnumFromJSON(json["customType"]),
      "numericFrom": json["numericFrom"] == null ? void 0 : json["numericFrom"],
      "numericTo": json["numericTo"] == null ? void 0 : json["numericTo"],
      "selectOptions": json["selectOptions"] == null ? void 0 : json["selectOptions"].map(MetaSelectOptionDtoFromJSON),
      "text": json["text"] == null ? void 0 : json["text"]
    };
  }
  function QuestionMetaDataDtoToJSON(json) {
    return QuestionMetaDataDtoToJSONTyped(json, false);
  }
  function QuestionMetaDataDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "customType": QuestionCustomTypeEnumToJSON(value["customType"]),
      "numericFrom": value["numericFrom"],
      "numericTo": value["numericTo"],
      "selectOptions": value["selectOptions"] == null ? void 0 : value["selectOptions"].map(MetaSelectOptionDtoToJSON),
      "text": value["text"]
    };
  }

  // src/.source-sdk/models/PublicQuestionDto.ts
  function instanceOfPublicQuestionDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    return true;
  }
  function PublicQuestionDtoFromJSON(json) {
    return PublicQuestionDtoFromJSONTyped(json, false);
  }
  function PublicQuestionDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "question": json["question"] == null ? void 0 : json["question"],
      "questionType": json["questionType"] == null ? void 0 : json["questionType"],
      "ordinal": json["ordinal"] == null ? void 0 : json["ordinal"],
      "pageOrdinal": json["pageOrdinal"] == null ? void 0 : json["pageOrdinal"],
      "isMandatory": json["isMandatory"] == null ? void 0 : json["isMandatory"],
      "metadata": json["metadata"] == null ? void 0 : QuestionMetaDataDtoFromJSON(json["metadata"])
    };
  }
  function PublicQuestionDtoToJSON(json) {
    return PublicQuestionDtoToJSONTyped(json, false);
  }
  function PublicQuestionDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "question": value["question"],
      "questionType": value["questionType"],
      "ordinal": value["ordinal"],
      "pageOrdinal": value["pageOrdinal"],
      "isMandatory": value["isMandatory"],
      "metadata": QuestionMetaDataDtoToJSON(value["metadata"])
    };
  }

  // src/.source-sdk/models/PublicCheckoutQuestionnaireDto.ts
  function instanceOfPublicCheckoutQuestionnaireDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("isWaiver" in value) || value["isWaiver"] === void 0) return false;
    return true;
  }
  function PublicCheckoutQuestionnaireDtoFromJSON(json) {
    return PublicCheckoutQuestionnaireDtoFromJSONTyped(json, false);
  }
  function PublicCheckoutQuestionnaireDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "title": json["title"] == null ? void 0 : json["title"],
      "createdAt": json["createdAt"] == null ? void 0 : new Date(json["createdAt"]),
      "organizationId": json["organizationId"] == null ? void 0 : json["organizationId"],
      "questions": json["questions"] == null ? void 0 : json["questions"].map(PublicQuestionDtoFromJSON),
      "isWaiver": json["isWaiver"]
    };
  }
  function PublicCheckoutQuestionnaireDtoToJSON(json) {
    return PublicCheckoutQuestionnaireDtoToJSONTyped(json, false);
  }
  function PublicCheckoutQuestionnaireDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "title": value["title"],
      "createdAt": value["createdAt"] == null ? value["createdAt"] : value["createdAt"].toISOString(),
      "organizationId": value["organizationId"],
      "questions": value["questions"] == null ? void 0 : value["questions"].map(PublicQuestionDtoToJSON),
      "isWaiver": value["isWaiver"]
    };
  }

  // src/.source-sdk/models/GetCheckoutQuestionnaires200Response.ts
  function instanceOfGetCheckoutQuestionnaires200Response(value) {
    if (!("meta" in value) || value["meta"] === void 0) return false;
    if (!("data" in value) || value["data"] === void 0) return false;
    return true;
  }
  function GetCheckoutQuestionnaires200ResponseFromJSON(json) {
    return GetCheckoutQuestionnaires200ResponseFromJSONTyped(json, false);
  }
  function GetCheckoutQuestionnaires200ResponseFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "meta": PaginationMetaDtoFromJSON(json["meta"]),
      "data": json["data"].map(PublicCheckoutQuestionnaireDtoFromJSON)
    };
  }
  function GetCheckoutQuestionnaires200ResponseToJSON(json) {
    return GetCheckoutQuestionnaires200ResponseToJSONTyped(json, false);
  }
  function GetCheckoutQuestionnaires200ResponseToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "meta": PaginationMetaDtoToJSON(value["meta"]),
      "data": value["data"].map(PublicCheckoutQuestionnaireDtoToJSON)
    };
  }

  // src/.source-sdk/models/PublicQuestionnaireDto.ts
  function instanceOfPublicQuestionnaireDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    return true;
  }
  function PublicQuestionnaireDtoFromJSON(json) {
    return PublicQuestionnaireDtoFromJSONTyped(json, false);
  }
  function PublicQuestionnaireDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "title": json["title"] == null ? void 0 : json["title"],
      "createdAt": json["createdAt"] == null ? void 0 : new Date(json["createdAt"]),
      "organizationId": json["organizationId"] == null ? void 0 : json["organizationId"],
      "questions": json["questions"] == null ? void 0 : json["questions"].map(PublicQuestionDtoFromJSON)
    };
  }
  function PublicQuestionnaireDtoToJSON(json) {
    return PublicQuestionnaireDtoToJSONTyped(json, false);
  }
  function PublicQuestionnaireDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "title": value["title"],
      "createdAt": value["createdAt"] == null ? value["createdAt"] : value["createdAt"].toISOString(),
      "organizationId": value["organizationId"],
      "questions": value["questions"] == null ? void 0 : value["questions"].map(PublicQuestionDtoToJSON)
    };
  }

  // src/.source-sdk/apis/QuestionnairesPublicApiApi.ts
  var QuestionnairesPublicApiApi = class extends BaseAPI {
    /**
     * Creates request options for getCheckoutQuestionnaires without sending the request
     */
    async getCheckoutQuestionnairesRequestOpts(requestParameters) {
      if (requestParameters["userId"] == null) {
        throw new RequiredError(
          "userId",
          'Required parameter "userId" was null or undefined when calling getCheckoutQuestionnaires().'
        );
      }
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getCheckoutQuestionnaires().'
        );
      }
      if (requestParameters["questionnaireIds"] == null) {
        throw new RequiredError(
          "questionnaireIds",
          'Required parameter "questionnaireIds" was null or undefined when calling getCheckoutQuestionnaires().'
        );
      }
      const queryParameters = {};
      if (requestParameters["page"] != null) {
        queryParameters["page"] = requestParameters["page"];
      }
      if (requestParameters["offset"] != null) {
        queryParameters["offset"] = requestParameters["offset"];
      }
      if (requestParameters["itemsPerPage"] != null) {
        queryParameters["itemsPerPage"] = requestParameters["itemsPerPage"];
      }
      if (requestParameters["questionnaireIds"] != null) {
        queryParameters["questionnaireIds"] = requestParameters["questionnaireIds"];
      }
      if (requestParameters["cartId"] != null) {
        queryParameters["cartId"] = requestParameters["cartId"];
      }
      if (requestParameters["includeOrgWaiver"] != null) {
        queryParameters["includeOrgWaiver"] = requestParameters["includeOrgWaiver"];
      }
      if (requestParameters["expand"] != null) {
        queryParameters["expand"] = requestParameters["expand"];
      }
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/user/{userId}/checkout-questionnaires`;
      urlPath = urlPath.replace("{userId}", encodeURIComponent(String(requestParameters["userId"])));
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get questionnaires a user still needs to sign for checkout, scoped to a single organization and user. Excludes questionnaires already answered in the cart or validly signed. Optionally includes the organization waiver.
     * 
     */
    async getCheckoutQuestionnairesRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getCheckoutQuestionnairesRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => GetCheckoutQuestionnaires200ResponseFromJSON(jsonValue));
    }
    /**
     * Get questionnaires a user still needs to sign for checkout, scoped to a single organization and user. Excludes questionnaires already answered in the cart or validly signed. Optionally includes the organization waiver.
     * 
     */
    async getCheckoutQuestionnaires(requestParameters, initOverrides) {
      const response = await this.getCheckoutQuestionnairesRaw(requestParameters, initOverrides);
      return await response.value();
    }
    /**
     * Creates request options for getPublicQuestionnaireById without sending the request
     */
    async getPublicQuestionnaireByIdRequestOpts(requestParameters) {
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getPublicQuestionnaireById().'
        );
      }
      if (requestParameters["questionnaireId"] == null) {
        throw new RequiredError(
          "questionnaireId",
          'Required parameter "questionnaireId" was null or undefined when calling getPublicQuestionnaireById().'
        );
      }
      const queryParameters = {};
      if (requestParameters["expand"] != null) {
        queryParameters["expand"] = requestParameters["expand"];
      }
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/questionnaires/{questionnaireId}`;
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      urlPath = urlPath.replace("{questionnaireId}", encodeURIComponent(String(requestParameters["questionnaireId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get a public questionnaire by ID
     * 
     */
    async getPublicQuestionnaireByIdRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getPublicQuestionnaireByIdRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => PublicQuestionnaireDtoFromJSON(jsonValue));
    }
    /**
     * Get a public questionnaire by ID
     * 
     */
    async getPublicQuestionnaireById(requestParameters, initOverrides) {
      const response = await this.getPublicQuestionnaireByIdRaw(requestParameters, initOverrides);
      return await response.value();
    }
  };
  var GetCheckoutQuestionnairesExpandEnum = {
    Questions: "questions"
  };
  var GetPublicQuestionnaireByIdExpandEnum = {
    Questions: "questions"
  };

  // src/.source-sdk/models/DateAndTimesDto.ts
  function instanceOfDateAndTimesDto(value) {
    if (!("date" in value) || value["date"] === void 0) return false;
    return true;
  }
  function DateAndTimesDtoFromJSON(json) {
    return DateAndTimesDtoFromJSONTyped(json, false);
  }
  function DateAndTimesDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "date": new Date(json["date"]),
      "times": json["times"] == null ? void 0 : json["times"]
    };
  }
  function DateAndTimesDtoToJSON(json) {
    return DateAndTimesDtoToJSONTyped(json, false);
  }
  function DateAndTimesDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "date": value["date"].toISOString().substring(0, 10),
      "times": value["times"]
    };
  }

  // src/.source-sdk/models/ScheduleTimeSlotDto.ts
  function instanceOfScheduleTimeSlotDto(value) {
    if (!("startDate" in value) || value["startDate"] === void 0) return false;
    if (!("startTime" in value) || value["startTime"] === void 0) return false;
    if (!("endDate" in value) || value["endDate"] === void 0) return false;
    if (!("endTime" in value) || value["endTime"] === void 0) return false;
    if (!("price" in value) || value["price"] === void 0) return false;
    if (!("timezone" in value) || value["timezone"] === void 0) return false;
    if (!("isAvailable" in value) || value["isAvailable"] === void 0) return false;
    return true;
  }
  function ScheduleTimeSlotDtoFromJSON(json) {
    return ScheduleTimeSlotDtoFromJSONTyped(json, false);
  }
  function ScheduleTimeSlotDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "startDate": json["startDate"],
      "startTime": json["startTime"],
      "endDate": json["endDate"],
      "endTime": json["endTime"],
      "price": json["price"],
      "timezone": json["timezone"],
      "isAvailable": json["isAvailable"],
      "spacesIds": json["spacesIds"] == null ? void 0 : json["spacesIds"]
    };
  }
  function ScheduleTimeSlotDtoToJSON(json) {
    return ScheduleTimeSlotDtoToJSONTyped(json, false);
  }
  function ScheduleTimeSlotDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "startDate": value["startDate"],
      "startTime": value["startTime"],
      "endDate": value["endDate"],
      "endTime": value["endTime"],
      "price": value["price"],
      "timezone": value["timezone"],
      "isAvailable": value["isAvailable"],
      "spacesIds": value["spacesIds"]
    };
  }

  // src/.source-sdk/models/ResourceTypeEnum.ts
  var ResourceTypeEnum = {
    Space: "space",
    Instructor: "instructor"
  };
  function instanceOfResourceTypeEnum(value) {
    for (const key in ResourceTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(ResourceTypeEnum, key)) {
        if (ResourceTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ResourceTypeEnumFromJSON(json) {
    return ResourceTypeEnumFromJSONTyped(json, false);
  }
  function ResourceTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ResourceTypeEnumToJSON(value) {
    return value;
  }
  function ResourceTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/ResourceSubTypeEnum.ts
  var ResourceSubTypeEnum = {
    Court: "court",
    Field: "field",
    Room: "room",
    Diamond: "diamond",
    Rink: "rink",
    Studio: "studio",
    Pool: "pool",
    BattingCage: "batting cage",
    Shelter: "shelter",
    GolfSimulator: "golf simulator"
  };
  function instanceOfResourceSubTypeEnum(value) {
    for (const key in ResourceSubTypeEnum) {
      if (Object.prototype.hasOwnProperty.call(ResourceSubTypeEnum, key)) {
        if (ResourceSubTypeEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ResourceSubTypeEnumFromJSON(json) {
    return ResourceSubTypeEnumFromJSONTyped(json, false);
  }
  function ResourceSubTypeEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ResourceSubTypeEnumToJSON(value) {
    return value;
  }
  function ResourceSubTypeEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/AmenitiesNameEnum.ts
  var AmenitiesNameEnum = {
    Heat: "heat",
    Ac: "ac",
    Wifi: "wifi",
    Restrooms: "restrooms",
    DrinkingFountain: "drinking_fountain",
    Parking: "parking",
    Concessions: "concessions",
    Shelter: "shelter",
    PortableRestrooms: "portable_restrooms",
    Lights: "lights",
    LockerRoom: "locker_room",
    PaidParking: "paid_parking",
    Accessible: "accessible"
  };
  function instanceOfAmenitiesNameEnum(value) {
    for (const key in AmenitiesNameEnum) {
      if (Object.prototype.hasOwnProperty.call(AmenitiesNameEnum, key)) {
        if (AmenitiesNameEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function AmenitiesNameEnumFromJSON(json) {
    return AmenitiesNameEnumFromJSONTyped(json, false);
  }
  function AmenitiesNameEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function AmenitiesNameEnumToJSON(value) {
    return value;
  }
  function AmenitiesNameEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/SpacePropertiesEnum.ts
  var SpacePropertiesEnum = {
    Outdoor: "outdoor",
    Indoor: "indoor"
  };
  function instanceOfSpacePropertiesEnum(value) {
    for (const key in SpacePropertiesEnum) {
      if (Object.prototype.hasOwnProperty.call(SpacePropertiesEnum, key)) {
        if (SpacePropertiesEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function SpacePropertiesEnumFromJSON(json) {
    return SpacePropertiesEnumFromJSONTyped(json, false);
  }
  function SpacePropertiesEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function SpacePropertiesEnumToJSON(value) {
    return value;
  }
  function SpacePropertiesEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/SurfacesEnum.ts
  var SurfacesEnum = {
    Grass: "grass",
    Turf: "turf",
    FieldTurf: "fieldTurf",
    AstroTurf: "astroTurf",
    Hardwood: "hardwood",
    Asphalt: "asphalt",
    Sand: "sand",
    Ice: "ice",
    SportCourt: "sportCourt"
  };
  function instanceOfSurfacesEnum(value) {
    for (const key in SurfacesEnum) {
      if (Object.prototype.hasOwnProperty.call(SurfacesEnum, key)) {
        if (SurfacesEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function SurfacesEnumFromJSON(json) {
    return SurfacesEnumFromJSONTyped(json, false);
  }
  function SurfacesEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function SurfacesEnumToJSON(value) {
    return value;
  }
  function SurfacesEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/PublicResourceMetadataDto.ts
  function instanceOfPublicResourceMetadataDto(value) {
    return true;
  }
  function PublicResourceMetadataDtoFromJSON(json) {
    return PublicResourceMetadataDtoFromJSONTyped(json, false);
  }
  function PublicResourceMetadataDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "subType": json["subType"] == null ? void 0 : ResourceSubTypeEnumFromJSON(json["subType"]),
      "amenities": json["amenities"] == null ? void 0 : json["amenities"].map(AmenitiesNameEnumFromJSON),
      "width": json["width"] == null ? void 0 : json["width"],
      "length": json["length"] == null ? void 0 : json["length"],
      "surface": json["surface"] == null ? void 0 : SurfacesEnumFromJSON(json["surface"]),
      "properties": json["properties"] == null ? void 0 : json["properties"].map(SpacePropertiesEnumFromJSON),
      "programTypes": json["programTypes"] == null ? void 0 : json["programTypes"].map(ProgramTypeNameEnumFromJSON)
    };
  }
  function PublicResourceMetadataDtoToJSON(json) {
    return PublicResourceMetadataDtoToJSONTyped(json, false);
  }
  function PublicResourceMetadataDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "subType": ResourceSubTypeEnumToJSON(value["subType"]),
      "amenities": value["amenities"] == null ? void 0 : value["amenities"].map(AmenitiesNameEnumToJSON),
      "width": value["width"],
      "length": value["length"],
      "surface": SurfacesEnumToJSON(value["surface"]),
      "properties": value["properties"] == null ? void 0 : value["properties"].map(SpacePropertiesEnumToJSON),
      "programTypes": value["programTypes"] == null ? void 0 : value["programTypes"].map(ProgramTypeNameEnumToJSON)
    };
  }

  // src/.source-sdk/models/PublicResourceDto.ts
  function instanceOfPublicResourceDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("name" in value) || value["name"] === void 0) return false;
    if (!("type" in value) || value["type"] === void 0) return false;
    if (!("sports" in value) || value["sports"] === void 0) return false;
    if (!("status" in value) || value["status"] === void 0) return false;
    return true;
  }
  function PublicResourceDtoFromJSON(json) {
    return PublicResourceDtoFromJSONTyped(json, false);
  }
  function PublicResourceDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "name": json["name"],
      "description": json["description"] == null ? void 0 : json["description"],
      "type": ResourceTypeEnumFromJSON(json["type"]),
      "sports": json["sports"].map(SportNameEnumFromJSON),
      "mainMedia": json["mainMedia"] == null ? void 0 : SimpleMediaDtoFromJSON(json["mainMedia"]),
      "status": ActivityEnumFromJSON(json["status"]),
      "linkSEO": json["linkSEO"] == null ? void 0 : json["linkSEO"],
      "parentResourceId": json["parentResourceId"] == null ? void 0 : json["parentResourceId"],
      "metadata": json["metadata"] == null ? void 0 : PublicResourceMetadataDtoFromJSON(json["metadata"]),
      "activityTimes": json["activityTimes"] == null ? void 0 : json["activityTimes"].map(SimpleActivityTimesDtoFromJSON)
    };
  }
  function PublicResourceDtoToJSON(json) {
    return PublicResourceDtoToJSONTyped(json, false);
  }
  function PublicResourceDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "name": value["name"],
      "description": value["description"],
      "type": ResourceTypeEnumToJSON(value["type"]),
      "sports": value["sports"].map(SportNameEnumToJSON),
      "mainMedia": SimpleMediaDtoToJSON(value["mainMedia"]),
      "status": ActivityEnumToJSON(value["status"]),
      "linkSEO": value["linkSEO"],
      "parentResourceId": value["parentResourceId"],
      "metadata": PublicResourceMetadataDtoToJSON(value["metadata"]),
      "activityTimes": value["activityTimes"] == null ? void 0 : value["activityTimes"].map(SimpleActivityTimesDtoToJSON)
    };
  }

  // src/.source-sdk/models/PublicResourceScheduleDto.ts
  function instanceOfPublicResourceScheduleDto(value) {
    if (!("resource" in value) || value["resource"] === void 0) return false;
    if (!("timeSlots" in value) || value["timeSlots"] === void 0) return false;
    return true;
  }
  function PublicResourceScheduleDtoFromJSON(json) {
    return PublicResourceScheduleDtoFromJSONTyped(json, false);
  }
  function PublicResourceScheduleDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "resource": PublicResourceDtoFromJSON(json["resource"]),
      "timeSlots": json["timeSlots"].map(ScheduleTimeSlotDtoFromJSON),
      "spaces": json["spaces"] == null ? void 0 : json["spaces"].map(PublicResourceDtoFromJSON)
    };
  }
  function PublicResourceScheduleDtoToJSON(json) {
    return PublicResourceScheduleDtoToJSONTyped(json, false);
  }
  function PublicResourceScheduleDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "resource": PublicResourceDtoToJSON(value["resource"]),
      "timeSlots": value["timeSlots"].map(ScheduleTimeSlotDtoToJSON),
      "spaces": value["spaces"] == null ? void 0 : value["spaces"].map(PublicResourceDtoToJSON)
    };
  }

  // src/.source-sdk/models/BookingScheduleDto.ts
  function instanceOfBookingScheduleDto(value) {
    if (!("dates" in value) || value["dates"] === void 0) return false;
    if (!("resources" in value) || value["resources"] === void 0) return false;
    return true;
  }
  function BookingScheduleDtoFromJSON(json) {
    return BookingScheduleDtoFromJSONTyped(json, false);
  }
  function BookingScheduleDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "dates": json["dates"].map(DateAndTimesDtoFromJSON),
      "resources": json["resources"].map(PublicResourceScheduleDtoFromJSON)
    };
  }
  function BookingScheduleDtoToJSON(json) {
    return BookingScheduleDtoToJSONTyped(json, false);
  }
  function BookingScheduleDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "dates": value["dates"].map(DateAndTimesDtoToJSON),
      "resources": value["resources"].map(PublicResourceScheduleDtoToJSON)
    };
  }

  // src/.source-sdk/models/BookingScheduleSettingsDto.ts
  function instanceOfBookingScheduleSettingsDto(value) {
    if (!("dates" in value) || value["dates"] === void 0) return false;
    if (!("resources" in value) || value["resources"] === void 0) return false;
    return true;
  }
  function BookingScheduleSettingsDtoFromJSON(json) {
    return BookingScheduleSettingsDtoFromJSONTyped(json, false);
  }
  function BookingScheduleSettingsDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "dates": json["dates"].map(DateAndTimesDtoFromJSON),
      "resources": json["resources"].map(PublicResourceDtoFromJSON)
    };
  }
  function BookingScheduleSettingsDtoToJSON(json) {
    return BookingScheduleSettingsDtoToJSONTyped(json, false);
  }
  function BookingScheduleSettingsDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "dates": value["dates"].map(DateAndTimesDtoToJSON),
      "resources": value["resources"].map(PublicResourceDtoToJSON)
    };
  }

  // src/.source-sdk/apis/SchedulePublicApiApi.ts
  var SchedulePublicApiApi = class extends BaseAPI {
    /**
     * Creates request options for getBookingSchedule without sending the request
     */
    async getBookingScheduleRequestOpts(requestParameters) {
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getBookingSchedule().'
        );
      }
      if (requestParameters["facilityId"] == null) {
        throw new RequiredError(
          "facilityId",
          'Required parameter "facilityId" was null or undefined when calling getBookingSchedule().'
        );
      }
      if (requestParameters["productId"] == null) {
        throw new RequiredError(
          "productId",
          'Required parameter "productId" was null or undefined when calling getBookingSchedule().'
        );
      }
      if (requestParameters["date"] == null) {
        throw new RequiredError(
          "date",
          'Required parameter "date" was null or undefined when calling getBookingSchedule().'
        );
      }
      const queryParameters = {};
      if (requestParameters["facilityId"] != null) {
        queryParameters["facilityId"] = requestParameters["facilityId"];
      }
      if (requestParameters["productId"] != null) {
        queryParameters["productId"] = requestParameters["productId"];
      }
      if (requestParameters["userId"] != null) {
        queryParameters["userId"] = requestParameters["userId"];
      }
      if (requestParameters["timeIncrements"] != null) {
        queryParameters["timeIncrements"] = requestParameters["timeIncrements"];
      }
      if (requestParameters["duration"] != null) {
        queryParameters["duration"] = requestParameters["duration"];
      }
      if (requestParameters["resourcesIds"] != null) {
        queryParameters["resourcesIds"] = requestParameters["resourcesIds"];
      }
      if (requestParameters["date"] != null) {
        queryParameters["date"] = requestParameters["date"];
      }
      if (requestParameters["expand"] != null) {
        queryParameters["expand"] = requestParameters["expand"];
      }
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/online-booking/schedule`;
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Returns resources schedule for a given date and options
     * 
     */
    async getBookingScheduleRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getBookingScheduleRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => BookingScheduleDtoFromJSON(jsonValue));
    }
    /**
     * Returns resources schedule for a given date and options
     * 
     */
    async getBookingSchedule(requestParameters, initOverrides) {
      const response = await this.getBookingScheduleRaw(requestParameters, initOverrides);
      return await response.value();
    }
    /**
     * Creates request options for getBookingScheduleSettings without sending the request
     */
    async getBookingScheduleSettingsRequestOpts(requestParameters) {
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getBookingScheduleSettings().'
        );
      }
      if (requestParameters["facilityId"] == null) {
        throw new RequiredError(
          "facilityId",
          'Required parameter "facilityId" was null or undefined when calling getBookingScheduleSettings().'
        );
      }
      if (requestParameters["productId"] == null) {
        throw new RequiredError(
          "productId",
          'Required parameter "productId" was null or undefined when calling getBookingScheduleSettings().'
        );
      }
      const queryParameters = {};
      if (requestParameters["facilityId"] != null) {
        queryParameters["facilityId"] = requestParameters["facilityId"];
      }
      if (requestParameters["productId"] != null) {
        queryParameters["productId"] = requestParameters["productId"];
      }
      if (requestParameters["userId"] != null) {
        queryParameters["userId"] = requestParameters["userId"];
      }
      if (requestParameters["timeIncrements"] != null) {
        queryParameters["timeIncrements"] = requestParameters["timeIncrements"];
      }
      if (requestParameters["duration"] != null) {
        queryParameters["duration"] = requestParameters["duration"];
      }
      if (requestParameters["date"] != null) {
        queryParameters["date"] = requestParameters["date"];
      }
      if (requestParameters["expand"] != null) {
        queryParameters["expand"] = requestParameters["expand"];
      }
      const headerParameters = {};
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/online-booking/schedule/settings`;
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Returns resources schedule for a given date and options
     * 
     */
    async getBookingScheduleSettingsRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getBookingScheduleSettingsRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => BookingScheduleSettingsDtoFromJSON(jsonValue));
    }
    /**
     * Returns resources schedule for a given date and options
     * 
     */
    async getBookingScheduleSettings(requestParameters, initOverrides) {
      const response = await this.getBookingScheduleSettingsRaw(requestParameters, initOverrides);
      return await response.value();
    }
  };

  // src/.source-sdk/models/BasicCustomerDto.ts
  function instanceOfBasicCustomerDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    if (!("type" in value) || value["type"] === void 0) return false;
    return true;
  }
  function BasicCustomerDtoFromJSON(json) {
    return BasicCustomerDtoFromJSONTyped(json, false);
  }
  function BasicCustomerDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "type": CustomerTypeEnumFromJSON(json["type"]),
      "familyStatus": json["familyStatus"] == null ? void 0 : CustomerFamilyStatusEnumFromJSON(json["familyStatus"]),
      "waiverSignedDate": json["waiverSignedDate"] == null ? void 0 : json["waiverSignedDate"]
    };
  }
  function BasicCustomerDtoToJSON(json) {
    return BasicCustomerDtoToJSONTyped(json, false);
  }
  function BasicCustomerDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "type": CustomerTypeEnumToJSON(value["type"]),
      "familyStatus": CustomerFamilyStatusEnumToJSON(value["familyStatus"]),
      "waiverSignedDate": value["waiverSignedDate"]
    };
  }

  // src/.source-sdk/models/AddressDto.ts
  function instanceOfAddressDto(value) {
    return true;
  }
  function AddressDtoFromJSON(json) {
    return AddressDtoFromJSONTyped(json, false);
  }
  function AddressDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "street": json["street"] == null ? void 0 : json["street"],
      "streetNum": json["streetNum"] == null ? void 0 : json["streetNum"],
      "aptNum": json["aptNum"] == null ? void 0 : json["aptNum"],
      "city": json["city"] == null ? void 0 : json["city"],
      "state": json["state"] == null ? void 0 : json["state"],
      "country": json["country"] == null ? void 0 : json["country"],
      "zip": json["zip"] == null ? void 0 : json["zip"],
      "geo": json["geo"] == null ? void 0 : json["geo"]
    };
  }
  function AddressDtoToJSON(json) {
    return AddressDtoToJSONTyped(json, false);
  }
  function AddressDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "street": value["street"],
      "streetNum": value["streetNum"],
      "aptNum": value["aptNum"],
      "city": value["city"],
      "state": value["state"],
      "country": value["country"],
      "zip": value["zip"],
      "geo": value["geo"]
    };
  }

  // src/.source-sdk/models/ExtendedUserDto.ts
  function instanceOfExtendedUserDto(value) {
    if (!("id" in value) || value["id"] === void 0) return false;
    return true;
  }
  function ExtendedUserDtoFromJSON(json) {
    return ExtendedUserDtoFromJSONTyped(json, false);
  }
  function ExtendedUserDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "id": json["id"],
      "firstName": json["firstName"] == null ? void 0 : json["firstName"],
      "lastName": json["lastName"] == null ? void 0 : json["lastName"],
      "email": json["email"] == null ? void 0 : json["email"],
      "phoneNumber": json["phoneNumber"] == null ? void 0 : json["phoneNumber"],
      "birthDate": json["birthDate"] == null ? void 0 : new Date(json["birthDate"]),
      "gender": json["gender"] == null ? void 0 : GenderNameEnumFromJSON(json["gender"]),
      "family": json["family"] == null ? void 0 : json["family"].map(ExtendedUserDtoFromJSON),
      "customer": json["customer"] == null ? void 0 : BasicCustomerDtoFromJSON(json["customer"]),
      "profilePicture": json["profilePicture"] == null ? void 0 : SimpleMediaDtoFromJSON(json["profilePicture"]),
      "address": json["address"] == null ? void 0 : AddressDtoFromJSON(json["address"])
    };
  }
  function ExtendedUserDtoToJSON(json) {
    return ExtendedUserDtoToJSONTyped(json, false);
  }
  function ExtendedUserDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "id": value["id"],
      "firstName": value["firstName"],
      "lastName": value["lastName"],
      "email": value["email"],
      "phoneNumber": value["phoneNumber"],
      "birthDate": value["birthDate"] == null ? value["birthDate"] : value["birthDate"].toISOString(),
      "gender": GenderNameEnumToJSON(value["gender"]),
      "family": value["family"] == null ? void 0 : value["family"].map(ExtendedUserDtoToJSON),
      "customer": BasicCustomerDtoToJSON(value["customer"]),
      "profilePicture": SimpleMediaDtoToJSON(value["profilePicture"]),
      "address": AddressDtoToJSON(value["address"])
    };
  }

  // src/.source-sdk/apis/UsersPublicApiApi.ts
  var UsersPublicApiApi = class extends BaseAPI {
    /**
     * Creates request options for getUser without sending the request
     */
    async getUserRequestOpts(requestParameters) {
      if (requestParameters["organizationId"] == null) {
        throw new RequiredError(
          "organizationId",
          'Required parameter "organizationId" was null or undefined when calling getUser().'
        );
      }
      const queryParameters = {};
      if (requestParameters["expand"] != null) {
        queryParameters["expand"] = requestParameters["expand"];
      }
      const headerParameters = {};
      if (requestParameters["xBondUserIdToken"] != null) {
        headerParameters["X-BondUserIdToken"] = String(requestParameters["xBondUserIdToken"]);
      }
      if (requestParameters["xBondUserAccessToken"] != null) {
        headerParameters["X-BondUserAccessToken"] = String(requestParameters["xBondUserAccessToken"]);
      }
      if (this.configuration && this.configuration.apiKey) {
        headerParameters["X-Api-Key"] = await this.configuration.apiKey("X-Api-Key");
      }
      let urlPath = `/v1/organization/{organizationId}/user`;
      urlPath = urlPath.replace("{organizationId}", encodeURIComponent(String(requestParameters["organizationId"])));
      return {
        path: urlPath,
        method: "GET",
        headers: headerParameters,
        query: queryParameters
      };
    }
    /**
     * Get user data by ID
     * 
     */
    async getUserRaw(requestParameters, initOverrides) {
      const requestOptions = await this.getUserRequestOpts(requestParameters);
      const response = await this.request(requestOptions, initOverrides);
      return new JSONApiResponse(response, (jsonValue) => ExtendedUserDtoFromJSON(jsonValue));
    }
    /**
     * Get user data by ID
     * 
     */
    async getUser(requestParameters, initOverrides) {
      const response = await this.getUserRaw(requestParameters, initOverrides);
      return await response.value();
    }
  };

  // src/.source-sdk/models/ErrorResponsesDto.ts
  function instanceOfErrorResponsesDto(value) {
    if (!("message" in value) || value["message"] === void 0) return false;
    if (!("statusCode" in value) || value["statusCode"] === void 0) return false;
    if (!("timestamp" in value) || value["timestamp"] === void 0) return false;
    if (!("path" in value) || value["path"] === void 0) return false;
    return true;
  }
  function ErrorResponsesDtoFromJSON(json) {
    return ErrorResponsesDtoFromJSONTyped(json, false);
  }
  function ErrorResponsesDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "message": json["message"],
      "code": json["code"] == null ? void 0 : json["code"],
      "statusCode": json["statusCode"],
      "timestamp": json["timestamp"],
      "path": json["path"]
    };
  }
  function ErrorResponsesDtoToJSON(json) {
    return ErrorResponsesDtoToJSONTyped(json, false);
  }
  function ErrorResponsesDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "message": value["message"],
      "code": value["code"],
      "statusCode": value["statusCode"],
      "timestamp": value["timestamp"],
      "path": value["path"]
    };
  }

  // src/.source-sdk/models/EventExpandEnum.ts
  var EventExpandEnum = {
    Resources: "resources",
    Capacity: "capacity"
  };
  function instanceOfEventExpandEnum(value) {
    for (const key in EventExpandEnum) {
      if (Object.prototype.hasOwnProperty.call(EventExpandEnum, key)) {
        if (EventExpandEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function EventExpandEnumFromJSON(json) {
    return EventExpandEnumFromJSONTyped(json, false);
  }
  function EventExpandEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function EventExpandEnumToJSON(value) {
    return value;
  }
  function EventExpandEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/ExpandUserEnum.ts
  var ExpandUserEnum = {
    Address: "address",
    ProfilePicture: "profile_picture",
    Family: "family"
  };
  function instanceOfExpandUserEnum(value) {
    for (const key in ExpandUserEnum) {
      if (Object.prototype.hasOwnProperty.call(ExpandUserEnum, key)) {
        if (ExpandUserEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ExpandUserEnumFromJSON(json) {
    return ExpandUserEnumFromJSONTyped(json, false);
  }
  function ExpandUserEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ExpandUserEnumToJSON(value) {
    return value;
  }
  function ExpandUserEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/OrderByProgramEnum.ts
  var OrderByProgramEnum = {
    Name: "name",
    Type: "type",
    Sport: "sport",
    CreatedAt: "createdAt",
    UpdatedAt: "updatedAt"
  };
  function instanceOfOrderByProgramEnum(value) {
    for (const key in OrderByProgramEnum) {
      if (Object.prototype.hasOwnProperty.call(OrderByProgramEnum, key)) {
        if (OrderByProgramEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function OrderByProgramEnumFromJSON(json) {
    return OrderByProgramEnumFromJSONTyped(json, false);
  }
  function OrderByProgramEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function OrderByProgramEnumToJSON(value) {
    return value;
  }
  function OrderByProgramEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/PaginationResultDto.ts
  function instanceOfPaginationResultDto(value) {
    if (!("meta" in value) || value["meta"] === void 0) return false;
    if (!("data" in value) || value["data"] === void 0) return false;
    return true;
  }
  function PaginationResultDtoFromJSON(json) {
    return PaginationResultDtoFromJSONTyped(json, false);
  }
  function PaginationResultDtoFromJSONTyped(json, ignoreDiscriminator) {
    if (json == null) {
      return json;
    }
    return {
      "meta": PaginationMetaDtoFromJSON(json["meta"]),
      "data": json["data"]
    };
  }
  function PaginationResultDtoToJSON(json) {
    return PaginationResultDtoToJSONTyped(json, false);
  }
  function PaginationResultDtoToJSONTyped(value, ignoreDiscriminator = false) {
    if (value == null) {
      return value;
    }
    return {
      "meta": PaginationMetaDtoToJSON(value["meta"]),
      "data": value["data"]
    };
  }

  // src/.source-sdk/models/ProductExpandEnum.ts
  var ProductExpandEnum = {
    Prices: "prices",
    RequiredProducts: "requiredProducts",
    EntitlementDiscounts: "entitlementDiscounts",
    AccountingCodes: "accountingCodes",
    Packages: "packages",
    PricingSchedule: "pricingSchedule",
    ActivityTimes: "activityTimes",
    Media: "media"
  };
  function instanceOfProductExpandEnum(value) {
    for (const key in ProductExpandEnum) {
      if (Object.prototype.hasOwnProperty.call(ProductExpandEnum, key)) {
        if (ProductExpandEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ProductExpandEnumFromJSON(json) {
    return ProductExpandEnumFromJSONTyped(json, false);
  }
  function ProductExpandEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ProductExpandEnumToJSON(value) {
    return value;
  }
  function ProductExpandEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/ProgramExpandEnum.ts
  var ProgramExpandEnum = {
    AccountingCodes: "accountingCodes",
    Sessions: "sessions",
    SessionsAccountingCodes: "sessions.accountingCodes",
    SessionsRequiredProducts: "sessions.requiredProducts",
    SessionsProducts: "sessions.products",
    SessionsProductsPrices: "sessions.products.prices",
    SessionsProductsRequiredProducts: "sessions.products.requiredProducts",
    SessionsProductsEntitlementDiscounts: "sessions.products.entitlementDiscounts",
    SessionsProductsAccountingCodes: "sessions.products.accountingCodes"
  };
  function instanceOfProgramExpandEnum(value) {
    for (const key in ProgramExpandEnum) {
      if (Object.prototype.hasOwnProperty.call(ProgramExpandEnum, key)) {
        if (ProgramExpandEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ProgramExpandEnumFromJSON(json) {
    return ProgramExpandEnumFromJSONTyped(json, false);
  }
  function ProgramExpandEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ProgramExpandEnumToJSON(value) {
    return value;
  }
  function ProgramExpandEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/ResourceExpandEnum.ts
  var ResourceExpandEnum = {
    Metadata: "metadata",
    Media: "media"
  };
  function instanceOfResourceExpandEnum(value) {
    for (const key in ResourceExpandEnum) {
      if (Object.prototype.hasOwnProperty.call(ResourceExpandEnum, key)) {
        if (ResourceExpandEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function ResourceExpandEnumFromJSON(json) {
    return ResourceExpandEnumFromJSONTyped(json, false);
  }
  function ResourceExpandEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function ResourceExpandEnumToJSON(value) {
    return value;
  }
  function ResourceExpandEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/SegmentExpandEnum.ts
  var SegmentExpandEnum = {
    Resources: "resources",
    ActivityTimes: "activityTimes",
    Capacity: "capacity",
    Settings: "settings",
    Waitlist: "waitlist"
  };
  function instanceOfSegmentExpandEnum(value) {
    for (const key in SegmentExpandEnum) {
      if (Object.prototype.hasOwnProperty.call(SegmentExpandEnum, key)) {
        if (SegmentExpandEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function SegmentExpandEnumFromJSON(json) {
    return SegmentExpandEnumFromJSONTyped(json, false);
  }
  function SegmentExpandEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function SegmentExpandEnumToJSON(value) {
    return value;
  }
  function SegmentExpandEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/.source-sdk/models/SessionExpandEnum.ts
  var SessionExpandEnum = {
    AccountingCodes: "accountingCodes",
    RequiredProducts: "requiredProducts",
    Products: "products",
    ProductsPrices: "products.prices",
    ProductsRequiredProducts: "products.requiredProducts",
    ProductsEntitlementDiscounts: "products.entitlementDiscounts",
    ProductsAccountingCodes: "products.accountingCodes"
  };
  function instanceOfSessionExpandEnum(value) {
    for (const key in SessionExpandEnum) {
      if (Object.prototype.hasOwnProperty.call(SessionExpandEnum, key)) {
        if (SessionExpandEnum[key] === value) {
          return true;
        }
      }
    }
    return false;
  }
  function SessionExpandEnumFromJSON(json) {
    return SessionExpandEnumFromJSONTyped(json, false);
  }
  function SessionExpandEnumFromJSONTyped(json, ignoreDiscriminator) {
    return json;
  }
  function SessionExpandEnumToJSON(value) {
    return value;
  }
  function SessionExpandEnumToJSONTyped(value, ignoreDiscriminator) {
    return value;
  }

  // src/types/profile.ts
  var UserGenderEnum = /* @__PURE__ */ ((UserGenderEnum2) => {
    UserGenderEnum2[UserGenderEnum2["OTHER"] = 1] = "OTHER";
    UserGenderEnum2[UserGenderEnum2["MALE"] = 2] = "MALE";
    UserGenderEnum2[UserGenderEnum2["FEMALE"] = 3] = "FEMALE";
    return UserGenderEnum2;
  })(UserGenderEnum || {});

  // src/errors.ts
  var BondSportsApiErrors = {
    accessTokenMissingExpirationClaim: "Access token missing expiration claim",
    authCodeExchangeFailed: "Failed to exchange authorization code for tokens",
    consumerDataNotAdded: "Consumer data not added. Call updateProfileDetails to update data first",
    invalidBirthDateFormat: "birthDate must be in YYYY-MM-DD format",
    invalidJwtFormat: "Invalid JWT format",
    missingAccessOrIdToken: "No access or id token available",
    missingIdToken: "No ID token available",
    missingRefreshToken: "No refresh token available",
    missingUserIdClaim: "No user ID claim available",
    refreshTokenExchangeFailed: "Failed to exchange refresh token for new tokens"
  };

  // node_modules/date-fns/constants.js
  var daysInYear = 365.2425;
  var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
  var minTime = -maxTime;
  var millisecondsInWeek = 6048e5;
  var millisecondsInDay = 864e5;
  var millisecondsInMinute = 6e4;
  var millisecondsInHour = 36e5;
  var millisecondsInSecond = 1e3;
  var secondsInHour = 3600;
  var secondsInDay = secondsInHour * 24;
  var secondsInWeek = secondsInDay * 7;
  var secondsInYear = secondsInDay * daysInYear;
  var secondsInMonth = secondsInYear / 12;
  var secondsInQuarter = secondsInMonth * 3;
  var constructFromSymbol = /* @__PURE__ */ Symbol.for("constructDateFrom");

  // node_modules/date-fns/constructFrom.js
  function constructFrom(date, value) {
    if (typeof date === "function") return date(value);
    if (date && typeof date === "object" && constructFromSymbol in date)
      return date[constructFromSymbol](value);
    if (date instanceof Date) return new date.constructor(value);
    return new Date(value);
  }

  // node_modules/date-fns/toDate.js
  function toDate(argument, context) {
    return constructFrom(context || argument, argument);
  }

  // node_modules/date-fns/addDays.js
  function addDays(date, amount, options) {
    const _date = toDate(date, options?.in);
    if (isNaN(amount)) return constructFrom(options?.in || date, NaN);
    if (!amount) return _date;
    _date.setDate(_date.getDate() + amount);
    return _date;
  }

  // node_modules/date-fns/_lib/defaultOptions.js
  var defaultOptions = {};
  function getDefaultOptions() {
    return defaultOptions;
  }

  // node_modules/date-fns/startOfWeek.js
  function startOfWeek(date, options) {
    const defaultOptions2 = getDefaultOptions();
    const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
    const _date = toDate(date, options?.in);
    const day = _date.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    _date.setDate(_date.getDate() - diff);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  // node_modules/date-fns/startOfISOWeek.js
  function startOfISOWeek(date, options) {
    return startOfWeek(date, { ...options, weekStartsOn: 1 });
  }

  // node_modules/date-fns/getISOWeekYear.js
  function getISOWeekYear(date, options) {
    const _date = toDate(date, options?.in);
    const year = _date.getFullYear();
    const fourthOfJanuaryOfNextYear = constructFrom(_date, 0);
    fourthOfJanuaryOfNextYear.setFullYear(year + 1, 0, 4);
    fourthOfJanuaryOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfISOWeek(fourthOfJanuaryOfNextYear);
    const fourthOfJanuaryOfThisYear = constructFrom(_date, 0);
    fourthOfJanuaryOfThisYear.setFullYear(year, 0, 4);
    fourthOfJanuaryOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfISOWeek(fourthOfJanuaryOfThisYear);
    if (_date.getTime() >= startOfNextYear.getTime()) {
      return year + 1;
    } else if (_date.getTime() >= startOfThisYear.getTime()) {
      return year;
    } else {
      return year - 1;
    }
  }

  // node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js
  function getTimezoneOffsetInMilliseconds(date) {
    const _date = toDate(date);
    const utcDate = new Date(
      Date.UTC(
        _date.getFullYear(),
        _date.getMonth(),
        _date.getDate(),
        _date.getHours(),
        _date.getMinutes(),
        _date.getSeconds(),
        _date.getMilliseconds()
      )
    );
    utcDate.setUTCFullYear(_date.getFullYear());
    return +date - +utcDate;
  }

  // node_modules/date-fns/_lib/normalizeDates.js
  function normalizeDates(context, ...dates) {
    const normalize = constructFrom.bind(
      null,
      context || dates.find((date) => typeof date === "object")
    );
    return dates.map(normalize);
  }

  // node_modules/date-fns/startOfDay.js
  function startOfDay(date, options) {
    const _date = toDate(date, options?.in);
    _date.setHours(0, 0, 0, 0);
    return _date;
  }

  // node_modules/date-fns/differenceInCalendarDays.js
  function differenceInCalendarDays(laterDate, earlierDate, options) {
    const [laterDate_, earlierDate_] = normalizeDates(
      options?.in,
      laterDate,
      earlierDate
    );
    const laterStartOfDay = startOfDay(laterDate_);
    const earlierStartOfDay = startOfDay(earlierDate_);
    const laterTimestamp = +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
    const earlierTimestamp = +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);
    return Math.round((laterTimestamp - earlierTimestamp) / millisecondsInDay);
  }

  // node_modules/date-fns/startOfISOWeekYear.js
  function startOfISOWeekYear(date, options) {
    const year = getISOWeekYear(date, options);
    const fourthOfJanuary = constructFrom(options?.in || date, 0);
    fourthOfJanuary.setFullYear(year, 0, 4);
    fourthOfJanuary.setHours(0, 0, 0, 0);
    return startOfISOWeek(fourthOfJanuary);
  }

  // node_modules/date-fns/isDate.js
  function isDate(value) {
    return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
  }

  // node_modules/date-fns/isValid.js
  function isValid(date) {
    return !(!isDate(date) && typeof date !== "number" || isNaN(+toDate(date)));
  }

  // node_modules/date-fns/startOfYear.js
  function startOfYear(date, options) {
    const date_ = toDate(date, options?.in);
    date_.setFullYear(date_.getFullYear(), 0, 1);
    date_.setHours(0, 0, 0, 0);
    return date_;
  }

  // node_modules/date-fns/locale/en-US/_lib/formatDistance.js
  var formatDistanceLocale = {
    lessThanXSeconds: {
      one: "less than a second",
      other: "less than {{count}} seconds"
    },
    xSeconds: {
      one: "1 second",
      other: "{{count}} seconds"
    },
    halfAMinute: "half a minute",
    lessThanXMinutes: {
      one: "less than a minute",
      other: "less than {{count}} minutes"
    },
    xMinutes: {
      one: "1 minute",
      other: "{{count}} minutes"
    },
    aboutXHours: {
      one: "about 1 hour",
      other: "about {{count}} hours"
    },
    xHours: {
      one: "1 hour",
      other: "{{count}} hours"
    },
    xDays: {
      one: "1 day",
      other: "{{count}} days"
    },
    aboutXWeeks: {
      one: "about 1 week",
      other: "about {{count}} weeks"
    },
    xWeeks: {
      one: "1 week",
      other: "{{count}} weeks"
    },
    aboutXMonths: {
      one: "about 1 month",
      other: "about {{count}} months"
    },
    xMonths: {
      one: "1 month",
      other: "{{count}} months"
    },
    aboutXYears: {
      one: "about 1 year",
      other: "about {{count}} years"
    },
    xYears: {
      one: "1 year",
      other: "{{count}} years"
    },
    overXYears: {
      one: "over 1 year",
      other: "over {{count}} years"
    },
    almostXYears: {
      one: "almost 1 year",
      other: "almost {{count}} years"
    }
  };
  var formatDistance = (token, count, options) => {
    let result;
    const tokenValue = formatDistanceLocale[token];
    if (typeof tokenValue === "string") {
      result = tokenValue;
    } else if (count === 1) {
      result = tokenValue.one;
    } else {
      result = tokenValue.other.replace("{{count}}", count.toString());
    }
    if (options?.addSuffix) {
      if (options.comparison && options.comparison > 0) {
        return "in " + result;
      } else {
        return result + " ago";
      }
    }
    return result;
  };

  // node_modules/date-fns/locale/_lib/buildFormatLongFn.js
  function buildFormatLongFn(args) {
    return (options = {}) => {
      const width = options.width ? String(options.width) : args.defaultWidth;
      const format2 = args.formats[width] || args.formats[args.defaultWidth];
      return format2;
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/formatLong.js
  var dateFormats = {
    full: "EEEE, MMMM do, y",
    long: "MMMM do, y",
    medium: "MMM d, y",
    short: "MM/dd/yyyy"
  };
  var timeFormats = {
    full: "h:mm:ss a zzzz",
    long: "h:mm:ss a z",
    medium: "h:mm:ss a",
    short: "h:mm a"
  };
  var dateTimeFormats = {
    full: "{{date}} 'at' {{time}}",
    long: "{{date}} 'at' {{time}}",
    medium: "{{date}}, {{time}}",
    short: "{{date}}, {{time}}"
  };
  var formatLong = {
    date: buildFormatLongFn({
      formats: dateFormats,
      defaultWidth: "full"
    }),
    time: buildFormatLongFn({
      formats: timeFormats,
      defaultWidth: "full"
    }),
    dateTime: buildFormatLongFn({
      formats: dateTimeFormats,
      defaultWidth: "full"
    })
  };

  // node_modules/date-fns/locale/en-US/_lib/formatRelative.js
  var formatRelativeLocale = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: "P"
  };
  var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];

  // node_modules/date-fns/locale/_lib/buildLocalizeFn.js
  function buildLocalizeFn(args) {
    return (value, options) => {
      const context = options?.context ? String(options.context) : "standalone";
      let valuesArray;
      if (context === "formatting" && args.formattingValues) {
        const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
        const width = options?.width ? String(options.width) : defaultWidth;
        valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
      } else {
        const defaultWidth = args.defaultWidth;
        const width = options?.width ? String(options.width) : args.defaultWidth;
        valuesArray = args.values[width] || args.values[defaultWidth];
      }
      const index = args.argumentCallback ? args.argumentCallback(value) : value;
      return valuesArray[index];
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/localize.js
  var eraValues = {
    narrow: ["B", "A"],
    abbreviated: ["BC", "AD"],
    wide: ["Before Christ", "Anno Domini"]
  };
  var quarterValues = {
    narrow: ["1", "2", "3", "4"],
    abbreviated: ["Q1", "Q2", "Q3", "Q4"],
    wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
  };
  var monthValues = {
    narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    abbreviated: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    wide: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ]
  };
  var dayValues = {
    narrow: ["S", "M", "T", "W", "T", "F", "S"],
    short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    wide: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ]
  };
  var dayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    }
  };
  var formattingDayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    }
  };
  var ordinalNumber = (dirtyNumber, _options) => {
    const number = Number(dirtyNumber);
    const rem100 = number % 100;
    if (rem100 > 20 || rem100 < 10) {
      switch (rem100 % 10) {
        case 1:
          return number + "st";
        case 2:
          return number + "nd";
        case 3:
          return number + "rd";
      }
    }
    return number + "th";
  };
  var localize = {
    ordinalNumber,
    era: buildLocalizeFn({
      values: eraValues,
      defaultWidth: "wide"
    }),
    quarter: buildLocalizeFn({
      values: quarterValues,
      defaultWidth: "wide",
      argumentCallback: (quarter) => quarter - 1
    }),
    month: buildLocalizeFn({
      values: monthValues,
      defaultWidth: "wide"
    }),
    day: buildLocalizeFn({
      values: dayValues,
      defaultWidth: "wide"
    }),
    dayPeriod: buildLocalizeFn({
      values: dayPeriodValues,
      defaultWidth: "wide",
      formattingValues: formattingDayPeriodValues,
      defaultFormattingWidth: "wide"
    })
  };

  // node_modules/date-fns/locale/_lib/buildMatchFn.js
  function buildMatchFn(args) {
    return (string, options = {}) => {
      const width = options.width;
      const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
      const matchResult = string.match(matchPattern);
      if (!matchResult) {
        return null;
      }
      const matchedString = matchResult[0];
      const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
      const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
        // [TODO] -- I challenge you to fix the type
        findKey(parsePatterns, (pattern) => pattern.test(matchedString))
      );
      let value;
      value = args.valueCallback ? args.valueCallback(key) : key;
      value = options.valueCallback ? (
        // [TODO] -- I challenge you to fix the type
        options.valueCallback(value)
      ) : value;
      const rest = string.slice(matchedString.length);
      return { value, rest };
    };
  }
  function findKey(object, predicate) {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
        return key;
      }
    }
    return void 0;
  }
  function findIndex(array, predicate) {
    for (let key = 0; key < array.length; key++) {
      if (predicate(array[key])) {
        return key;
      }
    }
    return void 0;
  }

  // node_modules/date-fns/locale/_lib/buildMatchPatternFn.js
  function buildMatchPatternFn(args) {
    return (string, options = {}) => {
      const matchResult = string.match(args.matchPattern);
      if (!matchResult) return null;
      const matchedString = matchResult[0];
      const parseResult = string.match(args.parsePattern);
      if (!parseResult) return null;
      let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
      value = options.valueCallback ? options.valueCallback(value) : value;
      const rest = string.slice(matchedString.length);
      return { value, rest };
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/match.js
  var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
  var parseOrdinalNumberPattern = /\d+/i;
  var matchEraPatterns = {
    narrow: /^(b|a)/i,
    abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
    wide: /^(before christ|before common era|anno domini|common era)/i
  };
  var parseEraPatterns = {
    any: [/^b/i, /^(a|c)/i]
  };
  var matchQuarterPatterns = {
    narrow: /^[1234]/i,
    abbreviated: /^q[1234]/i,
    wide: /^[1234](th|st|nd|rd)? quarter/i
  };
  var parseQuarterPatterns = {
    any: [/1/i, /2/i, /3/i, /4/i]
  };
  var matchMonthPatterns = {
    narrow: /^[jfmasond]/i,
    abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
  };
  var parseMonthPatterns = {
    narrow: [
      /^j/i,
      /^f/i,
      /^m/i,
      /^a/i,
      /^m/i,
      /^j/i,
      /^j/i,
      /^a/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i
    ],
    any: [
      /^ja/i,
      /^f/i,
      /^mar/i,
      /^ap/i,
      /^may/i,
      /^jun/i,
      /^jul/i,
      /^au/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i
    ]
  };
  var matchDayPatterns = {
    narrow: /^[smtwf]/i,
    short: /^(su|mo|tu|we|th|fr|sa)/i,
    abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
    wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
  };
  var parseDayPatterns = {
    narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
    any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
  };
  var matchDayPeriodPatterns = {
    narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
    any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
  };
  var parseDayPeriodPatterns = {
    any: {
      am: /^a/i,
      pm: /^p/i,
      midnight: /^mi/i,
      noon: /^no/i,
      morning: /morning/i,
      afternoon: /afternoon/i,
      evening: /evening/i,
      night: /night/i
    }
  };
  var match = {
    ordinalNumber: buildMatchPatternFn({
      matchPattern: matchOrdinalNumberPattern,
      parsePattern: parseOrdinalNumberPattern,
      valueCallback: (value) => parseInt(value, 10)
    }),
    era: buildMatchFn({
      matchPatterns: matchEraPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseEraPatterns,
      defaultParseWidth: "any"
    }),
    quarter: buildMatchFn({
      matchPatterns: matchQuarterPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseQuarterPatterns,
      defaultParseWidth: "any",
      valueCallback: (index) => index + 1
    }),
    month: buildMatchFn({
      matchPatterns: matchMonthPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseMonthPatterns,
      defaultParseWidth: "any"
    }),
    day: buildMatchFn({
      matchPatterns: matchDayPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseDayPatterns,
      defaultParseWidth: "any"
    }),
    dayPeriod: buildMatchFn({
      matchPatterns: matchDayPeriodPatterns,
      defaultMatchWidth: "any",
      parsePatterns: parseDayPeriodPatterns,
      defaultParseWidth: "any"
    })
  };

  // node_modules/date-fns/locale/en-US.js
  var enUS = {
    code: "en-US",
    formatDistance,
    formatLong,
    formatRelative,
    localize,
    match,
    options: {
      weekStartsOn: 0,
      firstWeekContainsDate: 1
    }
  };

  // node_modules/date-fns/getDayOfYear.js
  function getDayOfYear(date, options) {
    const _date = toDate(date, options?.in);
    const diff = differenceInCalendarDays(_date, startOfYear(_date));
    const dayOfYear = diff + 1;
    return dayOfYear;
  }

  // node_modules/date-fns/getISOWeek.js
  function getISOWeek(date, options) {
    const _date = toDate(date, options?.in);
    const diff = +startOfISOWeek(_date) - +startOfISOWeekYear(_date);
    return Math.round(diff / millisecondsInWeek) + 1;
  }

  // node_modules/date-fns/getWeekYear.js
  function getWeekYear(date, options) {
    const _date = toDate(date, options?.in);
    const year = _date.getFullYear();
    const defaultOptions2 = getDefaultOptions();
    const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
    const firstWeekOfNextYear = constructFrom(options?.in || date, 0);
    firstWeekOfNextYear.setFullYear(year + 1, 0, firstWeekContainsDate);
    firstWeekOfNextYear.setHours(0, 0, 0, 0);
    const startOfNextYear = startOfWeek(firstWeekOfNextYear, options);
    const firstWeekOfThisYear = constructFrom(options?.in || date, 0);
    firstWeekOfThisYear.setFullYear(year, 0, firstWeekContainsDate);
    firstWeekOfThisYear.setHours(0, 0, 0, 0);
    const startOfThisYear = startOfWeek(firstWeekOfThisYear, options);
    if (+_date >= +startOfNextYear) {
      return year + 1;
    } else if (+_date >= +startOfThisYear) {
      return year;
    } else {
      return year - 1;
    }
  }

  // node_modules/date-fns/startOfWeekYear.js
  function startOfWeekYear(date, options) {
    const defaultOptions2 = getDefaultOptions();
    const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
    const year = getWeekYear(date, options);
    const firstWeek = constructFrom(options?.in || date, 0);
    firstWeek.setFullYear(year, 0, firstWeekContainsDate);
    firstWeek.setHours(0, 0, 0, 0);
    const _date = startOfWeek(firstWeek, options);
    return _date;
  }

  // node_modules/date-fns/getWeek.js
  function getWeek(date, options) {
    const _date = toDate(date, options?.in);
    const diff = +startOfWeek(_date, options) - +startOfWeekYear(_date, options);
    return Math.round(diff / millisecondsInWeek) + 1;
  }

  // node_modules/date-fns/_lib/addLeadingZeros.js
  function addLeadingZeros(number, targetLength) {
    const sign = number < 0 ? "-" : "";
    const output = Math.abs(number).toString().padStart(targetLength, "0");
    return sign + output;
  }

  // node_modules/date-fns/_lib/format/lightFormatters.js
  var lightFormatters = {
    // Year
    y(date, token) {
      const signedYear = date.getFullYear();
      const year = signedYear > 0 ? signedYear : 1 - signedYear;
      return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
    },
    // Month
    M(date, token) {
      const month = date.getMonth();
      return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
    },
    // Day of the month
    d(date, token) {
      return addLeadingZeros(date.getDate(), token.length);
    },
    // AM or PM
    a(date, token) {
      const dayPeriodEnumValue = date.getHours() / 12 >= 1 ? "pm" : "am";
      switch (token) {
        case "a":
        case "aa":
          return dayPeriodEnumValue.toUpperCase();
        case "aaa":
          return dayPeriodEnumValue;
        case "aaaaa":
          return dayPeriodEnumValue[0];
        case "aaaa":
        default:
          return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
      }
    },
    // Hour [1-12]
    h(date, token) {
      return addLeadingZeros(date.getHours() % 12 || 12, token.length);
    },
    // Hour [0-23]
    H(date, token) {
      return addLeadingZeros(date.getHours(), token.length);
    },
    // Minute
    m(date, token) {
      return addLeadingZeros(date.getMinutes(), token.length);
    },
    // Second
    s(date, token) {
      return addLeadingZeros(date.getSeconds(), token.length);
    },
    // Fraction of second
    S(date, token) {
      const numberOfDigits = token.length;
      const milliseconds = date.getMilliseconds();
      const fractionalSeconds = Math.trunc(
        milliseconds * Math.pow(10, numberOfDigits - 3)
      );
      return addLeadingZeros(fractionalSeconds, token.length);
    }
  };

  // node_modules/date-fns/_lib/format/formatters.js
  var dayPeriodEnum = {
    am: "am",
    pm: "pm",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  };
  var formatters = {
    // Era
    G: function(date, token, localize2) {
      const era = date.getFullYear() > 0 ? 1 : 0;
      switch (token) {
        // AD, BC
        case "G":
        case "GG":
        case "GGG":
          return localize2.era(era, { width: "abbreviated" });
        // A, B
        case "GGGGG":
          return localize2.era(era, { width: "narrow" });
        // Anno Domini, Before Christ
        case "GGGG":
        default:
          return localize2.era(era, { width: "wide" });
      }
    },
    // Year
    y: function(date, token, localize2) {
      if (token === "yo") {
        const signedYear = date.getFullYear();
        const year = signedYear > 0 ? signedYear : 1 - signedYear;
        return localize2.ordinalNumber(year, { unit: "year" });
      }
      return lightFormatters.y(date, token);
    },
    // Local week-numbering year
    Y: function(date, token, localize2, options) {
      const signedWeekYear = getWeekYear(date, options);
      const weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
      if (token === "YY") {
        const twoDigitYear = weekYear % 100;
        return addLeadingZeros(twoDigitYear, 2);
      }
      if (token === "Yo") {
        return localize2.ordinalNumber(weekYear, { unit: "year" });
      }
      return addLeadingZeros(weekYear, token.length);
    },
    // ISO week-numbering year
    R: function(date, token) {
      const isoWeekYear = getISOWeekYear(date);
      return addLeadingZeros(isoWeekYear, token.length);
    },
    // Extended year. This is a single number designating the year of this calendar system.
    // The main difference between `y` and `u` localizers are B.C. years:
    // | Year | `y` | `u` |
    // |------|-----|-----|
    // | AC 1 |   1 |   1 |
    // | BC 1 |   1 |   0 |
    // | BC 2 |   2 |  -1 |
    // Also `yy` always returns the last two digits of a year,
    // while `uu` pads single digit years to 2 characters and returns other years unchanged.
    u: function(date, token) {
      const year = date.getFullYear();
      return addLeadingZeros(year, token.length);
    },
    // Quarter
    Q: function(date, token, localize2) {
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      switch (token) {
        // 1, 2, 3, 4
        case "Q":
          return String(quarter);
        // 01, 02, 03, 04
        case "QQ":
          return addLeadingZeros(quarter, 2);
        // 1st, 2nd, 3rd, 4th
        case "Qo":
          return localize2.ordinalNumber(quarter, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "QQQ":
          return localize2.quarter(quarter, {
            width: "abbreviated",
            context: "formatting"
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "QQQQQ":
          return localize2.quarter(quarter, {
            width: "narrow",
            context: "formatting"
          });
        // 1st quarter, 2nd quarter, ...
        case "QQQQ":
        default:
          return localize2.quarter(quarter, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Stand-alone quarter
    q: function(date, token, localize2) {
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      switch (token) {
        // 1, 2, 3, 4
        case "q":
          return String(quarter);
        // 01, 02, 03, 04
        case "qq":
          return addLeadingZeros(quarter, 2);
        // 1st, 2nd, 3rd, 4th
        case "qo":
          return localize2.ordinalNumber(quarter, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "qqq":
          return localize2.quarter(quarter, {
            width: "abbreviated",
            context: "standalone"
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "qqqqq":
          return localize2.quarter(quarter, {
            width: "narrow",
            context: "standalone"
          });
        // 1st quarter, 2nd quarter, ...
        case "qqqq":
        default:
          return localize2.quarter(quarter, {
            width: "wide",
            context: "standalone"
          });
      }
    },
    // Month
    M: function(date, token, localize2) {
      const month = date.getMonth();
      switch (token) {
        case "M":
        case "MM":
          return lightFormatters.M(date, token);
        // 1st, 2nd, ..., 12th
        case "Mo":
          return localize2.ordinalNumber(month + 1, { unit: "month" });
        // Jan, Feb, ..., Dec
        case "MMM":
          return localize2.month(month, {
            width: "abbreviated",
            context: "formatting"
          });
        // J, F, ..., D
        case "MMMMM":
          return localize2.month(month, {
            width: "narrow",
            context: "formatting"
          });
        // January, February, ..., December
        case "MMMM":
        default:
          return localize2.month(month, { width: "wide", context: "formatting" });
      }
    },
    // Stand-alone month
    L: function(date, token, localize2) {
      const month = date.getMonth();
      switch (token) {
        // 1, 2, ..., 12
        case "L":
          return String(month + 1);
        // 01, 02, ..., 12
        case "LL":
          return addLeadingZeros(month + 1, 2);
        // 1st, 2nd, ..., 12th
        case "Lo":
          return localize2.ordinalNumber(month + 1, { unit: "month" });
        // Jan, Feb, ..., Dec
        case "LLL":
          return localize2.month(month, {
            width: "abbreviated",
            context: "standalone"
          });
        // J, F, ..., D
        case "LLLLL":
          return localize2.month(month, {
            width: "narrow",
            context: "standalone"
          });
        // January, February, ..., December
        case "LLLL":
        default:
          return localize2.month(month, { width: "wide", context: "standalone" });
      }
    },
    // Local week of year
    w: function(date, token, localize2, options) {
      const week = getWeek(date, options);
      if (token === "wo") {
        return localize2.ordinalNumber(week, { unit: "week" });
      }
      return addLeadingZeros(week, token.length);
    },
    // ISO week of year
    I: function(date, token, localize2) {
      const isoWeek = getISOWeek(date);
      if (token === "Io") {
        return localize2.ordinalNumber(isoWeek, { unit: "week" });
      }
      return addLeadingZeros(isoWeek, token.length);
    },
    // Day of the month
    d: function(date, token, localize2) {
      if (token === "do") {
        return localize2.ordinalNumber(date.getDate(), { unit: "date" });
      }
      return lightFormatters.d(date, token);
    },
    // Day of year
    D: function(date, token, localize2) {
      const dayOfYear = getDayOfYear(date);
      if (token === "Do") {
        return localize2.ordinalNumber(dayOfYear, { unit: "dayOfYear" });
      }
      return addLeadingZeros(dayOfYear, token.length);
    },
    // Day of week
    E: function(date, token, localize2) {
      const dayOfWeek = date.getDay();
      switch (token) {
        // Tue
        case "E":
        case "EE":
        case "EEE":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        // T
        case "EEEEE":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "EEEEEE":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        // Tuesday
        case "EEEE":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Local day of week
    e: function(date, token, localize2, options) {
      const dayOfWeek = date.getDay();
      const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        // Numerical value (Nth day of week with current locale or weekStartsOn)
        case "e":
          return String(localDayOfWeek);
        // Padded numerical value
        case "ee":
          return addLeadingZeros(localDayOfWeek, 2);
        // 1st, 2nd, ..., 7th
        case "eo":
          return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
        case "eee":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        // T
        case "eeeee":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "eeeeee":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        // Tuesday
        case "eeee":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Stand-alone local day of week
    c: function(date, token, localize2, options) {
      const dayOfWeek = date.getDay();
      const localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        // Numerical value (same as in `e`)
        case "c":
          return String(localDayOfWeek);
        // Padded numerical value
        case "cc":
          return addLeadingZeros(localDayOfWeek, token.length);
        // 1st, 2nd, ..., 7th
        case "co":
          return localize2.ordinalNumber(localDayOfWeek, { unit: "day" });
        case "ccc":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "standalone"
          });
        // T
        case "ccccc":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "standalone"
          });
        // Tu
        case "cccccc":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "standalone"
          });
        // Tuesday
        case "cccc":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "standalone"
          });
      }
    },
    // ISO day of week
    i: function(date, token, localize2) {
      const dayOfWeek = date.getDay();
      const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
      switch (token) {
        // 2
        case "i":
          return String(isoDayOfWeek);
        // 02
        case "ii":
          return addLeadingZeros(isoDayOfWeek, token.length);
        // 2nd
        case "io":
          return localize2.ordinalNumber(isoDayOfWeek, { unit: "day" });
        // Tue
        case "iii":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        // T
        case "iiiii":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "iiiiii":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        // Tuesday
        case "iiii":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // AM or PM
    a: function(date, token, localize2) {
      const hours = date.getHours();
      const dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
      switch (token) {
        case "a":
        case "aa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "aaa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          }).toLowerCase();
        case "aaaaa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "aaaa":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // AM, PM, midnight, noon
    b: function(date, token, localize2) {
      const hours = date.getHours();
      let dayPeriodEnumValue;
      if (hours === 12) {
        dayPeriodEnumValue = dayPeriodEnum.noon;
      } else if (hours === 0) {
        dayPeriodEnumValue = dayPeriodEnum.midnight;
      } else {
        dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
      }
      switch (token) {
        case "b":
        case "bb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "bbb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          }).toLowerCase();
        case "bbbbb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "bbbb":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // in the morning, in the afternoon, in the evening, at night
    B: function(date, token, localize2) {
      const hours = date.getHours();
      let dayPeriodEnumValue;
      if (hours >= 17) {
        dayPeriodEnumValue = dayPeriodEnum.evening;
      } else if (hours >= 12) {
        dayPeriodEnumValue = dayPeriodEnum.afternoon;
      } else if (hours >= 4) {
        dayPeriodEnumValue = dayPeriodEnum.morning;
      } else {
        dayPeriodEnumValue = dayPeriodEnum.night;
      }
      switch (token) {
        case "B":
        case "BB":
        case "BBB":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "BBBBB":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "BBBB":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    // Hour [1-12]
    h: function(date, token, localize2) {
      if (token === "ho") {
        let hours = date.getHours() % 12;
        if (hours === 0) hours = 12;
        return localize2.ordinalNumber(hours, { unit: "hour" });
      }
      return lightFormatters.h(date, token);
    },
    // Hour [0-23]
    H: function(date, token, localize2) {
      if (token === "Ho") {
        return localize2.ordinalNumber(date.getHours(), { unit: "hour" });
      }
      return lightFormatters.H(date, token);
    },
    // Hour [0-11]
    K: function(date, token, localize2) {
      const hours = date.getHours() % 12;
      if (token === "Ko") {
        return localize2.ordinalNumber(hours, { unit: "hour" });
      }
      return addLeadingZeros(hours, token.length);
    },
    // Hour [1-24]
    k: function(date, token, localize2) {
      let hours = date.getHours();
      if (hours === 0) hours = 24;
      if (token === "ko") {
        return localize2.ordinalNumber(hours, { unit: "hour" });
      }
      return addLeadingZeros(hours, token.length);
    },
    // Minute
    m: function(date, token, localize2) {
      if (token === "mo") {
        return localize2.ordinalNumber(date.getMinutes(), { unit: "minute" });
      }
      return lightFormatters.m(date, token);
    },
    // Second
    s: function(date, token, localize2) {
      if (token === "so") {
        return localize2.ordinalNumber(date.getSeconds(), { unit: "second" });
      }
      return lightFormatters.s(date, token);
    },
    // Fraction of second
    S: function(date, token) {
      return lightFormatters.S(date, token);
    },
    // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
    X: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      if (timezoneOffset === 0) {
        return "Z";
      }
      switch (token) {
        // Hours and optional minutes
        case "X":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);
        // Hours, minutes and optional seconds without `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `XX`
        case "XXXX":
        case "XX":
          return formatTimezone(timezoneOffset);
        // Hours, minutes and optional seconds with `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `XXX`
        case "XXXXX":
        case "XXX":
        // Hours and minutes with `:` delimiter
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },
    // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
    x: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      switch (token) {
        // Hours and optional minutes
        case "x":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);
        // Hours, minutes and optional seconds without `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `xx`
        case "xxxx":
        case "xx":
          return formatTimezone(timezoneOffset);
        // Hours, minutes and optional seconds with `:` delimiter
        // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
        // so this token always has the same output as `xxx`
        case "xxxxx":
        case "xxx":
        // Hours and minutes with `:` delimiter
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },
    // Timezone (GMT)
    O: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      switch (token) {
        // Short
        case "O":
        case "OO":
        case "OOO":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        // Long
        case "OOOO":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },
    // Timezone (specific non-location)
    z: function(date, token, _localize) {
      const timezoneOffset = date.getTimezoneOffset();
      switch (token) {
        // Short
        case "z":
        case "zz":
        case "zzz":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        // Long
        case "zzzz":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },
    // Seconds timestamp
    t: function(date, token, _localize) {
      const timestamp = Math.trunc(+date / 1e3);
      return addLeadingZeros(timestamp, token.length);
    },
    // Milliseconds timestamp
    T: function(date, token, _localize) {
      return addLeadingZeros(+date, token.length);
    }
  };
  function formatTimezoneShort(offset, delimiter = "") {
    const sign = offset > 0 ? "-" : "+";
    const absOffset = Math.abs(offset);
    const hours = Math.trunc(absOffset / 60);
    const minutes = absOffset % 60;
    if (minutes === 0) {
      return sign + String(hours);
    }
    return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
  }
  function formatTimezoneWithOptionalMinutes(offset, delimiter) {
    if (offset % 60 === 0) {
      const sign = offset > 0 ? "-" : "+";
      return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
    }
    return formatTimezone(offset, delimiter);
  }
  function formatTimezone(offset, delimiter = "") {
    const sign = offset > 0 ? "-" : "+";
    const absOffset = Math.abs(offset);
    const hours = addLeadingZeros(Math.trunc(absOffset / 60), 2);
    const minutes = addLeadingZeros(absOffset % 60, 2);
    return sign + hours + delimiter + minutes;
  }

  // node_modules/date-fns/_lib/format/longFormatters.js
  var dateLongFormatter = (pattern, formatLong2) => {
    switch (pattern) {
      case "P":
        return formatLong2.date({ width: "short" });
      case "PP":
        return formatLong2.date({ width: "medium" });
      case "PPP":
        return formatLong2.date({ width: "long" });
      case "PPPP":
      default:
        return formatLong2.date({ width: "full" });
    }
  };
  var timeLongFormatter = (pattern, formatLong2) => {
    switch (pattern) {
      case "p":
        return formatLong2.time({ width: "short" });
      case "pp":
        return formatLong2.time({ width: "medium" });
      case "ppp":
        return formatLong2.time({ width: "long" });
      case "pppp":
      default:
        return formatLong2.time({ width: "full" });
    }
  };
  var dateTimeLongFormatter = (pattern, formatLong2) => {
    const matchResult = pattern.match(/(P+)(p+)?/) || [];
    const datePattern = matchResult[1];
    const timePattern = matchResult[2];
    if (!timePattern) {
      return dateLongFormatter(pattern, formatLong2);
    }
    let dateTimeFormat;
    switch (datePattern) {
      case "P":
        dateTimeFormat = formatLong2.dateTime({ width: "short" });
        break;
      case "PP":
        dateTimeFormat = formatLong2.dateTime({ width: "medium" });
        break;
      case "PPP":
        dateTimeFormat = formatLong2.dateTime({ width: "long" });
        break;
      case "PPPP":
      default:
        dateTimeFormat = formatLong2.dateTime({ width: "full" });
        break;
    }
    return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong2)).replace("{{time}}", timeLongFormatter(timePattern, formatLong2));
  };
  var longFormatters = {
    p: timeLongFormatter,
    P: dateTimeLongFormatter
  };

  // node_modules/date-fns/_lib/protectedTokens.js
  var dayOfYearTokenRE = /^D+$/;
  var weekYearTokenRE = /^Y+$/;
  var throwTokens = ["D", "DD", "YY", "YYYY"];
  function isProtectedDayOfYearToken(token) {
    return dayOfYearTokenRE.test(token);
  }
  function isProtectedWeekYearToken(token) {
    return weekYearTokenRE.test(token);
  }
  function warnOrThrowProtectedError(token, format2, input) {
    const _message = message(token, format2, input);
    console.warn(_message);
    if (throwTokens.includes(token)) throw new RangeError(_message);
  }
  function message(token, format2, input) {
    const subject = token[0] === "Y" ? "years" : "days of the month";
    return `Use \`${token.toLowerCase()}\` instead of \`${token}\` (in \`${format2}\`) for formatting ${subject} to the input \`${input}\`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md`;
  }

  // node_modules/date-fns/format.js
  var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
  var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
  var escapedStringRegExp = /^'([^]*?)'?$/;
  var doubleQuoteRegExp = /''/g;
  var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
  function format(date, formatStr, options) {
    const defaultOptions2 = getDefaultOptions();
    const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
    const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
    const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
    const originalDate = toDate(date, options?.in);
    if (!isValid(originalDate)) {
      throw new RangeError("Invalid time value");
    }
    let parts = formatStr.match(longFormattingTokensRegExp).map((substring) => {
      const firstCharacter = substring[0];
      if (firstCharacter === "p" || firstCharacter === "P") {
        const longFormatter = longFormatters[firstCharacter];
        return longFormatter(substring, locale.formatLong);
      }
      return substring;
    }).join("").match(formattingTokensRegExp).map((substring) => {
      if (substring === "''") {
        return { isToken: false, value: "'" };
      }
      const firstCharacter = substring[0];
      if (firstCharacter === "'") {
        return { isToken: false, value: cleanEscapedString(substring) };
      }
      if (formatters[firstCharacter]) {
        return { isToken: true, value: substring };
      }
      if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
        throw new RangeError(
          "Format string contains an unescaped latin alphabet character `" + firstCharacter + "`"
        );
      }
      return { isToken: false, value: substring };
    });
    if (locale.localize.preprocessor) {
      parts = locale.localize.preprocessor(originalDate, parts);
    }
    const formatterOptions = {
      firstWeekContainsDate,
      weekStartsOn,
      locale
    };
    return parts.map((part) => {
      if (!part.isToken) return part.value;
      const token = part.value;
      if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token) || !options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) {
        warnOrThrowProtectedError(token, formatStr, String(date));
      }
      const formatter = formatters[token[0]];
      return formatter(originalDate, token, locale.localize, formatterOptions);
    }).join("");
  }
  function cleanEscapedString(input) {
    const matched = input.match(escapedStringRegExp);
    if (!matched) {
      return input;
    }
    return matched[1].replace(doubleQuoteRegExp, "'");
  }

  // node_modules/date-fns/getDefaultOptions.js
  function getDefaultOptions2() {
    return Object.assign({}, getDefaultOptions());
  }

  // node_modules/date-fns/getISODay.js
  function getISODay(date, options) {
    const day = toDate(date, options?.in).getDay();
    return day === 0 ? 7 : day;
  }

  // node_modules/date-fns/transpose.js
  function transpose(date, constructor) {
    const date_ = isConstructor(constructor) ? new constructor(0) : constructFrom(constructor, 0);
    date_.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    date_.setHours(
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    );
    return date_;
  }
  function isConstructor(constructor) {
    return typeof constructor === "function" && constructor.prototype?.constructor === constructor;
  }

  // node_modules/date-fns/parse/_lib/Setter.js
  var TIMEZONE_UNIT_PRIORITY = 10;
  var Setter = class {
    subPriority = 0;
    validate(_utcDate, _options) {
      return true;
    }
  };
  var ValueSetter = class extends Setter {
    constructor(value, validateValue, setValue, priority, subPriority) {
      super();
      this.value = value;
      this.validateValue = validateValue;
      this.setValue = setValue;
      this.priority = priority;
      if (subPriority) {
        this.subPriority = subPriority;
      }
    }
    validate(date, options) {
      return this.validateValue(date, this.value, options);
    }
    set(date, flags, options) {
      return this.setValue(date, flags, this.value, options);
    }
  };
  var DateTimezoneSetter = class extends Setter {
    priority = TIMEZONE_UNIT_PRIORITY;
    subPriority = -1;
    constructor(context, reference) {
      super();
      this.context = context || ((date) => constructFrom(reference, date));
    }
    set(date, flags) {
      if (flags.timestampIsSet) return date;
      return constructFrom(date, transpose(date, this.context));
    }
  };

  // node_modules/date-fns/parse/_lib/Parser.js
  var Parser = class {
    run(dateString, token, match2, options) {
      const result = this.parse(dateString, token, match2, options);
      if (!result) {
        return null;
      }
      return {
        setter: new ValueSetter(
          result.value,
          this.validate,
          this.set,
          this.priority,
          this.subPriority
        ),
        rest: result.rest
      };
    }
    validate(_utcDate, _value, _options) {
      return true;
    }
  };

  // node_modules/date-fns/parse/_lib/parsers/EraParser.js
  var EraParser = class extends Parser {
    priority = 140;
    parse(dateString, token, match2) {
      switch (token) {
        // AD, BC
        case "G":
        case "GG":
        case "GGG":
          return match2.era(dateString, { width: "abbreviated" }) || match2.era(dateString, { width: "narrow" });
        // A, B
        case "GGGGG":
          return match2.era(dateString, { width: "narrow" });
        // Anno Domini, Before Christ
        case "GGGG":
        default:
          return match2.era(dateString, { width: "wide" }) || match2.era(dateString, { width: "abbreviated" }) || match2.era(dateString, { width: "narrow" });
      }
    }
    set(date, flags, value) {
      flags.era = value;
      date.setFullYear(value, 0, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    incompatibleTokens = ["R", "u", "t", "T"];
  };

  // node_modules/date-fns/parse/_lib/constants.js
  var numericPatterns = {
    month: /^(1[0-2]|0?\d)/,
    // 0 to 12
    date: /^(3[0-1]|[0-2]?\d)/,
    // 0 to 31
    dayOfYear: /^(36[0-6]|3[0-5]\d|[0-2]?\d?\d)/,
    // 0 to 366
    week: /^(5[0-3]|[0-4]?\d)/,
    // 0 to 53
    hour23h: /^(2[0-3]|[0-1]?\d)/,
    // 0 to 23
    hour24h: /^(2[0-4]|[0-1]?\d)/,
    // 0 to 24
    hour11h: /^(1[0-1]|0?\d)/,
    // 0 to 11
    hour12h: /^(1[0-2]|0?\d)/,
    // 0 to 12
    minute: /^[0-5]?\d/,
    // 0 to 59
    second: /^[0-5]?\d/,
    // 0 to 59
    singleDigit: /^\d/,
    // 0 to 9
    twoDigits: /^\d{1,2}/,
    // 0 to 99
    threeDigits: /^\d{1,3}/,
    // 0 to 999
    fourDigits: /^\d{1,4}/,
    // 0 to 9999
    anyDigitsSigned: /^-?\d+/,
    singleDigitSigned: /^-?\d/,
    // 0 to 9, -0 to -9
    twoDigitsSigned: /^-?\d{1,2}/,
    // 0 to 99, -0 to -99
    threeDigitsSigned: /^-?\d{1,3}/,
    // 0 to 999, -0 to -999
    fourDigitsSigned: /^-?\d{1,4}/
    // 0 to 9999, -0 to -9999
  };
  var timezonePatterns = {
    basicOptionalMinutes: /^([+-])(\d{2})(\d{2})?|Z/,
    basic: /^([+-])(\d{2})(\d{2})|Z/,
    basicOptionalSeconds: /^([+-])(\d{2})(\d{2})((\d{2}))?|Z/,
    extended: /^([+-])(\d{2}):(\d{2})|Z/,
    extendedOptionalSeconds: /^([+-])(\d{2}):(\d{2})(:(\d{2}))?|Z/
  };

  // node_modules/date-fns/parse/_lib/utils.js
  function mapValue(parseFnResult, mapFn) {
    if (!parseFnResult) {
      return parseFnResult;
    }
    return {
      value: mapFn(parseFnResult.value),
      rest: parseFnResult.rest
    };
  }
  function parseNumericPattern(pattern, dateString) {
    const matchResult = dateString.match(pattern);
    if (!matchResult) {
      return null;
    }
    return {
      value: parseInt(matchResult[0], 10),
      rest: dateString.slice(matchResult[0].length)
    };
  }
  function parseTimezonePattern(pattern, dateString) {
    const matchResult = dateString.match(pattern);
    if (!matchResult) {
      return null;
    }
    if (matchResult[0] === "Z") {
      return {
        value: 0,
        rest: dateString.slice(1)
      };
    }
    const sign = matchResult[1] === "+" ? 1 : -1;
    const hours = matchResult[2] ? parseInt(matchResult[2], 10) : 0;
    const minutes = matchResult[3] ? parseInt(matchResult[3], 10) : 0;
    const seconds = matchResult[5] ? parseInt(matchResult[5], 10) : 0;
    return {
      value: sign * (hours * millisecondsInHour + minutes * millisecondsInMinute + seconds * millisecondsInSecond),
      rest: dateString.slice(matchResult[0].length)
    };
  }
  function parseAnyDigitsSigned(dateString) {
    return parseNumericPattern(numericPatterns.anyDigitsSigned, dateString);
  }
  function parseNDigits(n, dateString) {
    switch (n) {
      case 1:
        return parseNumericPattern(numericPatterns.singleDigit, dateString);
      case 2:
        return parseNumericPattern(numericPatterns.twoDigits, dateString);
      case 3:
        return parseNumericPattern(numericPatterns.threeDigits, dateString);
      case 4:
        return parseNumericPattern(numericPatterns.fourDigits, dateString);
      default:
        return parseNumericPattern(new RegExp("^\\d{1," + n + "}"), dateString);
    }
  }
  function parseNDigitsSigned(n, dateString) {
    switch (n) {
      case 1:
        return parseNumericPattern(numericPatterns.singleDigitSigned, dateString);
      case 2:
        return parseNumericPattern(numericPatterns.twoDigitsSigned, dateString);
      case 3:
        return parseNumericPattern(numericPatterns.threeDigitsSigned, dateString);
      case 4:
        return parseNumericPattern(numericPatterns.fourDigitsSigned, dateString);
      default:
        return parseNumericPattern(new RegExp("^-?\\d{1," + n + "}"), dateString);
    }
  }
  function dayPeriodEnumToHours(dayPeriod) {
    switch (dayPeriod) {
      case "morning":
        return 4;
      case "evening":
        return 17;
      case "pm":
      case "noon":
      case "afternoon":
        return 12;
      case "am":
      case "midnight":
      case "night":
      default:
        return 0;
    }
  }
  function normalizeTwoDigitYear(twoDigitYear, currentYear) {
    const isCommonEra = currentYear > 0;
    const absCurrentYear = isCommonEra ? currentYear : 1 - currentYear;
    let result;
    if (absCurrentYear <= 50) {
      result = twoDigitYear || 100;
    } else {
      const rangeEnd = absCurrentYear + 50;
      const rangeEndCentury = Math.trunc(rangeEnd / 100) * 100;
      const isPreviousCentury = twoDigitYear >= rangeEnd % 100;
      result = twoDigitYear + rangeEndCentury - (isPreviousCentury ? 100 : 0);
    }
    return isCommonEra ? result : 1 - result;
  }
  function isLeapYearIndex(year) {
    return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
  }

  // node_modules/date-fns/parse/_lib/parsers/YearParser.js
  var YearParser = class extends Parser {
    priority = 130;
    incompatibleTokens = ["Y", "R", "u", "w", "I", "i", "e", "c", "t", "T"];
    parse(dateString, token, match2) {
      const valueCallback = (year) => ({
        year,
        isTwoDigitYear: token === "yy"
      });
      switch (token) {
        case "y":
          return mapValue(parseNDigits(4, dateString), valueCallback);
        case "yo":
          return mapValue(
            match2.ordinalNumber(dateString, {
              unit: "year"
            }),
            valueCallback
          );
        default:
          return mapValue(parseNDigits(token.length, dateString), valueCallback);
      }
    }
    validate(_date, value) {
      return value.isTwoDigitYear || value.year > 0;
    }
    set(date, flags, value) {
      const currentYear = date.getFullYear();
      if (value.isTwoDigitYear) {
        const normalizedTwoDigitYear = normalizeTwoDigitYear(
          value.year,
          currentYear
        );
        date.setFullYear(normalizedTwoDigitYear, 0, 1);
        date.setHours(0, 0, 0, 0);
        return date;
      }
      const year = !("era" in flags) || flags.era === 1 ? value.year : 1 - value.year;
      date.setFullYear(year, 0, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
  };

  // node_modules/date-fns/parse/_lib/parsers/LocalWeekYearParser.js
  var LocalWeekYearParser = class extends Parser {
    priority = 130;
    parse(dateString, token, match2) {
      const valueCallback = (year) => ({
        year,
        isTwoDigitYear: token === "YY"
      });
      switch (token) {
        case "Y":
          return mapValue(parseNDigits(4, dateString), valueCallback);
        case "Yo":
          return mapValue(
            match2.ordinalNumber(dateString, {
              unit: "year"
            }),
            valueCallback
          );
        default:
          return mapValue(parseNDigits(token.length, dateString), valueCallback);
      }
    }
    validate(_date, value) {
      return value.isTwoDigitYear || value.year > 0;
    }
    set(date, flags, value, options) {
      const currentYear = getWeekYear(date, options);
      if (value.isTwoDigitYear) {
        const normalizedTwoDigitYear = normalizeTwoDigitYear(
          value.year,
          currentYear
        );
        date.setFullYear(
          normalizedTwoDigitYear,
          0,
          options.firstWeekContainsDate
        );
        date.setHours(0, 0, 0, 0);
        return startOfWeek(date, options);
      }
      const year = !("era" in flags) || flags.era === 1 ? value.year : 1 - value.year;
      date.setFullYear(year, 0, options.firstWeekContainsDate);
      date.setHours(0, 0, 0, 0);
      return startOfWeek(date, options);
    }
    incompatibleTokens = [
      "y",
      "R",
      "u",
      "Q",
      "q",
      "M",
      "L",
      "I",
      "d",
      "D",
      "i",
      "t",
      "T"
    ];
  };

  // node_modules/date-fns/parse/_lib/parsers/ISOWeekYearParser.js
  var ISOWeekYearParser = class extends Parser {
    priority = 130;
    parse(dateString, token) {
      if (token === "R") {
        return parseNDigitsSigned(4, dateString);
      }
      return parseNDigitsSigned(token.length, dateString);
    }
    set(date, _flags, value) {
      const firstWeekOfYear = constructFrom(date, 0);
      firstWeekOfYear.setFullYear(value, 0, 4);
      firstWeekOfYear.setHours(0, 0, 0, 0);
      return startOfISOWeek(firstWeekOfYear);
    }
    incompatibleTokens = [
      "G",
      "y",
      "Y",
      "u",
      "Q",
      "q",
      "M",
      "L",
      "w",
      "d",
      "D",
      "e",
      "c",
      "t",
      "T"
    ];
  };

  // node_modules/date-fns/parse/_lib/parsers/ExtendedYearParser.js
  var ExtendedYearParser = class extends Parser {
    priority = 130;
    parse(dateString, token) {
      if (token === "u") {
        return parseNDigitsSigned(4, dateString);
      }
      return parseNDigitsSigned(token.length, dateString);
    }
    set(date, _flags, value) {
      date.setFullYear(value, 0, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    incompatibleTokens = ["G", "y", "Y", "R", "w", "I", "i", "e", "c", "t", "T"];
  };

  // node_modules/date-fns/parse/_lib/parsers/QuarterParser.js
  var QuarterParser = class extends Parser {
    priority = 120;
    parse(dateString, token, match2) {
      switch (token) {
        // 1, 2, 3, 4
        case "Q":
        case "QQ":
          return parseNDigits(token.length, dateString);
        // 1st, 2nd, 3rd, 4th
        case "Qo":
          return match2.ordinalNumber(dateString, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "QQQ":
          return match2.quarter(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.quarter(dateString, {
            width: "narrow",
            context: "formatting"
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "QQQQQ":
          return match2.quarter(dateString, {
            width: "narrow",
            context: "formatting"
          });
        // 1st quarter, 2nd quarter, ...
        case "QQQQ":
        default:
          return match2.quarter(dateString, {
            width: "wide",
            context: "formatting"
          }) || match2.quarter(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.quarter(dateString, {
            width: "narrow",
            context: "formatting"
          });
      }
    }
    validate(_date, value) {
      return value >= 1 && value <= 4;
    }
    set(date, _flags, value) {
      date.setMonth((value - 1) * 3, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    incompatibleTokens = [
      "Y",
      "R",
      "q",
      "M",
      "L",
      "w",
      "I",
      "d",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T"
    ];
  };

  // node_modules/date-fns/parse/_lib/parsers/StandAloneQuarterParser.js
  var StandAloneQuarterParser = class extends Parser {
    priority = 120;
    parse(dateString, token, match2) {
      switch (token) {
        // 1, 2, 3, 4
        case "q":
        case "qq":
          return parseNDigits(token.length, dateString);
        // 1st, 2nd, 3rd, 4th
        case "qo":
          return match2.ordinalNumber(dateString, { unit: "quarter" });
        // Q1, Q2, Q3, Q4
        case "qqq":
          return match2.quarter(dateString, {
            width: "abbreviated",
            context: "standalone"
          }) || match2.quarter(dateString, {
            width: "narrow",
            context: "standalone"
          });
        // 1, 2, 3, 4 (narrow quarter; could be not numerical)
        case "qqqqq":
          return match2.quarter(dateString, {
            width: "narrow",
            context: "standalone"
          });
        // 1st quarter, 2nd quarter, ...
        case "qqqq":
        default:
          return match2.quarter(dateString, {
            width: "wide",
            context: "standalone"
          }) || match2.quarter(dateString, {
            width: "abbreviated",
            context: "standalone"
          }) || match2.quarter(dateString, {
            width: "narrow",
            context: "standalone"
          });
      }
    }
    validate(_date, value) {
      return value >= 1 && value <= 4;
    }
    set(date, _flags, value) {
      date.setMonth((value - 1) * 3, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    incompatibleTokens = [
      "Y",
      "R",
      "Q",
      "M",
      "L",
      "w",
      "I",
      "d",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T"
    ];
  };

  // node_modules/date-fns/parse/_lib/parsers/MonthParser.js
  var MonthParser = class extends Parser {
    incompatibleTokens = [
      "Y",
      "R",
      "q",
      "Q",
      "L",
      "w",
      "I",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T"
    ];
    priority = 110;
    parse(dateString, token, match2) {
      const valueCallback = (value) => value - 1;
      switch (token) {
        // 1, 2, ..., 12
        case "M":
          return mapValue(
            parseNumericPattern(numericPatterns.month, dateString),
            valueCallback
          );
        // 01, 02, ..., 12
        case "MM":
          return mapValue(parseNDigits(2, dateString), valueCallback);
        // 1st, 2nd, ..., 12th
        case "Mo":
          return mapValue(
            match2.ordinalNumber(dateString, {
              unit: "month"
            }),
            valueCallback
          );
        // Jan, Feb, ..., Dec
        case "MMM":
          return match2.month(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.month(dateString, { width: "narrow", context: "formatting" });
        // J, F, ..., D
        case "MMMMM":
          return match2.month(dateString, {
            width: "narrow",
            context: "formatting"
          });
        // January, February, ..., December
        case "MMMM":
        default:
          return match2.month(dateString, { width: "wide", context: "formatting" }) || match2.month(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.month(dateString, { width: "narrow", context: "formatting" });
      }
    }
    validate(_date, value) {
      return value >= 0 && value <= 11;
    }
    set(date, _flags, value) {
      date.setMonth(value, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
  };

  // node_modules/date-fns/parse/_lib/parsers/StandAloneMonthParser.js
  var StandAloneMonthParser = class extends Parser {
    priority = 110;
    parse(dateString, token, match2) {
      const valueCallback = (value) => value - 1;
      switch (token) {
        // 1, 2, ..., 12
        case "L":
          return mapValue(
            parseNumericPattern(numericPatterns.month, dateString),
            valueCallback
          );
        // 01, 02, ..., 12
        case "LL":
          return mapValue(parseNDigits(2, dateString), valueCallback);
        // 1st, 2nd, ..., 12th
        case "Lo":
          return mapValue(
            match2.ordinalNumber(dateString, {
              unit: "month"
            }),
            valueCallback
          );
        // Jan, Feb, ..., Dec
        case "LLL":
          return match2.month(dateString, {
            width: "abbreviated",
            context: "standalone"
          }) || match2.month(dateString, { width: "narrow", context: "standalone" });
        // J, F, ..., D
        case "LLLLL":
          return match2.month(dateString, {
            width: "narrow",
            context: "standalone"
          });
        // January, February, ..., December
        case "LLLL":
        default:
          return match2.month(dateString, { width: "wide", context: "standalone" }) || match2.month(dateString, {
            width: "abbreviated",
            context: "standalone"
          }) || match2.month(dateString, { width: "narrow", context: "standalone" });
      }
    }
    validate(_date, value) {
      return value >= 0 && value <= 11;
    }
    set(date, _flags, value) {
      date.setMonth(value, 1);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    incompatibleTokens = [
      "Y",
      "R",
      "q",
      "Q",
      "M",
      "w",
      "I",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T"
    ];
  };

  // node_modules/date-fns/setWeek.js
  function setWeek(date, week, options) {
    const date_ = toDate(date, options?.in);
    const diff = getWeek(date_, options) - week;
    date_.setDate(date_.getDate() - diff * 7);
    return toDate(date_, options?.in);
  }

  // node_modules/date-fns/parse/_lib/parsers/LocalWeekParser.js
  var LocalWeekParser = class extends Parser {
    priority = 100;
    parse(dateString, token, match2) {
      switch (token) {
        case "w":
          return parseNumericPattern(numericPatterns.week, dateString);
        case "wo":
          return match2.ordinalNumber(dateString, { unit: "week" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
    validate(_date, value) {
      return value >= 1 && value <= 53;
    }
    set(date, _flags, value, options) {
      return startOfWeek(setWeek(date, value, options), options);
    }
    incompatibleTokens = [
      "y",
      "R",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "I",
      "d",
      "D",
      "i",
      "t",
      "T"
    ];
  };

  // node_modules/date-fns/setISOWeek.js
  function setISOWeek(date, week, options) {
    const _date = toDate(date, options?.in);
    const diff = getISOWeek(_date, options) - week;
    _date.setDate(_date.getDate() - diff * 7);
    return _date;
  }

  // node_modules/date-fns/parse/_lib/parsers/ISOWeekParser.js
  var ISOWeekParser = class extends Parser {
    priority = 100;
    parse(dateString, token, match2) {
      switch (token) {
        case "I":
          return parseNumericPattern(numericPatterns.week, dateString);
        case "Io":
          return match2.ordinalNumber(dateString, { unit: "week" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
    validate(_date, value) {
      return value >= 1 && value <= 53;
    }
    set(date, _flags, value) {
      return startOfISOWeek(setISOWeek(date, value));
    }
    incompatibleTokens = [
      "y",
      "Y",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "w",
      "d",
      "D",
      "e",
      "c",
      "t",
      "T"
    ];
  };

  // node_modules/date-fns/parse/_lib/parsers/DateParser.js
  var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var DAYS_IN_MONTH_LEAP_YEAR = [
    31,
    29,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ];
  var DateParser = class extends Parser {
    priority = 90;
    subPriority = 1;
    parse(dateString, token, match2) {
      switch (token) {
        case "d":
          return parseNumericPattern(numericPatterns.date, dateString);
        case "do":
          return match2.ordinalNumber(dateString, { unit: "date" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
    validate(date, value) {
      const year = date.getFullYear();
      const isLeapYear = isLeapYearIndex(year);
      const month = date.getMonth();
      if (isLeapYear) {
        return value >= 1 && value <= DAYS_IN_MONTH_LEAP_YEAR[month];
      } else {
        return value >= 1 && value <= DAYS_IN_MONTH[month];
      }
    }
    set(date, _flags, value) {
      date.setDate(value);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    incompatibleTokens = [
      "Y",
      "R",
      "q",
      "Q",
      "w",
      "I",
      "D",
      "i",
      "e",
      "c",
      "t",
      "T"
    ];
  };

  // node_modules/date-fns/parse/_lib/parsers/DayOfYearParser.js
  var DayOfYearParser = class extends Parser {
    priority = 90;
    subpriority = 1;
    parse(dateString, token, match2) {
      switch (token) {
        case "D":
        case "DD":
          return parseNumericPattern(numericPatterns.dayOfYear, dateString);
        case "Do":
          return match2.ordinalNumber(dateString, { unit: "date" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
    validate(date, value) {
      const year = date.getFullYear();
      const isLeapYear = isLeapYearIndex(year);
      if (isLeapYear) {
        return value >= 1 && value <= 366;
      } else {
        return value >= 1 && value <= 365;
      }
    }
    set(date, _flags, value) {
      date.setMonth(0, value);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    incompatibleTokens = [
      "Y",
      "R",
      "q",
      "Q",
      "M",
      "L",
      "w",
      "I",
      "d",
      "E",
      "i",
      "e",
      "c",
      "t",
      "T"
    ];
  };

  // node_modules/date-fns/setDay.js
  function setDay(date, day, options) {
    const defaultOptions2 = getDefaultOptions();
    const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
    const date_ = toDate(date, options?.in);
    const currentDay = date_.getDay();
    const remainder = day % 7;
    const dayIndex = (remainder + 7) % 7;
    const delta = 7 - weekStartsOn;
    const diff = day < 0 || day > 6 ? day - (currentDay + delta) % 7 : (dayIndex + delta) % 7 - (currentDay + delta) % 7;
    return addDays(date_, diff, options);
  }

  // node_modules/date-fns/parse/_lib/parsers/DayParser.js
  var DayParser = class extends Parser {
    priority = 90;
    parse(dateString, token, match2) {
      switch (token) {
        // Tue
        case "E":
        case "EE":
        case "EEE":
          return match2.day(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.day(dateString, { width: "short", context: "formatting" }) || match2.day(dateString, { width: "narrow", context: "formatting" });
        // T
        case "EEEEE":
          return match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "EEEEEE":
          return match2.day(dateString, { width: "short", context: "formatting" }) || match2.day(dateString, { width: "narrow", context: "formatting" });
        // Tuesday
        case "EEEE":
        default:
          return match2.day(dateString, { width: "wide", context: "formatting" }) || match2.day(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.day(dateString, { width: "short", context: "formatting" }) || match2.day(dateString, { width: "narrow", context: "formatting" });
      }
    }
    validate(_date, value) {
      return value >= 0 && value <= 6;
    }
    set(date, _flags, value, options) {
      date = setDay(date, value, options);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    incompatibleTokens = ["D", "i", "e", "c", "t", "T"];
  };

  // node_modules/date-fns/parse/_lib/parsers/LocalDayParser.js
  var LocalDayParser = class extends Parser {
    priority = 90;
    parse(dateString, token, match2, options) {
      const valueCallback = (value) => {
        const wholeWeekDays = Math.floor((value - 1) / 7) * 7;
        return (value + options.weekStartsOn + 6) % 7 + wholeWeekDays;
      };
      switch (token) {
        // 3
        case "e":
        case "ee":
          return mapValue(parseNDigits(token.length, dateString), valueCallback);
        // 3rd
        case "eo":
          return mapValue(
            match2.ordinalNumber(dateString, {
              unit: "day"
            }),
            valueCallback
          );
        // Tue
        case "eee":
          return match2.day(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.day(dateString, { width: "short", context: "formatting" }) || match2.day(dateString, { width: "narrow", context: "formatting" });
        // T
        case "eeeee":
          return match2.day(dateString, {
            width: "narrow",
            context: "formatting"
          });
        // Tu
        case "eeeeee":
          return match2.day(dateString, { width: "short", context: "formatting" }) || match2.day(dateString, { width: "narrow", context: "formatting" });
        // Tuesday
        case "eeee":
        default:
          return match2.day(dateString, { width: "wide", context: "formatting" }) || match2.day(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.day(dateString, { width: "short", context: "formatting" }) || match2.day(dateString, { width: "narrow", context: "formatting" });
      }
    }
    validate(_date, value) {
      return value >= 0 && value <= 6;
    }
    set(date, _flags, value, options) {
      date = setDay(date, value, options);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    incompatibleTokens = [
      "y",
      "R",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "I",
      "d",
      "D",
      "E",
      "i",
      "c",
      "t",
      "T"
    ];
  };

  // node_modules/date-fns/parse/_lib/parsers/StandAloneLocalDayParser.js
  var StandAloneLocalDayParser = class extends Parser {
    priority = 90;
    parse(dateString, token, match2, options) {
      const valueCallback = (value) => {
        const wholeWeekDays = Math.floor((value - 1) / 7) * 7;
        return (value + options.weekStartsOn + 6) % 7 + wholeWeekDays;
      };
      switch (token) {
        // 3
        case "c":
        case "cc":
          return mapValue(parseNDigits(token.length, dateString), valueCallback);
        // 3rd
        case "co":
          return mapValue(
            match2.ordinalNumber(dateString, {
              unit: "day"
            }),
            valueCallback
          );
        // Tue
        case "ccc":
          return match2.day(dateString, {
            width: "abbreviated",
            context: "standalone"
          }) || match2.day(dateString, { width: "short", context: "standalone" }) || match2.day(dateString, { width: "narrow", context: "standalone" });
        // T
        case "ccccc":
          return match2.day(dateString, {
            width: "narrow",
            context: "standalone"
          });
        // Tu
        case "cccccc":
          return match2.day(dateString, { width: "short", context: "standalone" }) || match2.day(dateString, { width: "narrow", context: "standalone" });
        // Tuesday
        case "cccc":
        default:
          return match2.day(dateString, { width: "wide", context: "standalone" }) || match2.day(dateString, {
            width: "abbreviated",
            context: "standalone"
          }) || match2.day(dateString, { width: "short", context: "standalone" }) || match2.day(dateString, { width: "narrow", context: "standalone" });
      }
    }
    validate(_date, value) {
      return value >= 0 && value <= 6;
    }
    set(date, _flags, value, options) {
      date = setDay(date, value, options);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    incompatibleTokens = [
      "y",
      "R",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "I",
      "d",
      "D",
      "E",
      "i",
      "e",
      "t",
      "T"
    ];
  };

  // node_modules/date-fns/setISODay.js
  function setISODay(date, day, options) {
    const date_ = toDate(date, options?.in);
    const currentDay = getISODay(date_, options);
    const diff = day - currentDay;
    return addDays(date_, diff, options);
  }

  // node_modules/date-fns/parse/_lib/parsers/ISODayParser.js
  var ISODayParser = class extends Parser {
    priority = 90;
    parse(dateString, token, match2) {
      const valueCallback = (value) => {
        if (value === 0) {
          return 7;
        }
        return value;
      };
      switch (token) {
        // 2
        case "i":
        case "ii":
          return parseNDigits(token.length, dateString);
        // 2nd
        case "io":
          return match2.ordinalNumber(dateString, { unit: "day" });
        // Tue
        case "iii":
          return mapValue(
            match2.day(dateString, {
              width: "abbreviated",
              context: "formatting"
            }) || match2.day(dateString, {
              width: "short",
              context: "formatting"
            }) || match2.day(dateString, {
              width: "narrow",
              context: "formatting"
            }),
            valueCallback
          );
        // T
        case "iiiii":
          return mapValue(
            match2.day(dateString, {
              width: "narrow",
              context: "formatting"
            }),
            valueCallback
          );
        // Tu
        case "iiiiii":
          return mapValue(
            match2.day(dateString, {
              width: "short",
              context: "formatting"
            }) || match2.day(dateString, {
              width: "narrow",
              context: "formatting"
            }),
            valueCallback
          );
        // Tuesday
        case "iiii":
        default:
          return mapValue(
            match2.day(dateString, {
              width: "wide",
              context: "formatting"
            }) || match2.day(dateString, {
              width: "abbreviated",
              context: "formatting"
            }) || match2.day(dateString, {
              width: "short",
              context: "formatting"
            }) || match2.day(dateString, {
              width: "narrow",
              context: "formatting"
            }),
            valueCallback
          );
      }
    }
    validate(_date, value) {
      return value >= 1 && value <= 7;
    }
    set(date, _flags, value) {
      date = setISODay(date, value);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    incompatibleTokens = [
      "y",
      "Y",
      "u",
      "q",
      "Q",
      "M",
      "L",
      "w",
      "d",
      "D",
      "E",
      "e",
      "c",
      "t",
      "T"
    ];
  };

  // node_modules/date-fns/parse/_lib/parsers/AMPMParser.js
  var AMPMParser = class extends Parser {
    priority = 80;
    parse(dateString, token, match2) {
      switch (token) {
        case "a":
        case "aa":
        case "aaa":
          return match2.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "aaaaa":
          return match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "aaaa":
        default:
          return match2.dayPeriod(dateString, {
            width: "wide",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
      }
    }
    set(date, _flags, value) {
      date.setHours(dayPeriodEnumToHours(value), 0, 0, 0);
      return date;
    }
    incompatibleTokens = ["b", "B", "H", "k", "t", "T"];
  };

  // node_modules/date-fns/parse/_lib/parsers/AMPMMidnightParser.js
  var AMPMMidnightParser = class extends Parser {
    priority = 80;
    parse(dateString, token, match2) {
      switch (token) {
        case "b":
        case "bb":
        case "bbb":
          return match2.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "bbbbb":
          return match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "bbbb":
        default:
          return match2.dayPeriod(dateString, {
            width: "wide",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
      }
    }
    set(date, _flags, value) {
      date.setHours(dayPeriodEnumToHours(value), 0, 0, 0);
      return date;
    }
    incompatibleTokens = ["a", "B", "H", "k", "t", "T"];
  };

  // node_modules/date-fns/parse/_lib/parsers/DayPeriodParser.js
  var DayPeriodParser = class extends Parser {
    priority = 80;
    parse(dateString, token, match2) {
      switch (token) {
        case "B":
        case "BB":
        case "BBB":
          return match2.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "BBBBB":
          return match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
        case "BBBB":
        default:
          return match2.dayPeriod(dateString, {
            width: "wide",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "abbreviated",
            context: "formatting"
          }) || match2.dayPeriod(dateString, {
            width: "narrow",
            context: "formatting"
          });
      }
    }
    set(date, _flags, value) {
      date.setHours(dayPeriodEnumToHours(value), 0, 0, 0);
      return date;
    }
    incompatibleTokens = ["a", "b", "t", "T"];
  };

  // node_modules/date-fns/parse/_lib/parsers/Hour1to12Parser.js
  var Hour1to12Parser = class extends Parser {
    priority = 70;
    parse(dateString, token, match2) {
      switch (token) {
        case "h":
          return parseNumericPattern(numericPatterns.hour12h, dateString);
        case "ho":
          return match2.ordinalNumber(dateString, { unit: "hour" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
    validate(_date, value) {
      return value >= 1 && value <= 12;
    }
    set(date, _flags, value) {
      const isPM = date.getHours() >= 12;
      if (isPM && value < 12) {
        date.setHours(value + 12, 0, 0, 0);
      } else if (!isPM && value === 12) {
        date.setHours(0, 0, 0, 0);
      } else {
        date.setHours(value, 0, 0, 0);
      }
      return date;
    }
    incompatibleTokens = ["H", "K", "k", "t", "T"];
  };

  // node_modules/date-fns/parse/_lib/parsers/Hour0to23Parser.js
  var Hour0to23Parser = class extends Parser {
    priority = 70;
    parse(dateString, token, match2) {
      switch (token) {
        case "H":
          return parseNumericPattern(numericPatterns.hour23h, dateString);
        case "Ho":
          return match2.ordinalNumber(dateString, { unit: "hour" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
    validate(_date, value) {
      return value >= 0 && value <= 23;
    }
    set(date, _flags, value) {
      date.setHours(value, 0, 0, 0);
      return date;
    }
    incompatibleTokens = ["a", "b", "h", "K", "k", "t", "T"];
  };

  // node_modules/date-fns/parse/_lib/parsers/Hour0To11Parser.js
  var Hour0To11Parser = class extends Parser {
    priority = 70;
    parse(dateString, token, match2) {
      switch (token) {
        case "K":
          return parseNumericPattern(numericPatterns.hour11h, dateString);
        case "Ko":
          return match2.ordinalNumber(dateString, { unit: "hour" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
    validate(_date, value) {
      return value >= 0 && value <= 11;
    }
    set(date, _flags, value) {
      const isPM = date.getHours() >= 12;
      if (isPM && value < 12) {
        date.setHours(value + 12, 0, 0, 0);
      } else {
        date.setHours(value, 0, 0, 0);
      }
      return date;
    }
    incompatibleTokens = ["h", "H", "k", "t", "T"];
  };

  // node_modules/date-fns/parse/_lib/parsers/Hour1To24Parser.js
  var Hour1To24Parser = class extends Parser {
    priority = 70;
    parse(dateString, token, match2) {
      switch (token) {
        case "k":
          return parseNumericPattern(numericPatterns.hour24h, dateString);
        case "ko":
          return match2.ordinalNumber(dateString, { unit: "hour" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
    validate(_date, value) {
      return value >= 1 && value <= 24;
    }
    set(date, _flags, value) {
      const hours = value <= 24 ? value % 24 : value;
      date.setHours(hours, 0, 0, 0);
      return date;
    }
    incompatibleTokens = ["a", "b", "h", "H", "K", "t", "T"];
  };

  // node_modules/date-fns/parse/_lib/parsers/MinuteParser.js
  var MinuteParser = class extends Parser {
    priority = 60;
    parse(dateString, token, match2) {
      switch (token) {
        case "m":
          return parseNumericPattern(numericPatterns.minute, dateString);
        case "mo":
          return match2.ordinalNumber(dateString, { unit: "minute" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
    validate(_date, value) {
      return value >= 0 && value <= 59;
    }
    set(date, _flags, value) {
      date.setMinutes(value, 0, 0);
      return date;
    }
    incompatibleTokens = ["t", "T"];
  };

  // node_modules/date-fns/parse/_lib/parsers/SecondParser.js
  var SecondParser = class extends Parser {
    priority = 50;
    parse(dateString, token, match2) {
      switch (token) {
        case "s":
          return parseNumericPattern(numericPatterns.second, dateString);
        case "so":
          return match2.ordinalNumber(dateString, { unit: "second" });
        default:
          return parseNDigits(token.length, dateString);
      }
    }
    validate(_date, value) {
      return value >= 0 && value <= 59;
    }
    set(date, _flags, value) {
      date.setSeconds(value, 0);
      return date;
    }
    incompatibleTokens = ["t", "T"];
  };

  // node_modules/date-fns/parse/_lib/parsers/FractionOfSecondParser.js
  var FractionOfSecondParser = class extends Parser {
    priority = 30;
    parse(dateString, token) {
      const valueCallback = (value) => Math.trunc(value * Math.pow(10, -token.length + 3));
      return mapValue(parseNDigits(token.length, dateString), valueCallback);
    }
    set(date, _flags, value) {
      date.setMilliseconds(value);
      return date;
    }
    incompatibleTokens = ["t", "T"];
  };

  // node_modules/date-fns/parse/_lib/parsers/ISOTimezoneWithZParser.js
  var ISOTimezoneWithZParser = class extends Parser {
    priority = 10;
    parse(dateString, token) {
      switch (token) {
        case "X":
          return parseTimezonePattern(
            timezonePatterns.basicOptionalMinutes,
            dateString
          );
        case "XX":
          return parseTimezonePattern(timezonePatterns.basic, dateString);
        case "XXXX":
          return parseTimezonePattern(
            timezonePatterns.basicOptionalSeconds,
            dateString
          );
        case "XXXXX":
          return parseTimezonePattern(
            timezonePatterns.extendedOptionalSeconds,
            dateString
          );
        case "XXX":
        default:
          return parseTimezonePattern(timezonePatterns.extended, dateString);
      }
    }
    set(date, flags, value) {
      if (flags.timestampIsSet) return date;
      return constructFrom(
        date,
        date.getTime() - getTimezoneOffsetInMilliseconds(date) - value
      );
    }
    incompatibleTokens = ["t", "T", "x"];
  };

  // node_modules/date-fns/parse/_lib/parsers/ISOTimezoneParser.js
  var ISOTimezoneParser = class extends Parser {
    priority = 10;
    parse(dateString, token) {
      switch (token) {
        case "x":
          return parseTimezonePattern(
            timezonePatterns.basicOptionalMinutes,
            dateString
          );
        case "xx":
          return parseTimezonePattern(timezonePatterns.basic, dateString);
        case "xxxx":
          return parseTimezonePattern(
            timezonePatterns.basicOptionalSeconds,
            dateString
          );
        case "xxxxx":
          return parseTimezonePattern(
            timezonePatterns.extendedOptionalSeconds,
            dateString
          );
        case "xxx":
        default:
          return parseTimezonePattern(timezonePatterns.extended, dateString);
      }
    }
    set(date, flags, value) {
      if (flags.timestampIsSet) return date;
      return constructFrom(
        date,
        date.getTime() - getTimezoneOffsetInMilliseconds(date) - value
      );
    }
    incompatibleTokens = ["t", "T", "X"];
  };

  // node_modules/date-fns/parse/_lib/parsers/TimestampSecondsParser.js
  var TimestampSecondsParser = class extends Parser {
    priority = 40;
    parse(dateString) {
      return parseAnyDigitsSigned(dateString);
    }
    set(date, _flags, value) {
      return [constructFrom(date, value * 1e3), { timestampIsSet: true }];
    }
    incompatibleTokens = "*";
  };

  // node_modules/date-fns/parse/_lib/parsers/TimestampMillisecondsParser.js
  var TimestampMillisecondsParser = class extends Parser {
    priority = 20;
    parse(dateString) {
      return parseAnyDigitsSigned(dateString);
    }
    set(date, _flags, value) {
      return [constructFrom(date, value), { timestampIsSet: true }];
    }
    incompatibleTokens = "*";
  };

  // node_modules/date-fns/parse/_lib/parsers.js
  var parsers = {
    G: new EraParser(),
    y: new YearParser(),
    Y: new LocalWeekYearParser(),
    R: new ISOWeekYearParser(),
    u: new ExtendedYearParser(),
    Q: new QuarterParser(),
    q: new StandAloneQuarterParser(),
    M: new MonthParser(),
    L: new StandAloneMonthParser(),
    w: new LocalWeekParser(),
    I: new ISOWeekParser(),
    d: new DateParser(),
    D: new DayOfYearParser(),
    E: new DayParser(),
    e: new LocalDayParser(),
    c: new StandAloneLocalDayParser(),
    i: new ISODayParser(),
    a: new AMPMParser(),
    b: new AMPMMidnightParser(),
    B: new DayPeriodParser(),
    h: new Hour1to12Parser(),
    H: new Hour0to23Parser(),
    K: new Hour0To11Parser(),
    k: new Hour1To24Parser(),
    m: new MinuteParser(),
    s: new SecondParser(),
    S: new FractionOfSecondParser(),
    X: new ISOTimezoneWithZParser(),
    x: new ISOTimezoneParser(),
    t: new TimestampSecondsParser(),
    T: new TimestampMillisecondsParser()
  };

  // node_modules/date-fns/parse.js
  var formattingTokensRegExp2 = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
  var longFormattingTokensRegExp2 = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
  var escapedStringRegExp2 = /^'([^]*?)'?$/;
  var doubleQuoteRegExp2 = /''/g;
  var notWhitespaceRegExp = /\S/;
  var unescapedLatinCharacterRegExp2 = /[a-zA-Z]/;
  function parse(dateStr, formatStr, referenceDate, options) {
    const invalidDate = () => constructFrom(options?.in || referenceDate, NaN);
    const defaultOptions2 = getDefaultOptions2();
    const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
    const firstWeekContainsDate = options?.firstWeekContainsDate ?? options?.locale?.options?.firstWeekContainsDate ?? defaultOptions2.firstWeekContainsDate ?? defaultOptions2.locale?.options?.firstWeekContainsDate ?? 1;
    const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
    if (!formatStr)
      return dateStr ? invalidDate() : toDate(referenceDate, options?.in);
    const subFnOptions = {
      firstWeekContainsDate,
      weekStartsOn,
      locale
    };
    const setters = [new DateTimezoneSetter(options?.in, referenceDate)];
    const tokens = formatStr.match(longFormattingTokensRegExp2).map((substring) => {
      const firstCharacter = substring[0];
      if (firstCharacter in longFormatters) {
        const longFormatter = longFormatters[firstCharacter];
        return longFormatter(substring, locale.formatLong);
      }
      return substring;
    }).join("").match(formattingTokensRegExp2);
    const usedTokens = [];
    for (let token of tokens) {
      if (!options?.useAdditionalWeekYearTokens && isProtectedWeekYearToken(token)) {
        warnOrThrowProtectedError(token, formatStr, dateStr);
      }
      if (!options?.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(token)) {
        warnOrThrowProtectedError(token, formatStr, dateStr);
      }
      const firstCharacter = token[0];
      const parser = parsers[firstCharacter];
      if (parser) {
        const { incompatibleTokens } = parser;
        if (Array.isArray(incompatibleTokens)) {
          const incompatibleToken = usedTokens.find(
            (usedToken) => incompatibleTokens.includes(usedToken.token) || usedToken.token === firstCharacter
          );
          if (incompatibleToken) {
            throw new RangeError(
              `The format string mustn't contain \`${incompatibleToken.fullToken}\` and \`${token}\` at the same time`
            );
          }
        } else if (parser.incompatibleTokens === "*" && usedTokens.length > 0) {
          throw new RangeError(
            `The format string mustn't contain \`${token}\` and any other token at the same time`
          );
        }
        usedTokens.push({ token: firstCharacter, fullToken: token });
        const parseResult = parser.run(
          dateStr,
          token,
          locale.match,
          subFnOptions
        );
        if (!parseResult) {
          return invalidDate();
        }
        setters.push(parseResult.setter);
        dateStr = parseResult.rest;
      } else {
        if (firstCharacter.match(unescapedLatinCharacterRegExp2)) {
          throw new RangeError(
            "Format string contains an unescaped latin alphabet character `" + firstCharacter + "`"
          );
        }
        if (token === "''") {
          token = "'";
        } else if (firstCharacter === "'") {
          token = cleanEscapedString2(token);
        }
        if (dateStr.indexOf(token) === 0) {
          dateStr = dateStr.slice(token.length);
        } else {
          return invalidDate();
        }
      }
    }
    if (dateStr.length > 0 && notWhitespaceRegExp.test(dateStr)) {
      return invalidDate();
    }
    const uniquePrioritySetters = setters.map((setter) => setter.priority).sort((a, b) => b - a).filter((priority, index, array) => array.indexOf(priority) === index).map(
      (priority) => setters.filter((setter) => setter.priority === priority).sort((a, b) => b.subPriority - a.subPriority)
    ).map((setterArray) => setterArray[0]);
    let date = toDate(referenceDate, options?.in);
    if (isNaN(+date)) return invalidDate();
    const flags = {};
    for (const setter of uniquePrioritySetters) {
      if (!setter.validate(date, subFnOptions)) {
        return invalidDate();
      }
      const result = setter.set(date, flags, subFnOptions);
      if (Array.isArray(result)) {
        date = result[0];
        Object.assign(flags, result[1]);
      } else {
        date = result;
      }
    }
    return date;
  }
  function cleanEscapedString2(input) {
    return input.match(escapedStringRegExp2)[1].replace(doubleQuoteRegExp2, "'");
  }

  // node_modules/date-fns/isMatch.js
  function isMatch(dateStr, formatStr, options) {
    return isValid(parse(dateStr, formatStr, /* @__PURE__ */ new Date(), options));
  }

  // node_modules/jwt-decode/build/esm/index.js
  var InvalidTokenError = class extends Error {
  };
  InvalidTokenError.prototype.name = "InvalidTokenError";
  function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).replace(/(.)/g, (m, p) => {
      let code = p.charCodeAt(0).toString(16).toUpperCase();
      if (code.length < 2) {
        code = "0" + code;
      }
      return "%" + code;
    }));
  }
  function base64UrlDecode(str) {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += "==";
        break;
      case 3:
        output += "=";
        break;
      default:
        throw new Error("base64 string is not of the correct length");
    }
    try {
      return b64DecodeUnicode(output);
    } catch (err) {
      return atob(output);
    }
  }
  function jwtDecode(token, options) {
    if (typeof token !== "string") {
      throw new InvalidTokenError("Invalid token specified: must be a string");
    }
    options || (options = {});
    const pos = options.header === true ? 0 : 1;
    const part = token.split(".")[pos];
    if (typeof part !== "string") {
      throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
    }
    let decoded;
    try {
      decoded = base64UrlDecode(part);
    } catch (e) {
      throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
    }
    try {
      return JSON.parse(decoded);
    } catch (e) {
      throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
    }
  }

  // node_modules/oidc-client-ts/dist/esm/oidc-client-ts.js
  var nopLogger = {
    debug: () => void 0,
    info: () => void 0,
    warn: () => void 0,
    error: () => void 0
  };
  var level;
  var logger;
  var Log = /* @__PURE__ */ ((Log2) => {
    Log2[Log2["NONE"] = 0] = "NONE";
    Log2[Log2["ERROR"] = 1] = "ERROR";
    Log2[Log2["WARN"] = 2] = "WARN";
    Log2[Log2["INFO"] = 3] = "INFO";
    Log2[Log2["DEBUG"] = 4] = "DEBUG";
    return Log2;
  })(Log || {});
  ((Log2) => {
    function reset() {
      level = 3;
      logger = nopLogger;
    }
    Log2.reset = reset;
    function setLevel(value) {
      if (!(0 <= value && value <= 4)) {
        throw new Error("Invalid log level");
      }
      level = value;
    }
    Log2.setLevel = setLevel;
    function setLogger(value) {
      logger = value;
    }
    Log2.setLogger = setLogger;
  })(Log || (Log = {}));
  var Logger = class _Logger {
    constructor(_name) {
      this._name = _name;
    }
    /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
    debug(...args) {
      if (level >= 4) {
        logger.debug(_Logger._format(this._name, this._method), ...args);
      }
    }
    info(...args) {
      if (level >= 3) {
        logger.info(_Logger._format(this._name, this._method), ...args);
      }
    }
    warn(...args) {
      if (level >= 2) {
        logger.warn(_Logger._format(this._name, this._method), ...args);
      }
    }
    error(...args) {
      if (level >= 1) {
        logger.error(_Logger._format(this._name, this._method), ...args);
      }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */
    throw(err) {
      this.error(err);
      throw err;
    }
    create(method) {
      const methodLogger = Object.create(this);
      methodLogger._method = method;
      methodLogger.debug("begin");
      return methodLogger;
    }
    static createStatic(name, staticMethod) {
      const staticLogger = new _Logger(`${name}.${staticMethod}`);
      staticLogger.debug("begin");
      return staticLogger;
    }
    static _format(name, method) {
      const prefix = `[${name}]`;
      return method ? `${prefix} ${method}:` : prefix;
    }
    /* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
    // helpers for static class methods
    static debug(name, ...args) {
      if (level >= 4) {
        logger.debug(_Logger._format(name), ...args);
      }
    }
    static info(name, ...args) {
      if (level >= 3) {
        logger.info(_Logger._format(name), ...args);
      }
    }
    static warn(name, ...args) {
      if (level >= 2) {
        logger.warn(_Logger._format(name), ...args);
      }
    }
    static error(name, ...args) {
      if (level >= 1) {
        logger.error(_Logger._format(name), ...args);
      }
    }
    /* eslint-enable @typescript-eslint/no-unsafe-enum-comparison */
  };
  Log.reset();
  var JwtUtils = class {
    // IMPORTANT: doesn't validate the token
    static decode(token) {
      try {
        return jwtDecode(token);
      } catch (err) {
        Logger.error("JwtUtils.decode", err);
        throw err;
      }
    }
    static async generateSignedJwt(header, payload, privateKey) {
      const encodedHeader = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(header)));
      const encodedPayload = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
      const encodedToken = `${encodedHeader}.${encodedPayload}`;
      const signature = await window.crypto.subtle.sign(
        {
          name: "ECDSA",
          hash: { name: "SHA-256" }
        },
        privateKey,
        new TextEncoder().encode(encodedToken)
      );
      const encodedSignature = CryptoUtils.encodeBase64Url(new Uint8Array(signature));
      return `${encodedToken}.${encodedSignature}`;
    }
    static async generateSignedJwtWithHmac(header, payload, secretKey) {
      const encodedHeader = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(header)));
      const encodedPayload = CryptoUtils.encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
      const encodedToken = `${encodedHeader}.${encodedPayload}`;
      const signature = await window.crypto.subtle.sign(
        "HMAC",
        secretKey,
        new TextEncoder().encode(encodedToken)
      );
      const encodedSignature = CryptoUtils.encodeBase64Url(new Uint8Array(signature));
      return `${encodedToken}.${encodedSignature}`;
    }
  };
  var UUID_V4_TEMPLATE = "10000000-1000-4000-8000-100000000000";
  var toBase64 = (val) => btoa([...new Uint8Array(val)].map((chr) => String.fromCharCode(chr)).join(""));
  var _CryptoUtils = class _CryptoUtils2 {
    static _randomWord() {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0];
    }
    /**
     * Generates RFC4122 version 4 guid
     */
    static generateUUIDv4() {
      const uuid = UUID_V4_TEMPLATE.replace(
        /[018]/g,
        (c) => (+c ^ _CryptoUtils2._randomWord() & 15 >> +c / 4).toString(16)
      );
      return uuid.replace(/-/g, "");
    }
    /**
     * PKCE: Generate a code verifier
     */
    static generateCodeVerifier() {
      return _CryptoUtils2.generateUUIDv4() + _CryptoUtils2.generateUUIDv4() + _CryptoUtils2.generateUUIDv4();
    }
    /**
     * PKCE: Generate a code challenge
     */
    static async generateCodeChallenge(code_verifier) {
      if (!crypto.subtle) {
        throw new Error("Crypto.subtle is available only in secure contexts (HTTPS).");
      }
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(code_verifier);
        const hashed = await crypto.subtle.digest("SHA-256", data);
        return toBase64(hashed).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      } catch (err) {
        Logger.error("CryptoUtils.generateCodeChallenge", err);
        throw err;
      }
    }
    /**
     * Generates a base64-encoded string for a basic auth header
     */
    static generateBasicAuth(client_id, client_secret) {
      const encoder = new TextEncoder();
      const data = encoder.encode([client_id, client_secret].join(":"));
      return toBase64(data);
    }
    /**
     * Generates a hash of a string using a given algorithm
     * @param alg
     * @param message
     */
    static async hash(alg, message2) {
      const msgUint8 = new TextEncoder().encode(message2);
      const hashBuffer = await crypto.subtle.digest(alg, msgUint8);
      return new Uint8Array(hashBuffer);
    }
    /**
     * Generates a rfc7638 compliant jwk thumbprint
     * @param jwk
     */
    static async customCalculateJwkThumbprint(jwk) {
      let jsonObject;
      switch (jwk.kty) {
        case "RSA":
          jsonObject = {
            "e": jwk.e,
            "kty": jwk.kty,
            "n": jwk.n
          };
          break;
        case "EC":
          jsonObject = {
            "crv": jwk.crv,
            "kty": jwk.kty,
            "x": jwk.x,
            "y": jwk.y
          };
          break;
        case "OKP":
          jsonObject = {
            "crv": jwk.crv,
            "kty": jwk.kty,
            "x": jwk.x
          };
          break;
        case "oct":
          jsonObject = {
            "crv": jwk.k,
            "kty": jwk.kty
          };
          break;
        default:
          throw new Error("Unknown jwk type");
      }
      const utf8encodedAndHashed = await _CryptoUtils2.hash("SHA-256", JSON.stringify(jsonObject));
      return _CryptoUtils2.encodeBase64Url(utf8encodedAndHashed);
    }
    static async generateDPoPProof({
      url,
      accessToken,
      httpMethod,
      keyPair,
      nonce
    }) {
      let hashedToken;
      let encodedHash;
      const payload = {
        "jti": window.crypto.randomUUID(),
        "htm": httpMethod != null ? httpMethod : "GET",
        "htu": url,
        "iat": Math.floor(Date.now() / 1e3)
      };
      if (accessToken) {
        hashedToken = await _CryptoUtils2.hash("SHA-256", accessToken);
        encodedHash = _CryptoUtils2.encodeBase64Url(hashedToken);
        payload.ath = encodedHash;
      }
      if (nonce) {
        payload.nonce = nonce;
      }
      try {
        const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
        const header = {
          "alg": "ES256",
          "typ": "dpop+jwt",
          "jwk": {
            "crv": publicJwk.crv,
            "kty": publicJwk.kty,
            "x": publicJwk.x,
            "y": publicJwk.y
          }
        };
        return await JwtUtils.generateSignedJwt(header, payload, keyPair.privateKey);
      } catch (err) {
        if (err instanceof TypeError) {
          throw new Error(`Error exporting dpop public key: ${err.message}`);
        } else {
          throw err;
        }
      }
    }
    static async generateDPoPJkt(keyPair) {
      try {
        const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
        return await _CryptoUtils2.customCalculateJwkThumbprint(publicJwk);
      } catch (err) {
        if (err instanceof TypeError) {
          throw new Error(`Could not retrieve dpop keys from storage: ${err.message}`);
        } else {
          throw err;
        }
      }
    }
    static async generateDPoPKeys() {
      return await window.crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: "P-256"
        },
        false,
        ["sign", "verify"]
      );
    }
    /**
     * Generates a client assertion JWT for client_secret_jwt authentication
     * @param client_id The client identifier
     * @param client_secret The client secret
     * @param audience The token endpoint URL (audience)
     * @param algorithm The HMAC algorithm to use (HS256, HS384, HS512). Defaults to HS256
     */
    static async generateClientAssertionJwt(client_id, client_secret, audience, algorithm = "HS256") {
      const now = Math.floor(Date.now() / 1e3);
      const header = {
        "alg": algorithm,
        "typ": "JWT"
      };
      const payload = {
        "iss": client_id,
        "sub": client_id,
        "aud": audience,
        "jti": _CryptoUtils2.generateUUIDv4(),
        "exp": now + 300,
        // 5 minutes
        "iat": now
      };
      const hashMap = {
        "HS256": "SHA-256",
        "HS384": "SHA-384",
        "HS512": "SHA-512"
      };
      const hashFunction = hashMap[algorithm];
      if (!hashFunction) {
        throw new Error(`Unsupported algorithm: ${algorithm}. Supported algorithms are: HS256, HS384, HS512`);
      }
      const encoder = new TextEncoder();
      const secretKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(client_secret),
        { name: "HMAC", hash: hashFunction },
        false,
        ["sign"]
      );
      return await JwtUtils.generateSignedJwtWithHmac(header, payload, secretKey);
    }
  };
  _CryptoUtils.encodeBase64Url = (input) => {
    return toBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };
  var CryptoUtils = _CryptoUtils;
  var Event = class {
    constructor(_name) {
      this._name = _name;
      this._callbacks = [];
      this._logger = new Logger(`Event('${this._name}')`);
    }
    addHandler(cb) {
      this._callbacks.push(cb);
      return () => this.removeHandler(cb);
    }
    removeHandler(cb) {
      const idx = this._callbacks.lastIndexOf(cb);
      if (idx >= 0) {
        this._callbacks.splice(idx, 1);
      }
    }
    async raise(...ev) {
      this._logger.debug("raise:", ...ev);
      for (const cb of this._callbacks) {
        await cb(...ev);
      }
    }
  };
  var PopupUtils = class {
    /**
     * Populates a map of window features with a placement centered in front of
     * the current window. If no explicit width is given, a default value is
     * binned into [800, 720, 600, 480, 360] based on the current window's width.
     */
    static center({ ...features }) {
      var _a, _b, _c;
      if (features.width == null)
        features.width = (_a = [800, 720, 600, 480].find((width) => width <= window.outerWidth / 1.618)) != null ? _a : 360;
      (_b = features.left) != null ? _b : features.left = Math.max(0, Math.round(window.screenX + (window.outerWidth - features.width) / 2));
      if (features.height != null)
        (_c = features.top) != null ? _c : features.top = Math.max(0, Math.round(window.screenY + (window.outerHeight - features.height) / 2));
      return features;
    }
    static serialize(features) {
      return Object.entries(features).filter(([, value]) => value != null).map(([key, value]) => `${key}=${typeof value !== "boolean" ? value : value ? "yes" : "no"}`).join(",");
    }
  };
  var Timer = class _Timer extends Event {
    constructor() {
      super(...arguments);
      this._logger = new Logger(`Timer('${this._name}')`);
      this._timerHandle = null;
      this._expiration = 0;
      this._callback = () => {
        const diff = this._expiration - _Timer.getEpochTime();
        this._logger.debug("timer completes in", diff);
        if (this._expiration <= _Timer.getEpochTime()) {
          this.cancel();
          void super.raise();
        }
      };
    }
    // get the time
    static getEpochTime() {
      return Math.floor(Date.now() / 1e3);
    }
    init(durationInSeconds) {
      const logger2 = this._logger.create("init");
      durationInSeconds = Math.max(Math.floor(durationInSeconds), 1);
      const expiration = _Timer.getEpochTime() + durationInSeconds;
      if (this.expiration === expiration && this._timerHandle) {
        logger2.debug("skipping since already initialized for expiration at", this.expiration);
        return;
      }
      this.cancel();
      logger2.debug("using duration", durationInSeconds);
      this._expiration = expiration;
      const timerDurationInSeconds = Math.min(durationInSeconds, 5);
      this._timerHandle = setInterval(this._callback, timerDurationInSeconds * 1e3);
    }
    get expiration() {
      return this._expiration;
    }
    cancel() {
      this._logger.create("cancel");
      if (this._timerHandle) {
        clearInterval(this._timerHandle);
        this._timerHandle = null;
      }
    }
  };
  var UrlUtils = class {
    static readParams(url, responseMode = "query") {
      if (!url) throw new TypeError("Invalid URL");
      const parsedUrl = new URL(url, "http://127.0.0.1");
      const params = parsedUrl[responseMode === "fragment" ? "hash" : "search"];
      return new URLSearchParams(params.slice(1));
    }
  };
  var URL_STATE_DELIMITER = ";";
  var ErrorResponse = class extends Error {
    constructor(args, form) {
      var _a, _b, _c;
      super(args.error_description || args.error || "");
      this.form = form;
      this.name = "ErrorResponse";
      if (!args.error) {
        Logger.error("ErrorResponse", "No error passed");
        throw new Error("No error passed");
      }
      this.error = args.error;
      this.error_description = (_a = args.error_description) != null ? _a : null;
      this.error_uri = (_b = args.error_uri) != null ? _b : null;
      this.state = args.userState;
      this.session_state = (_c = args.session_state) != null ? _c : null;
      this.url_state = args.url_state;
    }
  };
  var ErrorTimeout = class extends Error {
    constructor(message2) {
      super(message2);
      this.name = "ErrorTimeout";
    }
  };
  var AccessTokenEvents = class {
    constructor(args) {
      this._logger = new Logger("AccessTokenEvents");
      this._expiringTimer = new Timer("Access token expiring");
      this._expiredTimer = new Timer("Access token expired");
      this._expiringNotificationTimeInSeconds = args.expiringNotificationTimeInSeconds;
    }
    async load(container) {
      const logger2 = this._logger.create("load");
      if (container.access_token && container.expires_in !== void 0) {
        const duration = container.expires_in;
        logger2.debug("access token present, remaining duration:", duration);
        if (duration > 0) {
          let expiring = duration - this._expiringNotificationTimeInSeconds;
          if (expiring <= 0) {
            expiring = 1;
          }
          logger2.debug("registering expiring timer, raising in", expiring, "seconds");
          this._expiringTimer.init(expiring);
        } else {
          logger2.debug("canceling existing expiring timer because we're past expiration.");
          this._expiringTimer.cancel();
        }
        const expired = duration + 1;
        logger2.debug("registering expired timer, raising in", expired, "seconds");
        this._expiredTimer.init(expired);
      } else {
        this._expiringTimer.cancel();
        this._expiredTimer.cancel();
      }
    }
    async unload() {
      this._logger.debug("unload: canceling existing access token timers");
      this._expiringTimer.cancel();
      this._expiredTimer.cancel();
    }
    /**
     * Add callback: Raised prior to the access token expiring.
     */
    addAccessTokenExpiring(cb) {
      return this._expiringTimer.addHandler(cb);
    }
    /**
     * Remove callback: Raised prior to the access token expiring.
     */
    removeAccessTokenExpiring(cb) {
      this._expiringTimer.removeHandler(cb);
    }
    /**
     * Add callback: Raised after the access token has expired.
     */
    addAccessTokenExpired(cb) {
      return this._expiredTimer.addHandler(cb);
    }
    /**
     * Remove callback: Raised after the access token has expired.
     */
    removeAccessTokenExpired(cb) {
      this._expiredTimer.removeHandler(cb);
    }
  };
  var CheckSessionIFrame = class {
    constructor(_callback, _client_id, url, _intervalInSeconds, _stopOnError) {
      this._callback = _callback;
      this._client_id = _client_id;
      this._intervalInSeconds = _intervalInSeconds;
      this._stopOnError = _stopOnError;
      this._logger = new Logger("CheckSessionIFrame");
      this._timer = null;
      this._session_state = null;
      this._message = (e) => {
        if (e.origin === this._frame_origin && e.source === this._frame.contentWindow) {
          if (e.data === "error") {
            this._logger.error("error message from check session op iframe");
            if (this._stopOnError) {
              this.stop();
            }
          } else if (e.data === "changed") {
            this._logger.debug("changed message from check session op iframe");
            this.stop();
            void this._callback();
          } else {
            this._logger.debug(e.data + " message from check session op iframe");
          }
        }
      };
      const parsedUrl = new URL(url);
      this._frame_origin = parsedUrl.origin;
      this._frame = window.document.createElement("iframe");
      this._frame.style.visibility = "hidden";
      this._frame.style.position = "fixed";
      this._frame.style.left = "-1000px";
      this._frame.style.top = "0";
      this._frame.width = "0";
      this._frame.height = "0";
      this._frame.src = parsedUrl.href;
    }
    load() {
      return new Promise((resolve) => {
        this._frame.onload = () => {
          resolve();
        };
        window.document.body.appendChild(this._frame);
        window.addEventListener("message", this._message, false);
      });
    }
    start(session_state) {
      if (this._session_state === session_state) {
        return;
      }
      this._logger.create("start");
      this.stop();
      this._session_state = session_state;
      const send = () => {
        if (!this._frame.contentWindow || !this._session_state) {
          return;
        }
        this._frame.contentWindow.postMessage(this._client_id + " " + this._session_state, this._frame_origin);
      };
      send();
      this._timer = setInterval(send, this._intervalInSeconds * 1e3);
    }
    stop() {
      this._logger.create("stop");
      this._session_state = null;
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    }
  };
  var InMemoryWebStorage = class {
    constructor() {
      this._logger = new Logger("InMemoryWebStorage");
      this._data = {};
    }
    clear() {
      this._logger.create("clear");
      this._data = {};
    }
    getItem(key) {
      this._logger.create(`getItem('${key}')`);
      return this._data[key];
    }
    setItem(key, value) {
      this._logger.create(`setItem('${key}')`);
      this._data[key] = value;
    }
    removeItem(key) {
      this._logger.create(`removeItem('${key}')`);
      delete this._data[key];
    }
    get length() {
      return Object.getOwnPropertyNames(this._data).length;
    }
    key(index) {
      return Object.getOwnPropertyNames(this._data)[index];
    }
  };
  var ErrorDPoPNonce = class extends Error {
    constructor(nonce, message2) {
      super(message2);
      this.name = "ErrorDPoPNonce";
      this.nonce = nonce;
    }
  };
  var JsonService = class {
    constructor(additionalContentTypes = [], _jwtHandler = null, _extraHeaders = {}) {
      this._jwtHandler = _jwtHandler;
      this._extraHeaders = _extraHeaders;
      this._logger = new Logger("JsonService");
      this._contentTypes = [];
      this._contentTypes.push(...additionalContentTypes, "application/json");
      if (_jwtHandler) {
        this._contentTypes.push("application/jwt");
      }
    }
    async fetchWithTimeout(input, init = {}) {
      const { timeoutInSeconds, ...initFetch } = init;
      if (!timeoutInSeconds) {
        return await fetch(input, initFetch);
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutInSeconds * 1e3);
      try {
        const response = await fetch(input, {
          ...init,
          signal: controller.signal
        });
        return response;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new ErrorTimeout("Network timed out");
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    }
    async getJson(url, {
      token,
      credentials,
      timeoutInSeconds
    } = {}) {
      const logger2 = this._logger.create("getJson");
      const headers = {
        "Accept": this._contentTypes.join(", ")
      };
      if (token) {
        logger2.debug("token passed, setting Authorization header");
        headers["Authorization"] = "Bearer " + token;
      }
      this._appendExtraHeaders(headers);
      let response;
      try {
        logger2.debug("url:", url);
        response = await this.fetchWithTimeout(url, { method: "GET", headers, timeoutInSeconds, credentials });
      } catch (err) {
        logger2.error("Network Error");
        throw err;
      }
      logger2.debug("HTTP response received, status", response.status);
      const contentType = response.headers.get("Content-Type");
      if (contentType && !this._contentTypes.find((item) => contentType.startsWith(item))) {
        logger2.throw(new Error(`Invalid response Content-Type: ${contentType != null ? contentType : "undefined"}, from URL: ${url}`));
      }
      if (response.ok && this._jwtHandler && (contentType == null ? void 0 : contentType.startsWith("application/jwt"))) {
        return await this._jwtHandler(await response.text());
      }
      let json;
      try {
        json = await response.json();
      } catch (err) {
        logger2.error("Error parsing JSON response", err);
        if (response.ok) throw err;
        throw new Error(`${response.statusText} (${response.status})`);
      }
      if (!response.ok) {
        logger2.error("Error from server:", json);
        if (json.error) {
          throw new ErrorResponse(json);
        }
        throw new Error(`${response.statusText} (${response.status}): ${JSON.stringify(json)}`);
      }
      return json;
    }
    async postForm(url, {
      body,
      basicAuth,
      timeoutInSeconds,
      initCredentials,
      extraHeaders
    }) {
      const logger2 = this._logger.create("postForm");
      const headers = {
        "Accept": this._contentTypes.join(", "),
        "Content-Type": "application/x-www-form-urlencoded",
        ...extraHeaders
      };
      if (basicAuth !== void 0) {
        headers["Authorization"] = "Basic " + basicAuth;
      }
      this._appendExtraHeaders(headers);
      let response;
      try {
        logger2.debug("url:", url);
        response = await this.fetchWithTimeout(url, { method: "POST", headers, body, timeoutInSeconds, credentials: initCredentials });
      } catch (err) {
        logger2.error("Network error");
        throw err;
      }
      logger2.debug("HTTP response received, status", response.status);
      const contentType = response.headers.get("Content-Type");
      if (contentType && !this._contentTypes.find((item) => contentType.startsWith(item))) {
        throw new Error(`Invalid response Content-Type: ${contentType != null ? contentType : "undefined"}, from URL: ${url}`);
      }
      const responseText = await response.text();
      let json = {};
      if (responseText) {
        try {
          json = JSON.parse(responseText);
        } catch (err) {
          logger2.error("Error parsing JSON response", err);
          if (response.ok) throw err;
          throw new Error(`${response.statusText} (${response.status})`);
        }
      }
      if (!response.ok) {
        logger2.error("Error from server:", json);
        if (response.headers.has("dpop-nonce")) {
          const nonce = response.headers.get("dpop-nonce");
          throw new ErrorDPoPNonce(nonce, `${JSON.stringify(json)}`);
        }
        if (json.error) {
          throw new ErrorResponse(json, body);
        }
        throw new Error(`${response.statusText} (${response.status}): ${JSON.stringify(json)}`);
      }
      return json;
    }
    _appendExtraHeaders(headers) {
      const logger2 = this._logger.create("appendExtraHeaders");
      const customKeys = Object.keys(this._extraHeaders);
      const protectedHeaders = [
        "accept",
        "content-type"
      ];
      const preventOverride = [
        "authorization"
      ];
      if (customKeys.length === 0) {
        return;
      }
      customKeys.forEach((headerName) => {
        if (protectedHeaders.includes(headerName.toLocaleLowerCase())) {
          logger2.warn("Protected header could not be set", headerName, protectedHeaders);
          return;
        }
        if (preventOverride.includes(headerName.toLocaleLowerCase()) && Object.keys(headers).includes(headerName)) {
          logger2.warn("Header could not be overridden", headerName, preventOverride);
          return;
        }
        const content = typeof this._extraHeaders[headerName] === "function" ? this._extraHeaders[headerName]() : this._extraHeaders[headerName];
        if (content && content !== "") {
          headers[headerName] = content;
        }
      });
    }
  };
  var MetadataService = class {
    constructor(_settings) {
      this._settings = _settings;
      this._logger = new Logger("MetadataService");
      this._signingKeys = null;
      this._metadata = null;
      this._metadataUrl = this._settings.metadataUrl;
      this._jsonService = new JsonService(
        ["application/jwk-set+json"],
        null,
        this._settings.extraHeaders
      );
      if (this._settings.signingKeys) {
        this._logger.debug("using signingKeys from settings");
        this._signingKeys = this._settings.signingKeys;
      }
      if (this._settings.metadata) {
        this._logger.debug("using metadata from settings");
        this._metadata = this._settings.metadata;
      }
      if (this._settings.fetchRequestCredentials) {
        this._logger.debug("using fetchRequestCredentials from settings");
        this._fetchRequestCredentials = this._settings.fetchRequestCredentials;
      }
    }
    resetSigningKeys() {
      this._signingKeys = null;
    }
    async getMetadata() {
      const logger2 = this._logger.create("getMetadata");
      if (this._metadata) {
        logger2.debug("using cached values");
        return this._metadata;
      }
      if (!this._metadataUrl) {
        logger2.throw(new Error("No authority or metadataUrl configured on settings"));
        throw null;
      }
      logger2.debug("getting metadata from", this._metadataUrl);
      const metadata = await this._jsonService.getJson(this._metadataUrl, { credentials: this._fetchRequestCredentials, timeoutInSeconds: this._settings.requestTimeoutInSeconds });
      logger2.debug("merging remote JSON with seed metadata");
      this._metadata = Object.assign({}, metadata, this._settings.metadataSeed);
      return this._metadata;
    }
    getIssuer() {
      return this._getMetadataProperty("issuer");
    }
    getAuthorizationEndpoint() {
      return this._getMetadataProperty("authorization_endpoint");
    }
    getUserInfoEndpoint() {
      return this._getMetadataProperty("userinfo_endpoint");
    }
    getTokenEndpoint(optional = true) {
      return this._getMetadataProperty("token_endpoint", optional);
    }
    getCheckSessionIframe() {
      return this._getMetadataProperty("check_session_iframe", true);
    }
    getEndSessionEndpoint() {
      return this._getMetadataProperty("end_session_endpoint", true);
    }
    getRevocationEndpoint(optional = true) {
      return this._getMetadataProperty("revocation_endpoint", optional);
    }
    getKeysEndpoint(optional = true) {
      return this._getMetadataProperty("jwks_uri", optional);
    }
    async _getMetadataProperty(name, optional = false) {
      const logger2 = this._logger.create(`_getMetadataProperty('${name}')`);
      const metadata = await this.getMetadata();
      logger2.debug("resolved");
      if (metadata[name] === void 0) {
        if (optional === true) {
          logger2.warn("Metadata does not contain optional property");
          return void 0;
        }
        logger2.throw(new Error("Metadata does not contain property " + name));
      }
      return metadata[name];
    }
    async getSigningKeys() {
      const logger2 = this._logger.create("getSigningKeys");
      if (this._signingKeys) {
        logger2.debug("returning signingKeys from cache");
        return this._signingKeys;
      }
      const jwks_uri = await this.getKeysEndpoint(false);
      logger2.debug("got jwks_uri", jwks_uri);
      const keySet = await this._jsonService.getJson(jwks_uri, { timeoutInSeconds: this._settings.requestTimeoutInSeconds });
      logger2.debug("got key set", keySet);
      if (!Array.isArray(keySet.keys)) {
        logger2.throw(new Error("Missing keys on keyset"));
        throw null;
      }
      this._signingKeys = keySet.keys;
      return this._signingKeys;
    }
  };
  var WebStorageStateStore = class {
    constructor({
      prefix = "oidc.",
      store = localStorage
    } = {}) {
      this._logger = new Logger("WebStorageStateStore");
      this._store = store;
      this._prefix = prefix;
    }
    async set(key, value) {
      this._logger.create(`set('${key}')`);
      key = this._prefix + key;
      await this._store.setItem(key, value);
    }
    async get(key) {
      this._logger.create(`get('${key}')`);
      key = this._prefix + key;
      const item = await this._store.getItem(key);
      return item;
    }
    async remove(key) {
      this._logger.create(`remove('${key}')`);
      key = this._prefix + key;
      const item = await this._store.getItem(key);
      await this._store.removeItem(key);
      return item;
    }
    async getAllKeys() {
      this._logger.create("getAllKeys");
      const len = await this._store.length;
      const keys = [];
      for (let index = 0; index < len; index++) {
        const key = await this._store.key(index);
        if (key && key.indexOf(this._prefix) === 0) {
          keys.push(key.substr(this._prefix.length));
        }
      }
      return keys;
    }
  };
  var DefaultResponseType = "code";
  var DefaultScope = "openid";
  var DefaultClientAuthentication = "client_secret_post";
  var DefaultStaleStateAgeInSeconds = 60 * 15;
  var OidcClientSettingsStore = class {
    constructor({
      // metadata related
      authority,
      metadataUrl,
      metadata,
      signingKeys,
      metadataSeed,
      // client related
      client_id,
      client_secret,
      response_type = DefaultResponseType,
      scope = DefaultScope,
      redirect_uri,
      post_logout_redirect_uri,
      client_authentication = DefaultClientAuthentication,
      token_endpoint_auth_signing_alg = "HS256",
      // optional protocol
      prompt,
      display,
      max_age,
      ui_locales,
      acr_values,
      resource,
      response_mode,
      // behavior flags
      filterProtocolClaims = true,
      loadUserInfo = false,
      requestTimeoutInSeconds,
      staleStateAgeInSeconds = DefaultStaleStateAgeInSeconds,
      mergeClaimsStrategy = { array: "replace" },
      disablePKCE = false,
      // other behavior
      stateStore,
      revokeTokenAdditionalContentTypes,
      fetchRequestCredentials,
      refreshTokenAllowedScope,
      // extra
      extraQueryParams = {},
      extraTokenParams = {},
      extraHeaders = {},
      dpop,
      omitScopeWhenRequesting = false
    }) {
      var _a;
      this.authority = authority;
      if (metadataUrl) {
        this.metadataUrl = metadataUrl;
      } else {
        this.metadataUrl = authority;
        if (authority) {
          if (!this.metadataUrl.endsWith("/")) {
            this.metadataUrl += "/";
          }
          this.metadataUrl += ".well-known/openid-configuration";
        }
      }
      this.metadata = metadata;
      this.metadataSeed = metadataSeed;
      this.signingKeys = signingKeys;
      this.client_id = client_id;
      this.client_secret = client_secret;
      this.response_type = response_type;
      this.scope = scope;
      this.redirect_uri = redirect_uri;
      this.post_logout_redirect_uri = post_logout_redirect_uri;
      this.client_authentication = client_authentication;
      this.token_endpoint_auth_signing_alg = token_endpoint_auth_signing_alg;
      this.prompt = prompt;
      this.display = display;
      this.max_age = max_age;
      this.ui_locales = ui_locales;
      this.acr_values = acr_values;
      this.resource = resource;
      this.response_mode = response_mode;
      this.filterProtocolClaims = filterProtocolClaims != null ? filterProtocolClaims : true;
      this.loadUserInfo = !!loadUserInfo;
      this.staleStateAgeInSeconds = staleStateAgeInSeconds;
      this.mergeClaimsStrategy = mergeClaimsStrategy;
      this.omitScopeWhenRequesting = omitScopeWhenRequesting;
      this.disablePKCE = !!disablePKCE;
      this.revokeTokenAdditionalContentTypes = revokeTokenAdditionalContentTypes;
      this.fetchRequestCredentials = fetchRequestCredentials ? fetchRequestCredentials : "same-origin";
      this.requestTimeoutInSeconds = requestTimeoutInSeconds;
      if (stateStore) {
        this.stateStore = stateStore;
      } else {
        const store = typeof window !== "undefined" ? window.localStorage : new InMemoryWebStorage();
        this.stateStore = new WebStorageStateStore({ store });
      }
      this.refreshTokenAllowedScope = refreshTokenAllowedScope;
      this.extraQueryParams = extraQueryParams;
      this.extraTokenParams = extraTokenParams;
      this.extraHeaders = extraHeaders;
      this.dpop = dpop;
      if (this.dpop && !((_a = this.dpop) == null ? void 0 : _a.store)) {
        throw new Error("A DPoPStore is required when dpop is enabled");
      }
    }
  };
  var UserInfoService = class {
    constructor(_settings, _metadataService) {
      this._settings = _settings;
      this._metadataService = _metadataService;
      this._logger = new Logger("UserInfoService");
      this._getClaimsFromJwt = async (responseText) => {
        const logger2 = this._logger.create("_getClaimsFromJwt");
        try {
          const payload = JwtUtils.decode(responseText);
          logger2.debug("JWT decoding successful");
          return payload;
        } catch (err) {
          logger2.error("Error parsing JWT response");
          throw err;
        }
      };
      this._jsonService = new JsonService(
        void 0,
        this._getClaimsFromJwt,
        this._settings.extraHeaders
      );
    }
    async getClaims(token) {
      const logger2 = this._logger.create("getClaims");
      if (!token) {
        this._logger.throw(new Error("No token passed"));
      }
      const url = await this._metadataService.getUserInfoEndpoint();
      logger2.debug("got userinfo url", url);
      const claims = await this._jsonService.getJson(url, {
        token,
        credentials: this._settings.fetchRequestCredentials,
        timeoutInSeconds: this._settings.requestTimeoutInSeconds
      });
      logger2.debug("got claims", claims);
      return claims;
    }
  };
  var TokenClient = class {
    constructor(_settings, _metadataService) {
      this._settings = _settings;
      this._metadataService = _metadataService;
      this._logger = new Logger("TokenClient");
      this._jsonService = new JsonService(
        this._settings.revokeTokenAdditionalContentTypes,
        null,
        this._settings.extraHeaders
      );
    }
    /**
     * Exchange code.
     *
     * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.1.3
     */
    async exchangeCode({
      grant_type = "authorization_code",
      redirect_uri = this._settings.redirect_uri,
      client_id = this._settings.client_id,
      client_secret = this._settings.client_secret,
      extraHeaders,
      ...args
    }) {
      const logger2 = this._logger.create("exchangeCode");
      if (!client_id) {
        logger2.throw(new Error("A client_id is required"));
      }
      if (!redirect_uri) {
        logger2.throw(new Error("A redirect_uri is required"));
      }
      if (!args.code) {
        logger2.throw(new Error("A code is required"));
      }
      const params = new URLSearchParams({ grant_type, redirect_uri });
      for (const [key, value] of Object.entries(args)) {
        if (value != null) {
          params.set(key, value);
        }
      }
      if ((this._settings.client_authentication === "client_secret_basic" || this._settings.client_authentication === "client_secret_jwt") && (client_secret === void 0 || client_secret === null)) {
        logger2.throw(new Error("A client_secret is required"));
        throw null;
      }
      let basicAuth;
      const url = await this._metadataService.getTokenEndpoint(false);
      switch (this._settings.client_authentication) {
        case "client_secret_basic":
          basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
          break;
        case "client_secret_post":
          params.append("client_id", client_id);
          if (client_secret) {
            params.append("client_secret", client_secret);
          }
          break;
        case "client_secret_jwt": {
          const clientAssertion = await CryptoUtils.generateClientAssertionJwt(client_id, client_secret, url, this._settings.token_endpoint_auth_signing_alg);
          params.append("client_id", client_id);
          params.append("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
          params.append("client_assertion", clientAssertion);
          break;
        }
      }
      logger2.debug("got token endpoint");
      const response = await this._jsonService.postForm(url, {
        body: params,
        basicAuth,
        timeoutInSeconds: this._settings.requestTimeoutInSeconds,
        initCredentials: this._settings.fetchRequestCredentials,
        extraHeaders
      });
      logger2.debug("got response");
      return response;
    }
    /**
     * Exchange credentials.
     *
     * @see https://www.rfc-editor.org/rfc/rfc6749#section-4.3.2
     */
    async exchangeCredentials({
      grant_type = "password",
      client_id = this._settings.client_id,
      client_secret = this._settings.client_secret,
      scope = this._settings.scope,
      ...args
    }) {
      const logger2 = this._logger.create("exchangeCredentials");
      if (!client_id) {
        logger2.throw(new Error("A client_id is required"));
      }
      const params = new URLSearchParams({ grant_type });
      if (!this._settings.omitScopeWhenRequesting) {
        params.set("scope", scope);
      }
      for (const [key, value] of Object.entries(args)) {
        if (value != null) {
          params.set(key, value);
        }
      }
      if ((this._settings.client_authentication === "client_secret_basic" || this._settings.client_authentication === "client_secret_jwt") && (client_secret === void 0 || client_secret === null)) {
        logger2.throw(new Error("A client_secret is required"));
        throw null;
      }
      let basicAuth;
      const url = await this._metadataService.getTokenEndpoint(false);
      switch (this._settings.client_authentication) {
        case "client_secret_basic":
          basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
          break;
        case "client_secret_post":
          params.append("client_id", client_id);
          if (client_secret) {
            params.append("client_secret", client_secret);
          }
          break;
        case "client_secret_jwt": {
          const clientAssertion = await CryptoUtils.generateClientAssertionJwt(client_id, client_secret, url, this._settings.token_endpoint_auth_signing_alg);
          params.append("client_id", client_id);
          params.append("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
          params.append("client_assertion", clientAssertion);
          break;
        }
      }
      logger2.debug("got token endpoint");
      const response = await this._jsonService.postForm(url, { body: params, basicAuth, timeoutInSeconds: this._settings.requestTimeoutInSeconds, initCredentials: this._settings.fetchRequestCredentials });
      logger2.debug("got response");
      return response;
    }
    /**
     * Exchange a refresh token.
     *
     * @see https://www.rfc-editor.org/rfc/rfc6749#section-6
     */
    async exchangeRefreshToken({
      grant_type = "refresh_token",
      client_id = this._settings.client_id,
      client_secret = this._settings.client_secret,
      timeoutInSeconds,
      extraHeaders,
      ...args
    }) {
      const logger2 = this._logger.create("exchangeRefreshToken");
      if (!client_id) {
        logger2.throw(new Error("A client_id is required"));
      }
      if (!args.refresh_token) {
        logger2.throw(new Error("A refresh_token is required"));
      }
      const params = new URLSearchParams({ grant_type });
      for (const [key, value] of Object.entries(args)) {
        if (Array.isArray(value)) {
          value.forEach((param) => params.append(key, param));
        } else if (value != null) {
          params.set(key, value);
        }
      }
      if ((this._settings.client_authentication === "client_secret_basic" || this._settings.client_authentication === "client_secret_jwt") && (client_secret === void 0 || client_secret === null)) {
        logger2.throw(new Error("A client_secret is required"));
        throw null;
      }
      let basicAuth;
      const url = await this._metadataService.getTokenEndpoint(false);
      switch (this._settings.client_authentication) {
        case "client_secret_basic":
          basicAuth = CryptoUtils.generateBasicAuth(client_id, client_secret);
          break;
        case "client_secret_post":
          params.append("client_id", client_id);
          if (client_secret) {
            params.append("client_secret", client_secret);
          }
          break;
        case "client_secret_jwt": {
          const clientAssertion = await CryptoUtils.generateClientAssertionJwt(client_id, client_secret, url, this._settings.token_endpoint_auth_signing_alg);
          params.append("client_id", client_id);
          params.append("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
          params.append("client_assertion", clientAssertion);
          break;
        }
      }
      logger2.debug("got token endpoint");
      const response = await this._jsonService.postForm(url, { body: params, basicAuth, timeoutInSeconds, initCredentials: this._settings.fetchRequestCredentials, extraHeaders });
      logger2.debug("got response");
      return response;
    }
    /**
     * Revoke an access or refresh token.
     *
     * @see https://datatracker.ietf.org/doc/html/rfc7009#section-2.1
     */
    async revoke(args) {
      var _a;
      const logger2 = this._logger.create("revoke");
      if (!args.token) {
        logger2.throw(new Error("A token is required"));
      }
      const url = await this._metadataService.getRevocationEndpoint(false);
      logger2.debug(`got revocation endpoint, revoking ${(_a = args.token_type_hint) != null ? _a : "default token type"}`);
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(args)) {
        if (value != null) {
          params.set(key, value);
        }
      }
      params.set("client_id", this._settings.client_id);
      if (this._settings.client_secret) {
        params.set("client_secret", this._settings.client_secret);
      }
      await this._jsonService.postForm(url, { body: params, timeoutInSeconds: this._settings.requestTimeoutInSeconds });
      logger2.debug("got response");
    }
  };
  var ResponseValidator = class {
    constructor(_settings, _metadataService, _claimsService) {
      this._settings = _settings;
      this._metadataService = _metadataService;
      this._claimsService = _claimsService;
      this._logger = new Logger("ResponseValidator");
      this._userInfoService = new UserInfoService(this._settings, this._metadataService);
      this._tokenClient = new TokenClient(this._settings, this._metadataService);
    }
    async validateSigninResponse(response, state, extraHeaders) {
      const logger2 = this._logger.create("validateSigninResponse");
      this._processSigninState(response, state);
      logger2.debug("state processed");
      await this._processCode(response, state, extraHeaders);
      logger2.debug("code processed");
      if (response.isOpenId) {
        this._validateIdTokenAttributes(response, "", state.nonce);
      }
      logger2.debug("tokens validated");
      await this._processClaims(response, state == null ? void 0 : state.skipUserInfo, response.isOpenId);
      logger2.debug("claims processed");
    }
    async validateCredentialsResponse(response, skipUserInfo) {
      const logger2 = this._logger.create("validateCredentialsResponse");
      const shouldValidateSubClaim = response.isOpenId && !!response.id_token;
      if (shouldValidateSubClaim) {
        this._validateIdTokenAttributes(response);
      }
      logger2.debug("tokens validated");
      await this._processClaims(response, skipUserInfo, shouldValidateSubClaim);
      logger2.debug("claims processed");
    }
    async validateRefreshResponse(response, state) {
      var _a, _b;
      const logger2 = this._logger.create("validateRefreshResponse");
      response.userState = state.data;
      (_a = response.session_state) != null ? _a : response.session_state = state.session_state;
      (_b = response.scope) != null ? _b : response.scope = state.scope;
      if (response.isOpenId && !!response.id_token) {
        this._validateIdTokenAttributes(response, state.id_token);
        logger2.debug("ID Token validated");
      }
      if (!response.id_token) {
        response.id_token = state.id_token;
        response.profile = state.profile;
      }
      const hasIdToken = response.isOpenId && !!response.id_token;
      await this._processClaims(response, false, hasIdToken);
      logger2.debug("claims processed");
    }
    validateSignoutResponse(response, state) {
      const logger2 = this._logger.create("validateSignoutResponse");
      if (state.id !== response.state) {
        logger2.throw(new Error("State does not match"));
      }
      logger2.debug("state validated");
      response.userState = state.data;
      if (response.error) {
        logger2.warn("Response was error", response.error);
        throw new ErrorResponse(response);
      }
    }
    _processSigninState(response, state) {
      var _a;
      const logger2 = this._logger.create("_processSigninState");
      if (state.id !== response.state) {
        logger2.throw(new Error("State does not match"));
      }
      if (!state.client_id) {
        logger2.throw(new Error("No client_id on state"));
      }
      if (!state.authority) {
        logger2.throw(new Error("No authority on state"));
      }
      if (this._settings.authority !== state.authority) {
        logger2.throw(new Error("authority mismatch on settings vs. signin state"));
      }
      if (this._settings.client_id && this._settings.client_id !== state.client_id) {
        logger2.throw(new Error("client_id mismatch on settings vs. signin state"));
      }
      logger2.debug("state validated");
      response.userState = state.data;
      response.url_state = state.url_state;
      (_a = response.scope) != null ? _a : response.scope = state.scope;
      if (response.error) {
        logger2.warn("Response was error", response.error);
        throw new ErrorResponse(response);
      }
      if (state.code_verifier && !response.code) {
        logger2.throw(new Error("Expected code in response"));
      }
    }
    async _processClaims(response, skipUserInfo = false, validateSub = true) {
      const logger2 = this._logger.create("_processClaims");
      response.profile = this._claimsService.filterProtocolClaims(response.profile);
      if (skipUserInfo || !this._settings.loadUserInfo || !response.access_token) {
        logger2.debug("not loading user info");
        return;
      }
      logger2.debug("loading user info");
      const claims = await this._userInfoService.getClaims(response.access_token);
      logger2.debug("user info claims received from user info endpoint");
      if (validateSub && claims.sub !== response.profile.sub) {
        logger2.throw(new Error("subject from UserInfo response does not match subject in ID Token"));
      }
      response.profile = this._claimsService.mergeClaims(response.profile, this._claimsService.filterProtocolClaims(claims));
      logger2.debug("user info claims received, updated profile:", response.profile);
    }
    async _processCode(response, state, extraHeaders) {
      const logger2 = this._logger.create("_processCode");
      if (response.code) {
        logger2.debug("Validating code");
        const tokenResponse = await this._tokenClient.exchangeCode({
          client_id: state.client_id,
          client_secret: state.client_secret,
          code: response.code,
          redirect_uri: state.redirect_uri,
          code_verifier: state.code_verifier,
          extraHeaders,
          ...state.extraTokenParams
        });
        Object.assign(response, tokenResponse);
      } else {
        logger2.debug("No code to process");
      }
    }
    _validateIdTokenAttributes(response, existingToken, nonce) {
      var _a;
      const logger2 = this._logger.create("_validateIdTokenAttributes");
      logger2.debug("decoding ID Token JWT");
      const incoming = JwtUtils.decode((_a = response.id_token) != null ? _a : "");
      if (!incoming.sub) {
        logger2.throw(new Error("ID Token is missing a subject claim"));
      }
      if (nonce && incoming.nonce !== nonce) {
        logger2.throw(new Error("nonce in id_token does not match nonce in client storage"));
      }
      if (existingToken) {
        const existing = JwtUtils.decode(existingToken);
        if (incoming.sub !== existing.sub) {
          logger2.throw(new Error("sub in id_token does not match current sub"));
        }
        if (incoming.auth_time && incoming.auth_time !== existing.auth_time) {
          logger2.throw(new Error("auth_time in id_token does not match original auth_time"));
        }
        if (incoming.azp && incoming.azp !== existing.azp) {
          logger2.throw(new Error("azp in id_token does not match original azp"));
        }
        if (!incoming.azp && existing.azp) {
          logger2.throw(new Error("azp not in id_token, but present in original id_token"));
        }
      }
      response.profile = incoming;
    }
  };
  var State = class _State {
    constructor(args) {
      this.id = args.id || CryptoUtils.generateUUIDv4();
      this.data = args.data;
      if (args.created && args.created > 0) {
        this.created = args.created;
      } else {
        this.created = Timer.getEpochTime();
      }
      this.request_type = args.request_type;
      this.url_state = args.url_state;
    }
    toStorageString() {
      new Logger("State").create("toStorageString");
      return JSON.stringify({
        id: this.id,
        data: this.data,
        created: this.created,
        request_type: this.request_type,
        url_state: this.url_state
      });
    }
    static fromStorageString(storageString) {
      Logger.createStatic("State", "fromStorageString");
      return Promise.resolve(new _State(JSON.parse(storageString)));
    }
    static async clearStaleState(storage, age) {
      const logger2 = Logger.createStatic("State", "clearStaleState");
      const cutoff = Timer.getEpochTime() - age;
      const keys = await storage.getAllKeys();
      logger2.debug("got keys", keys);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const item = await storage.get(key);
        let remove = false;
        if (item) {
          try {
            const state = await _State.fromStorageString(item);
            logger2.debug("got item from key:", key, state.created);
            if (state.created <= cutoff) {
              remove = true;
            }
          } catch (err) {
            logger2.error("Error parsing state for key:", key, err);
            remove = true;
          }
        } else {
          logger2.debug("no item in storage for key:", key);
          remove = true;
        }
        if (remove) {
          logger2.debug("removed item for key:", key);
          void storage.remove(key);
        }
      }
    }
  };
  var SigninState = class _SigninState extends State {
    constructor(args) {
      super(args);
      this.code_verifier = args.code_verifier;
      this.code_challenge = args.code_challenge;
      this.authority = args.authority;
      this.client_id = args.client_id;
      this.redirect_uri = args.redirect_uri;
      this.scope = args.scope;
      this.client_secret = args.client_secret;
      this.extraTokenParams = args.extraTokenParams;
      this.response_mode = args.response_mode;
      this.skipUserInfo = args.skipUserInfo;
      this.nonce = args.nonce;
    }
    static async create(args) {
      const code_verifier = args.code_verifier === true ? CryptoUtils.generateCodeVerifier() : args.code_verifier || void 0;
      const code_challenge = code_verifier ? await CryptoUtils.generateCodeChallenge(code_verifier) : void 0;
      return new _SigninState({
        ...args,
        code_verifier,
        code_challenge
      });
    }
    toStorageString() {
      new Logger("SigninState").create("toStorageString");
      return JSON.stringify({
        id: this.id,
        data: this.data,
        created: this.created,
        request_type: this.request_type,
        url_state: this.url_state,
        code_verifier: this.code_verifier,
        authority: this.authority,
        client_id: this.client_id,
        redirect_uri: this.redirect_uri,
        scope: this.scope,
        client_secret: this.client_secret,
        extraTokenParams: this.extraTokenParams,
        response_mode: this.response_mode,
        skipUserInfo: this.skipUserInfo,
        nonce: this.nonce
      });
    }
    static fromStorageString(storageString) {
      Logger.createStatic("SigninState", "fromStorageString");
      const data = JSON.parse(storageString);
      return _SigninState.create(data);
    }
  };
  var _SigninRequest = class _SigninRequest2 {
    constructor(args) {
      this.url = args.url;
      this.state = args.state;
    }
    static async create({
      // mandatory
      url,
      authority,
      client_id,
      redirect_uri,
      response_type,
      scope,
      // optional
      state_data,
      response_mode,
      request_type,
      client_secret,
      nonce,
      url_state,
      resource,
      skipUserInfo,
      extraQueryParams,
      extraTokenParams,
      disablePKCE,
      dpopJkt,
      omitScopeWhenRequesting,
      ...optionalParams
    }) {
      if (!url) {
        this._logger.error("create: No url passed");
        throw new Error("url");
      }
      if (!client_id) {
        this._logger.error("create: No client_id passed");
        throw new Error("client_id");
      }
      if (!redirect_uri) {
        this._logger.error("create: No redirect_uri passed");
        throw new Error("redirect_uri");
      }
      if (!response_type) {
        this._logger.error("create: No response_type passed");
        throw new Error("response_type");
      }
      if (!scope) {
        this._logger.error("create: No scope passed");
        throw new Error("scope");
      }
      if (!authority) {
        this._logger.error("create: No authority passed");
        throw new Error("authority");
      }
      const state = await SigninState.create({
        data: state_data,
        request_type,
        url_state,
        code_verifier: !disablePKCE,
        client_id,
        authority,
        redirect_uri,
        response_mode,
        client_secret,
        scope,
        extraTokenParams,
        skipUserInfo,
        nonce
      });
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.append("client_id", client_id);
      parsedUrl.searchParams.append("redirect_uri", redirect_uri);
      parsedUrl.searchParams.append("response_type", response_type);
      if (!omitScopeWhenRequesting) {
        parsedUrl.searchParams.append("scope", scope);
      }
      if (nonce) {
        parsedUrl.searchParams.append("nonce", nonce);
      }
      if (dpopJkt) {
        parsedUrl.searchParams.append("dpop_jkt", dpopJkt);
      }
      let stateParam = state.id;
      if (url_state) {
        stateParam = `${stateParam}${URL_STATE_DELIMITER}${url_state}`;
      }
      parsedUrl.searchParams.append("state", stateParam);
      if (state.code_challenge) {
        parsedUrl.searchParams.append("code_challenge", state.code_challenge);
        parsedUrl.searchParams.append("code_challenge_method", "S256");
      }
      if (resource) {
        const resources = Array.isArray(resource) ? resource : [resource];
        resources.forEach((r) => parsedUrl.searchParams.append("resource", r));
      }
      for (const [key, value] of Object.entries({ response_mode, ...optionalParams, ...extraQueryParams })) {
        if (value != null) {
          parsedUrl.searchParams.append(key, value.toString());
        }
      }
      return new _SigninRequest2({
        url: parsedUrl.href,
        state
      });
    }
  };
  _SigninRequest._logger = new Logger("SigninRequest");
  var SigninRequest = _SigninRequest;
  var OidcScope = "openid";
  var SigninResponse = class {
    constructor(params) {
      this.access_token = "";
      this.token_type = "";
      this.profile = {};
      this.state = params.get("state");
      this.session_state = params.get("session_state");
      if (this.state) {
        const splitState = decodeURIComponent(this.state).split(URL_STATE_DELIMITER);
        this.state = splitState[0];
        if (splitState.length > 1) {
          this.url_state = splitState.slice(1).join(URL_STATE_DELIMITER);
        }
      }
      this.error = params.get("error");
      this.error_description = params.get("error_description");
      this.error_uri = params.get("error_uri");
      this.code = params.get("code");
    }
    get expires_in() {
      if (this.expires_at === void 0) {
        return void 0;
      }
      return this.expires_at - Timer.getEpochTime();
    }
    set expires_in(value) {
      if (typeof value === "string") value = Number(value);
      if (value !== void 0 && value >= 0) {
        this.expires_at = Math.floor(value) + Timer.getEpochTime();
      }
    }
    get isOpenId() {
      var _a;
      return ((_a = this.scope) == null ? void 0 : _a.split(" ").includes(OidcScope)) || !!this.id_token;
    }
  };
  var SignoutRequest = class {
    constructor({
      url,
      state_data,
      id_token_hint,
      post_logout_redirect_uri,
      extraQueryParams,
      request_type,
      client_id,
      url_state
    }) {
      this._logger = new Logger("SignoutRequest");
      if (!url) {
        this._logger.error("ctor: No url passed");
        throw new Error("url");
      }
      const parsedUrl = new URL(url);
      if (id_token_hint) {
        parsedUrl.searchParams.append("id_token_hint", id_token_hint);
      }
      if (client_id) {
        parsedUrl.searchParams.append("client_id", client_id);
      }
      if (post_logout_redirect_uri) {
        parsedUrl.searchParams.append("post_logout_redirect_uri", post_logout_redirect_uri);
        if (state_data || url_state) {
          this.state = new State({ data: state_data, request_type, url_state });
          let stateParam = this.state.id;
          if (url_state) {
            stateParam = `${stateParam}${URL_STATE_DELIMITER}${url_state}`;
          }
          parsedUrl.searchParams.append("state", stateParam);
        }
      }
      for (const [key, value] of Object.entries({ ...extraQueryParams })) {
        if (value != null) {
          parsedUrl.searchParams.append(key, value.toString());
        }
      }
      this.url = parsedUrl.href;
    }
  };
  var SignoutResponse = class {
    constructor(params) {
      this.state = params.get("state");
      if (this.state) {
        const splitState = decodeURIComponent(this.state).split(URL_STATE_DELIMITER);
        this.state = splitState[0];
        if (splitState.length > 1) {
          this.url_state = splitState.slice(1).join(URL_STATE_DELIMITER);
        }
      }
      this.error = params.get("error");
      this.error_description = params.get("error_description");
      this.error_uri = params.get("error_uri");
    }
  };
  var DefaultProtocolClaims = [
    "nbf",
    "jti",
    "auth_time",
    "nonce",
    "acr",
    "amr",
    "azp",
    "at_hash"
    // https://openid.net/specs/openid-connect-core-1_0.html#CodeIDToken
  ];
  var InternalRequiredProtocolClaims = ["sub", "iss", "aud", "exp", "iat"];
  var ClaimsService = class {
    constructor(_settings) {
      this._settings = _settings;
      this._logger = new Logger("ClaimsService");
    }
    filterProtocolClaims(claims) {
      const result = { ...claims };
      if (this._settings.filterProtocolClaims) {
        let protocolClaims;
        if (Array.isArray(this._settings.filterProtocolClaims)) {
          protocolClaims = this._settings.filterProtocolClaims;
        } else {
          protocolClaims = DefaultProtocolClaims;
        }
        for (const claim of protocolClaims) {
          if (!InternalRequiredProtocolClaims.includes(claim)) {
            delete result[claim];
          }
        }
      }
      return result;
    }
    mergeClaims(claims1, claims2) {
      const result = { ...claims1 };
      for (const [claim, values] of Object.entries(claims2)) {
        if (result[claim] !== values) {
          if (Array.isArray(result[claim]) || Array.isArray(values)) {
            if (this._settings.mergeClaimsStrategy.array == "replace") {
              result[claim] = values;
            } else {
              const mergedValues = Array.isArray(result[claim]) ? result[claim] : [result[claim]];
              for (const value of Array.isArray(values) ? values : [values]) {
                if (!mergedValues.includes(value)) {
                  mergedValues.push(value);
                }
              }
              result[claim] = mergedValues;
            }
          } else if (typeof result[claim] === "object" && typeof values === "object") {
            result[claim] = this.mergeClaims(result[claim], values);
          } else {
            result[claim] = values;
          }
        }
      }
      return result;
    }
  };
  var DPoPState = class {
    constructor(keys, nonce) {
      this.keys = keys;
      this.nonce = nonce;
    }
  };
  var OidcClient = class {
    constructor(settings, metadataService) {
      this._logger = new Logger("OidcClient");
      this.settings = settings instanceof OidcClientSettingsStore ? settings : new OidcClientSettingsStore(settings);
      this.metadataService = metadataService != null ? metadataService : new MetadataService(this.settings);
      this._claimsService = new ClaimsService(this.settings);
      this._validator = new ResponseValidator(this.settings, this.metadataService, this._claimsService);
      this._tokenClient = new TokenClient(this.settings, this.metadataService);
    }
    async createSigninRequest({
      state,
      request,
      request_uri,
      request_type,
      id_token_hint,
      login_hint,
      skipUserInfo,
      nonce,
      url_state,
      response_type = this.settings.response_type,
      scope = this.settings.scope,
      redirect_uri = this.settings.redirect_uri,
      prompt = this.settings.prompt,
      display = this.settings.display,
      max_age = this.settings.max_age,
      ui_locales = this.settings.ui_locales,
      acr_values = this.settings.acr_values,
      resource = this.settings.resource,
      response_mode = this.settings.response_mode,
      extraQueryParams = this.settings.extraQueryParams,
      extraTokenParams = this.settings.extraTokenParams,
      dpopJkt,
      omitScopeWhenRequesting = this.settings.omitScopeWhenRequesting
    }) {
      const logger2 = this._logger.create("createSigninRequest");
      if (response_type !== "code") {
        throw new Error("Only the Authorization Code flow (with PKCE) is supported");
      }
      const url = await this.metadataService.getAuthorizationEndpoint();
      logger2.debug("Received authorization endpoint", url);
      const signinRequest = await SigninRequest.create({
        url,
        authority: this.settings.authority,
        client_id: this.settings.client_id,
        redirect_uri,
        response_type,
        scope,
        state_data: state,
        url_state,
        prompt,
        display,
        max_age,
        ui_locales,
        id_token_hint,
        login_hint,
        acr_values,
        dpopJkt,
        resource,
        request,
        request_uri,
        extraQueryParams,
        extraTokenParams,
        request_type,
        response_mode,
        client_secret: this.settings.client_secret,
        skipUserInfo,
        nonce,
        disablePKCE: this.settings.disablePKCE,
        omitScopeWhenRequesting
      });
      await this.clearStaleState();
      const signinState = signinRequest.state;
      await this.settings.stateStore.set(signinState.id, signinState.toStorageString());
      return signinRequest;
    }
    async readSigninResponseState(url, removeState = false) {
      const logger2 = this._logger.create("readSigninResponseState");
      const response = new SigninResponse(UrlUtils.readParams(url, this.settings.response_mode));
      if (!response.state) {
        logger2.throw(new Error("No state in response"));
        throw null;
      }
      const storedStateString = await this.settings.stateStore[removeState ? "remove" : "get"](response.state);
      if (!storedStateString) {
        logger2.throw(new Error("No matching state found in storage"));
        throw null;
      }
      const state = await SigninState.fromStorageString(storedStateString);
      return { state, response };
    }
    async processSigninResponse(url, extraHeaders, removeState = true) {
      const logger2 = this._logger.create("processSigninResponse");
      const { state, response } = await this.readSigninResponseState(url, removeState);
      logger2.debug("received state from storage; validating response");
      if (this.settings.dpop && this.settings.dpop.store) {
        const dpopProof = await this.getDpopProof(this.settings.dpop.store);
        extraHeaders = { ...extraHeaders, "DPoP": dpopProof };
      }
      try {
        await this._validator.validateSigninResponse(response, state, extraHeaders);
      } catch (err) {
        if (err instanceof ErrorDPoPNonce && this.settings.dpop) {
          const dpopProof = await this.getDpopProof(this.settings.dpop.store, err.nonce);
          extraHeaders["DPoP"] = dpopProof;
          await this._validator.validateSigninResponse(response, state, extraHeaders);
        } else {
          throw err;
        }
      }
      return response;
    }
    async getDpopProof(dpopStore, nonce) {
      let keyPair;
      let dpopState;
      if (!(await dpopStore.getAllKeys()).includes(this.settings.client_id)) {
        keyPair = await CryptoUtils.generateDPoPKeys();
        dpopState = new DPoPState(keyPair, nonce);
        await dpopStore.set(this.settings.client_id, dpopState);
      } else {
        dpopState = await dpopStore.get(this.settings.client_id);
        if (dpopState.nonce !== nonce && nonce) {
          dpopState.nonce = nonce;
          await dpopStore.set(this.settings.client_id, dpopState);
        }
      }
      return await CryptoUtils.generateDPoPProof({
        url: await this.metadataService.getTokenEndpoint(false),
        httpMethod: "POST",
        keyPair: dpopState.keys,
        nonce: dpopState.nonce
      });
    }
    async processResourceOwnerPasswordCredentials({
      username,
      password,
      skipUserInfo = false,
      extraTokenParams = {}
    }) {
      const tokenResponse = await this._tokenClient.exchangeCredentials({ username, password, ...extraTokenParams });
      const signinResponse = new SigninResponse(new URLSearchParams());
      Object.assign(signinResponse, tokenResponse);
      await this._validator.validateCredentialsResponse(signinResponse, skipUserInfo);
      return signinResponse;
    }
    async useRefreshToken({
      state,
      redirect_uri,
      resource,
      timeoutInSeconds,
      extraHeaders,
      extraTokenParams
    }) {
      var _a;
      const logger2 = this._logger.create("useRefreshToken");
      let scope;
      if (this.settings.refreshTokenAllowedScope === void 0) {
        scope = state.scope;
      } else {
        const allowableScopes = this.settings.refreshTokenAllowedScope.split(" ");
        const providedScopes = ((_a = state.scope) == null ? void 0 : _a.split(" ")) || [];
        scope = providedScopes.filter((s) => allowableScopes.includes(s)).join(" ");
      }
      if (this.settings.dpop && this.settings.dpop.store) {
        const dpopProof = await this.getDpopProof(this.settings.dpop.store);
        extraHeaders = { ...extraHeaders, "DPoP": dpopProof };
      }
      let result;
      try {
        result = await this._tokenClient.exchangeRefreshToken({
          refresh_token: state.refresh_token,
          // provide the (possible filtered) scope list
          scope,
          redirect_uri,
          resource,
          timeoutInSeconds,
          extraHeaders,
          ...extraTokenParams
        });
      } catch (err) {
        if (err instanceof ErrorDPoPNonce && this.settings.dpop) {
          extraHeaders["DPoP"] = await this.getDpopProof(this.settings.dpop.store, err.nonce);
          result = await this._tokenClient.exchangeRefreshToken({
            refresh_token: state.refresh_token,
            // provide the (possible filtered) scope list
            scope,
            redirect_uri,
            resource,
            timeoutInSeconds,
            extraHeaders,
            ...extraTokenParams
          });
        } else {
          throw err;
        }
      }
      const response = new SigninResponse(new URLSearchParams());
      Object.assign(response, result);
      logger2.debug("validating response", response);
      await this._validator.validateRefreshResponse(response, {
        ...state,
        // override the scope in the state handed over to the validator
        // so it can set the granted scope to the requested scope in case none is included in the response
        scope
      });
      return response;
    }
    async createSignoutRequest({
      state,
      id_token_hint,
      client_id,
      request_type,
      url_state,
      post_logout_redirect_uri = this.settings.post_logout_redirect_uri,
      extraQueryParams = this.settings.extraQueryParams
    } = {}) {
      const logger2 = this._logger.create("createSignoutRequest");
      const url = await this.metadataService.getEndSessionEndpoint();
      if (!url) {
        logger2.throw(new Error("No end session endpoint"));
        throw null;
      }
      logger2.debug("Received end session endpoint", url);
      if (!client_id && post_logout_redirect_uri && !id_token_hint) {
        client_id = this.settings.client_id;
      }
      const request = new SignoutRequest({
        url,
        id_token_hint,
        client_id,
        post_logout_redirect_uri,
        state_data: state,
        extraQueryParams,
        request_type,
        url_state
      });
      await this.clearStaleState();
      const signoutState = request.state;
      if (signoutState) {
        logger2.debug("Signout request has state to persist");
        await this.settings.stateStore.set(signoutState.id, signoutState.toStorageString());
      }
      return request;
    }
    async readSignoutResponseState(url, removeState = false) {
      const logger2 = this._logger.create("readSignoutResponseState");
      const response = new SignoutResponse(UrlUtils.readParams(url, this.settings.response_mode));
      if (!response.state) {
        logger2.debug("No state in response");
        if (response.error) {
          logger2.warn("Response was error:", response.error);
          throw new ErrorResponse(response);
        }
        return { state: void 0, response };
      }
      const storedStateString = await this.settings.stateStore[removeState ? "remove" : "get"](response.state);
      if (!storedStateString) {
        logger2.throw(new Error("No matching state found in storage"));
        throw null;
      }
      const state = await State.fromStorageString(storedStateString);
      return { state, response };
    }
    async processSignoutResponse(url) {
      const logger2 = this._logger.create("processSignoutResponse");
      const { state, response } = await this.readSignoutResponseState(url, true);
      if (state) {
        logger2.debug("Received state from storage; validating response");
        this._validator.validateSignoutResponse(response, state);
      } else {
        logger2.debug("No state from storage; skipping response validation");
      }
      return response;
    }
    clearStaleState() {
      this._logger.create("clearStaleState");
      return State.clearStaleState(this.settings.stateStore, this.settings.staleStateAgeInSeconds);
    }
    async revokeToken(token, type) {
      this._logger.create("revokeToken");
      return await this._tokenClient.revoke({
        token,
        token_type_hint: type
      });
    }
  };
  var SessionMonitor = class {
    constructor(_userManager) {
      this._userManager = _userManager;
      this._logger = new Logger("SessionMonitor");
      this._start = async (user) => {
        const session_state = user.session_state;
        if (!session_state) {
          return;
        }
        const logger2 = this._logger.create("_start");
        if (user.profile) {
          this._sub = user.profile.sub;
          logger2.debug("session_state", session_state, ", sub", this._sub);
        } else {
          this._sub = void 0;
          logger2.debug("session_state", session_state, ", anonymous user");
        }
        if (this._checkSessionIFrame) {
          this._checkSessionIFrame.start(session_state);
          return;
        }
        try {
          const url = await this._userManager.metadataService.getCheckSessionIframe();
          if (url) {
            logger2.debug("initializing check session iframe");
            const client_id = this._userManager.settings.client_id;
            const intervalInSeconds = this._userManager.settings.checkSessionIntervalInSeconds;
            const stopOnError = this._userManager.settings.stopCheckSessionOnError;
            const checkSessionIFrame = new CheckSessionIFrame(this._callback, client_id, url, intervalInSeconds, stopOnError);
            await checkSessionIFrame.load();
            this._checkSessionIFrame = checkSessionIFrame;
            checkSessionIFrame.start(session_state);
          } else {
            logger2.warn("no check session iframe found in the metadata");
          }
        } catch (err) {
          logger2.error("Error from getCheckSessionIframe:", err instanceof Error ? err.message : err);
        }
      };
      this._stop = () => {
        const logger2 = this._logger.create("_stop");
        this._sub = void 0;
        if (this._checkSessionIFrame) {
          this._checkSessionIFrame.stop();
        }
        if (this._userManager.settings.monitorAnonymousSession) {
          const timerHandle = setInterval(async () => {
            clearInterval(timerHandle);
            try {
              const session = await this._userManager.querySessionStatus();
              if (session) {
                const tmpUser = {
                  session_state: session.session_state,
                  profile: session.sub ? {
                    sub: session.sub
                  } : null
                };
                void this._start(tmpUser);
              }
            } catch (err) {
              logger2.error("error from querySessionStatus", err instanceof Error ? err.message : err);
            }
          }, 1e3);
        }
      };
      this._callback = async () => {
        const logger2 = this._logger.create("_callback");
        try {
          const session = await this._userManager.querySessionStatus();
          let raiseEvent = true;
          if (session && this._checkSessionIFrame) {
            if (session.sub === this._sub) {
              raiseEvent = false;
              this._checkSessionIFrame.start(session.session_state);
              logger2.debug("same sub still logged in at OP, session state has changed, restarting check session iframe; session_state", session.session_state);
              await this._userManager.events._raiseUserSessionChanged();
            } else {
              logger2.debug("different subject signed into OP", session.sub);
            }
          } else {
            logger2.debug("subject no longer signed into OP");
          }
          if (raiseEvent) {
            if (this._sub) {
              await this._userManager.events._raiseUserSignedOut();
            } else {
              await this._userManager.events._raiseUserSignedIn();
            }
          } else {
            logger2.debug("no change in session detected, no event to raise");
          }
        } catch (err) {
          if (this._sub) {
            logger2.debug("Error calling queryCurrentSigninSession; raising signed out event", err);
            await this._userManager.events._raiseUserSignedOut();
          }
        }
      };
      if (!_userManager) {
        this._logger.throw(new Error("No user manager passed"));
      }
      this._userManager.events.addUserLoaded(this._start);
      this._userManager.events.addUserUnloaded(this._stop);
      this._init().catch((err) => {
        this._logger.error(err);
      });
    }
    async _init() {
      this._logger.create("_init");
      const user = await this._userManager.getUser();
      if (user) {
        void this._start(user);
      } else if (this._userManager.settings.monitorAnonymousSession) {
        const session = await this._userManager.querySessionStatus();
        if (session) {
          const tmpUser = {
            session_state: session.session_state,
            profile: session.sub ? {
              sub: session.sub
            } : null
          };
          void this._start(tmpUser);
        }
      }
    }
  };
  var User = class _User {
    constructor(args) {
      var _a;
      this.id_token = args.id_token;
      this.session_state = (_a = args.session_state) != null ? _a : null;
      this.access_token = args.access_token;
      this.refresh_token = args.refresh_token;
      this.token_type = args.token_type;
      this.scope = args.scope;
      this.profile = args.profile;
      this.expires_at = args.expires_at;
      this.state = args.userState;
      this.url_state = args.url_state;
    }
    /** Computed number of seconds the access token has remaining. */
    get expires_in() {
      if (this.expires_at === void 0) {
        return void 0;
      }
      return this.expires_at - Timer.getEpochTime();
    }
    set expires_in(value) {
      if (value !== void 0) {
        this.expires_at = Math.floor(value) + Timer.getEpochTime();
      }
    }
    /** Computed value indicating if the access token is expired. */
    get expired() {
      const expires_in = this.expires_in;
      if (expires_in === void 0) {
        return void 0;
      }
      return expires_in <= 0;
    }
    /** Array representing the parsed values from the `scope`. */
    get scopes() {
      var _a, _b;
      return (_b = (_a = this.scope) == null ? void 0 : _a.split(" ")) != null ? _b : [];
    }
    toStorageString() {
      new Logger("User").create("toStorageString");
      return JSON.stringify({
        id_token: this.id_token,
        session_state: this.session_state,
        access_token: this.access_token,
        refresh_token: this.refresh_token,
        token_type: this.token_type,
        scope: this.scope,
        profile: this.profile,
        expires_at: this.expires_at
      });
    }
    static fromStorageString(storageString) {
      Logger.createStatic("User", "fromStorageString");
      return new _User(JSON.parse(storageString));
    }
  };
  var messageSource = "oidc-client";
  var AbstractChildWindow = class {
    constructor() {
      this._abort = new Event("Window navigation aborted");
      this._disposeHandlers = /* @__PURE__ */ new Set();
      this._window = null;
    }
    async navigate(params) {
      const logger2 = this._logger.create("navigate");
      if (!this._window) {
        throw new Error("Attempted to navigate on a disposed window");
      }
      logger2.debug("setting URL in window");
      this._window.location.replace(params.url);
      const { url, keepOpen } = await new Promise((resolve, reject) => {
        const listener = (e) => {
          var _a;
          const data = e.data;
          const origin = (_a = params.scriptOrigin) != null ? _a : window.location.origin;
          if (e.origin !== origin || (data == null ? void 0 : data.source) !== messageSource) {
            return;
          }
          try {
            const state = UrlUtils.readParams(data.url, params.response_mode).get("state");
            if (!state) {
              logger2.warn("no state found in response url");
            }
            if (e.source !== this._window && state !== params.state) {
              return;
            }
          } catch {
            this._dispose();
            reject(new Error("Invalid response from window"));
          }
          resolve(data);
        };
        window.addEventListener("message", listener, false);
        this._disposeHandlers.add(() => window.removeEventListener("message", listener, false));
        const channel = new BroadcastChannel(`oidc-client-popup-${params.state}`);
        channel.addEventListener("message", listener, false);
        this._disposeHandlers.add(() => channel.close());
        this._disposeHandlers.add(this._abort.addHandler((reason) => {
          this._dispose();
          reject(reason);
        }));
      });
      logger2.debug("got response from window");
      this._dispose();
      if (!keepOpen) {
        this.close();
      }
      return { url };
    }
    _dispose() {
      this._logger.create("_dispose");
      for (const dispose of this._disposeHandlers) {
        dispose();
      }
      this._disposeHandlers.clear();
    }
    static _notifyParent(parent, url, keepOpen = false, targetOrigin = window.location.origin) {
      const msgData = {
        source: messageSource,
        url,
        keepOpen
      };
      const logger2 = new Logger("_notifyParent");
      if (parent) {
        logger2.debug("With parent. Using parent.postMessage.");
        parent.postMessage(msgData, targetOrigin);
      } else {
        logger2.debug("No parent. Using BroadcastChannel.");
        const state = new URL(url).searchParams.get("state");
        if (!state) {
          throw new Error("No parent and no state in URL. Can't complete notification.");
        }
        const channel = new BroadcastChannel(`oidc-client-popup-${state}`);
        channel.postMessage(msgData);
        channel.close();
      }
    }
  };
  var DefaultPopupWindowFeatures = {
    location: false,
    toolbar: false,
    height: 640,
    closePopupWindowAfterInSeconds: -1
  };
  var DefaultPopupTarget = "_blank";
  var DefaultAccessTokenExpiringNotificationTimeInSeconds = 60;
  var DefaultCheckSessionIntervalInSeconds = 2;
  var DefaultSilentRequestTimeoutInSeconds = 10;
  var UserManagerSettingsStore = class extends OidcClientSettingsStore {
    constructor(args) {
      const {
        popup_redirect_uri = args.redirect_uri,
        popup_post_logout_redirect_uri = args.post_logout_redirect_uri,
        popupWindowFeatures = DefaultPopupWindowFeatures,
        popupWindowTarget = DefaultPopupTarget,
        redirectMethod = "assign",
        redirectTarget = "self",
        iframeNotifyParentOrigin = args.iframeNotifyParentOrigin,
        iframeScriptOrigin = args.iframeScriptOrigin,
        requestTimeoutInSeconds,
        silent_redirect_uri = args.redirect_uri,
        silentRequestTimeoutInSeconds,
        automaticSilentRenew = true,
        validateSubOnSilentRenew = true,
        includeIdTokenInSilentRenew = false,
        monitorSession = false,
        monitorAnonymousSession = false,
        checkSessionIntervalInSeconds = DefaultCheckSessionIntervalInSeconds,
        query_status_response_type = "code",
        stopCheckSessionOnError = true,
        revokeTokenTypes = ["access_token", "refresh_token"],
        revokeTokensOnSignout = false,
        includeIdTokenInSilentSignout = false,
        accessTokenExpiringNotificationTimeInSeconds = DefaultAccessTokenExpiringNotificationTimeInSeconds,
        maxSilentRenewTimeoutRetries,
        userStore
      } = args;
      super(args);
      this.popup_redirect_uri = popup_redirect_uri;
      this.popup_post_logout_redirect_uri = popup_post_logout_redirect_uri;
      this.popupWindowFeatures = popupWindowFeatures;
      this.popupWindowTarget = popupWindowTarget;
      this.redirectMethod = redirectMethod;
      this.redirectTarget = redirectTarget;
      this.iframeNotifyParentOrigin = iframeNotifyParentOrigin;
      this.iframeScriptOrigin = iframeScriptOrigin;
      this.silent_redirect_uri = silent_redirect_uri;
      this.silentRequestTimeoutInSeconds = silentRequestTimeoutInSeconds || requestTimeoutInSeconds || DefaultSilentRequestTimeoutInSeconds;
      this.automaticSilentRenew = automaticSilentRenew;
      this.validateSubOnSilentRenew = validateSubOnSilentRenew;
      this.includeIdTokenInSilentRenew = includeIdTokenInSilentRenew;
      this.monitorSession = monitorSession;
      this.monitorAnonymousSession = monitorAnonymousSession;
      this.checkSessionIntervalInSeconds = checkSessionIntervalInSeconds;
      this.stopCheckSessionOnError = stopCheckSessionOnError;
      this.query_status_response_type = query_status_response_type;
      this.revokeTokenTypes = revokeTokenTypes;
      this.revokeTokensOnSignout = revokeTokensOnSignout;
      this.includeIdTokenInSilentSignout = includeIdTokenInSilentSignout;
      this.accessTokenExpiringNotificationTimeInSeconds = accessTokenExpiringNotificationTimeInSeconds;
      this.maxSilentRenewTimeoutRetries = maxSilentRenewTimeoutRetries;
      if (userStore) {
        this.userStore = userStore;
      } else {
        const store = typeof window !== "undefined" ? window.sessionStorage : new InMemoryWebStorage();
        this.userStore = new WebStorageStateStore({ store });
      }
    }
  };
  var IFrameWindow = class _IFrameWindow extends AbstractChildWindow {
    constructor({
      silentRequestTimeoutInSeconds = DefaultSilentRequestTimeoutInSeconds
    }) {
      super();
      this._logger = new Logger("IFrameWindow");
      this._timeoutInSeconds = silentRequestTimeoutInSeconds;
      this._frame = _IFrameWindow.createHiddenIframe();
      this._window = this._frame.contentWindow;
    }
    static createHiddenIframe() {
      const iframe = window.document.createElement("iframe");
      iframe.style.visibility = "hidden";
      iframe.style.position = "fixed";
      iframe.style.left = "-1000px";
      iframe.style.top = "0";
      iframe.width = "0";
      iframe.height = "0";
      window.document.body.appendChild(iframe);
      return iframe;
    }
    async navigate(params) {
      this._logger.debug("navigate: Using timeout of:", this._timeoutInSeconds);
      const timer = setTimeout(() => void this._abort.raise(new ErrorTimeout("IFrame timed out without a response")), this._timeoutInSeconds * 1e3);
      this._disposeHandlers.add(() => clearTimeout(timer));
      return await super.navigate(params);
    }
    close() {
      var _a;
      if (this._frame) {
        if (this._frame.parentNode) {
          this._frame.addEventListener("load", (ev) => {
            var _a2;
            const frame = ev.target;
            (_a2 = frame.parentNode) == null ? void 0 : _a2.removeChild(frame);
            void this._abort.raise(new Error("IFrame removed from DOM"));
          }, true);
          (_a = this._frame.contentWindow) == null ? void 0 : _a.location.replace("about:blank");
        }
        this._frame = null;
      }
      this._window = null;
    }
    static notifyParent(url, targetOrigin) {
      return super._notifyParent(window.parent, url, false, targetOrigin);
    }
  };
  var IFrameNavigator = class {
    constructor(_settings) {
      this._settings = _settings;
      this._logger = new Logger("IFrameNavigator");
    }
    async prepare({
      silentRequestTimeoutInSeconds = this._settings.silentRequestTimeoutInSeconds
    }) {
      return new IFrameWindow({ silentRequestTimeoutInSeconds });
    }
    async callback(url) {
      this._logger.create("callback");
      IFrameWindow.notifyParent(url, this._settings.iframeNotifyParentOrigin);
    }
  };
  var checkForPopupClosedInterval = 500;
  var second = 1e3;
  var PopupWindow = class extends AbstractChildWindow {
    constructor({
      popupWindowTarget = DefaultPopupTarget,
      popupWindowFeatures = {},
      popupSignal,
      popupAbortOnClose
    }) {
      super();
      this._logger = new Logger("PopupWindow");
      const centeredPopup = PopupUtils.center({ ...DefaultPopupWindowFeatures, ...popupWindowFeatures });
      this._window = window.open(void 0, popupWindowTarget, PopupUtils.serialize(centeredPopup));
      this.abortOnClose = Boolean(popupAbortOnClose);
      if (popupSignal) {
        popupSignal.addEventListener("abort", () => {
          var _a;
          void this._abort.raise(new Error((_a = popupSignal.reason) != null ? _a : "Popup aborted"));
        });
      }
      if (popupWindowFeatures.closePopupWindowAfterInSeconds && popupWindowFeatures.closePopupWindowAfterInSeconds > 0) {
        setTimeout(() => {
          if (!this._window || typeof this._window.closed !== "boolean" || this._window.closed) {
            void this._abort.raise(new Error("Popup blocked by user"));
            return;
          }
          this.close();
        }, popupWindowFeatures.closePopupWindowAfterInSeconds * second);
      }
    }
    async navigate(params) {
      var _a;
      (_a = this._window) == null ? void 0 : _a.focus();
      const popupClosedInterval = setInterval(() => {
        if (!this._window || this._window.closed) {
          this._logger.debug("Popup closed by user or isolated by redirect");
          clearPopupClosedInterval();
          this._disposeHandlers.delete(clearPopupClosedInterval);
          if (this.abortOnClose) {
            void this._abort.raise(new Error("Popup closed by user"));
          }
        }
      }, checkForPopupClosedInterval);
      const clearPopupClosedInterval = () => clearInterval(popupClosedInterval);
      this._disposeHandlers.add(clearPopupClosedInterval);
      return await super.navigate(params);
    }
    close() {
      if (this._window) {
        if (!this._window.closed) {
          this._window.close();
          void this._abort.raise(new Error("Popup closed"));
        }
      }
      this._window = null;
    }
    static notifyOpener(url, keepOpen) {
      super._notifyParent(window.opener, url, keepOpen);
      if (!keepOpen && !window.opener) {
        window.close();
      }
    }
  };
  var PopupNavigator = class {
    constructor(_settings) {
      this._settings = _settings;
      this._logger = new Logger("PopupNavigator");
    }
    async prepare({
      popupWindowFeatures = this._settings.popupWindowFeatures,
      popupWindowTarget = this._settings.popupWindowTarget,
      popupSignal,
      popupAbortOnClose
    }) {
      return new PopupWindow({
        popupWindowFeatures,
        popupWindowTarget,
        popupSignal,
        popupAbortOnClose
      });
    }
    async callback(url, { keepOpen = false }) {
      this._logger.create("callback");
      PopupWindow.notifyOpener(url, keepOpen);
    }
  };
  var RedirectNavigator = class {
    constructor(_settings) {
      this._settings = _settings;
      this._logger = new Logger("RedirectNavigator");
    }
    async prepare({
      redirectMethod = this._settings.redirectMethod,
      redirectTarget = this._settings.redirectTarget
    }) {
      var _a;
      this._logger.create("prepare");
      let targetWindow = window.self;
      if (redirectTarget === "top") {
        targetWindow = (_a = window.top) != null ? _a : window.self;
      }
      const redirect = targetWindow.location[redirectMethod].bind(targetWindow.location);
      let abort;
      return {
        navigate: async (params) => {
          this._logger.create("navigate");
          const promise = new Promise((resolve, reject) => {
            abort = reject;
            window.addEventListener("pageshow", () => resolve(window.location.href));
            redirect(params.url);
          });
          return await promise;
        },
        close: () => {
          this._logger.create("close");
          abort == null ? void 0 : abort(new Error("Redirect aborted"));
          targetWindow.stop();
        }
      };
    }
    async callback() {
      return;
    }
  };
  var UserManagerEvents = class extends AccessTokenEvents {
    constructor(settings) {
      super({ expiringNotificationTimeInSeconds: settings.accessTokenExpiringNotificationTimeInSeconds });
      this._logger = new Logger("UserManagerEvents");
      this._userLoaded = new Event("User loaded");
      this._userUnloaded = new Event("User unloaded");
      this._silentRenewError = new Event("Silent renew error");
      this._userSignedIn = new Event("User signed in");
      this._userSignedOut = new Event("User signed out");
      this._userSessionChanged = new Event("User session changed");
    }
    async load(user, raiseEvent = true) {
      await super.load(user);
      if (raiseEvent) {
        await this._userLoaded.raise(user);
      }
    }
    async unload() {
      await super.unload();
      await this._userUnloaded.raise();
    }
    /**
     * Add callback: Raised when a user session has been established (or re-established).
     */
    addUserLoaded(cb) {
      return this._userLoaded.addHandler(cb);
    }
    /**
     * Remove callback: Raised when a user session has been established (or re-established).
     */
    removeUserLoaded(cb) {
      return this._userLoaded.removeHandler(cb);
    }
    /**
     * Add callback: Raised when a user session has been terminated.
     */
    addUserUnloaded(cb) {
      return this._userUnloaded.addHandler(cb);
    }
    /**
     * Remove callback: Raised when a user session has been terminated.
     */
    removeUserUnloaded(cb) {
      return this._userUnloaded.removeHandler(cb);
    }
    /**
     * Add callback: Raised when the automatic silent renew has failed.
     */
    addSilentRenewError(cb) {
      return this._silentRenewError.addHandler(cb);
    }
    /**
     * Remove callback: Raised when the automatic silent renew has failed.
     */
    removeSilentRenewError(cb) {
      return this._silentRenewError.removeHandler(cb);
    }
    /**
     * @internal
     */
    async _raiseSilentRenewError(e) {
      await this._silentRenewError.raise(e);
    }
    /**
     * Add callback: Raised when the user is signed in (when `monitorSession` is set).
     * @see {@link UserManagerSettings.monitorSession}
     */
    addUserSignedIn(cb) {
      return this._userSignedIn.addHandler(cb);
    }
    /**
     * Remove callback: Raised when the user is signed in (when `monitorSession` is set).
     */
    removeUserSignedIn(cb) {
      this._userSignedIn.removeHandler(cb);
    }
    /**
     * @internal
     */
    async _raiseUserSignedIn() {
      await this._userSignedIn.raise();
    }
    /**
     * Add callback: Raised when the user's sign-in status at the OP has changed (when `monitorSession` is set).
     * @see {@link UserManagerSettings.monitorSession}
     */
    addUserSignedOut(cb) {
      return this._userSignedOut.addHandler(cb);
    }
    /**
     * Remove callback: Raised when the user's sign-in status at the OP has changed (when `monitorSession` is set).
     */
    removeUserSignedOut(cb) {
      this._userSignedOut.removeHandler(cb);
    }
    /**
     * @internal
     */
    async _raiseUserSignedOut() {
      await this._userSignedOut.raise();
    }
    /**
     * Add callback: Raised when the user session changed (when `monitorSession` is set).
     * @see {@link UserManagerSettings.monitorSession}
     */
    addUserSessionChanged(cb) {
      return this._userSessionChanged.addHandler(cb);
    }
    /**
     * Remove callback: Raised when the user session changed (when `monitorSession` is set).
     */
    removeUserSessionChanged(cb) {
      this._userSessionChanged.removeHandler(cb);
    }
    /**
     * @internal
     */
    async _raiseUserSessionChanged() {
      await this._userSessionChanged.raise();
    }
  };
  var SilentRenewService = class {
    constructor(_userManager) {
      this._userManager = _userManager;
      this._logger = new Logger("SilentRenewService");
      this._isStarted = false;
      this._retryTimer = new Timer("Retry Silent Renew");
      this._timeoutRetryCount = 0;
      this._tokenExpiring = async () => {
        const logger2 = this._logger.create("_tokenExpiring");
        try {
          await this._userManager.signinSilent();
          this._timeoutRetryCount = 0;
          logger2.debug("silent token renewal successful");
        } catch (err) {
          if (err instanceof ErrorTimeout) {
            this._timeoutRetryCount++;
            const maxRetries = this._userManager.settings.maxSilentRenewTimeoutRetries;
            const hasReachedLimit = maxRetries !== void 0 && this._timeoutRetryCount > maxRetries;
            if (hasReachedLimit) {
              logger2.error(
                `Timeout retry limit reached (${this._timeoutRetryCount} > ${maxRetries}), raising silentRenewError:`,
                err
              );
              this._timeoutRetryCount = 0;
              await this._userManager.events._raiseSilentRenewError(err);
              return;
            }
            logger2.warn(
              `ErrorTimeout from signinSilent (attempt ${this._timeoutRetryCount}), retry in 5s:`,
              err
            );
            this._retryTimer.init(5);
            return;
          }
          logger2.error("Error from signinSilent:", err);
          this._timeoutRetryCount = 0;
          await this._userManager.events._raiseSilentRenewError(err);
        }
      };
    }
    async start() {
      const logger2 = this._logger.create("start");
      if (!this._isStarted) {
        this._isStarted = true;
        this._userManager.events.addAccessTokenExpiring(this._tokenExpiring);
        this._retryTimer.addHandler(this._tokenExpiring);
        try {
          await this._userManager.getUser();
        } catch (err) {
          logger2.error("getUser error", err);
        }
      }
    }
    stop() {
      if (this._isStarted) {
        this._retryTimer.cancel();
        this._retryTimer.removeHandler(this._tokenExpiring);
        this._userManager.events.removeAccessTokenExpiring(this._tokenExpiring);
        this._isStarted = false;
      }
    }
  };
  var RefreshState = class {
    constructor(args) {
      this.refresh_token = args.refresh_token;
      this.id_token = args.id_token;
      this.session_state = args.session_state;
      this.scope = args.scope;
      this.profile = args.profile;
      this.data = args.state;
    }
  };
  var UserManager = class {
    constructor(settings, redirectNavigator, popupNavigator, iframeNavigator) {
      this._logger = new Logger("UserManager");
      this.settings = new UserManagerSettingsStore(settings);
      this._client = new OidcClient(settings);
      this._redirectNavigator = redirectNavigator != null ? redirectNavigator : new RedirectNavigator(this.settings);
      this._popupNavigator = popupNavigator != null ? popupNavigator : new PopupNavigator(this.settings);
      this._iframeNavigator = iframeNavigator != null ? iframeNavigator : new IFrameNavigator(this.settings);
      this._events = new UserManagerEvents(this.settings);
      this._silentRenewService = new SilentRenewService(this);
      if (this.settings.automaticSilentRenew) {
        this.startSilentRenew();
      }
      this._sessionMonitor = null;
      if (this.settings.monitorSession) {
        this._sessionMonitor = new SessionMonitor(this);
      }
    }
    /**
     * Get object used to register for events raised by the `UserManager`.
     */
    get events() {
      return this._events;
    }
    /**
     * Get object used to access the metadata configuration of the identity provider.
     */
    get metadataService() {
      return this._client.metadataService;
    }
    /**
     * Load the `User` object for the currently authenticated user.
     *
     * @param raiseEvent - If `true`, the `UserLoaded` event will be raised. Defaults to false.
     * @returns A promise
     */
    async getUser(raiseEvent = false) {
      const logger2 = this._logger.create("getUser");
      const user = await this._loadUser();
      if (user) {
        logger2.info("user loaded");
        await this._events.load(user, raiseEvent);
        return user;
      }
      logger2.info("user not found in storage");
      return null;
    }
    /**
     * Remove from any storage the currently authenticated user.
     *
     * @returns A promise
     */
    async removeUser() {
      const logger2 = this._logger.create("removeUser");
      await this.storeUser(null);
      logger2.info("user removed from storage");
      await this._events.unload();
    }
    /**
     * Trigger a redirect of the current window to the authorization endpoint.
     *
     * @returns A promise
     *
     * @throws `Error` In cases of wrong authentication.
     */
    async signinRedirect(args = {}) {
      var _a;
      this._logger.create("signinRedirect");
      const {
        redirectMethod,
        ...requestArgs
      } = args;
      let dpopJkt;
      if ((_a = this.settings.dpop) == null ? void 0 : _a.bind_authorization_code) {
        dpopJkt = await this.generateDPoPJkt(this.settings.dpop);
      }
      const handle = await this._redirectNavigator.prepare({ redirectMethod });
      await this._signinStart({
        request_type: "si:r",
        dpopJkt,
        ...requestArgs
      }, handle);
    }
    /**
     * Process the response (callback) from the authorization endpoint.
     * It is recommended to use {@link UserManager.signinCallback} instead.
     *
     * @returns A promise containing the authenticated `User`.
     *
     * @see {@link UserManager.signinCallback}
     */
    async signinRedirectCallback(url = window.location.href) {
      const logger2 = this._logger.create("signinRedirectCallback");
      const user = await this._signinEnd(url);
      if (user.profile && user.profile.sub) {
        logger2.info("success, signed in subject", user.profile.sub);
      } else {
        logger2.info("no subject");
      }
      return user;
    }
    /**
     * Trigger the signin with user/password.
     *
     * @returns A promise containing the authenticated `User`.
     * @throws {@link ErrorResponse} In cases of wrong authentication.
     */
    async signinResourceOwnerCredentials({
      username,
      password,
      skipUserInfo = false
    }) {
      const logger2 = this._logger.create("signinResourceOwnerCredential");
      const signinResponse = await this._client.processResourceOwnerPasswordCredentials({
        username,
        password,
        skipUserInfo,
        extraTokenParams: this.settings.extraTokenParams
      });
      logger2.debug("got signin response");
      const user = await this._buildUser(signinResponse);
      if (user.profile && user.profile.sub) {
        logger2.info("success, signed in subject", user.profile.sub);
      } else {
        logger2.info("no subject");
      }
      return user;
    }
    /**
     * Trigger a request (via a popup window) to the authorization endpoint.
     *
     * @returns A promise containing the authenticated `User`.
     * @throws `Error` In cases of wrong authentication.
     */
    async signinPopup(args = {}) {
      var _a;
      const logger2 = this._logger.create("signinPopup");
      let dpopJkt;
      if ((_a = this.settings.dpop) == null ? void 0 : _a.bind_authorization_code) {
        dpopJkt = await this.generateDPoPJkt(this.settings.dpop);
      }
      const {
        popupWindowFeatures,
        popupWindowTarget,
        popupSignal,
        popupAbortOnClose,
        ...requestArgs
      } = args;
      const url = this.settings.popup_redirect_uri;
      if (!url) {
        logger2.throw(new Error("No popup_redirect_uri configured"));
      }
      const handle = await this._popupNavigator.prepare({ popupWindowFeatures, popupWindowTarget, popupSignal, popupAbortOnClose });
      const user = await this._signin({
        request_type: "si:p",
        redirect_uri: url,
        display: "popup",
        dpopJkt,
        ...requestArgs
      }, handle);
      if (user) {
        if (user.profile && user.profile.sub) {
          logger2.info("success, signed in subject", user.profile.sub);
        } else {
          logger2.info("no subject");
        }
      }
      return user;
    }
    /**
     * Notify the opening window of response (callback) from the authorization endpoint.
     * It is recommended to use {@link UserManager.signinCallback} instead.
     *
     * @returns A promise
     *
     * @see {@link UserManager.signinCallback}
     */
    async signinPopupCallback(url = window.location.href, keepOpen = false) {
      const logger2 = this._logger.create("signinPopupCallback");
      await this._popupNavigator.callback(url, { keepOpen });
      logger2.info("success");
    }
    /**
     * Trigger a silent request (via refresh token or an iframe) to the authorization endpoint.
     *
     * @returns A promise that contains the authenticated `User`.
     */
    async signinSilent(args = {}) {
      var _a, _b;
      const logger2 = this._logger.create("signinSilent");
      const {
        silentRequestTimeoutInSeconds,
        ...requestArgs
      } = args;
      let user = await this._loadUser();
      if (!args.forceIframeAuth && (user == null ? void 0 : user.refresh_token)) {
        logger2.debug("using refresh token");
        const state = new RefreshState(user);
        return await this._useRefreshToken({
          state,
          redirect_uri: requestArgs.redirect_uri,
          resource: requestArgs.resource,
          extraTokenParams: requestArgs.extraTokenParams,
          timeoutInSeconds: silentRequestTimeoutInSeconds
        });
      }
      let dpopJkt;
      if ((_a = this.settings.dpop) == null ? void 0 : _a.bind_authorization_code) {
        dpopJkt = await this.generateDPoPJkt(this.settings.dpop);
      }
      const url = this.settings.silent_redirect_uri;
      if (!url) {
        logger2.throw(new Error("No silent_redirect_uri configured"));
      }
      let verifySub;
      if (user && this.settings.validateSubOnSilentRenew) {
        logger2.debug("subject prior to silent renew:", user.profile.sub);
        verifySub = user.profile.sub;
      }
      const handle = await this._iframeNavigator.prepare({ silentRequestTimeoutInSeconds });
      user = await this._signin({
        request_type: "si:s",
        redirect_uri: url,
        prompt: "none",
        id_token_hint: this.settings.includeIdTokenInSilentRenew ? user == null ? void 0 : user.id_token : void 0,
        dpopJkt,
        ...requestArgs
      }, handle, verifySub);
      if (user) {
        if ((_b = user.profile) == null ? void 0 : _b.sub) {
          logger2.info("success, signed in subject", user.profile.sub);
        } else {
          logger2.info("no subject");
        }
      }
      return user;
    }
    async _useRefreshToken(args) {
      const response = await this._client.useRefreshToken({
        timeoutInSeconds: this.settings.silentRequestTimeoutInSeconds,
        ...args
      });
      const user = new User({ ...args.state, ...response });
      await this.storeUser(user);
      await this._events.load(user);
      return user;
    }
    /**
     *
     * Notify the parent window of response (callback) from the authorization endpoint.
     * It is recommended to use {@link UserManager.signinCallback} instead.
     *
     * @returns A promise
     *
     * @see {@link UserManager.signinCallback}
     */
    async signinSilentCallback(url = window.location.href) {
      const logger2 = this._logger.create("signinSilentCallback");
      await this._iframeNavigator.callback(url);
      logger2.info("success");
    }
    /**
     * Process any response (callback) from the authorization endpoint, by dispatching the request_type
     * and executing one of the following functions:
     * - {@link UserManager.signinRedirectCallback}
     * - {@link UserManager.signinPopupCallback}
     * - {@link UserManager.signinSilentCallback}
     *
     * @throws `Error` If request_type is unknown or signin cannot be processed.
     */
    async signinCallback(url = window.location.href) {
      const { state } = await this._client.readSigninResponseState(url);
      switch (state.request_type) {
        case "si:r":
          return await this.signinRedirectCallback(url);
        case "si:p":
          await this.signinPopupCallback(url);
          break;
        case "si:s":
          await this.signinSilentCallback(url);
          break;
        default:
          throw new Error("invalid request_type in state");
      }
      return void 0;
    }
    /**
     * Process any response (callback) from the end session endpoint, by dispatching the request_type
     * and executing one of the following functions:
     * - {@link UserManager.signoutRedirectCallback}
     * - {@link UserManager.signoutPopupCallback}
     * - {@link UserManager.signoutSilentCallback}
     *
     * @throws `Error` If request_type is unknown or signout cannot be processed.
     */
    async signoutCallback(url = window.location.href, keepOpen = false) {
      const { state } = await this._client.readSignoutResponseState(url);
      if (!state) {
        return void 0;
      }
      switch (state.request_type) {
        case "so:r":
          return await this.signoutRedirectCallback(url);
        case "so:p":
          await this.signoutPopupCallback(url, keepOpen);
          break;
        case "so:s":
          await this.signoutSilentCallback(url);
          break;
        default:
          throw new Error("invalid request_type in state");
      }
      return void 0;
    }
    /**
     * Query OP for user's current signin status.
     *
     * @returns A promise object with session_state and subject identifier.
     */
    async querySessionStatus(args = {}) {
      const logger2 = this._logger.create("querySessionStatus");
      const {
        silentRequestTimeoutInSeconds,
        ...requestArgs
      } = args;
      const url = this.settings.silent_redirect_uri;
      if (!url) {
        logger2.throw(new Error("No silent_redirect_uri configured"));
      }
      const user = await this._loadUser();
      const handle = await this._iframeNavigator.prepare({ silentRequestTimeoutInSeconds });
      const navResponse = await this._signinStart({
        request_type: "si:s",
        // this acts like a signin silent
        redirect_uri: url,
        prompt: "none",
        id_token_hint: this.settings.includeIdTokenInSilentRenew ? user == null ? void 0 : user.id_token : void 0,
        response_type: this.settings.query_status_response_type,
        scope: "openid",
        skipUserInfo: true,
        ...requestArgs
      }, handle);
      try {
        const extraHeaders = {};
        const signinResponse = await this._client.processSigninResponse(navResponse.url, extraHeaders);
        logger2.debug("got signin response");
        if (signinResponse.session_state && signinResponse.profile.sub) {
          logger2.info("success for subject", signinResponse.profile.sub);
          return {
            session_state: signinResponse.session_state,
            sub: signinResponse.profile.sub
          };
        }
        logger2.info("success, user not authenticated");
        return null;
      } catch (err) {
        if (this.settings.monitorAnonymousSession && err instanceof ErrorResponse) {
          switch (err.error) {
            case "login_required":
            case "consent_required":
            case "interaction_required":
            case "account_selection_required":
              logger2.info("success for anonymous user");
              return {
                session_state: err.session_state
              };
          }
        }
        throw err;
      }
    }
    async _signin(args, handle, verifySub) {
      const navResponse = await this._signinStart(args, handle);
      return await this._signinEnd(navResponse.url, verifySub);
    }
    async _signinStart(args, handle) {
      const logger2 = this._logger.create("_signinStart");
      try {
        const signinRequest = await this._client.createSigninRequest(args);
        logger2.debug("got signin request");
        return await handle.navigate({
          url: signinRequest.url,
          state: signinRequest.state.id,
          response_mode: signinRequest.state.response_mode,
          scriptOrigin: this.settings.iframeScriptOrigin
        });
      } catch (err) {
        logger2.debug("error after preparing navigator, closing navigator window");
        handle.close();
        throw err;
      }
    }
    async _signinEnd(url, verifySub) {
      const logger2 = this._logger.create("_signinEnd");
      const extraHeaders = {};
      const signinResponse = await this._client.processSigninResponse(url, extraHeaders);
      logger2.debug("got signin response");
      const user = await this._buildUser(signinResponse, verifySub);
      return user;
    }
    async _buildUser(signinResponse, verifySub) {
      const logger2 = this._logger.create("_buildUser");
      const user = new User(signinResponse);
      if (verifySub) {
        if (verifySub !== user.profile.sub) {
          logger2.debug("current user does not match user returned from signin. sub from signin:", user.profile.sub);
          throw new ErrorResponse({ ...signinResponse, error: "login_required" });
        }
        logger2.debug("current user matches user returned from signin");
      }
      await this.storeUser(user);
      logger2.debug("user stored");
      await this._events.load(user);
      return user;
    }
    /**
     * Trigger a redirect of the current window to the end session endpoint.
     *
     * @returns A promise
     */
    async signoutRedirect(args = {}) {
      const logger2 = this._logger.create("signoutRedirect");
      const {
        redirectMethod,
        ...requestArgs
      } = args;
      const handle = await this._redirectNavigator.prepare({ redirectMethod });
      await this._signoutStart({
        request_type: "so:r",
        post_logout_redirect_uri: this.settings.post_logout_redirect_uri,
        ...requestArgs
      }, handle);
      logger2.info("success");
    }
    /**
     * Process response (callback) from the end session endpoint.
     * It is recommended to use {@link UserManager.signoutCallback} instead.
     *
     * @returns A promise containing signout response
     *
     * @see {@link UserManager.signoutCallback}
     */
    async signoutRedirectCallback(url = window.location.href) {
      const logger2 = this._logger.create("signoutRedirectCallback");
      const response = await this._signoutEnd(url);
      logger2.info("success");
      return response;
    }
    /**
     * Trigger a redirect of a popup window to the end session endpoint.
     *
     * @returns A promise
     */
    async signoutPopup(args = {}) {
      const logger2 = this._logger.create("signoutPopup");
      const {
        popupWindowFeatures,
        popupWindowTarget,
        popupSignal,
        ...requestArgs
      } = args;
      const url = this.settings.popup_post_logout_redirect_uri;
      const handle = await this._popupNavigator.prepare({ popupWindowFeatures, popupWindowTarget, popupSignal });
      await this._signout({
        request_type: "so:p",
        post_logout_redirect_uri: url,
        // we're putting a dummy entry in here because we
        // need a unique id from the state for notification
        // to the parent window, which is necessary if we
        // plan to return back to the client after signout
        // and so we can close the popup after signout
        state: url == null ? void 0 : {},
        ...requestArgs
      }, handle);
      logger2.info("success");
    }
    /**
     * Process response (callback) from the end session endpoint from a popup window.
     * It is recommended to use {@link UserManager.signoutCallback} instead.
     *
     * @returns A promise
     *
     * @see {@link UserManager.signoutCallback}
     */
    async signoutPopupCallback(url = window.location.href, keepOpen = false) {
      const logger2 = this._logger.create("signoutPopupCallback");
      await this._popupNavigator.callback(url, { keepOpen });
      logger2.info("success");
    }
    async _signout(args, handle) {
      const navResponse = await this._signoutStart(args, handle);
      return await this._signoutEnd(navResponse.url);
    }
    async _signoutStart(args = {}, handle) {
      var _a;
      const logger2 = this._logger.create("_signoutStart");
      try {
        const user = await this._loadUser();
        logger2.debug("loaded current user from storage");
        if (this.settings.revokeTokensOnSignout) {
          await this._revokeInternal(user);
        }
        const id_token = args.id_token_hint || user && user.id_token;
        if (id_token) {
          logger2.debug("setting id_token_hint in signout request");
          args.id_token_hint = id_token;
        }
        await this.removeUser();
        logger2.debug("user removed, creating signout request");
        const signoutRequest = await this._client.createSignoutRequest(args);
        logger2.debug("got signout request");
        return await handle.navigate({
          url: signoutRequest.url,
          state: (_a = signoutRequest.state) == null ? void 0 : _a.id,
          scriptOrigin: this.settings.iframeScriptOrigin
        });
      } catch (err) {
        logger2.debug("error after preparing navigator, closing navigator window");
        handle.close();
        throw err;
      }
    }
    async _signoutEnd(url) {
      const logger2 = this._logger.create("_signoutEnd");
      const signoutResponse = await this._client.processSignoutResponse(url);
      logger2.debug("got signout response");
      return signoutResponse;
    }
    /**
     * Trigger a silent request (via an iframe) to the end session endpoint.
     *
     * @returns A promise
     */
    async signoutSilent(args = {}) {
      var _a;
      const logger2 = this._logger.create("signoutSilent");
      const {
        silentRequestTimeoutInSeconds,
        ...requestArgs
      } = args;
      const id_token_hint = this.settings.includeIdTokenInSilentSignout ? (_a = await this._loadUser()) == null ? void 0 : _a.id_token : void 0;
      const url = this.settings.popup_post_logout_redirect_uri;
      const handle = await this._iframeNavigator.prepare({ silentRequestTimeoutInSeconds });
      await this._signout({
        request_type: "so:s",
        post_logout_redirect_uri: url,
        id_token_hint,
        ...requestArgs
      }, handle);
      logger2.info("success");
    }
    /**
     * Notify the parent window of response (callback) from the end session endpoint.
     * It is recommended to use {@link UserManager.signoutCallback} instead.
     *
     * @returns A promise
     *
     * @see {@link UserManager.signoutCallback}
     */
    async signoutSilentCallback(url = window.location.href) {
      const logger2 = this._logger.create("signoutSilentCallback");
      await this._iframeNavigator.callback(url);
      logger2.info("success");
    }
    async revokeTokens(types) {
      const user = await this._loadUser();
      await this._revokeInternal(user, types);
    }
    async _revokeInternal(user, types = this.settings.revokeTokenTypes) {
      const logger2 = this._logger.create("_revokeInternal");
      if (!user) return;
      const typesPresent = types.filter((type) => typeof user[type] === "string");
      if (!typesPresent.length) {
        logger2.debug("no need to revoke due to no token(s)");
        return;
      }
      for (const type of typesPresent) {
        await this._client.revokeToken(
          user[type],
          type
        );
        logger2.info(`${type} revoked successfully`);
        if (type !== "access_token") {
          user[type] = null;
        }
      }
      await this.storeUser(user);
      logger2.debug("user stored");
      await this._events.load(user);
    }
    /**
     * Enables silent renew for the `UserManager`.
     */
    startSilentRenew() {
      this._logger.create("startSilentRenew");
      void this._silentRenewService.start();
    }
    /**
     * Disables silent renew for the `UserManager`.
     */
    stopSilentRenew() {
      this._silentRenewService.stop();
    }
    get _userStoreKey() {
      return `user:${this.settings.authority}:${this.settings.client_id}`;
    }
    async _loadUser() {
      const logger2 = this._logger.create("_loadUser");
      const storageString = await this.settings.userStore.get(this._userStoreKey);
      if (storageString) {
        logger2.debug("user storageString loaded");
        return User.fromStorageString(storageString);
      }
      logger2.debug("no user storageString");
      return null;
    }
    async storeUser(user) {
      const logger2 = this._logger.create("storeUser");
      if (user) {
        logger2.debug("storing user");
        const storageString = user.toStorageString();
        await this.settings.userStore.set(this._userStoreKey, storageString);
      } else {
        this._logger.debug("removing user");
        await this.settings.userStore.remove(this._userStoreKey);
        if (this.settings.dpop) {
          await this.settings.dpop.store.remove(this.settings.client_id);
        }
      }
    }
    /**
     * Removes stale state entries in storage for incomplete authorize requests.
     */
    async clearStaleState() {
      await this._client.clearStaleState();
    }
    /**
     * Dynamically generates a DPoP proof for a given user, URL and optional Http method.
     * This method is useful when you need to make a request to a resource server
     * with fetch or similar, and you need to include a DPoP proof in a DPoP header.
     * @param url - The URL to generate the DPoP proof for
     * @param user - The user to generate the DPoP proof for
     * @param httpMethod - Optional, defaults to "GET"
     * @param nonce - Optional nonce provided by the resource server
     *
     * @returns A promise containing the DPoP proof or undefined if DPoP is not enabled/no user is found.
     */
    async dpopProof(url, user, httpMethod, nonce) {
      var _a, _b;
      const dpopState = await ((_b = (_a = this.settings.dpop) == null ? void 0 : _a.store) == null ? void 0 : _b.get(this.settings.client_id));
      if (dpopState) {
        return await CryptoUtils.generateDPoPProof({
          url,
          accessToken: user == null ? void 0 : user.access_token,
          httpMethod,
          keyPair: dpopState.keys,
          nonce
        });
      }
      return void 0;
    }
    async generateDPoPJkt(dpopSettings) {
      let dpopState = await dpopSettings.store.get(this.settings.client_id);
      if (!dpopState) {
        const dpopKeys = await CryptoUtils.generateDPoPKeys();
        dpopState = new DPoPState(dpopKeys);
        await dpopSettings.store.set(this.settings.client_id, dpopState);
      }
      return await CryptoUtils.generateDPoPJkt(dpopState.keys);
    }
  };

  // src/BondSportsApi.ts
  var TokenStoreKeyNames = {
    accessToken: "BondSdkAccessToken",
    idToken: "BondSdkIdToken",
    refreshToken: "BondSdkRefreshToken"
  };
  var TOKEN_EXPIRATION_OVERLAP_MILISECONDS = 6e4;
  var ONE_SECOND_IN_MILISECONDS = 1e3;
  var HTTP_STATUS_PROFILE_INCOMPLETE = 480;
  var BIRTH_DATE_FORMAT = "yyyy-MM-dd";
  var BondSportsApi = class {
    constructor(oauthConfig, apiKey, apiEndpoint = "https://api.bondsports.co") {
      this.oauthConfig = oauthConfig;
      this.apiKey = apiKey;
      this.apiEndpoint = apiEndpoint;
      this.expirationTime = 0;
      const oidcConfig = {
        authority: oauthConfig.authority,
        client_id: oauthConfig.clientId,
        redirect_uri: oauthConfig.redirectUri ?? window.location.origin + window.location.pathname,
        scope: oauthConfig.scopes ? oauthConfig.scopes.join(" ") : "openid email profile",
        response_type: "code"
      };
      this.userManager = new UserManager({
        ...oidcConfig,
        automaticSilentRenew: false
      });
      this.oidcClient = new OidcClient(oidcConfig);
      this.tokensLoadPromise = this.tokensLoad().catch(() => {
        this.cleanupTokenStore();
      });
    }
    /**
     * Initiates the OIDC authorization code flow by redirecting the browser
     * to the identity provider's login page.
     */
    async login() {
      return this.userManager.signinRedirect();
    }
    /**
     * Handles the OIDC redirect callback after a successful login.
     *
     * Should be called on the redirect URI page. Reads the `code` and `state`
     * parameters from the current URL, exchanges them for tokens, persists the
     * tokens, and cleans the query string from the browser history.
     *
     * Does nothing when no `code` parameter is present in the URL.
     *
     * @throws {Error} If the identity provider returns no user object.
     */
    async parseCallback() {
      if (!new URLSearchParams(window.location.search).has("code")) {
        return;
      }
      await this.tokensLoadPromise;
      console.debug("Exchanging authorization code for tokens");
      const userObject = await this.userManager.signinRedirectCallback();
      if (!userObject) {
        throw new Error(BondSportsApiErrors.authCodeExchangeFailed);
      }
      console.debug("Login successful!");
      this.tokensStore(userObject.access_token, userObject.id_token, userObject.refresh_token);
      await this.tokensLoad();
      history.replaceState({}, "", window.location.pathname);
    }
    /**
     * Returns an SDK {@link Configuration} pre-wired with authentication
     * middleware for use with generated API clients.
     *
     * The middleware injected into every request:
     * - Refreshes the access token automatically when it has expired.
     * - Injects `Content-Type`, `X-Api-Key`, `X-BondUserAccessToken`, and
     *   `X-BondUserIdToken` headers.
     *
     * @throws {Error} If no ID token is available.
     * @throws {Error} If the user's consumer data has not been added yet
     *                 (i.e. `custom:consumerDataAdded` claim is not `"true"`).
     */
    getApiConfig() {
      const tokenMiddleware = {
        pre: async (context) => {
          await this.tokensLoadPromise;
          if (this.isAccessTokenExpired()) {
            await this.refreshTokens();
          }
          if (!this.idToken) {
            throw new Error(BondSportsApiErrors.missingIdToken);
          }
          const claims = this.decodeJwt(this.idToken);
          const consumerDataAdded = claims["custom:consumerDataAdded"] === "true";
          if (!consumerDataAdded) {
            throw new Error(BondSportsApiErrors.consumerDataNotAdded);
          }
          return {
            ...context,
            init: {
              ...context.init,
              headers: {
                ...context.init.headers,
                "Content-Type": "application/json",
                "X-Api-Key": this.apiKey ?? "",
                "X-BondUserAccessToken": this.accessToken ?? "",
                "X-BondUserIdToken": this.idToken ?? ""
              }
            }
          };
        }
      };
      const profileIncompleteMiddleware = {
        post: async (context) => {
          if (context.response.status === HTTP_STATUS_PROFILE_INCOMPLETE) {
            throw new Error(BondSportsApiErrors.consumerDataNotAdded);
          }
        }
      };
      return new Configuration({
        basePath: this.apiEndpoint,
        middleware: [tokenMiddleware, profileIncompleteMiddleware]
      });
    }
    /**
     * Decodes the payload of a JWT without verifying its signature.
     *
     * @param token - A compact JWT string in the format `header.payload.signature`.
     * @returns The parsed JSON payload as a plain object.
     * @throws {Error} If the token cannot be decoded.
     */
    decodeJwt(token) {
      try {
        return jwtDecode(token);
      } catch {
        throw new Error(BondSportsApiErrors.invalidJwtFormat);
      }
    }
    /**
     * Returns `true` when the current access token is absent or its expiry
     * timestamp has already passed.
     */
    isAccessTokenExpired() {
      return !this.expirationTime || this.expirationTime < Date.now();
    }
    /**
     * Updates the authenticated user's profile with the provided birth date and
     * gender, then refreshes the session tokens so that updated JWT claims are
     * reflected immediately.
     *
     * @param birthDate - The user's date of birth in `YYYY-MM-DD` format.
     * @param gender - The user's gender ({@link UserGenderEnum}).
     * @returns The parsed JSON body of the API response.
     * @throws {Error} If `birthDate` is not in `YYYY-MM-DD` format.
     * @throws {Error} If either the access token or the ID token is unavailable.
     */
    async updateProfileDetails(birthDate, gender) {
      await this.tokensLoadPromise;
      if (!this.isValidBirthDate(birthDate)) {
        throw new Error(BondSportsApiErrors.invalidBirthDateFormat);
      }
      if (this.isAccessTokenExpired() && this.refreshToken) {
        await this.refreshTokens();
      }
      if (!this.accessToken || !this.idToken) {
        throw new Error(BondSportsApiErrors.missingAccessOrIdToken);
      }
      const claims = this.decodeJwt(this.idToken);
      const userId = claims["custom:userId"];
      if (!userId) {
        throw new Error(BondSportsApiErrors.missingUserIdClaim);
      }
      const payload = {
        profile: {
          birthDate,
          gender
        },
        skipUpdateNotification: true
      };
      const apiEndpoint = this.getProfileApiEndpoint();
      const response = await fetch(apiEndpoint + `/v4/user/${userId}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": this.apiKey,
          "X-BondUserAccessToken": this.accessToken,
          "X-BondUserIdToken": this.idToken
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        await this.refreshTokens();
      }
      return await response.json();
    }
    tokensStore(accessToken, idToken, refreshToken) {
      this.tokensStoreInternal(accessToken, idToken, refreshToken ?? "");
    }
    tokensStoreAfterRefresh(accessToken, idToken, refreshToken) {
      this.tokensStoreInternal(accessToken, idToken, refreshToken ?? this.refreshToken ?? "");
    }
    tokensStoreInternal(accessToken, idToken, refreshToken) {
      const nextRefreshToken = refreshToken ?? "";
      localStorage.setItem(TokenStoreKeyNames.refreshToken, nextRefreshToken);
      sessionStorage.setItem(TokenStoreKeyNames.accessToken, accessToken ?? "");
      sessionStorage.setItem(TokenStoreKeyNames.idToken, idToken ?? "");
      this.accessToken = accessToken || "";
      this.idToken = idToken || "";
      this.refreshToken = nextRefreshToken || "";
      this.setTokenTimer();
    }
    isValidBirthDate(birthDate) {
      const parsedBirthDate = parse(birthDate, BIRTH_DATE_FORMAT, /* @__PURE__ */ new Date(0));
      return isMatch(birthDate, BIRTH_DATE_FORMAT) && isValid(parsedBirthDate) && format(parsedBirthDate, BIRTH_DATE_FORMAT) === birthDate;
    }
    getProfileApiEndpoint() {
      if (!/^https?:\/\//.test(this.apiEndpoint)) {
        return this.apiEndpoint.replace(/\/$/, "");
      }
      const apiEndpointUrl = new URL(this.apiEndpoint);
      apiEndpointUrl.hostname = apiEndpointUrl.hostname.replace(/^public\./, "");
      return apiEndpointUrl.toString().replace(/\/$/, "");
    }
    async tokensLoad() {
      this.accessToken = sessionStorage.getItem(TokenStoreKeyNames.accessToken) || void 0;
      this.idToken = sessionStorage.getItem(TokenStoreKeyNames.idToken) || void 0;
      this.refreshToken = localStorage.getItem(TokenStoreKeyNames.refreshToken) || void 0;
      this.setTokenTimer();
      const timeoutTime = this.accessToken ? this.expirationTime - Date.now() - TOKEN_EXPIRATION_OVERLAP_MILISECONDS : 0;
      if (timeoutTime <= 0 && this.refreshToken) {
        console.debug("Access token expired, refreshing...");
        await this.refreshTokens();
      }
    }
    setTokenExpirationTime() {
      if (!this.accessToken) {
        return 0;
      }
      const decodedAccessToken = this.decodeJwt(this.accessToken);
      if (typeof decodedAccessToken.exp !== "number") {
        throw new Error(BondSportsApiErrors.accessTokenMissingExpirationClaim);
      }
      this.expirationTime = decodedAccessToken.exp * ONE_SECOND_IN_MILISECONDS;
      return this.expirationTime;
    }
    setTokenTimer() {
      let timeoutTime = 0;
      if (!this.accessToken) {
        return;
      }
      this.setTokenExpirationTime();
      timeoutTime = this.expirationTime - Date.now() - TOKEN_EXPIRATION_OVERLAP_MILISECONDS;
      console.debug("Access token expires in " + Math.round(timeoutTime / ONE_SECOND_IN_MILISECONDS) + " seconds");
      if (timeoutTime > 0 && this.refreshToken) {
        clearTimeout(this.refreshTokenTimeout);
        this.refreshTokenTimeout = setTimeout(this.refreshTokens.bind(this), timeoutTime);
      }
    }
    refreshTokens() {
      if (!this.refreshTokensInFlight) {
        this.refreshTokensInFlight = this.doRefreshTokens().finally(() => {
          this.refreshTokensInFlight = void 0;
        });
      }
      return this.refreshTokensInFlight;
    }
    async doRefreshTokens() {
      if (!this.refreshToken) {
        throw new Error(BondSportsApiErrors.missingRefreshToken);
      }
      const refreshTokenResponse = await this.oidcClient.useRefreshToken({
        state: {
          refresh_token: this.refreshToken,
          session_state: "",
          profile: {
            sub: "",
            iss: this.oauthConfig.authority,
            aud: this.oauthConfig.clientId,
            exp: 0,
            iat: 0
          }
        }
      });
      if (!refreshTokenResponse) {
        const silentUser = await this.userManager.signinSilent().catch(() => null);
        if (!silentUser) {
          this.cleanupTokenStore();
          throw new Error(BondSportsApiErrors.refreshTokenExchangeFailed);
        }
        this.tokensStoreAfterRefresh(silentUser.access_token, silentUser.id_token, silentUser.refresh_token);
        return;
      }
      this.tokensStoreAfterRefresh(refreshTokenResponse.access_token, refreshTokenResponse.id_token, refreshTokenResponse.refresh_token);
    }
    cleanupTokenStore() {
      localStorage.removeItem(TokenStoreKeyNames.refreshToken);
      sessionStorage.removeItem(TokenStoreKeyNames.accessToken);
      sessionStorage.removeItem(TokenStoreKeyNames.idToken);
      this.accessToken = void 0;
      this.idToken = void 0;
      this.refreshToken = void 0;
      this.expirationTime = 0;
      if (this.refreshTokenTimeout) {
        clearTimeout(this.refreshTokenTimeout);
        this.refreshTokenTimeout = void 0;
      }
    }
  };
  return __toCommonJS(index_exports);
})();
