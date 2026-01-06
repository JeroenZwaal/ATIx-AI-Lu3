import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Module as DomainModule } from '../../domain/entities/module.entity';
import type { IModuleRepository } from '../../domain/repositories/module.repository.interface';
import { ModuleModel } from '../schemas/module.schema';

export interface ModuleDocument extends Document {
  id: number;
  name: string;
  shortDescription?: string;
  description?: string;
  content?: string;
  studyCredits?: number;
  location?: string;
  contactId?: number;
  level?: string;
  learningOutcomes?: string;
  tags?: string[];
  interestsMatchScore?: number;
  popularityScore?: number;
  estimatedDifficulty?: number;
  availableSpots?: number;
  startDate?: Date;
  created_at?: Date;
  updated_at?: Date;
}

@Injectable()
export class ModuleRepository implements IModuleRepository {
  constructor(
    @InjectModel('Module') private readonly moduleModel: Model<ModuleDocument>,
  ) {}

  async findAll(): Promise<DomainModule[]> {
    const docs = await this.moduleModel.find().exec();
    return docs.map((d) => this.mapToEntity(d));
  }

  async findById(id: string): Promise<DomainModule | null> {
    if (!id || typeof id !== 'string' || !Types.ObjectId.isValid(id)) return null;
    const doc = await this.moduleModel.findById(new Types.ObjectId(id)).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByExternalId(externalId: number): Promise<DomainModule | null> {
    if (typeof externalId !== 'number') return null;
    const doc = await this.moduleModel.findOne({ id: externalId }).exec();
    return doc ? this.mapToEntity(doc) : null;
  }

  async search(query: string): Promise<DomainModule[]> {
    const q = String(query || '').trim();
    if (!q) return [];
    const docs = await this.moduleModel.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    }).exec();
    return docs.map((d) => this.mapToEntity(d));
  }

  async count(): Promise<number> {
    return this.moduleModel.countDocuments().exec();
  }

  async saveMany(modules: Omit<DomainModule, 'id'>[]): Promise<void> {
    if (!Array.isArray(modules) || modules.length === 0) return;

    const ops = modules.map((m) => ({
      updateOne: {
        filter: { id: m.externalId },
        update: {
          $set: {
            id: m.externalId,
            name: m.name,
            shortDescription: m.shortdescription,
            description: m.description,
            content: m.content,
            studyCredits: m.studycredit,
            location: m.location,
            contactId: m.contactId,
            level: m.level,
            learningOutcomes: m.learningoutcomes,
            tags: m.tags || [],
            interestsMatchScore: m.interests_match_score,
            popularityScore: m.popularity_score,
            estimatedDifficulty: m.estimated_difficulty,
            availableSpots: m.available_spots,
            startDate: m.start_date,
          },
        },
        upsert: true,
      },
    }));

    // BulkWrite to perform upserts efficiently
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore -- mongoose driver's types for bulkWrite can be finicky here
    await this.moduleModel.bulkWrite(ops);
  }

  async deleteAll(): Promise<void> {
    await this.moduleModel.deleteMany({}).exec();
  }

  private mapToEntity(doc: ModuleDocument): DomainModule {
    const id = doc._id ? doc._id.toString() : Math.random().toString(36).slice(2, 9);
    return new DomainModule(
      id,
      doc.id,
      doc.name,
      doc.shortDescription || '',
      doc.description || '',
      doc.content || '',
      doc.studyCredits || 0,
      doc.location || '',
      doc.contactId || 0,
      doc.level || '',
      doc.learningOutcomes || '',
      doc.tags || [],
      `${doc.name} ${doc.shortDescription || ''} ${doc.description || ''}`,
      doc.interestsMatchScore,
      doc.popularityScore,
      doc.estimatedDifficulty,
      doc.availableSpots,
      doc.startDate,
    );
  }
}
