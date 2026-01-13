import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    collection: 'modules',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class ModuleModel {
    @Prop({ required: true, unique: true, name: 'id' })
    id!: number;

    @Prop({ required: true, trim: true })
    name!: string;

    @Prop({ trim: true, name: 'shortdescription' })
    shortDescription!: string;

    @Prop({ trim: true })
    description!: string;

    @Prop({ trim: true })
    content!: string;

    @Prop({ name: 'studycredit' })
    studyCredits!: number;

    @Prop({ trim: true })
    location!: string;

    @Prop({ name: 'contact_id' })
    contactId!: number;

    @Prop({ trim: true })
    level!: string;

    @Prop({ trim: true, name: 'learningoutcomes' })
    learningOutcomes!: string;

    @Prop({ name: 'module_tags' })
    moduleTags!: string;

    @Prop({ name: 'interests_match_score' })
    interestsMatchScore?: number;

    @Prop({ name: 'popularity_score' })
    popularityScore?: number;

    @Prop({ name: 'estimated_difficulty' })
    estimatedDifficulty?: number;

    @Prop({ name: 'available_spots' })
    availableSpots?: number;

    @Prop({ name: 'start_date' })
    startDate?: Date;

    created_at: Date;
    updated_at: Date;
}

export const MODULESCHEMA = SchemaFactory.createForClass(ModuleModel);
export type ModuleDocument = ModuleModel & Document;
