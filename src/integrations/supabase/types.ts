export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          grs: string | null
          id: string
          ip_address: string | null
          microregiao: string | null
          municipio_id: string | null
          new_values: Json | null
          old_values: Json | null
          operation: string
          urs: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: string
          grs?: string | null
          id?: string
          ip_address?: string | null
          microregiao?: string | null
          municipio_id?: string | null
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          urs?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          grs?: string | null
          id?: string
          ip_address?: string | null
          microregiao?: string | null
          municipio_id?: string | null
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          urs?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cib_documentation: {
        Row: {
          created_at: string
          description: string
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      cib_meetings: {
        Row: {
          created_at: string
          created_by: string | null
          deliberations: string | null
          id: string
          meeting_date: string
          notes: string | null
          participants: string | null
          participation_type: string
          territory_impacts: string | null
          themes: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deliberations?: string | null
          id?: string
          meeting_date: string
          notes?: string | null
          participants?: string | null
          participation_type?: string
          territory_impacts?: string | null
          themes: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deliberations?: string | null
          id?: string
          meeting_date?: string
          notes?: string | null
          participants?: string | null
          participation_type?: string
          territory_impacts?: string | null
          themes?: string
          updated_at?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          id: string
          progress: number
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          id?: string
          progress?: number
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          id?: string
          progress?: number
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          duration: string | null
          enrolled: number
          format: string
          id: string
          level: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          enrolled?: number
          format?: string
          id?: string
          level?: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: string | null
          enrolled?: number
          format?: string
          id?: string
          level?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      forum_experts: {
        Row: {
          acceptance_rate: number | null
          created_at: string
          forum_id: string
          helpful_replies_count: number | null
          id: string
          is_verified: boolean | null
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          acceptance_rate?: number | null
          created_at?: string
          forum_id: string
          helpful_replies_count?: number | null
          id?: string
          is_verified?: boolean | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          acceptance_rate?: number | null
          created_at?: string
          forum_id?: string
          helpful_replies_count?: number | null
          id?: string
          is_verified?: boolean | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_experts_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_members: {
        Row: {
          accepted_rules: boolean | null
          accepted_rules_at: string | null
          created_at: string
          forum_id: string
          id: string
          user_id: string
        }
        Insert: {
          accepted_rules?: boolean | null
          accepted_rules_at?: string | null
          created_at?: string
          forum_id: string
          id?: string
          user_id: string
        }
        Update: {
          accepted_rules?: boolean | null
          accepted_rules_at?: string | null
          created_at?: string
          forum_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_members_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_accepted: boolean | null
          parent_reply_id: string | null
          topic_id: string
          updated_at: string
          votes_score: number | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          parent_reply_id?: string | null
          topic_id: string
          updated_at?: string
          votes_score?: number | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          parent_reply_id?: string | null
          topic_id?: string
          updated_at?: string
          votes_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_tags: {
        Row: {
          color: string | null
          created_at: string
          forum_id: string
          id: string
          name: string
          slug: string
          usage_count: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          forum_id: string
          id?: string
          name: string
          slug: string
          usage_count?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          forum_id?: string
          id?: string
          name?: string
          slug?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_tags_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topic_materials: {
        Row: {
          created_at: string
          created_by: string
          id: string
          material_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          material_id: string
          topic_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          material_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_topic_materials_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topic_tags: {
        Row: {
          created_at: string
          id: string
          tag_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tag_id: string
          topic_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tag_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_topic_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "forum_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topic_tags_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          author_id: string
          best_reply_id: string | null
          content: string
          created_at: string
          expires_at: string | null
          forum_id: string
          id: string
          is_featured: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          notification_sent: boolean | null
          replies_count: number | null
          status: Database["public"]["Enums"]["forum_topic_status"]
          title: string
          topic_type: Database["public"]["Enums"]["forum_topic_type"]
          updated_at: string
          views_count: number | null
          votes_score: number | null
        }
        Insert: {
          author_id: string
          best_reply_id?: string | null
          content: string
          created_at?: string
          expires_at?: string | null
          forum_id: string
          id?: string
          is_featured?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          notification_sent?: boolean | null
          replies_count?: number | null
          status?: Database["public"]["Enums"]["forum_topic_status"]
          title: string
          topic_type?: Database["public"]["Enums"]["forum_topic_type"]
          updated_at?: string
          views_count?: number | null
          votes_score?: number | null
        }
        Update: {
          author_id?: string
          best_reply_id?: string | null
          content?: string
          created_at?: string
          expires_at?: string | null
          forum_id?: string
          id?: string
          is_featured?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          notification_sent?: boolean | null
          replies_count?: number | null
          status?: Database["public"]["Enums"]["forum_topic_status"]
          title?: string
          topic_type?: Database["public"]["Enums"]["forum_topic_type"]
          updated_at?: string
          views_count?: number | null
          votes_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_votes: {
        Row: {
          created_at: string
          id: string
          reply_id: string | null
          topic_id: string | null
          user_id: string
          vote_value: number
        }
        Insert: {
          created_at?: string
          id?: string
          reply_id?: string | null
          topic_id?: string | null
          user_id: string
          vote_value: number
        }
        Update: {
          created_at?: string
          id?: string
          reply_id?: string | null
          topic_id?: string | null
          user_id?: string
          vote_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_votes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forums: {
        Row: {
          color: string
          created_at: string
          description: string
          display_order: number | null
          faq_content: string | null
          icon: string
          id: string
          is_active: boolean | null
          members_count: number | null
          microregiao: string | null
          moderator_id: string | null
          name: string
          rules: string | null
          sla_hours: number | null
          slug: string
          tipo_forum: string | null
          topics_count: number | null
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description: string
          display_order?: number | null
          faq_content?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          members_count?: number | null
          microregiao?: string | null
          moderator_id?: string | null
          name: string
          rules?: string | null
          sla_hours?: number | null
          slug: string
          tipo_forum?: string | null
          topics_count?: number | null
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          display_order?: number | null
          faq_content?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          members_count?: number | null
          microregiao?: string | null
          moderator_id?: string | null
          name?: string
          rules?: string | null
          sla_hours?: number | null
          slug?: string
          tipo_forum?: string | null
          topics_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      governance_documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          name: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          name: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          name?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      mentees: {
        Row: {
          created_at: string
          experience_level: string | null
          id: string
          job_role: string | null
          knowledge_gaps:
            | Database["public"]["Enums"]["mentorship_specialty"][]
            | null
          learning_goals: string | null
          municipality: string | null
          organization: string | null
          preferred_schedule: string | null
          total_hours: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_level?: string | null
          id?: string
          job_role?: string | null
          knowledge_gaps?:
            | Database["public"]["Enums"]["mentorship_specialty"][]
            | null
          learning_goals?: string | null
          municipality?: string | null
          organization?: string | null
          preferred_schedule?: string | null
          total_hours?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_level?: string | null
          id?: string
          job_role?: string | null
          knowledge_gaps?:
            | Database["public"]["Enums"]["mentorship_specialty"][]
            | null
          learning_goals?: string | null
          municipality?: string | null
          organization?: string | null
          preferred_schedule?: string | null
          total_hours?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          mentor_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          mentor_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          mentor_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_availability_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          availability_notes: string | null
          avg_rating: number | null
          bio: string | null
          created_at: string
          current_mentees: number | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          linkedin_url: string | null
          max_mentees: number | null
          municipality: string | null
          organization: string | null
          rating_count: number | null
          specialties:
            | Database["public"]["Enums"]["mentorship_specialty"][]
            | null
          total_hours: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
          years_experience: number | null
        }
        Insert: {
          availability_notes?: string | null
          avg_rating?: number | null
          bio?: string | null
          created_at?: string
          current_mentees?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          max_mentees?: number | null
          municipality?: string | null
          organization?: string | null
          rating_count?: number | null
          specialties?:
            | Database["public"]["Enums"]["mentorship_specialty"][]
            | null
          total_hours?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          years_experience?: number | null
        }
        Update: {
          availability_notes?: string | null
          avg_rating?: number | null
          bio?: string | null
          created_at?: string
          current_mentees?: number | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          max_mentees?: number | null
          municipality?: string | null
          organization?: string | null
          rating_count?: number | null
          specialties?:
            | Database["public"]["Enums"]["mentorship_specialty"][]
            | null
          total_hours?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      mentorship_badges: {
        Row: {
          badge_description: string | null
          badge_icon: string | null
          badge_name: string
          badge_type: string
          created_at: string
          earned_at: string
          id: string
          specialty: Database["public"]["Enums"]["mentorship_specialty"] | null
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name: string
          badge_type: string
          created_at?: string
          earned_at?: string
          id?: string
          specialty?: Database["public"]["Enums"]["mentorship_specialty"] | null
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name?: string
          badge_type?: string
          created_at?: string
          earned_at?: string
          id?: string
          specialty?: Database["public"]["Enums"]["mentorship_specialty"] | null
          user_id?: string
        }
        Relationships: []
      }
      mentorship_certificates: {
        Row: {
          certificate_code: string | null
          certificate_type: string
          created_at: string
          description: string | null
          hours_completed: number | null
          id: string
          is_public: boolean | null
          issued_at: string
          issued_by: string | null
          match_id: string | null
          sessions_completed: number | null
          specialty: Database["public"]["Enums"]["mentorship_specialty"] | null
          title: string
          user_id: string
        }
        Insert: {
          certificate_code?: string | null
          certificate_type: string
          created_at?: string
          description?: string | null
          hours_completed?: number | null
          id?: string
          is_public?: boolean | null
          issued_at?: string
          issued_by?: string | null
          match_id?: string | null
          sessions_completed?: number | null
          specialty?: Database["public"]["Enums"]["mentorship_specialty"] | null
          title: string
          user_id: string
        }
        Update: {
          certificate_code?: string | null
          certificate_type?: string
          created_at?: string
          description?: string | null
          hours_completed?: number | null
          id?: string
          is_public?: boolean | null
          issued_at?: string
          issued_by?: string | null
          match_id?: string | null
          sessions_completed?: number | null
          specialty?: Database["public"]["Enums"]["mentorship_specialty"] | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_certificates_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "mentorship_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_goals: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          match_id: string
          progress_percentage: number | null
          specialty: Database["public"]["Enums"]["mentorship_specialty"] | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          match_id: string
          progress_percentage?: number | null
          specialty?: Database["public"]["Enums"]["mentorship_specialty"] | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          match_id?: string
          progress_percentage?: number | null
          specialty?: Database["public"]["Enums"]["mentorship_specialty"] | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_goals_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "mentorship_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_matches: {
        Row: {
          created_at: string
          current_phase: string | null
          end_date: string | null
          goals: string | null
          id: string
          match_score: number | null
          matched_specialties:
            | Database["public"]["Enums"]["mentorship_specialty"][]
            | null
          mentee_id: string
          mentor_id: string
          phase_progress: number | null
          progress_notes: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_phase?: string | null
          end_date?: string | null
          goals?: string | null
          id?: string
          match_score?: number | null
          matched_specialties?:
            | Database["public"]["Enums"]["mentorship_specialty"][]
            | null
          mentee_id: string
          mentor_id: string
          phase_progress?: number | null
          progress_notes?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_phase?: string | null
          end_date?: string | null
          goals?: string | null
          id?: string
          match_score?: number | null
          matched_specialties?:
            | Database["public"]["Enums"]["mentorship_specialty"][]
            | null
          mentee_id?: string
          mentor_id?: string
          phase_progress?: number | null
          progress_notes?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_matches_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "mentees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_matches_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
        ]
      }
      mentorship_sessions: {
        Row: {
          action_items: string[] | null
          agenda: string | null
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          match_id: string
          meeting_link: string | null
          mentee_feedback: string | null
          mentor_feedback: string | null
          notes: string | null
          rating: number | null
          resources_shared: string[] | null
          scheduled_at: string
          session_number: number | null
          session_type: Database["public"]["Enums"]["mentorship_session_type"]
          skills_practiced:
            | Database["public"]["Enums"]["mentorship_specialty"][]
            | null
          status: Database["public"]["Enums"]["mentorship_session_status"]
          updated_at: string
        }
        Insert: {
          action_items?: string[] | null
          agenda?: string | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          match_id: string
          meeting_link?: string | null
          mentee_feedback?: string | null
          mentor_feedback?: string | null
          notes?: string | null
          rating?: number | null
          resources_shared?: string[] | null
          scheduled_at: string
          session_number?: number | null
          session_type: Database["public"]["Enums"]["mentorship_session_type"]
          skills_practiced?:
            | Database["public"]["Enums"]["mentorship_specialty"][]
            | null
          status?: Database["public"]["Enums"]["mentorship_session_status"]
          updated_at?: string
        }
        Update: {
          action_items?: string[] | null
          agenda?: string | null
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          match_id?: string
          meeting_link?: string | null
          mentee_feedback?: string | null
          mentor_feedback?: string | null
          notes?: string | null
          rating?: number | null
          resources_shared?: string[] | null
          scheduled_at?: string
          session_number?: number | null
          session_type?: Database["public"]["Enums"]["mentorship_session_type"]
          skills_practiced?:
            | Database["public"]["Enums"]["mentorship_specialty"][]
            | null
          status?: Database["public"]["Enums"]["mentorship_session_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_sessions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "mentorship_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      municipios: {
        Row: {
          cod_ibge: string
          cod_macro: string
          cod_micro: string
          coordenador_email: string | null
          coordenador_nome: string | null
          coordenador_telefone: string | null
          created_at: string
          grs: string | null
          id: string
          macrorregiao: string
          maturidade_digital: number | null
          microregiao: string
          municipio: string
          populacao: number | null
          profissionais: number | null
          status: Database["public"]["Enums"]["municipio_status"]
          updated_at: string
          urs: string
        }
        Insert: {
          cod_ibge: string
          cod_macro: string
          cod_micro: string
          coordenador_email?: string | null
          coordenador_nome?: string | null
          coordenador_telefone?: string | null
          created_at?: string
          grs?: string | null
          id?: string
          macrorregiao: string
          maturidade_digital?: number | null
          microregiao: string
          municipio: string
          populacao?: number | null
          profissionais?: number | null
          status?: Database["public"]["Enums"]["municipio_status"]
          updated_at?: string
          urs: string
        }
        Update: {
          cod_ibge?: string
          cod_macro?: string
          cod_micro?: string
          coordenador_email?: string | null
          coordenador_nome?: string | null
          coordenador_telefone?: string | null
          created_at?: string
          grs?: string | null
          id?: string
          macrorregiao?: string
          maturidade_digital?: number | null
          microregiao?: string
          municipio?: string
          populacao?: number | null
          profissionais?: number | null
          status?: Database["public"]["Enums"]["municipio_status"]
          updated_at?: string
          urs?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          job_title: string | null
          municipality: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          job_title?: string | null
          municipality?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          municipality?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trail_enrollments: {
        Row: {
          completed_at: string | null
          id: string
          progress: number
          started_at: string
          trail_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          progress?: number
          started_at?: string
          trail_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          progress?: number
          started_at?: string
          trail_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trail_enrollments_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "trails"
            referencedColumns: ["id"]
          },
        ]
      }
      trails: {
        Row: {
          courses_count: number
          created_at: string
          created_by: string | null
          description: string | null
          enrolled: number
          id: string
          title: string
          total_hours: number
          updated_at: string
        }
        Insert: {
          courses_count?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          enrolled?: number
          id?: string
          title: string
          total_hours?: number
          updated_at?: string
        }
        Update: {
          courses_count?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          enrolled?: number
          id?: string
          title?: string
          total_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_territory_profiles: {
        Row: {
          created_at: string
          created_by: string | null
          grs: string | null
          id: string
          macrorregiao: string | null
          microregiao: string | null
          municipio_id: string | null
          perfil_territorio: Database["public"]["Enums"]["user_territory_profile"]
          updated_at: string
          urs: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          grs?: string | null
          id?: string
          macrorregiao?: string | null
          microregiao?: string | null
          municipio_id?: string | null
          perfil_territorio?: Database["public"]["Enums"]["user_territory_profile"]
          updated_at?: string
          urs?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          grs?: string | null
          id?: string
          macrorregiao?: string | null
          microregiao?: string | null
          municipio_id?: string | null
          perfil_territorio?: Database["public"]["Enums"]["user_territory_profile"]
          updated_at?: string
          urs?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_territory_profiles_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_territory_profiles_municipio_id_fkey"
            columns: ["municipio_id"]
            isOneToOne: false
            referencedRelation: "municipios_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      municipios_public: {
        Row: {
          cod_ibge: string | null
          cod_macro: string | null
          cod_micro: string | null
          created_at: string | null
          grs: string | null
          id: string | null
          macrorregiao: string | null
          maturidade_digital: number | null
          microregiao: string | null
          municipio: string | null
          populacao: number | null
          profissionais: number | null
          status: Database["public"]["Enums"]["municipio_status"] | null
          updated_at: string | null
          urs: string | null
        }
        Insert: {
          cod_ibge?: string | null
          cod_macro?: string | null
          cod_micro?: string | null
          created_at?: string | null
          grs?: string | null
          id?: string | null
          macrorregiao?: string | null
          maturidade_digital?: number | null
          microregiao?: string | null
          municipio?: string | null
          populacao?: number | null
          profissionais?: number | null
          status?: Database["public"]["Enums"]["municipio_status"] | null
          updated_at?: string | null
          urs?: string | null
        }
        Update: {
          cod_ibge?: string | null
          cod_macro?: string | null
          cod_micro?: string | null
          created_at?: string | null
          grs?: string | null
          id?: string | null
          macrorregiao?: string | null
          maturidade_digital?: number | null
          microregiao?: string | null
          municipio?: string | null
          populacao?: number | null
          profissionais?: number | null
          status?: Database["public"]["Enums"]["municipio_status"] | null
          updated_at?: string | null
          urs?: string | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          job_title: string | null
          municipality: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          job_title?: string | null
          municipality?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          job_title?: string | null
          municipality?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_view_private_profile: {
        Args: { target_id: string; viewer_id: string }
        Returns: boolean
      }
      check_territory_access: {
        Args: {
          _target_microregiao?: string
          _target_municipio_id?: string
          _target_urs?: string
          _user_id: string
        }
        Returns: boolean
      }
      get_municipio_full: { Args: { municipio_id: string }; Returns: Json }
      get_profile_public: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
          job_title: string
          municipality: string
        }[]
      }
      get_profile_safe: { Args: { target_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_municipios_safe: {
        Args: {
          macrorregiao_filter?: string
          microregiao_filter?: string
          search_term?: string
          status_filter?: string
          urs_filter?: string
        }
        Returns: {
          cod_ibge: string
          cod_macro: string
          cod_micro: string
          created_at: string
          grs: string
          id: string
          macrorregiao: string
          maturidade_digital: number
          microregiao: string
          municipio: string
          populacao: number
          profissionais: number
          status: Database["public"]["Enums"]["municipio_status"]
          updated_at: string
          urs: string
        }[]
      }
      list_profiles_public: {
        Args: {
          limit_count?: number
          offset_count?: number
          search_term?: string
        }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
          job_title: string
          municipality: string
        }[]
      }
      log_audit: {
        Args: {
          _entity_id: string
          _entity_type: string
          _grs?: string
          _microregiao?: string
          _municipio_id?: string
          _new_values?: Json
          _old_values?: Json
          _operation: string
          _urs?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "coordenador" | "membro"
      forum_topic_status:
        | "open"
        | "resolved"
        | "awaiting_feedback"
        | "validated"
        | "archived"
      forum_topic_type:
        | "problem_solution"
        | "best_practice"
        | "qa"
        | "announcement"
      mentorship_session_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      mentorship_session_type: "diagnostic" | "practical" | "evaluation"
      mentorship_specialty:
        | "esus_ab"
        | "esus_regulacao"
        | "telessaude"
        | "seguranca_lgpd"
        | "rnds"
        | "implementacao"
        | "outros"
      municipio_status: "ativo" | "pendente" | "inativo" | "em_implantacao"
      user_territory_profile:
        | "municipal"
        | "nsd_microrregional"
        | "grs"
        | "estado_nsdigi"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "coordenador", "membro"],
      forum_topic_status: [
        "open",
        "resolved",
        "awaiting_feedback",
        "validated",
        "archived",
      ],
      forum_topic_type: [
        "problem_solution",
        "best_practice",
        "qa",
        "announcement",
      ],
      mentorship_session_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      mentorship_session_type: ["diagnostic", "practical", "evaluation"],
      mentorship_specialty: [
        "esus_ab",
        "esus_regulacao",
        "telessaude",
        "seguranca_lgpd",
        "rnds",
        "implementacao",
        "outros",
      ],
      municipio_status: ["ativo", "pendente", "inativo", "em_implantacao"],
      user_territory_profile: [
        "municipal",
        "nsd_microrregional",
        "grs",
        "estado_nsdigi",
      ],
    },
  },
} as const
