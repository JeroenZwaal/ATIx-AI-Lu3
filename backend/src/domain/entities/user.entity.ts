export class User {
    constructor(
        public readonly _id: string,
        public readonly email: string,
        public readonly passwordHash: string,
        public readonly firstName: string,
        public readonly lastName: string,
        public readonly skills: string[],
        public readonly interests: string[],
        public readonly favorites: UserFavorite[],
        public readonly twoFactorEnabled: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly studyProgram?: string,
        public readonly yearOfStudy?: number,
        public readonly studyLocation?: string,
        public readonly studyCredits?: string,
        public readonly twoFactorSecret?: string,
        public readonly refreshToken?: string,
    ) {}
}

export class UserFavorite {
    constructor(
        public readonly moduleId: string,
        public readonly addedAt: Date,
        public readonly moduleName: string,
    ) {}
}
