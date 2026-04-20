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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          condition_key: string
          condition_value: number
          cor: string
          created_at: string
          descricao: string
          icone: string
          id: number
          nome: string
          ordem: number
        }
        Insert: {
          condition_key: string
          condition_value?: number
          cor?: string
          created_at?: string
          descricao?: string
          icone?: string
          id?: number
          nome: string
          ordem?: number
        }
        Update: {
          condition_key?: string
          condition_value?: number
          cor?: string
          created_at?: string
          descricao?: string
          icone?: string
          id?: number
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      alternatives: {
        Row: {
          id: number
          is_correct: boolean
          letra: string
          ordem: number
          question_id: number
          texto: string
        }
        Insert: {
          id?: number
          is_correct?: boolean
          letra: string
          ordem?: number
          question_id: number
          texto: string
        }
        Update: {
          id?: number
          is_correct?: boolean
          letra?: string
          ordem?: number
          question_id?: number
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "alternatives_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alternatives_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions_full"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: number
          question_id: number
          ultimo_status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          question_id: number
          ultimo_status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          question_id?: number
          ultimo_status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplines: {
        Row: {
          created_at: string
          descricao: string
          icone: string
          id: number
          nome: string
          ordem: number
          status: Database["public"]["Enums"]["discipline_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string
          icone?: string
          id?: number
          nome: string
          ordem?: number
          status?: Database["public"]["Enums"]["discipline_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          icone?: string
          id?: number
          nome?: string
          ordem?: number
          status?: Database["public"]["Enums"]["discipline_status"]
          updated_at?: string
        }
        Relationships: []
      }
      discount_coupons: {
        Row: {
          applies_to_billing: string
          code: string
          created_at: string
          description: string | null
          discount_charge_scope: string
          discount_type: string
          discount_value: number
          eligible_plan_ids: string[] | null
          email_allowlist: string[] | null
          first_purchase_only: boolean
          id: string
          influencer_id: string | null
          is_active: boolean
          max_redemptions_per_user: number | null
          max_uses: number | null
          min_purchase_amount: number | null
          plan_id: string | null
          recurring_months: number | null
          updated_at: string
          uses_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applies_to_billing?: string
          code: string
          created_at?: string
          description?: string | null
          discount_charge_scope?: string
          discount_type: string
          discount_value: number
          eligible_plan_ids?: string[] | null
          email_allowlist?: string[] | null
          first_purchase_only?: boolean
          id?: string
          influencer_id?: string | null
          is_active?: boolean
          max_redemptions_per_user?: number | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          plan_id?: string | null
          recurring_months?: number | null
          updated_at?: string
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applies_to_billing?: string
          code?: string
          created_at?: string
          description?: string | null
          discount_charge_scope?: string
          discount_type?: string
          discount_value?: number
          eligible_plan_ids?: string[] | null
          email_allowlist?: string[] | null
          first_purchase_only?: boolean
          id?: string
          influencer_id?: string | null
          is_active?: boolean
          max_redemptions_per_user?: number | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          plan_id?: string | null
          recurring_months?: number | null
          updated_at?: string
          uses_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_coupons_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_coupons_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      group_activity_feed: {
        Row: {
          id: string
          group_id: string
          user_id: string
          type: string
          payload: Json
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          type: string
          payload?: Json
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          type?: string
          payload?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_activity_feed_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          group_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          group_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_question_comments: {
        Row: {
          id: string
          group_shared_question_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          group_shared_question_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          group_shared_question_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_question_comments_group_shared_question_id_fkey"
            columns: ["group_shared_question_id"]
            isOneToOne: false
            referencedRelation: "group_shared_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_question_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_shared_questions: {
        Row: {
          id: string
          group_id: string
          user_id: string
          question_id: number
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          question_id: number
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
          question_id?: number
          message?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_shared_questions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_shared_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_shared_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          avatar_emoji: string
          type: string
          owner_id: string
          invite_code: string | null
          max_members: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          avatar_emoji?: string
          type: string
          owner_id: string
          invite_code?: string | null
          max_members?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          avatar_emoji?: string
          type?: string
          owner_id?: string
          invite_code?: string | null
          max_members?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_groups_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      influencers: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      landing_stats: {
        Row: {
          display_order: number
          icon: string
          id: number
          key: string
          label: string
          suffix: string
          updated_at: string
          value: number
        }
        Insert: {
          display_order?: number
          icon?: string
          id?: number
          key: string
          label?: string
          suffix?: string
          updated_at?: string
          value?: number
        }
        Update: {
          display_order?: number
          icon?: string
          id?: number
          key?: string
          label?: string
          suffix?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          features: string[]
          id: string
          interval: Database["public"]["Enums"]["plan_interval"]
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: string[]
          id: string
          interval: Database["public"]["Enums"]["plan_interval"]
          is_active?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: string[]
          id?: string
          interval?: Database["public"]["Enums"]["plan_interval"]
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          blank: number
          correct: number
          created_at: string
          dificuldades: string[]
          discipline_ids: number[]
          finished_at: string | null
          id: number
          mode: Database["public"]["Enums"]["session_mode"]
          num_questions: number
          score: number
          started_at: string
          status: Database["public"]["Enums"]["session_status"]
          time_seconds: number
          topic_ids: number[]
          user_id: string
          wrong: number
        }
        Insert: {
          blank?: number
          correct?: number
          created_at?: string
          dificuldades?: string[]
          discipline_ids?: number[]
          finished_at?: string | null
          id?: number
          mode?: Database["public"]["Enums"]["session_mode"]
          num_questions?: number
          score?: number
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          time_seconds?: number
          topic_ids?: number[]
          user_id: string
          wrong?: number
        }
        Update: {
          blank?: number
          correct?: number
          created_at?: string
          dificuldades?: string[]
          discipline_ids?: number[]
          finished_at?: string | null
          id?: number
          mode?: Database["public"]["Enums"]["session_mode"]
          num_questions?: number
          score?: number
          started_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          time_seconds?: number
          topic_ids?: number[]
          user_id?: string
          wrong?: number
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          faculdade: string
          horas_estudo: number
          id: string
          meta_questoes_diarias: number | null
          nivel: number
          nome: string
          periodo: number
          plano: Database["public"]["Enums"]["user_plan"]
          questoes_totais: number
          status: Database["public"]["Enums"]["user_status"]
          streak: number
          streak_last_date: string | null
          taxa_acerto: number
          terms_accepted_at: string | null
          ultimo_acesso: string | null
          updated_at: string
          xp_atual: number
          xp_proximo_nivel: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          faculdade?: string
          horas_estudo?: number
          id: string
          meta_questoes_diarias?: number | null
          nivel?: number
          nome?: string
          periodo?: number
          plano?: Database["public"]["Enums"]["user_plan"]
          questoes_totais?: number
          status?: Database["public"]["Enums"]["user_status"]
          streak?: number
          streak_last_date?: string | null
          taxa_acerto?: number
          terms_accepted_at?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          xp_atual?: number
          xp_proximo_nivel?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          faculdade?: string
          horas_estudo?: number
          id?: string
          meta_questoes_diarias?: number | null
          nivel?: number
          nome?: string
          periodo?: number
          plano?: Database["public"]["Enums"]["user_plan"]
          questoes_totais?: number
          status?: Database["public"]["Enums"]["user_status"]
          streak?: number
          streak_last_date?: string | null
          taxa_acerto?: number
          terms_accepted_at?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          xp_atual?: number
          xp_proximo_nivel?: number
        }
        Relationships: []
      }
      question_reports: {
        Row: {
          admin_response: string | null
          comment: string
          created_at: string
          id: number
          question_id: number
          reason: Database["public"]["Enums"]["report_reason"]
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          comment?: string
          created_at?: string
          id?: number
          question_id: number
          reason: Database["public"]["Enums"]["report_reason"]
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          comment?: string
          created_at?: string
          id?: number
          question_id?: number
          reason?: Database["public"]["Enums"]["report_reason"]
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_reports_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_reports_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          comentario: string
          created_at: string
          dificuldade: Database["public"]["Enums"]["question_difficulty"]
          discipline_id: number
          enunciado: string
          estatistica: number
          explicacoes: Json
          id: number
          pergunta: string
          status: Database["public"]["Enums"]["question_status"]
          subtema: string | null
          tags: string[]
          topic_id: number
          updated_at: string
        }
        Insert: {
          comentario?: string
          created_at?: string
          dificuldade?: Database["public"]["Enums"]["question_difficulty"]
          discipline_id: number
          enunciado: string
          estatistica?: number
          explicacoes?: Json
          id?: number
          pergunta?: string
          status?: Database["public"]["Enums"]["question_status"]
          subtema?: string | null
          tags?: string[]
          topic_id: number
          updated_at?: string
        }
        Update: {
          comentario?: string
          created_at?: string
          dificuldade?: Database["public"]["Enums"]["question_difficulty"]
          discipline_id?: number
          enunciado?: string
          estatistica?: number
          explicacoes?: Json
          id?: number
          pergunta?: string
          status?: Database["public"]["Enums"]["question_status"]
          subtema?: string | null
          tags?: string[]
          topic_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      session_answers: {
        Row: {
          created_at: string
          id: number
          ordem: number
          question_id: number
          selected_letra: string | null
          session_id: number
          status: Database["public"]["Enums"]["answer_status"]
          time_seconds: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          ordem?: number
          question_id: number
          selected_letra?: string | null
          session_id: number
          status?: Database["public"]["Enums"]["answer_status"]
          time_seconds?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          ordem?: number
          question_id?: number
          selected_letra?: string | null
          session_id?: number
          status?: Database["public"]["Enums"]["answer_status"]
          time_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      simulado_sessions: {
        Row: {
          answers: Json
          blank: number
          correct: number
          created_at: string
          disciplina: string
          id: string
          question_ids: number[]
          score: number
          time_used_sec: number
          user_id: string
          wrong: number
        }
        Insert: {
          answers?: Json
          blank: number
          correct: number
          created_at?: string
          disciplina: string
          id?: string
          question_ids: number[]
          score: number
          time_used_sec: number
          user_id: string
          wrong: number
        }
        Update: {
          answers?: Json
          blank?: number
          correct?: number
          created_at?: string
          disciplina?: string
          id?: string
          question_ids?: number[]
          score?: number
          time_used_sec?: number
          user_id?: string
          wrong?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          external_id: string | null
          id: number
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start?: string
          external_id?: string | null
          id?: number
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          external_id?: string | null
          id?: number
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          descricao: string
          discipline_id: number
          id: number
          nome: string
          ordem: number
          subtemas: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string
          discipline_id: number
          id?: number
          nome: string
          ordem?: number
          subtemas?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          discipline_id?: number
          id?: number
          nome?: string
          ordem?: number
          subtemas?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: number
          id: number
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: number
          id?: number
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: number
          id?: number
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      questions_full: {
        Row: {
          comentario: string | null
          created_at: string | null
          dificuldade: Database["public"]["Enums"]["question_difficulty"] | null
          disciplina: string | null
          discipline_id: number | null
          enunciado: string | null
          estatistica: number | null
          explicacoes: Json | null
          id: number | null
          pergunta: string | null
          status: Database["public"]["Enums"]["question_status"] | null
          subtema: string | null
          tags: string[] | null
          tema: string | null
          topic_id: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      group_member_rankings: {
        Row: {
          group_id: string | null
          user_id: string | null
          role: string | null
          joined_at: string | null
          nome: string | null
          avatar_url: string | null
          nivel: number | null
          streak: number | null
          xp_total: number | null
          xp_week: number | null
          rank_xp_total: number | null
          rank_xp_week: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_group_slug: { Args: { group_name: string }; Returns: string }
      grant_xp: { Args: { p_user_id: string; p_xp: number }; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      update_streak: { Args: { p_user_id: string }; Returns: Json }
    }
    Enums: {
      answer_status: "acertou" | "errou" | "em_branco"
      discipline_status: "ativa" | "inativa"
      plan_interval: "mensal" | "anual"
      question_difficulty: "Fácil" | "Médio" | "Difícil"
      question_status: "rascunho" | "publicada" | "arquivada"
      report_reason:
        | "Erro no gabarito"
        | "Enunciado confuso"
        | "Alternativa ambígua"
        | "Conteúdo desatualizado"
        | "Outro"
      report_status: "pendente" | "revisado" | "corrigido" | "descartado"
      session_mode: "pratica" | "simulado" | "revisao"
      session_status: "em_andamento" | "finalizada" | "abandonada"
      subscription_status: "active" | "canceled" | "past_due"
      user_plan: "free" | "pro"
      user_status: "ativo" | "inativo" | "banido"
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
      answer_status: ["acertou", "errou", "em_branco"],
      discipline_status: ["ativa", "inativa"],
      plan_interval: ["mensal", "anual"],
      question_difficulty: ["Fácil", "Médio", "Difícil"],
      question_status: ["rascunho", "publicada", "arquivada"],
      report_reason: [
        "Erro no gabarito",
        "Enunciado confuso",
        "Alternativa ambígua",
        "Conteúdo desatualizado",
        "Outro",
      ],
      report_status: ["pendente", "revisado", "corrigido", "descartado"],
      session_mode: ["pratica", "simulado", "revisao"],
      session_status: ["em_andamento", "finalizada", "abandonada"],
      subscription_status: ["active", "canceled", "past_due"],
      user_plan: ["free", "pro"],
      user_status: ["ativo", "inativo", "banido"],
    },
  },
} as const
