import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserModel & Document;

@Schema({ timestamps: true })
export class UserModel {
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

  @Prop({ type: [String], default: [] })
  skills!: string[];

  @Prop({ type: [String], default: [] })
  interests!: string[];

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
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

UserSchema.index({ email: 1 });
