export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface StudentReq {
    firstName: string;
    lastName: string;
    rollNo: string;
    gender: Gender;
}

export interface StudentRes {
    id: number;
    stdId: string;
    username: string | null;
    fullName: string;
    rollNo: string;
    gender: Gender;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: string | null;   // ISO LocalDateTime from Spring Boot
    updatedAt: string | null;
}