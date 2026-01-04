export interface Module {
  id: string;
  externalId: number;
  name: string;
  shortdescription: string;
  description: string;
  content: string;
  studycredit: number;
  location: string;
  contactId: number;
  level: string;
  learningoutcomes: string;
  tags: string[];
  interests_match_score?: number;
  popularity_score?: number;
  estimated_difficulty?: number;
  available_spots?: number;
  start_date?: Date;
  combinedText: string;
}

/**
EU AI Act Compliance: Uitlegbare informatie voor aanbevelingen
*/
export interface ExplainabilityInfo {
  matching_terms: string[];
  goal_contribution: number;
  skills_contribution: number;
  interests_contribution: number;
  explanation_nl: string;
}

export interface ModuleRecommendation {
  module: Module;
  similarityScore: number;
  explainability?: ExplainabilityInfo;
}
