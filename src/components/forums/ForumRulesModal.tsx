import { useState } from "react";
import { Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Forum } from "@/types/forum";

interface ForumRulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forum: Forum;
  onAccept: () => void;
}

const ForumRulesModal = ({ open, onOpenChange, forum, onAccept }: ForumRulesModalProps) => {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
      onOpenChange(false);
    }
  };

  const rules = forum.rules?.split('\n').filter(r => r.trim()) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div 
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${forum.color}15` }}
            >
              <Shield className="h-5 w-5" style={{ color: forum.color }} />
            </div>
            <div>
              <DialogTitle>Regras do Fórum</DialogTitle>
              <DialogDescription>
                {forum.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            {rules.length > 0 ? (
              rules.map((rule, index) => (
                <p key={index} className="text-sm text-foreground">
                  {rule}
                </p>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma regra específica definida para este fórum.
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <Checkbox 
              id="accept-rules" 
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <label 
              htmlFor="accept-rules" 
              className="text-sm font-medium cursor-pointer"
            >
              Li e concordo com as regras do fórum
            </label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleAccept} disabled={!accepted}>
            Aceitar e Participar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ForumRulesModal;
