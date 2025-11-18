export interface CreatePatientInput {
  name: string;
  email: string;
  password: string;
  profilePhoto?: string;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface CreateDoctorInput {
  name: string;
  email: string;
  password: string;
  specialization: string;
  profilePhoto?: string;
}
