export class Module {
    constructor(
        public readonly id: string,
        public readonly externalId: number,
        public readonly name: string,
        public readonly shortdescription: string,
        public readonly description: string,
        public readonly content: string,
        public readonly studycredit: number,
        public readonly location: string,
        public readonly contactId: number,
        public readonly level: string,
        public readonly learningoutcomes: string,
        public readonly tags: string[],
        public readonly combinedText: string,
        public readonly interests_match_score?: number,
        public readonly popularity_score?: number,
        public readonly estimated_difficulty?: number,
        public readonly available_spots?: number,
        public readonly start_date?: Date,
    ) {}
}
/**
EU AI Act Compliance: Uitlegbare informatie voor aanbevelingen
*/
export class ExplainabilityInfo {
    constructor(
        public readonly matching_terms: string[],
        public readonly goal_contribution: number,
        public readonly skills_contribution: number,
        public readonly interests_contribution: number,
        public readonly explanation_nl: string,
    ) {}
}

export class ModuleRecommendation {
    constructor(
        public readonly module: Module,
        public readonly similarityScore: number,
        public readonly explainability?: ExplainabilityInfo,
    ) {}
}
