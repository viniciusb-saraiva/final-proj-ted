const API_URL = "http://localhost:5000";

// Chave do localStorage para SESSÃO
const LOGGED_DATA_KEY = "empresaLogada";

let allVagasCache = [];

const fetchAllVagas = async () => {
  try {
    const response = await fetch(`${API_URL}/vagas`);
    if (!response.ok) {
      throw new Error("Erro ao carregar vagas do servidor.");
    }
    const vagas = await response.json();

    vagas.forEach((vaga) => {
      if (typeof vaga.requisitos === "string") {
        vaga.requisitos = vaga.requisitos.split(",");
      }
    });

    allVagasCache = vagas;
    return vagas;
  } catch (error) {
    console.error("Erro ao recuperar vagas:", error);
    const container = document.querySelector("#vagas-container");
    container.innerHTML = `<p class="text-danger">Erro ao carregar vagas. ${error.message}</p>`;
    return [];
  }
};

const createVagaElement = (vaga) => {
  const col = document.createElement("div");
  col.className = "col";

  col.innerHTML = `
    <div class="card h-100 shadow-sm">
      <div class="card-body">
        <h5 class="card-title">${vaga.titulo}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${vaga.nome_empresa}</h6>
        <p class="card-text mb-1">
          <small><strong>Local:</strong> ${vaga.localizacao}</small>
        </p>
        <p class="card-text mb-1">
          <small><strong>Remuneração:</strong> ${vaga.remuneracao}</small>
        </p>
        <p class="card-text mb-1">
          <small><strong>Requisitos:</strong> ${vaga.requisitos.join(", ")}</small>
        </p>
        <p class="card-text mb-1">
          <small>
            <strong>
            Site da empresa:
            <a href="${vaga.site_empresa}" target="_blank">Link do site</a>
            </strong>
          </small> 
        </p>
      </div>
    </div>
  `;
  return col;
};

const renderAllVagas = (vagasToDisplay) => {
  const container = document.querySelector("#vagas-container");
  container.innerHTML = "";

  if (vagasToDisplay.length === 0) {
    container.innerHTML =
      '<div class="col-12"><p class="text-center">Nenhuma vaga de estágio encontrada que corresponda à pesquisa.</p></div>';
    return;
  }

  vagasToDisplay.forEach((vaga) => {
    container.appendChild(createVagaElement(vaga));
  });
};

const filterVagas = (event) => {
  const searchTerm = event.target.value.toLowerCase();

  const vagasFiltradas = allVagasCache.filter((vaga) => {
    const searchString = `${vaga.titulo} ${vaga.nome_empresa} ${
      vaga.localizacao
    } ${vaga.requisitos.join(" ")}`.toLowerCase();
    return searchString.includes(searchTerm);
  });

  renderAllVagas(vagasFiltradas);
};

const checkLoginState = () => {
  const loggedData = localStorage.getItem(LOGGED_DATA_KEY);
  const linkGerenciamento = document.querySelector("#link-gerenciamento");

  if (loggedData) {
    linkGerenciamento.style.display = "block";
  } else {
    linkGerenciamento.style.display = "none";
  }
};

const initializePage = async () => {
  checkLoginState();

  const vagasIniciais = await fetchAllVagas();

  renderAllVagas(vagasIniciais);
};

document.addEventListener("DOMContentLoaded", () => {
  initializePage();

  const searchInput = document.querySelector("#search");

  if (searchInput) {
    searchInput.addEventListener("input", filterVagas);
  }
});
