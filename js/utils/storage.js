// Define um prefixo para identificar os dados da biblioteca
// no armazenamento local do navegador.
// O v2 permite diferenciar versões das configurações.
const prefix = "aurora.v2.";

// =====================================================
// LEITURA DAS CONFIGURAÇÕES
// =====================================================

// Recupera uma configuração armazenada no navegador.
// key: identificador da configuração.
// fallback: valor padrão caso a configuração não exista
// ou ocorra algum erro durante a leitura.
export function readSetting(key, fallback) {

  try {

    // Recupera o valor armazenado no localStorage.
    // JSON.parse converte o texto armazenado
    // novamente para seu tipo de dado original.
    // Caso o resultado seja null ou undefined,
    // utiliza o valor padrão (fallback).
    return JSON.parse(localStorage.getItem(prefix + key)) ?? fallback;

  } catch {

    // Caso ocorra algum erro de leitura ou conversão,
    // retorna o valor padrão.
    return fallback;
  }
}

// =====================================================
// ARMAZENAMENTO DAS CONFIGURAÇÕES
// =====================================================

// Salva uma configuração no armazenamento local.
// key: identificador da configuração.
// value: valor que será armazenado.
export function saveSetting(key, value) {

  try {

    // JSON.stringify converte o valor em uma string JSON.
    // O prefixo identifica os dados pertencentes à biblioteca.
    localStorage.setItem(prefix + key, JSON.stringify(value));

  } catch {

    // Caso o navegador bloqueie o armazenamento
    // ou ocorra algum erro, a aplicação continua funcionando.
    /* A experiência continua se o navegador bloquear o armazenamento. */
  }
}

// =====================================================
// NORMALIZAÇÃO DE TEXTOS
// =====================================================

// Padroniza os textos utilizados na pesquisa do catálogo.
export const normalize = (value) =>
  value

    // Separa caracteres acentuados em caracteres base
    // e marcas diacríticas, utilizando a normalização Unicode NFD.
    .normalize("NFD")

    // Remove as marcas diacríticas do intervalo Unicode informado,
    // eliminando os acentos mais comuns.
    .replace(/[\u0300-\u036f]/g, "")

    // Converte todos os caracteres para letras minúsculas.
    .toLowerCase();

// =====================================================
// PROTEÇÃO DE CONTEÚDOS HTML
// =====================================================

// Converte caracteres especiais em entidades HTML,
// evitando que sejam interpretados como marcação.
export const escapeHTML = (value) =>

  // Converte o valor recebido em uma string.
  String(value).replace(

    // Expressão regular que identifica caracteres especiais.
    // A flag g permite substituir todas as ocorrências.
    /[&<>"']/g,

    // Substitui cada caractere pela entidade HTML correspondente.
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char],
  );