/**
 * MANUAL  Pesquisa de Personas  Backend v2 (schema-driven)
 * ----------------------------------------------------------
 * Colunas FIXAS, na ORDEM do questionario, com CABECALHOS LEGIVEIS.
 * - doPost(e): grava 1 linha mapeando cada campo (id) -> sua coluna via FIELDS.
 * - doGet(e) : devolve JSON (por id) SEM PII (e-mail, CPF, PIX) pro dashboard.
 * - setupSheet(): utilitario 1x -> limpa dados ficticios e aplica os cabecalhos.
 *
 * Trocar o FIELDS abaixo e o unico lugar a mexer quando o formulario mudar.
 */

var SHEET = 'respostas';
var SENSIVEL = ['email', 'cpf', 'pix'];   // nunca saem no doGet
var SECRET = 'mnl_pp_0b4fa28a43c1444c42fc';  // segredo compartilhado: o form envia, o backend exige (anti spam/bot/leitura publica)

// id = chave que o formulario envia  label = cabecalho legivel na planilha.
// A ORDEM aqui e a ordem das colunas (a ordem do questionario).
var FIELDS = [
  { id: '_recebido', label: 'Recebido em' },

  // Bloco 01  Sobre voce
  { id: 'idade',      label: '01 \u00b7 Idade' },
  { id: 'civil',      label: '01 \u00b7 Estado civil' },
  { id: 'filhos',     label: '01 \u00b7 Filhos' },
  { id: 'renda',      label: '01 \u00b7 Renda familiar mensal' },
  { id: 'profissao',  label: '01 \u00b7 Profiss\u00e3o' },

  // Bloco 02  Seu dia a dia
  { id: 'exerc',      label: '02 \u00b7 Frequ\u00eancia de exerc\u00edcio' },
  { id: 'modal',      label: '02 \u00b7 Modalidades que pratica' },
  { id: 'esportes',   label: '02 \u00b7 Esportes que acompanha' },
  { id: 'time',       label: '02 \u00b7 Time de futebol' },
  { id: 'hobbies',    label: '02 \u00b7 Hobbies' },
  { id: 'cuidados',   label: '02 \u00b7 Cuidados pessoais na rotina' },

  // Bloco 03  O que rola no seu feed
  { id: 'redes',      label: '03 \u00b7 Redes sociais que usa' },
  { id: 'conteudo',   label: '03 \u00b7 Tipos de conte\u00fado que consome' },
  { id: 'streaming',  label: '03 \u00b7 Servi\u00e7os de streaming' },
  { id: 'podcast',    label: '03 \u00b7 Podcasts / canais que acompanha' },
  { id: 'criador',    label: '03 \u00b7 Tipo de criador que segue' },
  { id: 'cite',       label: '03 \u00b7 Criadores / podcasts citados' },

  // Bloco 04  Sua historia com a queda
  { id: 'tempo_sinais', label: '04 \u00b7 Tempo desde os primeiros sinais' },
  { id: 'regiao',       label: '04 \u00b7 Regi\u00e3o mais afetada' },
  { id: 'autoestima',   label: '04 \u00b7 Impacto na autoestima (1\u20135)' },
  { id: 'frustracao',   label: '04 \u00b7 Maior frustra\u00e7\u00e3o com a calv\u00edcie' },
  { id: 'impacto',      label: '04 \u00b7 Impacto por \u00e1rea da vida (1\u20135)' },
  { id: 'motivou',      label: '04 \u00b7 O que mais motivou a tratar' },
  { id: 'quem_motivou', label: '04 \u00b7 Quem mais motivou a tratar' },

  // Bloco 05  A decisao de tratar
  { id: 'alternativas',       label: '05 \u00b7 Alternativas j\u00e1 tentadas' },
  { id: 'outro_medicamento',  label: '05 \u00b7 Toma medicamento p/ outra condi\u00e7\u00e3o' },
  { id: 'interesse_outras',   label: '05 \u00b7 Interesse em tratar outras condi\u00e7\u00f5es' },
  { id: 'fatores',            label: '05 \u00b7 Fator mais importante ao escolher marca' },
  { id: 'medos',              label: '05 \u00b7 Maiores medos antes de come\u00e7ar' },
  { id: 'receios_adicionais', label: '05 \u00b7 Receios adicionais sobre o tratamento' },
  { id: 'projecao',           label: '05 \u00b7 Tempo projetado de uso' },
  { id: 'fala',               label: '05 \u00b7 Fala abertamente sobre o tratamento' },
  { id: 'comunidade',         label: '05 \u00b7 Interesse em comunidade' },

  // Bloco 06  Sua experiencia com a MANUAL
  { id: 'conheceu',      label: '06 \u00b7 Onde conheceu a MANUAL' },
  { id: 'ate_comprar',   label: '06 \u00b7 Tempo at\u00e9 o primeiro pedido' },
  { id: 'tempo_cliente', label: '06 \u00b7 Tempo como cliente' },
  { id: 'resultados',    label: '06 \u00b7 Resultados notados' },
  { id: 'desafios',      label: '06 \u00b7 Maiores desafios no tratamento' },
  { id: 'impacto_vida',  label: '06 \u00b7 Impacto do tratamento na vida' },
  { id: 'satisfacao',    label: '06 \u00b7 Satisfa\u00e7\u00e3o com a MANUAL (1\u20135)' },
  { id: 'valoriza',      label: '06 \u00b7 O que mais valoriza no servi\u00e7o' },
  { id: 'se_sumisse',    label: '06 \u00b7 O que faria se a MANUAL sumisse' },
  { id: 'nps',           label: '06 \u00b7 NPS \u2014 recomendaria (0\u201310)' },
  { id: 'melhorias',     label: '06 \u00b7 Sugest\u00f5es de melhoria' },

  // Incentivo (PII)  no fim, isolado
  { id: 'email', label: 'PII \u00b7 E-mail (conta MANUAL)' },
  { id: 'cpf',   label: 'PII \u00b7 CPF' },
  { id: 'pix',   label: 'PII \u00b7 Chave PIX' },

  // Tecnico (backup integro pro dashboard)
  { id: '_raw', label: '_raw (JSON backup)' }
];

