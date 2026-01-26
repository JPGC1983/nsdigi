import { useState } from "react";
import { 
  X, 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  AlertTriangle, 
  Award, 
  Target, 
  CheckCircle,
  BellOff,
  Settings,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  type: "curso" | "forum" | "reuniao" | "material_obsoleto" | "certificado" | "meta" | "acao";
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDismiss: (id: string) => void;
}

const notificationConfig = {
  curso: { 
    icon: BookOpen, 
    color: "text-warning",
    bgColor: "bg-warning/10",
    label: "Novo Curso"
  },
  forum: { 
    icon: MessageSquare, 
    color: "text-info",
    bgColor: "bg-info/10",
    label: "Fórum"
  },
  reuniao: { 
    icon: Calendar, 
    color: "text-success",
    bgColor: "bg-success/10",
    label: "Reunião"
  },
  material_obsoleto: { 
    icon: AlertTriangle, 
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Material Obsoleto"
  },
  certificado: { 
    icon: Award, 
    color: "text-warning",
    bgColor: "bg-warning/10",
    label: "Certificado"
  },
  meta: { 
    icon: Target, 
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    label: "Meta"
  },
  acao: { 
    icon: CheckCircle, 
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: "Ação"
  },
};

const NotificationPanel = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDismiss,
}: NotificationPanelProps) => {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  
  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = filter === "unread" 
    ? notifications.filter((n) => !n.read)
    : notifications;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-card border-l border-border shadow-xl z-50 animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Notificações</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Todas
            </Button>
            <Button
              variant={filter === "unread" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("unread")}
            >
              Não lidas ({unreadCount})
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[calc(100vh-180px)]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <BellOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-base font-medium text-foreground mb-1">Tudo em dia!</p>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Você será notificado sobre novos cursos, fóruns, reuniões e atualizações importantes.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => {
                const config = notificationConfig[notification.type];
                const Icon = config.icon;
                
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "px-4 py-4 hover:bg-muted/50 transition-colors cursor-pointer group relative",
                      !notification.read && "bg-primary/5"
                    )}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        config.bgColor
                      )}>
                        <Icon className={cn("h-5 w-5", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs px-1.5 py-0">
                              {config.label}
                            </Badge>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {notification.time}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-foreground mt-1 line-clamp-1">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    
                    {/* Dismiss button - appears on hover */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(notification.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer Actions */}
        {notifications.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-border bg-card">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1"
                onClick={onMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCircle className="h-4 w-4" />
                Marcar todas como lidas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground"
                onClick={onClearAll}
              >
                <Trash2 className="h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPanel;
