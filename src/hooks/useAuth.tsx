import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole, RegistrationStatus } from "@/lib/permissions";

export interface Profile {
  id: string;
  full_name: string | null;
  job_title: string | null;
  phone: string | null;
  avatar_url: string | null;
  municipality?: string | null;
  email?: string | null;
  cbo?: string | null;
  cnes?: string | null;
  municipio_id?: string | null;
  status?: RegistrationStatus | string;
  aceite_termos_em?: string | null;
  motivo_recusa?: string | null;
}

export interface RoleAssignment {
  role: AppRole;
  nmsd_id: string | null;
  municipio_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  /** true enquanto a sessão ainda não foi lida */
  isLoading: boolean;
  /** true depois que perfil e papéis do usuário logado foram carregados */
  profileLoaded: boolean;
  isAdmin: boolean;
  isCoordinator: boolean;
  isModerator: boolean;
  isFocalPoint: boolean;
  isPending: boolean;
  isInactive: boolean;
  roles: AppRole[];
  roleAssignments: RoleAssignment[];
  coordinatorNmsdIds: string[];
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkRole: (role: AppRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const roles = roleAssignments.map((r) => r.role);
  const isAdmin = roles.includes("admin");
  const isCoordinator = roles.includes("coordenador");
  const isModerator = roles.includes("moderador");
  const isFocalPoint = roles.includes("ponto_focal");
  const isPending = !!profile && profile.status === "pendente";
  const isInactive = !!profile && profile.status === "inativo";
  const coordinatorNmsdIds = roleAssignments
    .filter((r) => r.role === "coordenador" && r.nmsd_id)
    .map((r) => r.nmsd_id as string);

  const loadUserData = async (userId: string) => {
    setProfileLoaded(false);
    await Promise.all([fetchProfile(userId), fetchRoles(userId)]);
    setProfileLoaded(true);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // setTimeout evita deadlock dentro do listener de autenticação
      if (session?.user) {
        setTimeout(() => {
          loadUserData(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setRoleAssignments([]);
        setProfileLoaded(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setProfileLoaded(true);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  const fetchRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role, nmsd_id, municipio_id")
      .eq("user_id", userId);

    if (!error && data) {
      setRoleAssignments(data as RoleAssignment[]);
    }
  };

  const checkRole = async (role: AppRole): Promise<boolean> => {
    if (!user) return false;
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: role,
    });
    return !error && data === true;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoleAssignments([]);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        profileLoaded,
        isAdmin,
        isCoordinator,
        isModerator,
        isFocalPoint,
        isPending,
        isInactive,
        roles,
        roleAssignments,
        coordinatorNmsdIds,
        signOut,
        refreshProfile,
        checkRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
