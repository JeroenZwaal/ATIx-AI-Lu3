import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ModuleDocument = ModuleModel & Document;

@Schema({ timestamps: true })
export class ModuleModel {
  @Prop({ required: true, unique: true, name: 'id' })
  externalId!: number;

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

  @Prop({ type: [String], default: [], name: 'module_tags' })
  tags!: string[];

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

  @Prop({ required: true })
  combinedText!: string;
}

export const ModuleSchema = SchemaFactory.createForClass(ModuleModel);

ModuleSchema.index({ externalId: 1 });
ModuleSchema.index({
  name: 'text',
  description: 'text',
  shortDescription: 'text',
});
