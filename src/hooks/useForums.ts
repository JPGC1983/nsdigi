import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Forum, ForumTag, ForumTopic, ForumReply, ForumExpert, ForumTopicType, ForumTopicStatus } from '@/types/forum';
import { useAuth } from './useAuth';

export function useForums() {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forums')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setForums((data as Forum[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { forums, loading, error, refetch: fetchForums };
}

export function useForum(slug: string) {
  const [forum, setForum] = useState<Forum | null>(null);
  const [tags, setTags] = useState<ForumTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchForum();
    }
  }, [slug]);

  const fetchForum = async () => {
    try {
      setLoading(true);
      const { data: forumData, error: forumError } = await supabase
        .from('forums')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (forumError) throw forumError;
      if (!forumData) {
        setError('Fórum não encontrado');
        return;
      }

      setForum(forumData as Forum);

      // Fetch tags for this forum
      const { data: tagsData, error: tagsError } = await supabase
        .from('forum_tags')
        .select('*')
        .eq('forum_id', forumData.id)
        .order('name');

      if (tagsError) throw tagsError;
      setTags((tagsData as ForumTag[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { forum, tags, loading, error, refetch: fetchForum };
}

export function useForumTopics(forumId: string | undefined) {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (forumId) {
      fetchTopics();
    }
  }, [forumId]);

  const fetchTopics = async () => {
    if (!forumId) return;
    
    try {
      setLoading(true);
      // Fetch topics
      const { data: topicsData, error: topicsError } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('forum_id', forumId)
        .order('is_pinned', { ascending: false })
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (topicsError) throw topicsError;

      if (!topicsData || topicsData.length === 0) {
        setTopics([]);
        return;
      }

      // Get unique author IDs
      const authorIds = [...new Set(topicsData.map(t => t.author_id))];
      
      // Fetch authors
      const { data: authorsData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', authorIds);

      const authorsMap = new Map(authorsData?.map(a => [a.id, a]) || []);

      // Map topics with authors
      const mappedTopics: ForumTopic[] = topicsData.map(topic => ({
        ...topic,
        topic_type: topic.topic_type as ForumTopicType,
        status: topic.status as ForumTopicStatus,
        author: authorsMap.get(topic.author_id) || undefined,
      }));

      setTopics(mappedTopics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { topics, loading, error, refetch: fetchTopics };
}

export function useForumTopic(topicId: string | undefined) {
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (topicId) {
      fetchTopic();
    }
  }, [topicId]);

  const fetchTopic = async () => {
    if (!topicId) return;
    
    try {
      setLoading(true);
      
      // Fetch topic
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('id', topicId)
        .maybeSingle();

      if (topicError) throw topicError;
      if (!topicData) {
        setError('Tópico não encontrado');
        return;
      }

      // Fetch author
      const { data: authorData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', topicData.author_id)
        .maybeSingle();

      const mappedTopic: ForumTopic = {
        ...topicData,
        topic_type: topicData.topic_type as ForumTopicType,
        status: topicData.status as ForumTopicStatus,
        author: authorData || undefined,
      };

      setTopic(mappedTopic);

      // Fetch replies
      const { data: repliesData, error: repliesError } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('topic_id', topicId)
        .order('is_accepted', { ascending: false })
        .order('votes_score', { ascending: false })
        .order('created_at');

      if (repliesError) throw repliesError;

      if (repliesData && repliesData.length > 0) {
        // Get unique reply author IDs
        const replyAuthorIds = [...new Set(repliesData.map(r => r.author_id))];
        
        // Fetch reply authors
        const { data: replyAuthorsData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', replyAuthorIds);

        const replyAuthorsMap = new Map(replyAuthorsData?.map(a => [a.id, a]) || []);

        const mappedReplies: ForumReply[] = repliesData.map(reply => ({
          ...reply,
          author: replyAuthorsMap.get(reply.author_id) || undefined,
        }));

        setReplies(mappedReplies);
      } else {
        setReplies([]);
      }

      // Increment view count
      await supabase
        .from('forum_topics')
        .update({ views_count: (topicData.views_count || 0) + 1 })
        .eq('id', topicId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { topic, replies, loading, error, refetch: fetchTopic };
}

export function useForumExperts(forumId: string | undefined) {
  const [experts, setExperts] = useState<ForumExpert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (forumId) {
      fetchExperts();
    }
  }, [forumId]);

  const fetchExperts = async () => {
    if (!forumId) return;
    
    try {
      setLoading(true);
      const { data: expertsData, error } = await supabase
        .from('forum_experts')
        .select('*')
        .eq('forum_id', forumId)
        .eq('is_verified', true)
        .order('helpful_replies_count', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!expertsData || expertsData.length === 0) {
        setExperts([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(expertsData.map(e => e.user_id))];
      
      // Fetch users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const usersMap = new Map(usersData?.map(u => [u.id, u]) || []);

      const mappedExperts: ForumExpert[] = expertsData.map(expert => ({
        ...expert,
        user: usersMap.get(expert.user_id) || undefined,
      }));

      setExperts(mappedExperts);
    } catch (err: any) {
      console.error('Error fetching experts:', err);
    } finally {
      setLoading(false);
    }
  };

  return { experts, loading };
}

export function useForumMembership(forumId: string | undefined) {
  const { user } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [hasAcceptedRules, setHasAcceptedRules] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (forumId && user) {
      checkMembership();
    }
  }, [forumId, user]);

  const checkMembership = async () => {
    if (!forumId || !user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('forum_members')
        .select('*')
        .eq('forum_id', forumId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      setIsMember(!!data);
      setHasAcceptedRules(data?.accepted_rules || false);
    } catch (err: any) {
      console.error('Error checking membership:', err);
    } finally {
      setLoading(false);
    }
  };

  const joinForum = async (acceptRules: boolean = true) => {
    if (!forumId || !user) return;
    
    try {
      const { error } = await supabase
        .from('forum_members')
        .insert({
          forum_id: forumId,
          user_id: user.id,
          accepted_rules: acceptRules,
          accepted_rules_at: acceptRules ? new Date().toISOString() : null,
        });

      if (error) throw error;
      
      setIsMember(true);
      setHasAcceptedRules(acceptRules);
    } catch (err: any) {
      console.error('Error joining forum:', err);
      throw err;
    }
  };

  return { isMember, hasAcceptedRules, loading, joinForum, refetch: checkMembership };
}
