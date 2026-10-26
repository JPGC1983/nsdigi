# NMSD – Núcleo Microrregional de Saúde Digital

Plataforma de governança dos serviços de saúde digital municipais de Minas Gerais: educação permanente, apoio técnico e articulação entre municípios.

- Publicado em: https://nsdigi.lovable.app
- Stack: React + Vite + Tailwind + shadcn/ui, com backend Lovable Cloud (banco, autenticação e funções).

## Perfis de acesso

Os papéis ficam na tabela `user_roles` (nunca no perfil). Valores técnicos e nomes exibidos:

| Valor no banco | Perfil na plataforma | Escopo |
| --- | --- | --- |
| `membro` | Profissional | município (`municipio_id`) |
| `moderador` | Moderador | município / domínio |
| `ponto_focal` | Ponto focal | município (`municipio_id`) |
| `coordenador` | Coordenador do NMSD | núcleo (`nmsd_id`) |
| `admin` | Admin URS/SES | todos os núcleos |

## Fluxo de cadastro e aprovação

1. A pessoa se cadastra em **/auth → Cadastrar** (nome, e-mail, senha, telefone, cargo, CBO, CNES opcional, município e aceite do Termo de Uso e da Política de Privacidade). O perfil nasce com status `pendente` e sem papel.
2. Enquanto estiver `pendente` (ou `inativo`), a pessoa vê apenas a tela de situação do cadastro, e o banco nega acesso a conteúdo restrito e participação (fóruns, matrículas, mentorias).
3. O **Coordenador do NMSD** abre **Aprovações** e aprova (como Profissional, Moderador ou Ponto focal), ajusta os dados ou recusa os cadastros dos municípios do seu núcleo.
4. O **Admin URS/SES** vê todos os núcleos e é o único que define coordenadores e administradores.

Toda aprovação, recusa e consulta da fila fica registrada em `audit_log`. As regras são aplicadas no banco pelas funções `list_registrations` e `review_registration`; a tela só esconde o que não é permitido.

## Seed: primeiro coordenador de cada NMSD

O primeiro coordenador de cada núcleo é definido pelo Admin URS/SES. Há duas formas:

**Pela plataforma (recomendado):** entre como Admin URS/SES → **Aprovações** → encontre a pessoa (aba Pendentes ou Ativos) → **Aprovar / Ajustar perfil** → perfil **Coordenador do NMSD** → escolha o NMSD → salvar.

**Por script (carga inicial em lote):** com a pessoa já cadastrada na plataforma, rode no SQL do backend, uma linha por coordenador. A função valida as regras e registra a auditoria; ela precisa ser chamada por uma sessão de Admin URS/SES. Para uma carga feita pela equipe técnica, use o bloco abaixo, que simula a sessão do admin:

```sql
-- 1) dados do admin que está fazendo a carga e do coordenador
DO $$
DECLARE
  v_admin uuid := (SELECT id FROM public.profiles WHERE email = 'admin@saude.mg.gov.br');
  v_coord uuid := (SELECT id FROM public.profiles WHERE email = 'coordenador@municipio.mg.gov.br');
  v_nmsd  uuid := (SELECT id FROM public.nucleos_microrregionais WHERE microregiao = 'NOME DA MICRORREGIÃO');
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
  PERFORM public.review_registration(v_coord, 'aprovar', 'coordenador', NULL, v_nmsd);
END $$;
```

Repita o bloco para cada núcleo, trocando os e-mails e o nome da microrregião.

## Desenvolvimento

```sh
npm install
npm run dev     # servidor local
npm test        # testes (inclui as regras de permissão em src/lib/permissions.test.ts)
```
