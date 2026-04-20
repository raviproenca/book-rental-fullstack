import { supabase } from "@/lib/supabase";
import type {
  StudyGroup,
  GroupMember,
  GroupSharedQuestion,
  GroupQuestionComment,
  GroupActivityEvent,
  GroupRole,
  GroupType,
  GroupActivityType,
} from "@/types";

type StudyGroupRow = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_emoji: string;
  type: string;
  invite_code: string | null;
  max_members: number;
  created_at: string;
};

async function currentUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Not authenticated");
  return session.user.id;
}

function mapGroup(
  row: StudyGroupRow,
  extras: { memberCount?: number; myRole?: GroupRole } = {},
): StudyGroup {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    avatarEmoji: row.avatar_emoji,
    type: (row.type as GroupType) ?? "private",
    inviteCode: row.invite_code,
    maxMembers: row.max_members,
    createdAt: row.created_at,
    memberCount: extras.memberCount,
    myRole: extras.myRole,
  };
}

async function countMembers(groupIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (groupIds.length === 0) return counts;

  const { data, error } = await supabase
    .from("group_members")
    .select("group_id")
    .in("group_id", groupIds);
  if (error) throw error;

  for (const row of data ?? []) {
    counts.set(row.group_id, (counts.get(row.group_id) ?? 0) + 1);
  }
  return counts;
}

async function fetchProfilesMap(
  userIds: string[],
): Promise<Map<string, { nome: string | null; avatar_url: string | null }>> {
  const map = new Map<
    string,
    { nome: string | null; avatar_url: string | null }
  >();
  if (userIds.length === 0) return map;

  const unique = Array.from(new Set(userIds));
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, avatar_url")
    .in("id", unique);
  if (error) throw error;

  for (const row of data ?? []) {
    map.set(row.id, { nome: row.nome, avatar_url: row.avatar_url });
  }
  return map;
}

export async function getMyGroups(): Promise<StudyGroup[]> {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from("group_members")
    .select("role, group:study_groups!group_members_group_id_fkey(*)")
    .eq("user_id", userId);
  if (error) throw error;

  const rows = (data ?? []) as Array<{
    role: string;
    group: StudyGroupRow | null;
  }>;

  const groups = rows.filter((r) => r.group !== null);
  const groupIds = groups.map((r) => (r.group as StudyGroupRow).id);
  const counts = await countMembers(groupIds);

  return groups.map((r) =>
    mapGroup(r.group as StudyGroupRow, {
      memberCount: counts.get((r.group as StudyGroupRow).id) ?? 0,
      myRole: (r.role as GroupRole) ?? "member",
    }),
  );
}

export async function getPublicGroups(): Promise<StudyGroup[]> {
  const { data, error } = await supabase
    .from("study_groups")
    .select("*")
    .eq("type", "public")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  const rows = (data ?? []) as StudyGroupRow[];
  const counts = await countMembers(rows.map((r) => r.id));

  return rows.map((row) =>
    mapGroup(row, { memberCount: counts.get(row.id) ?? 0 }),
  );
}

export async function getGroupByInviteCode(
  code: string,
): Promise<StudyGroup | null> {
  const { data, error } = await supabase
    .from("study_groups")
    .select("*")
    .eq("invite_code", code)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const counts = await countMembers([data.id]);
  return mapGroup(data as StudyGroupRow, {
    memberCount: counts.get(data.id) ?? 0,
  });
}

export async function createGroup(input: {
  name: string;
  description?: string;
  avatarEmoji: string;
  type: GroupType;
}): Promise<StudyGroup> {
  const userId = await currentUserId();

  const { data: slug, error: slugError } = await supabase.rpc(
    "generate_group_slug",
    { group_name: input.name },
  );
  if (slugError) throw slugError;
  if (!slug) throw new Error("Failed to generate group slug");

  const { data: groupRow, error: insertError } = await supabase
    .from("study_groups")
    .insert({
      name: input.name,
      description: input.description ?? null,
      avatar_emoji: input.avatarEmoji,
      type: input.type,
      owner_id: userId,
      slug,
    })
    .select("*")
    .single();
  if (insertError) throw insertError;

  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: groupRow.id,
    user_id: userId,
    role: "owner",
  });
  if (memberError) throw memberError;

  const { error: feedError } = await supabase
    .from("group_activity_feed")
    .insert({
      group_id: groupRow.id,
      user_id: userId,
      type: "joined_group",
      payload: { action: "created" },
    });
  if (feedError) throw feedError;

  return mapGroup(groupRow as StudyGroupRow, {
    memberCount: 1,
    myRole: "owner",
  });
}

export async function joinGroup(groupId: string): Promise<void> {
  const userId = await currentUserId();

  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: groupId,
    user_id: userId,
    role: "member",
  });
  if (memberError) throw memberError;

  const { error: feedError } = await supabase
    .from("group_activity_feed")
    .insert({
      group_id: groupId,
      user_id: userId,
      type: "joined_group",
      payload: {},
    });
  if (feedError) throw feedError;
}

export async function leaveGroup(groupId: string): Promise<void> {
  const userId = await currentUserId();

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function getGroupRankings(
  groupId: string,
): Promise<GroupMember[]> {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from("group_member_rankings")
    .select("*")
    .eq("group_id", groupId)
    .order("rank_xp_week", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    userId: row.user_id ?? "",
    groupId: row.group_id ?? groupId,
    role: (row.role as GroupRole) ?? "member",
    joinedAt: row.joined_at ?? "",
    nome: row.nome ?? "Anônimo",
    avatarUrl: row.avatar_url,
    nivel: row.nivel ?? 0,
    streak: row.streak ?? 0,
    xpTotal: row.xp_total ?? 0,
    xpWeek: row.xp_week ?? 0,
    rankTotal: row.rank_xp_total ?? 0,
    rankWeek: row.rank_xp_week ?? 0,
    isCurrentUser: row.user_id === userId,
  }));
}

