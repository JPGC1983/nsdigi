import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Mentor, 
  Mentee, 
  MentorshipMatch, 
  MentorshipSession,
  MentorshipGoal,
  MentorshipSpecialty,
  MentorAvailability 
} from "@/types/mentorship";

export const useMentors = (filters?: {
  specialty?: MentorshipSpecialty;
  municipality?: string;
  verified?: boolean;
}) => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from("mentors")
          .select(`
            *,
            profile:profiles!mentors_user_id_fkey (
              id,
              full_name,
              avatar_url,
              job_title
            ),
            availability:mentor_availability (*)
          `)
          .eq("is_active", true)
          .order("avg_rating", { ascending: false });

        if (filters?.verified) {
          query = query.eq("is_verified", true);
        }

        if (filters?.municipality) {
          query = query.eq("municipality", filters.municipality);
        }

        if (filters?.specialty) {
          query = query.contains("specialties", [filters.specialty]);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setMentors((data as unknown as Mentor[]) || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [filters?.specialty, filters?.municipality, filters?.verified]);

  return { mentors, loading, error };
};

export const useMentorProfile = () => {
  const { user } = useAuth();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMentor(null);
      setLoading(false);
      return;
    }

    const fetchMentorProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("mentors")
          .select(`
            *,
            profile:profiles!mentors_user_id_fkey (
              id,
              full_name,
              avatar_url,
              job_title
            ),
            availability:mentor_availability (*)
          `)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setMentor(data as unknown as Mentor);
      } catch (err) {
        console.error("Error fetching mentor profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorProfile();
  }, [user]);

  const createMentorProfile = async (data: Partial<Mentor>) => {
    if (!user) throw new Error("User not authenticated");

    const { data: newMentor, error } = await supabase
      .from("mentors")
      .insert({
        user_id: user.id,
        bio: data.bio,
        years_experience: data.years_experience || 0,
        municipality: data.municipality,
        organization: data.organization,
        specialties: data.specialties as any || [],
        max_mentees: data.max_mentees || 3,
        linkedin_url: data.linkedin_url,
        availability_notes: data.availability_notes,
      } as any)
      .select()
      .single();

    if (error) throw error;
    setMentor(newMentor as unknown as Mentor);
    return newMentor;
  };

  const updateMentorProfile = async (data: Partial<Mentor>) => {
    if (!mentor) throw new Error("No mentor profile found");

    const { data: updated, error } = await supabase
      .from("mentors")
      .update(data as any)
      .eq("id", mentor.id)
      .select()
      .single();

    if (error) throw error;
    setMentor(updated as unknown as Mentor);
    return updated;
  };

  const updateAvailability = async (slots: Omit<MentorAvailability, 'id' | 'mentor_id' | 'created_at'>[]) => {
    if (!mentor) throw new Error("No mentor profile found");

    // Delete existing slots
    await supabase
      .from("mentor_availability")
      .delete()
      .eq("mentor_id", mentor.id);

    // Insert new slots
    if (slots.length > 0) {
      const { error } = await supabase
        .from("mentor_availability")
        .insert(
          slots.map(slot => ({
            ...slot,
            mentor_id: mentor.id,
          }))
        );

      if (error) throw error;
    }
  };

  return { mentor, loading, createMentorProfile, updateMentorProfile, updateAvailability };
};

export const useMenteeProfile = () => {
  const { user } = useAuth();
  const [mentee, setMentee] = useState<Mentee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMentee(null);
      setLoading(false);
      return;
    }

    const fetchMenteeProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("mentees")
          .select(`
            *,
            profile:profiles!mentees_user_id_fkey (
              id,
              full_name,
              avatar_url,
              job_title
            )
          `)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setMentee(data as unknown as Mentee);
      } catch (err) {
        console.error("Error fetching mentee profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenteeProfile();
  }, [user]);

  const createMenteeProfile = async (data: Partial<Mentee>) => {
    if (!user) throw new Error("User not authenticated");

    const { data: newMentee, error } = await supabase
      .from("mentees")
      .insert({
        user_id: user.id,
        municipality: data.municipality,
        organization: data.organization,
        job_role: data.job_role,
        experience_level: data.experience_level || 'beginner',
        learning_goals: data.learning_goals,
        knowledge_gaps: data.knowledge_gaps as any || [],
        preferred_schedule: data.preferred_schedule,
      } as any)
      .select()
      .single();

    if (error) throw error;
    setMentee(newMentee as unknown as Mentee);
    return newMentee;
  };

  const updateMenteeProfile = async (data: Partial<Mentee>) => {
    if (!mentee) throw new Error("No mentee profile found");

    const { data: updated, error } = await supabase
      .from("mentees")
      .update(data as any)
      .eq("id", mentee.id)
      .select()
      .single();

    if (error) throw error;
    setMentee(updated as unknown as Mentee);
    return updated;
  };

  return { mentee, loading, createMenteeProfile, updateMenteeProfile };
};

