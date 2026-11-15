export type UserRole = 'student' | 'client' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deactivated';
export type ExperienceLevel = 'entry' | 'intermediate' | 'expert';
export type BudgetType = 'hourly' | 'fixed';
export type ProjectType = 'one-time' | 'ongoing';
export type ProjectStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'paused';
export type ApplicationStatus = 'pending' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn' | 'completed';
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  university?: string;
  department?: string;
  student_id?: string;
  bio?: string;
  experience_level: ExperienceLevel;
  education?: string;
  github_url?: string;
  linkedin_url?: string;
  website_url?: string;
  profile_completed: number;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: number;
  user_id: number;
  company_name?: string;
  industry?: string;
  company_size?: string;
  website_url?: string;
  bio?: string;
  location?: string;
  is_verified: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category: string;
  created_at: string;
}

export interface StudentSkill {
  id: number;
  student_profile_id: number;
  skill_id: number;
  skill_name?: string;
  category?: string;
  proficiency: SkillProficiency;
  years_of_experience: number;
}

export interface Project {
  id: number;
  client_id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  budget_type: BudgetType;
  project_type: ProjectType;
  experience_level: ExperienceLevel;
  deadline?: string;
  status: ProjectStatus;
  additional_requirements?: string;
  location: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  client_name?: string;
  client_company?: string;
  client_verified?: boolean;
  required_skills?: Array<{ id: number; name: string; category?: string; is_mandatory: number }>;
  proposals_count?: number;
  has_applied?: boolean;
}

export interface Application {
  id: number;
  project_id: number;
  student_id: number;
  cover_letter: string;
  proposed_rate: number;
  delivery_time: string;
  relevant_experience?: string;
  portfolio_item_ids?: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  // Joins
  project_title?: string;
  project_category?: string;
  project_budget?: number;
  project_budget_type?: string;
  project_status?: string;
  client_name?: string;
  client_id?: number;
  student_name?: string;
  student_email?: string;
  student_university?: string;
  student_avatar?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: number;
  created_at: string;
}

export interface Review {
  id: number;
  project_id: number;
  reviewer_id: number;
  reviewee_id: number;
  reviewer_role: 'student' | 'client';
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
  project_title?: string;
}
