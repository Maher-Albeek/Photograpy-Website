export type ConsentCategory = "necessary" | "analytics" | "externalMedia";

export type ConsentSelections = Record<ConsentCategory, boolean>;

export interface StoredConsent {
  version: string;
  timestamp: string;
  categories: ConsentSelections;
}

export interface ConsentCategoryDefinition {
  key: ConsentCategory;
  required: boolean;
  title: string;
  description: string;
  titleKey: string;
  descriptionKey: string;
}