export const useMentorshipMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MentorshipMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMatches([]);
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      try {
        const { data, error } = await supabase
          .from("mentorship_matches")
          .select(`
            *,
            mentor:mentors (
              *,
              profile:profiles!mentors_user_id_fkey (
                id,
                full_name,
                avatar_url,
                job_title
              )
            ),
            mentee:mentees (
              *,
              profile:profiles!mentees_user_id_fkey (
                id,
                full_name,
                avatar_url,
                job_title
              )
            ),
            sessions:mentorship_sessions (*),
            goals_list:mentorship_goals (*)
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMatches((data as unknown as MentorshipMatch[]) || []);
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [user]);

  const requestMatch = async (mentorId: string, menteeId: string, specialties: MentorshipSpecialty[]) => {
    const { data, error } = await supabase
      .from("mentorship_matches")
      .insert({
        mentor_id: mentorId,
        mentee_id: menteeId,
        matched_specialties: specialties as any,
        status: 'pending',
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateMatchStatus = async (matchId: string, status: string) => {
    const { error } = await supabase
      .from("mentorship_matches")
      .update({ status })
      .eq("id", matchId);

    if (error) throw error;
  };

  const updateMatchPhase = async (matchId: string, phase: string, progress: number) => {
    const { error } = await supabase
      .from("mentorship_matches")
      .update({ 
        current_phase: phase,
        phase_progress: progress,
      })
      .eq("id", matchId);

    if (error) throw error;
  };

  return { matches, loading, requestMatch, updateMatchStatus, updateMatchPhase };
};

export const useMentorshipSessions = (matchId?: string) => {
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
          .from("mentorship_sessions")
          .select("*")
          .eq("match_id", matchId)
          .order("scheduled_at", { ascending: true });

        if (error) throw error;
        setSessions((data as unknown as MentorshipSession[]) || []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [matchId]);

  const createSession = async (session: {
    match_id: string;
    session_type: 'diagnostic' | 'practical' | 'evaluation';
    scheduled_at: string;
    duration_minutes?: number;
    agenda?: string;
  }) => {
    const { data, error } = await supabase
      .from("mentorship_sessions")
      .insert([session])
      .select()
      .single();

    if (error) throw error;
    setSessions([...sessions, data as unknown as MentorshipSession]);
    return data;
  };

  const updateSession = async (sessionId: string, updates: Partial<MentorshipSession>) => {
    const { error } = await supabase
      .from("mentorship_sessions")
      .update(updates as any)
      .eq("id", sessionId);

    if (error) throw error;
  };

  return { sessions, loading, createSession, updateSession };
};

export const useMentorshipGoals = (matchId?: string) => {
  const [goals, setGoals] = useState<MentorshipGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) {
      setGoals([]);
      setLoading(false);
      return;
    }

    const fetchGoals = async () => {
      try {
        const { data, error } = await supabase
          .from("mentorship_goals")
          .select("*")
          .eq("match_id", matchId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setGoals((data as unknown as MentorshipGoal[]) || []);
      } catch (err) {
        console.error("Error fetching goals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [matchId]);

  const createGoal = async (goal: {
    match_id: string;
    title: string;
    description?: string;
    specialty?: 'esus_ab' | 'esus_regulacao' | 'telessaude' | 'seguranca_lgpd' | 'rnds' | 'implementacao';
    target_date?: string;
  }) => {
    const { data, error } = await supabase
      .from("mentorship_goals")
      .insert([goal])
      .select()
      .single();

    if (error) throw error;
    setGoals([...goals, data as unknown as MentorshipGoal]);
    return data;
  };

  const updateGoal = async (goalId: string, updates: Partial<MentorshipGoal>) => {
    const { error } = await supabase
      .from("mentorship_goals")
      .update(updates as any)
      .eq("id", goalId);

    if (error) throw error;
  };

  return { goals, loading, createGoal, updateGoal };
};

// Matching Algorithm
export const calculateMatchScore = (
  mentor: Mentor,
  mentee: Mentee
): { score: number; matchedSpecialties: MentorshipSpecialty[] } => {
  const mentorSpecialties = new Set(mentor.specialties);
  const menteeGaps = mentee.knowledge_gaps || [];
  
  // Find matching specialties
  const matchedSpecialties = menteeGaps.filter(gap => mentorSpecialties.has(gap));
  
  // Base score from specialty match (0-50 points)
  let score = (matchedSpecialties.length / Math.max(menteeGaps.length, 1)) * 50;
  
  // Bonus for same municipality (0-15 points)
  if (mentor.municipality && mentee.municipality && 
      mentor.municipality.toLowerCase() === mentee.municipality.toLowerCase()) {
    score += 15;
  }
  
  // Bonus for mentor rating (0-20 points)
  score += (mentor.avg_rating / 5) * 20;
  
  // Bonus for mentor experience (0-10 points)
  score += Math.min(mentor.years_experience, 10);
  
  // Availability bonus (0-5 points)
  if (mentor.current_mentees < mentor.max_mentees) {
    score += 5;
  }
  
  return {
    score: Math.round(score * 100) / 100,
    matchedSpecialties,
  };
};

export const getSuggestedMentors = (
  mentors: Mentor[],
  mentee: Mentee,
  limit: number = 5
): Array<{ mentor: Mentor; score: number; matchedSpecialties: MentorshipSpecialty[] }> => {
  const scoredMentors = mentors
    .filter(m => m.current_mentees < m.max_mentees)
    .map(mentor => ({
      mentor,
      ...calculateMatchScore(mentor, mentee),
    }))
    .filter(m => m.matchedSpecialties.length > 0)
    .sort((a, b) => b.score - a.score);

  return scoredMentors.slice(0, limit);
};
