#!/usr/bin/env node
/**
 * MCP Server — Central de Artes
 * Expõe o tool `criar_solicitacao_arte` para Claude Desktop.
 * Configurar em: %APPDATA%\Claude\claude_desktop_config.json
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  process.stderr.write("Erro: defina SUPABASE_URL e SUPABASE_KEY no claude_desktop_config.json\n");
  process.exit(1);
}

const SB_HEADERS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

function gid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const TIPOS = [
  "Arte para Instagram",
  "Arte para WhatsApp",
  "Arte para folder / panfleto",
  "PDF informativo de produtos",
  "Arte para representante",
  "Papel timbrado",
  "Divulgação de vaga",
  "Assinatura de e-mail",
  "Informativo interno",
  "Edição de vídeo",
  "Sinalização interna",
  "Arte para sacaria",
  "Cotação de fornecedor + arte",
  "Demanda estratégica (planejamento)",
  "Outros",
];

const ONDE = [
  "Instagram Feed",
  "Instagram Stories",
  "WhatsApp (clientes)",
  "WhatsApp (grupos)",
  "E-mail",
  "Uso interno",
  "Impresso / Físico",
  "Outros",
];

const server = new Server(
  { name: "central-de-artes", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "criar_solicitacao_arte",
      description:
        "Cria uma nova solicitação de arte na Central de Artes (Germisul / Pasto Brasil). " +
        "Use quando o usuário aprovar um conteúdo e quiser registrar uma demanda de design. " +
        "O status inicial será sempre 'aguardando prazo'.",
      inputSchema: {
        type: "object",
        properties: {
          nome: {
            type: "string",
            description: "Nome do solicitante (ex: 'Marketing Germisul')",
          },
          funcao: {
            type: "string",
            enum: ["Consultor(a)", "RH", "Diretoria", "Gerência", "Marketing", "Outros"],
            description: "Função/cargo do solicitante",
          },
          empresa: {
            type: "string",
            enum: ["Germisul", "Pasto Brasil"],
            description: "Empresa solicitante",
          },
          tipo: {
            type: "string",
            enum: TIPOS,
            description: "Tipo da peça de arte",
          },
          tipoO: {
            type: "string",
            description: "Descrição personalizada (obrigatório quando tipo = 'Outros')",
          },
          onde: {
            type: "array",
            items: { type: "string", enum: ONDE },
            description: "Onde a arte será publicada/usada",
          },
          info: {
            type: "string",
            description: "Texto da legenda, referências visuais e observações",
          },
          prazoD: {
            type: "string",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            description: "Prazo desejado no formato YYYY-MM-DD (ex: '2026-03-25')",
          },
          diaPostagem: {
            type: "string",
            pattern: "^\\d{4}-\\d{2}-\\d{2}$",
            description: "Data de postagem nas redes sociais no formato YYYY-MM-DD (ex: '2026-03-20')",
          },
        },
        required: ["nome", "empresa", "tipo", "prazoD", "info"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "criar_solicitacao_arte") {
    throw new Error(`Tool desconhecida: ${request.params.name}`);
  }

  const p = request.params.arguments;

  const nd = {
    id: gid(),
    nome: p.nome || "Lígia",
    funcao: p.funcao || "Marketing",
    empresa: p.empresa,
    tipo: p.tipo,
    tipoO: p.tipoO || "",
    prazoD: p.prazoD,
    info: p.info,
    onde: Array.isArray(p.onde) ? p.onde : [],
    ondeO: "",
    diaPostagem: p.diaPostagem || "",
    eN: "",
    eC: "",
    eE: "",
    eT: "",
    status: "aguardando_prazo",
    criado: Date.now(),
    ini: null,
    aprovadoEm: null,
    prazoR: null,
    responsavel: "",
    postado: false,
    fonte: "claude_desktop",
    historico: [
      {
        ts: Date.now(),
        tipo: "criacao",
        autor: p.nome || "Lígia",
        fonte: "claude_desktop",
      },
    ],
  };

  const payload = {
    id: nd.id,
    data: nd,
  };

  const res = await fetch(SUPABASE_URL + "/rest/v1/solicitacoes", {
    method: "POST",
    headers: { ...SB_HEADERS, Prefer: "return=minimal" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro Supabase (${res.status}): ${err}`);
  }

  const prazoFormatado = nd.prazoD.split("-").reverse().join("/");

  return {
    content: [
      {
        type: "text",
        text:
          `✅ Solicitação criada com sucesso!\n\n` +
          `**ID:** ${nd.id}\n` +
          `**Empresa:** ${nd.empresa}\n` +
          `**Tipo:** ${nd.tipo}${nd.tipoO ? ` — ${nd.tipoO}` : ""}\n` +
          `**Onde:** ${nd.onde.length ? nd.onde.join(", ") : "—"}\n` +
          `**Prazo desejado:** ${prazoFormatado}\n` +
          (nd.diaPostagem ? `**Dia de postagem:** ${nd.diaPostagem.split("-").reverse().join("/")}\n` : "") +
          `**Status:** Aguardando prazo\n\n` +
          `Acesse a Central de Artes para acompanhar:\n` +
          `https://ligiarasslam.github.io/Central-de-Artes/`,
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Erro fatal: ${err.message}\n`);
  process.exit(1);
});
