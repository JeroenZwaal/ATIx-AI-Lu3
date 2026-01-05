import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Module } from '../../domain/entities/module.entity';
import { IModuleRepository } from '../../domain/repositories/module.repository.interface';
import { ModuleDocument, ModuleModel } from '../schemas/module.schema';

@Injectable()
export class ModuleRepository implements IModuleRepository {
  constructor(
    @InjectModel(ModuleModel.name)
    private readonly moduleModel: Model<ModuleDocument>,
  ) {}

  private mapToEntity(doc: ModuleDocument): Module {
    const rawDoc = doc.toObject ? doc.toObject({ flattenMaps: true }) : doc;
    const raw = rawDoc as Record<string, unknown>;
    return {
      id: doc._id.toString(),
      name: doc.name,
      shortdescription: (doc.shortDescription ||
        raw.shortdescription ||
        '') as string,
      description: doc.description,
      content: doc.content,
      studycredit: doc.studyCredits ?? raw.studycredit ?? 0,
      location: doc.location,
      contactId: doc.contactId,
      level: doc.level,
      learningoutcomes: (doc.learningOutcomes ||
        raw.learningoutcomes ||
        '') as string,
      module_tags: doc.tags,
      interests_match_score: (doc.interestsMatchScore ??
        raw.interests_match_score) as number,
      popularity_score: (doc.popularityScore ?? raw.popularity_score) as number,
      estimated_difficulty: (doc.estimatedDifficulty ??
        raw.estimated_difficulty) as number,
      available_spots: (doc.availableSpots ?? raw.available_spots) as
        | number
        | undefined,
      start_date: (doc.startDate || raw.start_date) as Date | undefined,
    };
  }

  async findAll(): Promise<Module[]> {
    const docs = (await this.moduleModel
      .find()
      .exec()) as unknown as ModuleDocument[];
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async findById(id: string): Promise<Module | null> {
    const doc = (await this.moduleModel
      .findById(id)
      .exec()) as unknown as ModuleDocument | null;
    return doc ? this.mapToEntity(doc) : null;
  }

  async findByExternalId(externalId: number): Promise<Module | null> {
    const doc = (await this.moduleModel
      .findOne({ externalId })
      .exec()) as unknown as ModuleDocument | null;
    return doc ? this.mapToEntity(doc) : null;
  }

  async search(query: string): Promise<Module[]> {
    const docs = (await this.moduleModel
      .find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .exec()) as unknown as ModuleDocument[];
    return docs.map((doc) => this.mapToEntity(doc));
  }

  async count(): Promise<number> {
    return this.moduleModel.countDocuments().exec();
  }

  async deleteAll(): Promise<void> {
    await this.moduleModel.deleteMany({}).exec();
  }
}