/* ---------- INGESTAO: formulario -> planilha ---------- */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    // 0) limite de tamanho: rejeita corpos absurdos
    if (!e || !e.postData || !e.postData.contents || e.postData.contents.length > 20000) {
      return json_({ ok: false, error: 'bad request' });
    }
    var data = JSON.parse(e.postData.contents);
    // 1) segredo compartilhado: sem token valido, nao grava (mata spam/bot)
    if (!data || data.token !== SECRET) return json_({ ok: false, error: 'unauthorized' });
    delete data.token;                       // nunca guarda o token na planilha
    // 2) rejeita envio vazio/lixo: exige ao menos 3 respostas reais
    var reais = 0;
    for (var k in data) {
      if (k.charAt(0) === '_') continue;
      if (data[k] != null && String(data[k]).length > 0) reais++;
    }
    if (reais < 3) return json_({ ok: false, error: 'empty' });
    var sh = getSheet_();
    ensureHeaders_(sh);
    var row = FIELDS.map(function (f) {
      if (f.id === '_recebido') return new Date();
      if (f.id === '_raw') return JSON.stringify(data);
      var v = data[f.id];
      if (v == null) return '';
      if (Array.isArray(v)) return v.join(' | ');       // legivel pra humanos
      if (typeof v === 'object') return JSON.stringify(v);
      return v;
    });
    sh.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- CONSUMO: planilha -> dashboard (sem PII) ---------- */
function doGet(e) {
  // leitura protegida: sem token valido, nao devolve dados (fecha leitura publica)
  if (!e || !e.parameter || e.parameter.token !== SECRET) return json_([]);
  var sh = getSheet_();
  var vals = sh.getDataRange().getValues();
  if (vals.length < 2) return json_([]);
  var ids = FIELDS.map(function (f) { return f.id; });
  var rawIdx = ids.indexOf('_raw');
  var out = [];
  for (var i = 1; i < vals.length; i++) {
    var obj = null;
    if (rawIdx >= 0) { try { obj = JSON.parse(vals[i][rawIdx]); } catch (_) {} }
    if (!obj) {
      obj = {};
      FIELDS.forEach(function (f, j) { if (f.id.charAt(0) !== '_') obj[f.id] = vals[i][j]; });
    }
    SENSIVEL.forEach(function (k) { delete obj[k]; });
    delete obj.__consent;
    out.push(obj);
  }
  return json_(out);
}

/* ---------- utilitario 1x: reconstroi a planilha, removendo ficticios/teste ----------
 * Le o JSON cru (_raw) de cada linha, DESCARTA as ficticias/teste, e reescreve
 * as respostas REAIS (se houver) ja na nova ordem de colunas + cabecalhos legiveis.
 * E seguro rodar quantas vezes quiser. */
function setupSheet() {
  var sh = getSheet_();
  var vals = sh.getDataRange().getValues();
  var headers = (vals.length ? vals[0] : []).map(function (h) { return String(h); });
  var rawIdx = -1;   // acha a coluna _raw por prefixo (casa '_raw' e '_raw (JSON backup)')
  for (var c = 0; c < headers.length; c++) { if (headers[c] === '_raw' || headers[c].indexOf('_raw') === 0) { rawIdx = c; break; } }
  var keep = [], removed = 0;
  for (var i = 1; i < vals.length; i++) {
    var obj = {}; try { obj = JSON.parse(vals[i][rawIdx]) || {}; } catch (_) {}
    var email = String(obj.email || '').toLowerCase();
    var isFake = /ficticio\.test/.test(email) || /teste/.test(email) || /apagar/.test(email) ||
                 String(obj.frustracao || '').toUpperCase().indexOf('TESTE') >= 0;
    var isEmpty = !obj.idade && !obj.email && !obj.frustracao && Object.keys(obj).length < 3;
    if (isFake || isEmpty) { removed++; } else { keep.push(obj); }
  }
  sh.clearContents();
  var labels = FIELDS.map(function (f) { return f.label; });
  sh.getRange(1, 1, 1, labels.length).setValues([labels]);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, labels.length).setFontWeight('bold');
  if (keep.length) {
    var rows = keep.map(function (data) {
      return FIELDS.map(function (f) {
        if (f.id === '_recebido') return data._recebido || data.__ts || '';
        if (f.id === '_raw') return JSON.stringify(data);
        var v = data[f.id];
        if (v == null) return '';
        if (Array.isArray(v)) return v.join(' | ');
        if (typeof v === 'object') return JSON.stringify(v);
        return v;
      });
    });
    sh.getRange(2, 1, rows.length, labels.length).setValues(rows);
  }
  return 'ok \u2014 ' + removed + ' fict\u00edcias/teste removidas \u00b7 ' + keep.length + ' reais mantidas \u00b7 ' + labels.length + ' colunas';
}

/* ---------- helpers ---------- */
function ensureHeaders_(sh) {
  var labels = FIELDS.map(function (f) { return f.label; });
  var cur = sh.getLastColumn() > 0 ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
  var same = cur.length === labels.length && cur.every(function (v, i) { return v === labels[i]; });
  if (!same) {
    sh.getRange(1, 1, 1, labels.length).setValues([labels]);
    sh.setFrozenRows(1);
  }
}
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
