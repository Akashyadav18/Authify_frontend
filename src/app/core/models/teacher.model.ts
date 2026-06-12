export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface TeacherReq {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  experienceYear: number;
  qualification: string;
  gender: Gender;
}

export interface TeacherRes {
  id: number;
  teacherId: string | null;    // may be null
  fullName: string;
  phoneNumber: string | null;
  experienceYear: number;
  qualification: string;
  gender: Gender;
  createdBy: string | null;    // may be null
  createdAt: string | null;    // ISO LocalDateTime from Spring Boot — may be null
}
