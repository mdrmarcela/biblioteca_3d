"""Servidor local opcional, sem dependências.
Execute: python servir.py
"""

# Permite configurar previamente os argumentos de uma função.
from functools import partial

# Importa os componentes necessários para criar um servidor HTTP.
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

# Permite manipular caminhos de arquivos e diretórios.
from pathlib import Path

# Permite configurar os tipos MIME dos arquivos.
import mimetypes

# Permite abrir automaticamente o navegador padrão.
import webbrowser


# Define o tipo MIME dos arquivos JavaScript.
# Garante que sejam identificados corretamente pelo navegador.
mimetypes.add_type('text/javascript', '.js')

# Obtém o caminho absoluto da pasta onde servir.py está localizado.
# Essa pasta será utilizada como raiz do servidor.
root = Path(__file__).resolve().parent


# =====================================================
# CONTROLE DO CACHE
# =====================================================

# Cria uma classe que herda as funcionalidades
# do manipulador HTTP padrão do Python.
class SemCache(SimpleHTTPRequestHandler):

    """Evita que o navegador reutilize versões antigas
    dos arquivos durante o desenvolvimento."""

    # Sobrescreve o método responsável por finalizar
    # os cabeçalhos da resposta HTTP.
    def end_headers(self):

        # Instrui o navegador a não armazenar a resposta em cache.
        self.send_header('Cache-Control', 'no-store, max-age=0')

        # Executa o método original da classe pai.
        super().end_headers()


# =====================================================
# INICIALIZAÇÃO DO SERVIDOR
# =====================================================

# Percorre as portas de 8000 até 8010,
# procurando uma porta disponível.
for port in range(8000, 8011):

    try:

        # Cria um servidor HTTP com suporte a múltiplas threads.
        # 127.0.0.1 restringe o acesso à interface local.
        # partial configura o diretório que será disponibilizado.
        server = ThreadingHTTPServer(
            ('127.0.0.1', port),
            partial(SemCache, directory=str(root))
        )

        # Interrompe a busca quando consegue criar o servidor.
        break

    except OSError:

        # Caso não seja possível utilizar a porta,
        # tenta a próxima.
        continue

else:

    # Caso nenhuma porta permita iniciar o servidor,
    # encerra o programa com uma mensagem de orientação.
    raise SystemExit(
        'Portas 8000 a 8010 ocupadas. Use o Live Server do VS Code.'
    )


# =====================================================
# ABERTURA DA APLICAÇÃO
# =====================================================

# Monta o endereço HTTP utilizando a porta selecionada.
url = f'http://127.0.0.1:{port}'

# Exibe informações sobre o servidor no terminal.
print(
    f'Biblioteca Aurora: {url}\n'
    f'Pasta servida: {root}\n'
    f'Encerre com Ctrl+C.'
)

# Solicita a abertura automática da aplicação
# no navegador padrão do sistema.
webbrowser.open(url)


# =====================================================
# EXECUÇÃO E ENCERRAMENTO DO SERVIDOR
# =====================================================

try:

    # Mantém o servidor em execução,
    # aguardando e respondendo às requisições HTTP.
    server.serve_forever()

except KeyboardInterrupt:

    # Permite interromper a execução utilizando Ctrl+C
    # sem apresentar uma mensagem de exceção.
    pass

finally:

    # Fecha o servidor e libera os recursos associados.
    server.server_close()