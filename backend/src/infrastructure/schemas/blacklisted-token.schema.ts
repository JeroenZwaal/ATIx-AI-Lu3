import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    collection: 'blacklisted_tokens',
    timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class BlacklistedTokenDocument extends Document {
    @Prop({ required: true, unique: true, index: true })
    token!: string;

    @Prop({ required: true })
    expiresAt!: Date;

    created_at: Date;
}

export const BLACKLISTED_TOKEN_SCHEMA = SchemaFactory.createForClass(BlacklistedTokenDocument);
