export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          title: string | null;
          purpose: string;
          background_text: string | null;
          report_instructions: string | null;
          phase_profile: Json;
          status: "active" | "completed" | "paused";
          current_question_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string | null;
          purpose: string;
          background_text?: string | null;
          report_instructions?: string | null;
          phase_profile?: Json;
          status?: "active" | "completed" | "paused";
          current_question_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string | null;
          purpose?: string;
          background_text?: string | null;
          report_instructions?: string | null;
          phase_profile?: Json;
          status?: "active" | "completed" | "paused";
          current_question_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          session_id: string;
          question_index: number;
          statement: string;
          detail: string | null;
          options: Json;
          phase: "exploration" | "deep-dive";
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          question_index: number;
          statement: string;
          detail?: string | null;
          options: Json;
          phase: "exploration" | "deep-dive";
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          question_index?: number;
          statement?: string;
          detail?: string | null;
          options?: Json;
          phase?: "exploration" | "deep-dive";
          created_at?: string;
        };
      };
      answers: {
        Row: {
          id: string;
          question_id: string;
          session_id: string;
          selected_option: number;
          free_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          session_id: string;
          selected_option: number;
          free_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string;
          session_id?: string;
          selected_option?: number;
          free_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          session_id: string;
          batch_index: number;
          start_index: number;
          end_index: number;
          analysis_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          batch_index: number;
          start_index: number;
          end_index: number;
          analysis_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          batch_index?: number;
          start_index?: number;
          end_index?: number;
          analysis_text?: string;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          session_id: string;
          version: number;
          report_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          version?: number;
          report_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          version?: number;
          report_text?: string;
          created_at?: string;
        };
      };
    };
  };
}
