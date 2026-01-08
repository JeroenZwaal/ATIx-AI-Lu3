import { IsString, IsArray, IsNumber, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    studyProgram: string;
    @IsOptional()
    @IsString()
    studyLocation?: string;
    @IsNumber()
    studyCredits: number;
    @IsNumber()
    yearOfStudy: number;
    @IsArray()
    skills: string[];
    @IsArray()
    interests: string[];
}
