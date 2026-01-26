import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  topicId?: string;
  replyId?: string;
  currentScore: number;
  onVoteChange?: (newScore: number) => void;
}

const VoteButtons = ({ topicId, replyId, currentScore, onVoteChange }: VoteButtonsProps) => {
  const { user } = useAuth();
  const [score, setScore] = useState(currentScore);
  const [userVote, setUserVote] = useState<-1 | 0 | 1>(0);
  const [loading, setLoading] = useState(false);

  const handleVote = async (value: -1 | 1) => {
    if (!user) {
      toast.error("Faça login para votar");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      // If user already voted the same value, remove vote
      if (userVote === value) {
        await supabase
          .from('forum_votes')
          .delete()
          .eq('user_id', user.id)
          .eq(topicId ? 'topic_id' : 'reply_id', topicId || replyId);

        setUserVote(0);
        setScore(score - value);
        onVoteChange?.(score - value);
      } else {
        // Upsert vote
        const { error } = await supabase
          .from('forum_votes')
          .upsert({
            user_id: user.id,
            topic_id: topicId || null,
            reply_id: replyId || null,
            vote_value: value,
          }, {
            onConflict: topicId ? 'user_id,topic_id' : 'user_id,reply_id'
          });

        if (error) throw error;

        const diff = value - userVote;
        setUserVote(value);
        setScore(score + diff);
        onVoteChange?.(score + diff);
      }
    } catch (err: any) {
      toast.error("Erro ao registrar voto");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          userVote === 1 && "text-primary bg-primary/10"
        )}
        onClick={() => handleVote(1)}
        disabled={loading}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      
      <span className={cn(
        "text-sm font-medium min-w-[2rem] text-center",
        score > 0 && "text-primary",
        score < 0 && "text-destructive"
      )}>
        {score}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          userVote === -1 && "text-destructive bg-destructive/10"
        )}
        onClick={() => handleVote(-1)}
        disabled={loading}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default VoteButtons;
