// Variáveis globais para o mapa, a rota e o marcador
let map;
let rotaFixa;
let marcadorOnibus;
let pontosDaRota = []; // Inicializa como um array vazio
let markers = []; // Array para armazenar os marcadores editáveis

// **1. Rota Fixa:**
// Carrega os pontos da rota da sua API
async function carregarPontosDaRota() {
  try {
    const response = await fetch("https://busstop-b9ov.onrender.com/locations/all/bus_02");

    console.log("Resposta da API (rota fixa):", response);

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();

    console.log("Dados recebidos (rota fixa):", data);

    if (!Array.isArray(data)) {
      throw new Error("Formato de dados inválido recebido da API");
    }

    pontosDaRota = data.map(p => ({ lat: p.latitude, lng: p.longitude }));
  } catch (error) {
    console.error("Erro ao carregar os pontos da rota:", error);
  }
}

// **2. Função de Inicialização do Mapa:**
async function initMap() {
  // Aguarda o carregamento dos pontos da rota
  await carregarPontosDaRota();
  console.log("Pontos da rota carregados:", pontosDaRota);

  if (pontosDaRota.length === 0) {
    console.error("Nenhum ponto da rota foi carregado.");
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      center: { lat: -23.55052, lng: -46.633309 }
    });
    return;
  }

  // Cria o mapa
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: pontosDaRota[0],
    mapId: 'DEMO_MAP_ID'
  });

  // Adiciona o botão de salvar no mapa
  adicionarBotaoSalvar(map);

  // Cria e desenha a linha da rota fixa no mapa
  rotaFixa = new google.maps.Polyline({
    path: pontosDaRota,
    geodesic: true,
    strokeColor: '#0066ff',
    strokeOpacity: 1.0,
    strokeWeight: 5,
    editable: false // Desliguei o editable nativo da polyline para usar nossos marcadores customizados
  });

  rotaFixa.setMap(map);

  // --- LÓGICA DE EDIÇÃO ---

  // Cria marcadores visíveis para cada ponto da rota
  pontosDaRota.forEach((ponto, index) => {
    criarMarcadorEditavel(ponto, index);
  });

  // Inicia o rastreamento do ônibus (apenas visualização)
  iniciarRastreamento();
}

// Função auxiliar para criar marcadores com lógica de exclusão e arrasto
function criarMarcadorEditavel(posicao, indexInicial) {
  const marker = new google.maps.Marker({
    position: posicao,
    map: map,
    draggable: true,
    title: `Arraste para mover, Clique Dir. para excluir`,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 5,
      fillColor: "#FFFFFF",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "#0066ff"
    }
  });

  // Evento: Arrastando (atualiza visualmente a linha)
  marker.addListener('drag', function (event) {
    const currentIdx = markers.indexOf(marker); // Pega o índice atual no array
    if (currentIdx !== -1) {
      const newPosition = event.latLng;
      const path = rotaFixa.getPath();
      path.setAt(currentIdx, newPosition);
    }
  });

  // Evento: Fim do arrasto (atualiza os dados)
  marker.addListener('dragend', function (event) {
    const currentIdx = markers.indexOf(marker);
    if (currentIdx !== -1) {
      const newPosition = event.latLng;
      updateRoutePoint(currentIdx, newPosition);
    }
  });

  // Evento: Clique com botão direito (EXCLUIR PONTO)
  marker.addListener('rightclick', function () {
    const currentIdx = markers.indexOf(marker);
    if (currentIdx !== -1) {
      // Remove do mapa
      marker.setMap(null);

      // Remove dos arrays de dados
      markers.splice(currentIdx, 1);
      pontosDaRota.splice(currentIdx, 1);

      // Atualiza a linha no mapa
      rotaFixa.setPath(pontosDaRota);

      console.log(`Ponto removido. Restam ${pontosDaRota.length} pontos.`);
    }
  });

  markers.push(marker);
}

