import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Convenience type helpers
export type DbProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type DbProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type DbProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type DbDiscipline = Database["public"]["Tables"]["disciplines"]["Row"];
export type DbTopic = Database["public"]["Tables"]["topics"]["Row"];
export type DbQuestion = Database["public"]["Tables"]["questions"]["Row"];
export type DbAlternative = Database["public"]["Tables"]["alternatives"]["Row"];

export type DbQuestionInsert = Database["public"]["Tables"]["questions"]["Insert"];
export type DbAlternativeInsert = Database["public"]["Tables"]["alternatives"]["Insert"];

export type DbPracticeSession = Database["public"]["Tables"]["practice_sessions"]["Row"];
export type DbPracticeSessionInsert = Database["public"]["Tables"]["practice_sessions"]["Insert"];
export type DbSessionAnswer = Database["public"]["Tables"]["session_answers"]["Row"];
export type DbSessionAnswerInsert = Database["public"]["Tables"]["session_answers"]["Insert"];

export type DbAchievement = Database["public"]["Tables"]["achievements"]["Row"];
export type DbUserAchievement = Database["public"]["Tables"]["user_achievements"]["Row"];

export type DbBookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
export type DbQuestionReport = Database["public"]["Tables"]["question_reports"]["Row"];
export type DbPlan = Database["public"]["Tables"]["plans"]["Row"];
export type DbSubscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type DbDiscountCoupon = Database["public"]["Tables"]["discount_coupons"]["Row"];
export type DbDiscountCouponInsert = Database["public"]["Tables"]["discount_coupons"]["Insert"];
export type DbDiscountCouponUpdate = Database["public"]["Tables"]["discount_coupons"]["Update"];

export type DbLandingStat = Database["public"]["Tables"]["landing_stats"]["Row"];
export type DbLandingStatUpdate = Database["public"]["Tables"]["landing_stats"]["Update"];

// Study groups
export type DbStudyGroup = Database["public"]["Tables"]["study_groups"]["Row"];
export type DbStudyGroupInsert = Database["public"]["Tables"]["study_groups"]["Insert"];
export type DbStudyGroupUpdate = Database["public"]["Tables"]["study_groups"]["Update"];

export type DbGroupMember = Database["public"]["Tables"]["group_members"]["Row"];
export type DbGroupMemberInsert = Database["public"]["Tables"]["group_members"]["Insert"];

export type DbGroupSharedQuestion = Database["public"]["Tables"]["group_shared_questions"]["Row"];
export type DbGroupSharedQuestionInsert = Database["public"]["Tables"]["group_shared_questions"]["Insert"];

export type DbGroupQuestionComment = Database["public"]["Tables"]["group_question_comments"]["Row"];
export type DbGroupQuestionCommentInsert = Database["public"]["Tables"]["group_question_comments"]["Insert"];

export type DbGroupActivityFeed = Database["public"]["Tables"]["group_activity_feed"]["Row"];
export type DbGroupActivityFeedInsert = Database["public"]["Tables"]["group_activity_feed"]["Insert"];
