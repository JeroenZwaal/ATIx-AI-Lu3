import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({
    collection: 'users',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

export class UserDocument extends Document {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ trim: true })
  phoneNumber?: string;

  @Prop({ trim: true })
  bio?: string;

  @Prop({ type: [String], default: [], required: false })
  skills!: string[];

  @Prop({ type: [String], default: [] })
  interests!: string[];

  @Prop([{
  module_id: { type: String, required: true },
  added_at: { type: Date, required: true },
  module_name: { type: String, required: true },
  }])
  favorites: Array<{
      module_id: string;
      added_at: Date;
      module_name: string;
  }>;
  
  @Prop({ trim: true })
  studentNumber?: string;

  @Prop({ trim: true })
  studyProgram?: string;

  @Prop()
  yearOfStudy?: number;

  @Prop({ default: false })
  twoFactorEnabled!: boolean;

  @Prop()
  twoFactorSecret?: string;

  @Prop()
  refreshToken?: string;

  created_at: Date;
  updated_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