// Cria o botão de salvar na interface do Google Maps
function adicionarBotaoSalvar(map) {
  const controlDiv = document.createElement("div");
  controlDiv.style.margin = "10px";

  const controlUI = document.createElement("div");
  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.borderRadius = "3px";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.marginBottom = "22px";
  controlUI.style.textAlign = "center";
  controlUI.title = "Clique para salvar as alterações da rota";
  controlDiv.appendChild(controlUI);

  const controlText = document.createElement("div");
  controlText.style.color = "rgb(25,25,25)";
  controlText.style.fontFamily = "Roboto,Arial,sans-serif";
  controlText.style.fontSize = "16px";
  controlText.style.lineHeight = "38px";
  controlText.style.paddingLeft = "5px";
  controlText.style.paddingRight = "5px";
  controlText.innerHTML = "💾 Salvar Rota (Bus 03)";
  controlUI.appendChild(controlText);

  controlUI.addEventListener("click", salvarRotaNaAPI);

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(controlDiv);
}

// Função para enviar os dados para a API
async function salvarRotaNaAPI() {
  const url = "https://busstop-b9ov.onrender.com/locations";
  const busId = "bus_03"; // ID definido conforme sua solicitação anterior

  if (pontosDaRota.length === 0) {
    alert("Não há pontos na rota para salvar.");
    return;
  }

  // Confirmação para evitar envios acidentais de muitos dados
  const confirmacao = confirm(`Isso enviará ${pontosDaRota.length} pontos individualmente para o ID '${busId}'. Deseja continuar?`);
  if (!confirmacao) return;

  console.log(`Iniciando envio de ${pontosDaRota.length} pontos para ${url}...`);

  let erros = 0;
  let sucessos = 0;

  // Itera sobre cada ponto e faz uma requisição POST individual
  for (let i = 0; i < pontosDaRota.length; i++) {
    const p = pontosDaRota[i];

    // Garante que pegamos o valor numérico, seja de um objeto literal ou de um objeto Google Maps
    const lat = typeof p.lat === 'function' ? p.lat() : p.lat;
    const lng = typeof p.lng === 'function' ? p.lng() : p.lng;

    const payload = {
      busId: busId,
      latitude: lat,
      longitude: lng
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        sucessos++;
      } else {
        console.error(`Erro ao enviar ponto ${i}: ${response.status}`);
        erros++;
      }
    } catch (error) {
      console.error(`Erro de conexão no ponto ${i}:`, error);
      erros++;
    }
  }

  if (erros === 0) {
    alert(`Sucesso! ${sucessos} pontos enviados para o ${busId}.`);
  } else {
    alert(`Processo finalizado. Sucessos: ${sucessos}, Erros: ${erros}. Verifique o console (F12) para detalhes.`);
  }
}

// Garante que a função esteja acessível globalmente
window.initMap = initMap;

// **3. Função de Rastreamento do Ônibus:**
async function iniciarRastreamento() {
  try {
    const response = await fetch("https://busstop-b9ov.onrender.com/locations/all/bus_02");
    if (!response.ok) throw new Error(`Erro: ${response.status}`);

    const data = await response.json();
    const novaPosicao = data.map(p => ({ lat: p.latitude, lng: p.longitude }));

    let i = 0;
    setInterval(async () => {
      try {
        if (novaPosicao[i]) {
          atualizarMarcador(novaPosicao[i]);
        }
        i++;
        if (i >= novaPosicao.length) i = 0;
      } catch (error) {
        console.error("Erro ao atualizar a posição do ônibus:", error);
      }
    }, 3000);
  } catch (e) {
    console.error("Erro ao iniciar rastreamento", e);
  }
}

// **4. Função para Mover o Marcador:**
function atualizarMarcador(posicao) {
  if (marcadorOnibus) {
    marcadorOnibus.setPosition(posicao);
  } else {
    marcadorOnibus = new google.maps.Marker({
      position: posicao,
      map: map,
      title: 'Ônibus em Movimento',
      icon: {
        url: 'https://maps.gstatic.com/mapfiles/ms/micons/bus.png',
        scaledSize: new google.maps.Size(40, 40),
      }
    });
  }
}

function updateRoutePoint(index, newPosition) {
  console.log(`Ponto ${index} movido para: ${newPosition.lat()}, ${newPosition.lng()}`);
  // Atualiza o array local de dados
  pontosDaRota[index] = { lat: newPosition.lat(), lng: newPosition.lng() };
}
