/**
 * ShambaSoil Core Types & Interfaces
 * Production Agricultural Soil Intelligence System for Kenya
 */

export type UserRole = 'farmer' | 'extension_officer' | 'agronomist' | 'org_admin' | 'system_admin';

export type Language = 'en' | 'sw';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  full_name: string;
  phone: string;
  email: string;
  county: string;
  sub_county: string;
  ward?: string;
  language: Language;
  role: UserRole;
  farming_scale?: 'smallholder' | 'medium' | 'commercial';
  primary_crops?: string[];
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  owner_id: string;
  name: string;
  county: string;
  sub_county: string;
  ward: string;
  latitude?: number;
  longitude?: number;
  approximate_location: string;
  area: number;
  area_unit: 'acres' | 'hectares';
  soil_type?: string;
  current_crop?: string;
  previous_crop?: string;
  irrigation_status: 'rain_fed' | 'irrigated' | 'partially_irrigated';
  irrigation_type?: 'none' | 'drip' | 'sprinkler' | 'furrow' | 'bucket';
  farm_notes?: string;
  created_at: string;
  updated_at: string;
}

export type AnalysisStatus = 'DRAFT' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVIEW_REQUIRED';

export type ConfidenceLevel = 'low' | 'moderate' | 'higher';

export interface SoilImage {
  id: string;
  analysis_id: string;
  storage_path: string; // Base64 data URL or storage path
  position_type: 'surface' | 'close_up' | 'profile' | 'different_section';
  image_metadata?: {
    width?: number;
    height?: number;
    size_bytes?: number;
    mime_type?: string;
  };
  quality_score?: number;
  created_at: string;
}

export interface FarmerObservations {
  soil_color: 'black' | 'dark_brown' | 'brown' | 'red' | 'orange' | 'grey' | 'pale' | 'other';
  soil_feel: 'sandy' | 'loamy' | 'clay' | 'rocky' | 'unknown';
  drainage: 'drains_quickly' | 'moderate' | 'holds_water' | 'unknown';
  water_source: 'rain_fed' | 'borehole' | 'river' | 'well' | 'dam' | 'other';
  current_crop?: string;
  intended_crop?: string;
  recent_fertilizer?: {
    product: string;
    amount?: string;
    application_date?: string;
  };
  photo_representation: 'same_location' | 'different_locations' | 'different_parts';
}

export interface VisualObservation {
  id: string;
  analysis_id: string;
  category: 'texture' | 'structure' | 'organic_matter' | 'moisture' | 'compaction' | 'color';
  observation: string;
  confidence: ConfidenceLevel;
}

export interface StructuredAiAnalysis {
  image_quality: {
    score: number;
    usable: boolean;
    reason: string;
  };
  overall_assessment: 'soil_requires_attention' | 'soil_suitable_with_management' | 'soil_appears_promising' | 'more_information_required';
  visual_observations: string[];
  possible_soil_characteristics: string[];
  possible_risks: string[];
  confidence: ConfidenceLevel;
  confidence_reason: string;
  recommended_tests: string[];
  crop_considerations: string[];
  management_actions: {
    timing: 'do_now' | 'before_planting' | 'during_growth' | 'long_term' | 'avoid';
    action: string;
    why: string;
    how: string;
  }[];
  fertility_guidance: string[];
  irrigation_guidance: string[];
  warning: string;
}

export interface SoilAnalysis {
  id: string;
  farm_id: string;
  farm_name?: string;
  user_id: string;
  status: AnalysisStatus;
  analysis_type: 'AI_VISUAL';
  confidence: ConfidenceLevel;
  observations?: FarmerObservations;
  images: SoilImage[];
  ai_result?: StructuredAiAnalysis;
  selected_crop_id?: string;
  crop_suitability?: {
    crop_name: string;
    compatibility: 'suitable' | 'moderate_adaptation_needed' | 'high_risk';
    drainage_assessment: string;
    nutrient_considerations: string;
    water_needs: string;
    actions_before_planting: string[];
    cautions: string[];
  };
  created_at: string;
  completed_at?: string;
}

export interface SoilTestResult {
  id: string;
  farm_id: string;
  farm_name?: string;
  analysis_id?: string;
  source: 'AI_VISUAL' | 'LABORATORY';
  laboratory_name: string;
  test_date: string;
  ph?: number;
  nitrogen?: number; // mg/kg or %
  phosphorus?: number; // ppm (Bray/Olsen)
  potassium?: number; // ppm or meq/100g
  organic_carbon?: number; // %
  ec?: number; // dS/m
  calcium?: number;
  magnesium?: number;
  sulfur?: number;
  micronutrients?: Record<string, number | string>;
  document_path?: string;
  notes?: string;
  created_at: string;
}

export interface Crop {
  id: string;
  name: string;
  scientific_name: string;
  category: 'cereal' | 'legume' | 'vegetable' | 'fruit' | 'tuber' | 'cash_crop';
  growth_duration_days: string;
  temperature_range: string;
  water_requirement: string;
  soil_preferences: string;
  ph_preference: string;
  drainage_preference: string;
  nutrient_requirements: {
    n: 'low' | 'moderate' | 'high';
    p: 'low' | 'moderate' | 'high';
    k: 'low' | 'moderate' | 'high';
    description: string;
  };
  planting_guidance: string;
  spacing: string;
  common_deficiencies: string[];
  common_diseases: string[];
  common_pests: string[];
  harvest_info: string;
  kenya_notes: string;
  active: boolean;
}

export type CropGuide = Crop;

export interface FarmEvent {
  id: string;
  farm_id: string;
  farm_name?: string;
  user_id: string;
  event_type: 'planting' | 'fertilizer' | 'compost' | 'manure' | 'irrigation' | 'rain' | 'pest_scouting' | 'disease' | 'harvest' | 'soil_amendment';
  event_date: string;
  notes: string;
  metadata?: {
    crop_name?: string;
    product_name?: string;
    quantity?: string;
    cost_kes?: number;
    yield_amount?: string;
  };
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: 'KES';
  provider: 'M-PESA' | 'AIRTEL_MONEY' | 'CARD';
  provider_reference: string;
  phone_number: string;
  status: 'pending' | 'successful' | 'failed' | 'cancelled';
  product: 'soil_analysis_pack' | 'agronomist_review' | 'premium_subscription';
  metadata?: Record<string, any>;
  created_at: string;
  receipt_number?: string;
}

export interface ExpertReview {
  id: string;
  analysis_id: string;
  farm_id: string;
  user_id: string;
  farmer_name: string;
  professional_id?: string;
  professional_name?: string;
  status: 'pending' | 'in_review' | 'completed' | 'rejected';
  farmer_question: string;
  crop_intended: string;
  professional_response?: {
    summary: string;
    agronomic_recommendations: string[];
    fertilizer_opinion: string;
    soil_health_assessment: string;
    follow_up_advice: string;
    reviewed_at: string;
  };
  created_at: string;
  completed_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'soil_test_reminder' | 'planting_reminder' | 'weather_alert' | 'journal_prompt' | 'system' | 'review_completed';
  title: string;
  body: string;
  read: boolean;
  action_url?: string;
  created_at: string;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  organization: string;
  url?: string;
  topic: string;
  crop?: string;
  region?: string;
  publication_date: string;
  review_status: 'verified' | 'pending';
}

export interface SystemSettings {
  ai_model: string;
  prompt_version: string;
  maintenance_mode: boolean;
  free_analysis_limit: number;
  mpesa_paybill: string;
  mpesa_till: string;
}