export async function getGroupSharedQuestions(
  groupId: string,
): Promise<GroupSharedQuestion[]> {
  const { data: shared, error } = await supabase
    .from("group_shared_questions")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  const rows = shared ?? [];
  if (rows.length === 0) return [];

  const userIds = rows.map((r) => r.user_id);
  const questionIds = rows.map((r) => r.question_id);
  const sharedIds = rows.map((r) => r.id);

  const [profiles, questionsRes, commentsRes] = await Promise.all([
    fetchProfilesMap(userIds),
    supabase
      .from("questions_full")
      .select("id, enunciado, disciplina, tema, dificuldade")
      .in("id", questionIds),
    supabase
      .from("group_question_comments")
      .select("group_shared_question_id")
      .in("group_shared_question_id", sharedIds),
  ]);

  if (questionsRes.error) throw questionsRes.error;
  if (commentsRes.error) throw commentsRes.error;

  const questionsMap = new Map<
    number,
    {
      enunciado: string | null;
      disciplina: string | null;
      tema: string | null;
      dificuldade: string | null;
    }
  >();
  for (const q of questionsRes.data ?? []) {
    if (q.id == null) continue;
    questionsMap.set(q.id, {
      enunciado: q.enunciado,
      disciplina: q.disciplina,
      tema: q.tema,
      dificuldade: q.dificuldade,
    });
  }

  const commentCounts = new Map<string, number>();
  for (const c of commentsRes.data ?? []) {
    const id = c.group_shared_question_id;
    commentCounts.set(id, (commentCounts.get(id) ?? 0) + 1);
  }

  return rows.map((r) => {
    const profile = profiles.get(r.user_id);
    const question = questionsMap.get(r.question_id);
    return {
      id: r.id,
      groupId: r.group_id,
      userId: r.user_id,
      questionId: r.question_id,
      message: r.message,
      createdAt: r.created_at,
      userName: profile?.nome ?? "Anônimo",
      userAvatar: profile?.avatar_url ?? null,
      questionEnunciado: question?.enunciado ?? "",
      questionDisciplina: question?.disciplina ?? null,
      questionTema: question?.tema ?? null,
      questionDificuldade: question?.dificuldade ?? null,
      commentCount: commentCounts.get(r.id) ?? 0,
    };
  });
}

export async function shareQuestionToGroup(
  groupId: string,
  questionId: number,
  message?: string,
): Promise<void> {
  const userId = await currentUserId();

  const { data: shared, error: insertError } = await supabase
    .from("group_shared_questions")
    .insert({
      group_id: groupId,
      user_id: userId,
      question_id: questionId,
      message: message ?? null,
    })
    .select("id")
    .single();
  if (insertError) throw insertError;

  const { error: feedError } = await supabase
    .from("group_activity_feed")
    .insert({
      group_id: groupId,
      user_id: userId,
      type: "question_shared",
      payload: { question_id: questionId, shared_question_id: shared.id },
    });
  if (feedError) throw feedError;
}

export async function getQuestionComments(
  sharedQuestionId: string,
): Promise<GroupQuestionComment[]> {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from("group_question_comments")
    .select("*")
    .eq("group_shared_question_id", sharedQuestionId)
    .order("created_at", { ascending: true });
  if (error) throw error;

  const rows = data ?? [];
  const profiles = await fetchProfilesMap(rows.map((r) => r.user_id));

  return rows.map((r) => {
    const profile = profiles.get(r.user_id);
    return {
      id: r.id,
      groupSharedQuestionId: r.group_shared_question_id,
      userId: r.user_id,
      content: r.content,
      createdAt: r.created_at,
      userName: profile?.nome ?? "Anônimo",
      userAvatar: profile?.avatar_url ?? null,
      isCurrentUser: r.user_id === userId,
    };
  });
}

export async function addComment(
  sharedQuestionId: string,
  content: string,
): Promise<void> {
  const userId = await currentUserId();

  const { error } = await supabase.from("group_question_comments").insert({
    group_shared_question_id: sharedQuestionId,
    user_id: userId,
    content,
  });
  if (error) throw error;
}

export async function getGroupActivityFeed(
  groupId: string,
): Promise<GroupActivityEvent[]> {
  const { data, error } = await supabase
    .from("group_activity_feed")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;

  const rows = data ?? [];
  const profiles = await fetchProfilesMap(rows.map((r) => r.user_id));

  return rows.map((r) => {
    const profile = profiles.get(r.user_id);
    const payload =
      r.payload && typeof r.payload === "object" && !Array.isArray(r.payload)
        ? (r.payload as Record<string, unknown>)
        : {};
    return {
      id: r.id,
      groupId: r.group_id,
      userId: r.user_id,
      type: r.type as GroupActivityType,
      payload,
      createdAt: r.created_at,
      userName: profile?.nome ?? "Anônimo",
      userAvatar: profile?.avatar_url ?? null,
    };
  });
}

export async function publishSessionEvent(
  questoes: number,
  acerto: number,
): Promise<void> {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);
  if (error) throw error;

  const groupIds = (data ?? []).map((r) => r.group_id);
  if (groupIds.length === 0) return;

  const rows = groupIds.map((group_id) => ({
    group_id,
    user_id: userId,
    type: "session_completed",
    payload: { questions: questoes, correct: acerto },
  }));

  const { error: insertError } = await supabase
    .from("group_activity_feed")
    .insert(rows);
  if (insertError) throw insertError;
}
