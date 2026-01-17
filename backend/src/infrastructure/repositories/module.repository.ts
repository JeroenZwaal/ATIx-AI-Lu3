import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

        // Parse moduleTags - try multiple sources
        let tagsArray: string[] = [];
        const tagsValue =
            raw.module_tags ||
            (doc as ModuleDocument & { module_tags?: unknown }).module_tags ||
            doc.moduleTags;
        if (tagsValue) {
            try {
                // Replace single quotes with double quotes to make it valid JSON
                const jsonString = (tagsValue as string).replace(/'/g, '"');
                const parsed = JSON.parse(jsonString) as unknown;
                if (Array.isArray(parsed)) {
                    tagsArray = parsed as string[];
                }
            } catch (e) {
                console.warn('Failed to parse module_tags:', e);
            }
        }

        return new Module(
            doc._id.toString(),
            doc.id,
            doc.name,
            (doc.shortDescription || raw.shortdescription || '') as string,
            doc.description,
            doc.content,
            doc.studyCredits ?? (raw.studycredit as number) ?? 0,
            doc.location,
            doc.contactId,
            doc.level,
            (doc.learningOutcomes || raw.learningoutcomes || '') as string,
            tagsArray,
            '',
            (doc.interestsMatchScore ?? raw.interests_match_score) as number | undefined,
            (doc.popularityScore ?? raw.popularity_score) as number | undefined,
            (doc.estimatedDifficulty ?? raw.estimated_difficulty) as number | undefined,
            (doc.availableSpots ?? raw.available_spots) as number | undefined,
            (doc.startDate || raw.start_date) as Date | undefined,
        );
    }

    async findAll(): Promise<Module[]> {
        const docs = (await this.moduleModel.find().exec()) as unknown as ModuleDocument[];
        return docs.map((doc) => this.mapToEntity(doc));
    }

    async findById(id: string): Promise<Module | null> {
        // Valideer en sanitize ID om NoSQL injection te voorkomen
        if (!id || typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
            return null;
        }
        const doc = (await this.moduleModel
            .findById(new Types.ObjectId(id))
            .exec()) as unknown as ModuleDocument | null;
        return doc ? this.mapToEntity(doc) : null;
    }

    async findByExternalId(externalId: number): Promise<Module | null> {
        const safeExternalId = Number.isFinite(externalId) ? Math.trunc(externalId) : NaN;
        if (!Number.isFinite(safeExternalId)) {
            return null;
        }

        const doc = (await this.moduleModel
            // external id is stored in Mongo as field `id`
            .findOne()
            .where('id')
            .equals(safeExternalId)
            .exec()) as unknown as ModuleDocument | null;
        return doc ? this.mapToEntity(doc) : null;
    }

    async search(query: string): Promise<Module[]> {
        // Valideer query type en lengte
        if (!query || typeof query !== 'string') {
            return [];
        }

        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 0) {
            return [];
        }

        // MongoDB $text search is relatief veilig, maar extra validatie voor zekerheid
        // $text search escapt automatisch speciale tekens, maar we willen geen lege queries
        const docs = (await this.moduleModel
            .find({ $text: { $search: trimmedQuery } }, { score: { $meta: 'textScore' } })
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

    async getAllTags(): Promise<string[]> {
        const docs = (await this.moduleModel.find().exec()) as unknown as ModuleDocument[];
        const allTags = new Set<string>();

        docs.forEach((doc) => {
            const rawDoc = doc.toObject ? doc.toObject({ flattenMaps: true }) : doc;
            const raw = rawDoc as Record<string, unknown>;

            // Try to get module_tags from raw object or moduleTags property
            const tagsValue =
                raw.module_tags ||
                (doc as ModuleDocument & { module_tags?: unknown }).module_tags ||
                doc.moduleTags;

            if (tagsValue) {
                try {
                    // Replace single quotes with double quotes to make it valid JSON
                    const jsonString = (tagsValue as string).replace(/'/g, '"');
                    const parsed = JSON.parse(jsonString) as unknown;
                    if (Array.isArray(parsed)) {
                        const tagsArray = parsed as string[];
                        tagsArray.forEach((tag: string) => {
                            const trimmedTag = tag.trim().toLowerCase();
                            if (trimmedTag) {
                                allTags.add(trimmedTag);
                            }
                        });
                    }
                } catch (e) {
                    // If parsing fails, skip this document
                    console.warn('Failed to parse module_tags:', e);
                }
            }
        });

        return Array.from(allTags).sort();
    }
}
