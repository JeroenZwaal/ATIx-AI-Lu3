import { IsString, IsArray, IsNumber } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    studyProgram: string;
    @IsString()
    studyLocation: string;
    @IsNumber()
    studyCredits: number;
    @IsNumber()
    yearOfStudy: number;
    @IsArray()
    skills: string[];
    @IsArray()
    interests: string[];
}
