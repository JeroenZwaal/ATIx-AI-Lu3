import { IsString, IsArray, IsNumber, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    studyProgram?: string;
    @IsOptional()
    @IsString()
    studyLocation?: string;
    @IsOptional()
    @IsNumber()
    studyCredits?: number;
    @IsOptional()
    @IsNumber()
    yearOfStudy?: number;
    @IsOptional()
    @IsArray()
    skills?: string[];
    @IsOptional()
    @IsArray()
    interests?: string[];
}
