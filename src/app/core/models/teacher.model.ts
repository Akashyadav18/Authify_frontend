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
  teacherId: string;
  fullName: string;
  phoneNumber: string | null;
  experienceYear: number;
  qualification: string;
  gender: Gender;
}
