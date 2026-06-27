-- ============================================================
--  CAR SAAS - SCHEMA COMPLETO
--  Stack: PostgreSQL + PostGIS + Supabase
--  Versão: 1.0.0
-- ============================================================

-- ─── EXTENSÕES ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- busca textual por similaridade
CREATE EXTENSION IF NOT EXISTS "unaccent";  -- busca sem acentos

-- ============================================================
--  GRUPO 1: MULTITENANCY – TENANTS
-- ============================================================

CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(100) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    plan            VARCHAR(50)  NOT NULL DEFAULT 'free'
                        CHECK (plan IN ('free','starter','professional','enterprise')),
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    settings        JSONB        NOT NULL DEFAULT '{}',
    metadata        JSONB        NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE tenants IS 'Unidade raiz do multitenancy. Cada empresa/consultoria é um tenant.';

-- ============================================================
--  GRUPO 2: AUTENTICAÇÃO E CONTROLE DE ACESSO
-- ============================================================

-- users espelha auth.users do Supabase e adiciona dados de negócio
CREATE TABLE users (
    id              UUID PRIMARY KEY,  -- mesmo UUID do Supabase Auth
    tenant_id       UUID         NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    email           VARCHAR(320) NOT NULL,
    full_name       VARCHAR(255),
    avatar_url      TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    UNIQUE (tenant_id, email)
);

COMMENT ON TABLE users IS 'Espelha auth.users do Supabase. Dados de negócio separados da autenticação.';

CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    is_system       BOOLEAN      NOT NULL DEFAULT false,  -- roles padrão não excluíveis
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);

COMMENT ON TABLE roles IS 'Perfis de acesso por tenant. is_system=true = roles padrão imutáveis.';

CREATE TABLE permissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource        VARCHAR(100) NOT NULL,  -- ex: rural_properties
    action          VARCHAR(50)  NOT NULL,  -- ex: create, read, update, delete
    description     TEXT,
    UNIQUE (resource, action)
);

COMMENT ON TABLE permissions IS 'Ações granulares por recurso. Seed fixo, não varia por tenant.';

