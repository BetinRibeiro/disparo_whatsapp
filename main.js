// Adiciona um evento de escuta ao formulário de mensagem quando é enviado
document.getElementById("mensagemForm").addEventListener("submit", async function(event) {
    esconderFormulario();
    event.preventDefault();

    const instancia = document.getElementById("instancia").value;
    salvarInstanciaLocalStorage(instancia);

    const chaveApi = document.getElementById("chave_api").value;
    salvarChaveApiLocalStorage(chaveApi);

    const numeros = document.getElementById("numeros").value.split(",");
    salvarNumerosLocalStorage(numeros);

    const segundos = document.getElementById("segundos").value;
    salvarSegundosLocalStorage(segundos);

    const mensagens = document.getElementById("mensagem").value.split("|");
    salvarMensagensLocalStorage(mensagens);

    // Calcula o total de mensagens e números de telefone
    const totalMensagens = mensagens.length;
    const totalNumeros = numeros.length;

    // Itera sobre cada número de telefone
    for (let i = 0; i < totalNumeros; i++) {
        const numero = numeros[i].trim();
        const valido = await verifica(chaveApi, instancia, numero);

        if (valido) {
            // Encontra o índice da mensagem correspondente para este número
            const indiceMensagem = i % totalMensagens;
            const mensagem = mensagens[indiceMensagem].trim();

            await enviar(instancia, chaveApi, numero, mensagem);

            // Adiciona um item à lista de números enviados
            document.getElementById("numerosEnviados").innerHTML += `
                <p class=" bg-success list-group-item list-group-item-action">Número ${numero} - Mensagem ${indiceMensagem + 1} Enviada</p>
            `;

            await new Promise(resolve => setTimeout(resolve, segundos * 1000));
        } else {
            // Adiciona um item à lista de números enviados indicando que o número é inválido
            document.getElementById("numerosEnviados").innerHTML += `
                <p class=" bg-danger list-group-item list-group-item-action">Número ${numero} é Inválido - Mensagem não enviada</p>
            `;
        }
    }

    mostrarBotaoAtualizar();
});




async function verifica(chave_api, instancia, numero) {
    const url = `https://evoapi.arsenalsystembr.com.br/chat/whatsappNumbers/${instancia}`;

    const payload = JSON.stringify({
        numbers: [numero]
    });

    const headers = {
        'Content-Type': 'application/json',
        'apikey': chave_api
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: payload
    });

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
        for (const item of data) {
            if ('exists' in item && typeof item['exists'] === 'boolean') {
                return item['exists'];
            }
        }
    }

    return false;
}

async function enviar(instancia, chaveApi, numero, mensagem) {
    const url = `https://evoapi.arsenalsystembr.com.br/message/sendText/${instancia}`;
    const payload = JSON.stringify({
      "number": numero,
      "options": {
        "delay": 1200,
        "presence": "composing",
        "linkPreview": false
      },
      "textMessage": {
        "text": mensagem
      }
    });
    const headers = {
      'Content-Type': 'application/json',
      'apikey': chaveApi
    };
  
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: payload
    });
    return response.text();
}

// Funções relacionadas ao LocalStorage
function preencherInstanciaDoLocalStorage() {
    const instanciaLocalStorage = localStorage.getItem('instancia');
    if (instanciaLocalStorage) {
      document.getElementById('instancia').value = instanciaLocalStorage;
    }
}

function salvarInstanciaLocalStorage(instancia) {
    localStorage.setItem('instancia', instancia);
}

function preencherChaveApiDoLocalStorage() {
    const chaveApiLocalStorage = localStorage.getItem('chave_api');
    if (chaveApiLocalStorage) {
      document.getElementById('chave_api').value = chaveApiLocalStorage;
    }
}

function salvarChaveApiLocalStorage(chaveApi) {
    localStorage.setItem('chave_api', chaveApi);
}

function preencherNumerosDoLocalStorage() {
    const numerosLocalStorage = localStorage.getItem('numeros');
    if (numerosLocalStorage) {
      document.getElementById('numeros').value = numerosLocalStorage;
    }
}

function salvarNumerosLocalStorage(numeros) {
    localStorage.setItem('numeros', numeros);
}

function preencherSegundosDoLocalStorage() {
    const segundosLocalStorage = localStorage.getItem('segundos');
    if (segundosLocalStorage) {
      document.getElementById('segundos').value = segundosLocalStorage;
    }
}

function salvarSegundosLocalStorage(segundos) {
    localStorage.setItem('segundos', segundos);
}

function salvarMensagensLocalStorage(mensagens) {
    localStorage.setItem('mensagens', JSON.stringify(mensagens)); // Salvar mensagens como uma lista
}
function preencherMensagensDoLocalStorage() {
    const mensagensLocalStorage = localStorage.getItem('mensagens');
    if (mensagensLocalStorage) {
        const mensagens = JSON.parse(mensagensLocalStorage);
        document.getElementById('mensagem').value = mensagens.join("|");
    } else {
        document.getElementById('mensagem').value = ""; // Define um valor padrão quando não houver mensagens no localStorage
    }
}

// Funções relacionadas à visibilidade de elementos
function esconderFormulario() {
    document.getElementById('mensagemForm').style.display = 'none';
}
function mostrarFormulario() {
    document.getElementById('mensagemForm').style.display = 'block';
    esconderBotaoAtualizar()
    document.getElementById("numerosEnviados").innerHTML =""
}

function esconderBotaoAtualizar() {
    document.getElementById('botaoAtualizar').style.display = 'none';
}

function mostrarBotaoAtualizar() {
    document.getElementById('botaoAtualizar').style.display = 'block';
}

// Chamadas iniciais para inicializar elementos e dados do LocalStorage
esconderBotaoAtualizar();
preencherMensagensDoLocalStorage();
preencherSegundosDoLocalStorage();
preencherNumerosDoLocalStorage();
preencherChaveApiDoLocalStorage();
preencherInstanciaDoLocalStorage();
