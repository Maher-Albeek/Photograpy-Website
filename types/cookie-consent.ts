export type ConsentCategory = "necessary" | "preferences" | "analytics" | "marketing";

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