CREATE TABLE role_permissions (
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by     UUID REFERENCES users(id),
    assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================
--  GRUPO 3: EMPRESAS / CONSULTORIAS
-- ============================================================

CREATE TABLE companies (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID         NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    name            VARCHAR(255) NOT NULL,
    cnpj            VARCHAR(18),
    crea_number     VARCHAR(50),
    email           VARCHAR(320),
    phone           VARCHAR(20),
    address         JSONB        NOT NULL DEFAULT '{}',
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    metadata        JSONB        NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE companies IS 'Consultorias/empresas ambientais vinculadas ao tenant.';

-- ============================================================
--  GRUPO 4: PRODUTORES RURAIS E PROPRIETÁRIOS
-- ============================================================

CREATE TABLE rural_producers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID         NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    company_id      UUID         REFERENCES companies(id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    cpf_cnpj        VARCHAR(18)  NOT NULL,
    email           VARCHAR(320),
    phone           VARCHAR(20),
    address         JSONB        NOT NULL DEFAULT '{}',
    notes           TEXT,
    metadata        JSONB        NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    UNIQUE (tenant_id, cpf_cnpj)
);

COMMENT ON TABLE rural_producers IS 'Produtor rural cliente da consultoria.';

CREATE TABLE property_owners (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rural_producer_id    UUID        NOT NULL REFERENCES rural_producers(id) ON DELETE CASCADE,
    name                 VARCHAR(255) NOT NULL,
    cpf                  VARCHAR(14),
    document_type        VARCHAR(50) NOT NULL DEFAULT 'cpf'
                             CHECK (document_type IN ('cpf','cnpj','passport','rg')),
    ownership_percentage NUMERIC(5,2) CHECK (ownership_percentage BETWEEN 0 AND 100),
    relationship_type    VARCHAR(50),  -- ex: titular, herdeiro, coproprietário
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE property_owners IS 'Proprietários individuais de uma propriedade (N proprietários por imóvel).';

-- ============================================================
--  GRUPO 5: PROPRIEDADES RURAIS
-- ============================================================

CREATE TABLE rural_properties (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID         NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    rural_producer_id   UUID         NOT NULL REFERENCES rural_producers(id) ON DELETE RESTRICT,
    name                VARCHAR(255) NOT NULL,
    car_number          VARCHAR(100) UNIQUE,  -- código CAR no SICAR
    car_status          VARCHAR(50)  NOT NULL DEFAULT 'pending'
                            CHECK (car_status IN ('pending','active','suspended','cancelled','analysis')),
    total_area_ha       NUMERIC(12,4),
    state               CHAR(2)      NOT NULL,       -- UF
    municipality        VARCHAR(150) NOT NULL,
    ibge_code           VARCHAR(7),
    biome               VARCHAR(50)
                            CHECK (biome IN ('amazonia','cerrado','mata_atlantica',
                                             'caatinga','pantanal','pampa')),
    centroid            GEOGRAPHY(Point, 4326),      -- PostGIS
    notes               TEXT,
    metadata            JSONB        NOT NULL DEFAULT '{}',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

COMMENT ON TABLE rural_properties IS 'Imóvel rural principal. Vincula produtor, geometrias e áreas ambientais.';

-- Matrículas do cartório (1 propriedade → N matrículas)
CREATE TABLE property_registrations (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id          UUID         NOT NULL REFERENCES rural_properties(id) ON DELETE CASCADE,
    registration_number  VARCHAR(100) NOT NULL,
    registry_office      VARCHAR(255),
    city                 VARCHAR(150),
    state                CHAR(2),
    area_ha              NUMERIC(12,4),
    registration_date    DATE,
    notes                TEXT,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE property_registrations IS 'Matrículas cartoriais vinculadas à propriedade.';

-- Coordenadas individuais (vértices de levantamento topográfico)
CREATE TABLE geographical_coordinates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id     UUID         NOT NULL REFERENCES rural_properties(id) ON DELETE CASCADE,
    coordinate_type VARCHAR(50)  NOT NULL DEFAULT 'vertex'
                        CHECK (coordinate_type IN ('vertex','centroid','reference','boundary')),
    latitude        NUMERIC(10,7) NOT NULL,
    longitude       NUMERIC(10,7) NOT NULL,
    altitude        NUMERIC(8,2),
    accuracy_m      NUMERIC(6,2),
    sequence_order  INTEGER,
    geom            GEOGRAPHY(Point, 4326),  -- PostGIS para queries espaciais
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE geographical_coordinates IS 'Vértices georreferenciados do levantamento topográfico.';

-- Polígonos das propriedades (PostGIS)
CREATE TABLE property_polygons (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id     UUID         NOT NULL REFERENCES rural_properties(id) ON DELETE CASCADE,
    polygon_type    VARCHAR(50)  NOT NULL DEFAULT 'perimeter'
                        CHECK (polygon_type IN ('perimeter','lot','sector','reference')),
    geom            GEOGRAPHY(MultiPolygon, 4326) NOT NULL,
    area_ha         NUMERIC(12,4),
    perimeter_m     NUMERIC(12,2),
    source          VARCHAR(100),  -- ex: GPS, drone, INCRA
    source_scale    VARCHAR(20),
    acquired_at     DATE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE property_polygons IS 'Geometrias oficiais da propriedade (PostGIS MultiPolygon).';

-- ============================================================
--  GRUPO 6: ÁREAS AMBIENTAIS
-- ============================================================

-- APP – Área de Preservação Permanente
CREATE TABLE permanent_preservation_areas (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id         UUID         NOT NULL REFERENCES rural_properties(id) ON DELETE CASCADE,
    app_type            VARCHAR(100) NOT NULL
                            CHECK (app_type IN ('riverside','hilltop','hillside','spring',
                                                'restinga','mangrove','altitude','other')),
    geom                GEOGRAPHY(MultiPolygon, 4326),
    total_area_ha       NUMERIC(12,4),
    native_veg_area_ha  NUMERIC(12,4),
    consolidated_area_ha NUMERIC(12,4),
    anthropized_area_ha NUMERIC(12,4),
    status              VARCHAR(50)  NOT NULL DEFAULT 'regular'
                            CHECK (status IN ('regular','irregular','pra_required','pra_active')),
    notes               TEXT,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE permanent_preservation_areas IS 'APP por tipo (margem de rio, topo de morro, etc.).';

-- Reserva Legal
CREATE TABLE legal_reserves (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id         UUID         NOT NULL REFERENCES rural_properties(id) ON DELETE CASCADE,
    reserve_type        VARCHAR(50)  NOT NULL DEFAULT 'internal'
                            CHECK (reserve_type IN ('internal','external','compensated')),
    geom                GEOGRAPHY(MultiPolygon, 4326),
    total_area_ha       NUMERIC(12,4),
    required_area_ha    NUMERIC(12,4),
    native_veg_area_ha  NUMERIC(12,4),
    status              VARCHAR(50)  NOT NULL DEFAULT 'regular'
                            CHECK (status IN ('regular','irregular','deficit','pra_active')),
    compensated_sicar   VARCHAR(100),  -- CAR da propriedade doadora
    is_compensated      BOOLEAN      NOT NULL DEFAULT false,
    notes               TEXT,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE legal_reserves IS 'Reserva Legal do imóvel, incluindo compensação externa.';

-- Áreas Consolidadas (uso agropecuário anterior a 22/07/2008)
CREATE TABLE consolidated_areas (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id          UUID         NOT NULL REFERENCES rural_properties(id) ON DELETE CASCADE,
    area_type            VARCHAR(100) NOT NULL
                             CHECK (area_type IN ('agriculture','pasture','aquaculture',
                                                  'silviculture','infrastructure','urban','other')),
    geom                 GEOGRAPHY(MultiPolygon, 4326),
    total_area_ha        NUMERIC(12,4),
    consolidation_year   SMALLINT     CHECK (consolidation_year <= 2008),
    pra_required         BOOLEAN      NOT NULL DEFAULT false,
    notes                TEXT,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE consolidated_areas IS 'Áreas com uso consolidado anterior ao Marco Legal (Jul/2008).';

-- ============================================================
--  GRUPO 7: DOCUMENTOS E UPLOADS
-- ============================================================

CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID         NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    property_id     UUID         REFERENCES rural_properties(id) ON DELETE SET NULL,
    uploaded_by     UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    document_type   VARCHAR(100) NOT NULL
                        CHECK (document_type IN ('car_registration','car_analysis','title_deed',
                                                 'geo_survey','environmental_license','pra',
                                                 'legal_reserve_proposal','technical_report','other')),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(50)  NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','pending','approved','rejected','archived')),
    valid_until     DATE,
    metadata        JSONB        NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

COMMENT ON TABLE documents IS 'Documentos técnicos e administrativos do processo CAR.';

CREATE TABLE file_uploads (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id      UUID         NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    uploaded_by      UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    original_name    VARCHAR(500) NOT NULL,
    storage_path     TEXT         NOT NULL,  -- path no Supabase Storage
    storage_bucket   VARCHAR(100) NOT NULL DEFAULT 'documents',
    mime_type        VARCHAR(100),
    file_size_bytes  BIGINT,
    checksum_sha256  CHAR(64),
    is_public        BOOLEAN      NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE file_uploads IS 'Arquivos físicos vinculados a documentos (Supabase Storage).';

-- ============================================================
--  GRUPO 8: RELATÓRIOS
-- ============================================================

CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID         NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    property_id     UUID         REFERENCES rural_properties(id) ON DELETE SET NULL,
    generated_by    UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    report_type     VARCHAR(100) NOT NULL
                        CHECK (report_type IN ('car_summary','environmental_analysis',
                                               'legal_reserve_deficit','app_analysis',
                                               'consolidated_area','pra_proposal','custom')),
    title           VARCHAR(255) NOT NULL,
    status          VARCHAR(50)  NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','processing','completed','failed')),
    file_path       TEXT,
    parameters      JSONB        NOT NULL DEFAULT '{}',
    error_message   TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE reports IS 'Relatórios gerados (PDF/Excel). status=processing = geração assíncrona.';

-- ============================================================
--  GRUPO 9: AUDITORIA E HISTÓRICO
-- ============================================================

CREATE TABLE audit_logs (
    id              UUID DEFAULT uuid_generate_v4(),
    tenant_id       UUID         NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    user_id         UUID         REFERENCES users(id) ON DELETE SET NULL,
    table_name      VARCHAR(100) NOT NULL,
    record_id       UUID,
    operation       VARCHAR(10)  NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')),
    old_data        JSONB,
    new_data        JSONB,
    changed_fields  TEXT[],
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);  -- particionamento por data para escalar

-- Partições iniciais (criar via migration mensal em produção)
CREATE TABLE audit_logs_2025 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE audit_logs_2026 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

COMMENT ON TABLE audit_logs IS 'Histórico imutável de operações. Particionado por data para performance.';

-- ============================================================
--  GRUPO 10: INTELIGÊNCIA ARTIFICIAL (preparação futura)
-- ============================================================

CREATE TABLE ai_analysis_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID         NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    property_id     UUID         REFERENCES rural_properties(id) ON DELETE SET NULL,
    requested_by    UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    analysis_type   VARCHAR(100) NOT NULL
                        CHECK (analysis_type IN ('vegetation_detection','land_use_classification',
                                                 'app_identification','legal_reserve_analysis',
                                                 'change_detection','boundary_suggestion',
                                                 'document_ocr','inconsistency_check')),
    status          VARCHAR(50)  NOT NULL DEFAULT 'queued'
                        CHECK (status IN ('queued','processing','completed','failed','cancelled')),
    model_version   VARCHAR(50),
    input_data      JSONB        NOT NULL DEFAULT '{}',
    result_data     JSONB,
    confidence_score NUMERIC(4,3) CHECK (confidence_score BETWEEN 0 AND 1),
    processing_ms   INTEGER,
    error_message   TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ai_analysis_requests IS 'Fila de análises de IA (detecção de vegetação, uso do solo, OCR, etc.).';

-- ============================================================
--  GRUPO 11: NOTIFICAÇÕES
-- ============================================================

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50)  NOT NULL
                        CHECK (type IN ('car_status_change','document_approved','document_rejected',
                                        'report_ready','ai_completed','deadline_warning','system')),
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    payload         JSONB        NOT NULL DEFAULT '{}',
    is_read         BOOLEAN      NOT NULL DEFAULT false,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Notificações in-app por usuário. payload para deep-link no frontend.';

-- ============================================================
--  ÍNDICES
-- ============================================================

-- Multitenancy (todos os filtros primários são por tenant_id)
CREATE INDEX idx_users_tenant          ON users(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_tenant      ON companies(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_producers_tenant      ON rural_producers(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_tenant     ON rural_properties(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_tenant      ON documents(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_audit_tenant          ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_notifications_user    ON notifications(user_id, is_read, created_at DESC);

-- Chaves estrangeiras mais usadas em JOINs
CREATE INDEX idx_properties_producer   ON rural_properties(rural_producer_id);
CREATE INDEX idx_producers_company     ON rural_producers(company_id);
CREATE INDEX idx_coords_property       ON geographical_coordinates(property_id);
CREATE INDEX idx_polygons_property     ON property_polygons(property_id);
CREATE INDEX idx_app_property          ON permanent_preservation_areas(property_id);
CREATE INDEX idx_rl_property           ON legal_reserves(property_id);
CREATE INDEX idx_ca_property           ON consolidated_areas(property_id);
CREATE INDEX idx_docs_property         ON documents(property_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reports_property      ON reports(property_id);
CREATE INDEX idx_ai_property           ON ai_analysis_requests(property_id);
CREATE INDEX idx_files_document        ON file_uploads(document_id);

-- Campos de busca textual
CREATE INDEX idx_producers_name_trgm   ON rural_producers USING gin(name gin_trgm_ops);
CREATE INDEX idx_properties_name_trgm  ON rural_properties USING gin(name gin_trgm_ops);
CREATE INDEX idx_car_number            ON rural_properties(car_number) WHERE car_number IS NOT NULL;
CREATE INDEX idx_cpf_cnpj              ON rural_producers(cpf_cnpj);
CREATE INDEX idx_users_email           ON users(email);

-- PostGIS (queries espaciais)
CREATE INDEX idx_properties_centroid   ON rural_properties USING GIST(centroid);
CREATE INDEX idx_polygons_geom         ON property_polygons USING GIST(geom);
CREATE INDEX idx_app_geom              ON permanent_preservation_areas USING GIST(geom);
CREATE INDEX idx_rl_geom               ON legal_reserves USING GIST(geom);
CREATE INDEX idx_ca_geom               ON consolidated_areas USING GIST(geom);
CREATE INDEX idx_coords_geom           ON geographical_coordinates USING GIST(geom);

-- Status / filas de processamento
CREATE INDEX idx_reports_status        ON reports(tenant_id, status) WHERE status = 'pending';
CREATE INDEX idx_ai_status             ON ai_analysis_requests(tenant_id, status)
                                          WHERE status IN ('queued','processing');
CREATE INDEX idx_docs_status           ON documents(tenant_id, status);

-- Soft delete (queries de listagem excluem deleted_at IS NOT NULL)
CREATE INDEX idx_properties_not_deleted ON rural_properties(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_producers_not_deleted  ON rural_producers(tenant_id)   WHERE deleted_at IS NULL;

-- ============================================================
--  FUNÇÕES AUXILIARES
-- ============================================================

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

-- Aplica trigger em todas as tabelas com updated_at
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'tenants','users','roles','companies','rural_producers',
    'property_owners','rural_properties','property_registrations',
    'property_polygons','permanent_preservation_areas',
    'legal_reserves','consolidated_areas','documents','reports',
    'ai_analysis_requests'
  ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_set_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END;
$$;

-- Função genérica de auditoria (usada via trigger por tabela)
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _tenant_id UUID;
  _user_id   UUID;
  _changed   TEXT[];
BEGIN
  -- tenant_id e user_id vêm do contexto da sessão (definir via SET LOCAL)
  _tenant_id := current_setting('app.tenant_id', true)::UUID;
  _user_id   := current_setting('app.user_id',   true)::UUID;

  IF TG_OP = 'UPDATE' THEN
    SELECT array_agg(key) INTO _changed
    FROM jsonb_each(to_jsonb(NEW)) n
    JOIN jsonb_each(to_jsonb(OLD)) o USING (key)
    WHERE n.value <> o.value;
  END IF;

  INSERT INTO audit_logs(tenant_id, user_id, table_name, record_id,
                          operation, old_data, new_data, changed_fields)
  VALUES (
    _tenant_id, _user_id, TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END,
    _changed
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Exemplo: ativar auditoria para rural_properties
CREATE TRIGGER trg_audit_rural_properties
AFTER INSERT OR UPDATE OR DELETE ON rural_properties
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================================
--  ROW LEVEL SECURITY (RLS) – SUPABASE
-- ============================================================

ALTER TABLE tenants                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE rural_producers            ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_owners            ENABLE ROW LEVEL SECURITY;
ALTER TABLE rural_properties           ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_registrations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographical_coordinates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_polygons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE permanent_preservation_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_reserves             ENABLE ROW LEVEL SECURITY;
ALTER TABLE consolidated_areas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads               ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications              ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions                ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles                 ENABLE ROW LEVEL SECURITY;

-- Helper: retorna tenant_id do usuário autenticado
CREATE OR REPLACE FUNCTION auth_tenant_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT tenant_id FROM users
  WHERE id = auth.uid() AND deleted_at IS NULL
  LIMIT 1;
$$;

-- Políticas de isolamento por tenant (padrão para todas as tabelas com tenant_id)
CREATE POLICY tenant_isolation ON rural_properties
  USING (tenant_id = auth_tenant_id());

CREATE POLICY tenant_isolation ON rural_producers
  USING (tenant_id = auth_tenant_id());

CREATE POLICY tenant_isolation ON documents
  USING (tenant_id = auth_tenant_id());

CREATE POLICY tenant_isolation ON reports
  USING (tenant_id = auth_tenant_id());

CREATE POLICY tenant_isolation ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Usuário só vê os próprios dados de auth
CREATE POLICY users_own_tenant ON users
  USING (tenant_id = auth_tenant_id());

-- Admins do tenant podem gerenciar roles
CREATE POLICY admin_manage_roles ON roles
  USING (tenant_id = auth_tenant_id());

-- ============================================================
--  SEED INICIAL DE PERMISSÕES
-- ============================================================

INSERT INTO permissions (resource, action, description) VALUES
  ('rural_properties', 'create',  'Cadastrar propriedade'),
  ('rural_properties', 'read',    'Visualizar propriedade'),
  ('rural_properties', 'update',  'Editar propriedade'),
  ('rural_properties', 'delete',  'Excluir propriedade'),
  ('rural_producers',  'create',  'Cadastrar produtor'),
  ('rural_producers',  'read',    'Visualizar produtor'),
  ('rural_producers',  'update',  'Editar produtor'),
  ('rural_producers',  'delete',  'Excluir produtor'),
  ('documents',        'create',  'Enviar documento'),
  ('documents',        'read',    'Visualizar documento'),
  ('documents',        'approve', 'Aprovar documento'),
  ('documents',        'delete',  'Excluir documento'),
  ('reports',          'create',  'Gerar relatório'),
  ('reports',          'read',    'Visualizar relatório'),
  ('ai_analysis',      'request', 'Solicitar análise de IA'),
  ('admin',            'manage',  'Administração geral do tenant');

