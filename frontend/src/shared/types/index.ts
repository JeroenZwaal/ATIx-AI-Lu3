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
    combinedText: string;
    interests_match_score?: number;
    popularity_score?: number;
    estimated_difficulty?: number;
    available_spots?: number;
    start_date?: Date;
}
