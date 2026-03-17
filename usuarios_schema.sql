CREATE TABLE IF NOT EXISTS usuarios (
  id      TEXT PRIMARY KEY,
  nome    TEXT NOT NULL UNIQUE,
  pin     TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  criado  BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usr_nome ON usuarios (nome);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura publica"     ON usuarios FOR SELECT USING (true);
CREATE POLICY "Insercao publica"    ON usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualizacao publica" ON usuarios FOR UPDATE USING (true);

INSERT INTO usuarios (id, nome, pin, is_admin, criado) VALUES
  ('usr_ligia',       'Lígia',       '1234', true,  1773767283000),
  ('usr_rute',        'Rute',        '1234', true,  1773767283000),
  ('usr_patricia',    'Patricia',    '1234', false, 1773767283000),
  ('usr_darleno',     'Darleno',     '1234', false, 1773767283000),
  ('usr_rafaela',     'Rafaela',     '1234', false, 1773767283000),
  ('usr_graziane',    'Graziane',    '1234', false, 1773767283000),
  ('usr_anelisse',    'Anelisse',    '1234', false, 1773767283000),
  ('usr_guilhermina', 'Guilhermina', '1234', false, 1773767283000),
  ('usr_andreza',     'Andreza',     '1234', false, 1773767283000),
  ('usr_thallyson',   'Thallyson',   '1234', false, 1773767283000),
  ('usr_vinicius',    'Vinícius',    '1234', false, 1773767283000),
  ('usr_junior',      'Junior',      '1234', false, 1773767283000),
  ('usr_nicola',      'Nicola',      '1234', false, 1773767283000),
  ('usr_leandro',     'Leandro',     '1234', false, 1773767283000),
  ('usr_ster',        'Ster',        '1234', false, 1773767283000),
  ('usr_rogerio',     'Rogério',     '1234', false, 1773767283000),
  ('usr_silvio',      'Silvio',      '1234', false, 1773767283000),
  ('usr_nicanor',     'Nicanor',     '1234', false, 1773767283000)
ON CONFLICT (id) DO NOTHING;
