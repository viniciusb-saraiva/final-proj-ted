const API_URL = "http://localhost:5000";

const LOGGED_DATA_KEY = "empresaLogada";

let loggedCompany = null;

/**
 * Exibe uma mensagem Toast customizada.
 * @param {string} message - A mensagem a ser exibida.
 * @param {('success'|'danger'|'warning')} type - O tipo de alerta (cor).
 */
const showMessage = (message, type = "success") => {
  const container = document.querySelector("#message-container");
  if (!container) return;

  const toastHtml = `
    <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", toastHtml);

  const toastEl = container.lastElementChild;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();

  // Remove o elemento após a animação de esconder
  toastEl.addEventListener("hidden.bs.toast", () => {
    toastEl.remove();
  });
};

/**
 * Cria o HTML para um item de vaga na lista.
 * @param {object} vaga - O objeto vaga a ser renderizado.
 * @returns {HTMLLIElement} O elemento <li> da vaga.
 */
const createVagaElement = (vaga) => {
  const li = document.createElement("li");

  li.classList.add(
    "list-group-item",
    "d-flex",
    "justify-content-between",
    "align-items-start"
  );

  const requisitosDisplay = Array.isArray(vaga.requisitos)
    ? vaga.requisitos.join(" | ")
    : vaga.requisitos.replace(/,/g, " | ");

  li.innerHTML = `
    <div class="ms-2 me-auto">
      <div class="fw-bold">${vaga.titulo} - ${vaga.localizacao}</div>
      <p class="mb-1 small">Remuneração: ${vaga.remuneracao}</p>
      <p class="mb-1 small">
          <small>
            Site da empresa:
            <a href="${vaga.site_empresa}" target="_blank">Link do site</a>
          </small> 
        </p>
      <p class="mb-1 small text-muted text-truncate">Requisitos: ${requisitosDisplay}</p>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-sm btn-warning btn-edit" data-id="${vaga.id}" title="Editar Vaga">
        <i class="bi bi-pencil-square"></i>
      </button>
      <button class="btn btn-sm btn-danger btn-remove" data-id="${vaga.id}" title="Remover Vaga">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;

  // Adiciona listeners aos botões
  li.querySelector(".btn-edit").addEventListener("click", () =>
    editVaga(vaga.id)
  );
  li.querySelector(".btn-remove").addEventListener("click", () =>
    showConfirmRemove(vaga.id, vaga.titulo)
  );

  return li;
};

const renderMyVagas = async () => {
  const lista = document.querySelector("#minhas-vagas-lista");
  lista.innerHTML = "";

  if (!loggedCompany || !loggedCompany.cnpj) {
    lista.innerHTML = `<li class="list-group-item text-center text-danger">Erro: Dados da empresa não disponíveis.</li>`;
    return;
  }

  try {
    // Codifica o CNPJ para que a barra "/" seja lida corretamente na URL
    const encodedCNPJ = encodeURIComponent(loggedCompany.cnpj);

    const response = await fetch(`${API_URL}/vagas/empresa/${encodedCNPJ}`);
    const vagas = await response.json();

    if (response.ok && Array.isArray(vagas)) {
      if (vagas.length === 0) {
        lista.innerHTML = `<li class="list-group-item text-center text-muted">Nenhuma vaga cadastrada.</li>`;
        return;
      }
      vagas.forEach((vaga) => {
        lista.appendChild(createVagaElement(vaga));
      });
    } else {
      lista.innerHTML = `<li class="list-group-item text-center text-danger">Erro ao carregar vagas: ${
        vagas.message || "Erro desconhecido"
      }.</li>`;
    }
  } catch (error) {
    console.error("Erro ao buscar vagas:", error);
    lista.innerHTML = `<li class="list-group-item text-center text-danger">Erro de comunicação com o servidor.</li>`;
  }
};

const handleVagaSubmit = async (event) => {
  event.preventDefault();

  const id = document.querySelector("#vaga-id").value;
  const titulo = document.querySelector("#titulo").value.trim();
  const localizacao = document.querySelector("#localizacao").value.trim();
  const remuneracao = document.querySelector("#remuneracao").value.trim();
  const requisitos = document
    .querySelector("#requisitos")
    .value.split(",")
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
  const site_empresa = document.querySelector("#site-empresa").value.trim();

  if (!titulo || !localizacao || !remuneracao || requisitos.length === 0 || !site_empresa) {
    showMessage("Por favor, preencha todos os campos obrigatórios.", "warning");
    return;
  }

  const vagaData = {
    titulo,
    localizacao,
    remuneracao,
    requisitos,
    site_empresa,
    cnpj_empresa: loggedCompany.cnpj,
    nome_empresa: loggedCompany.nome,
  };

  try {
    let response;
    let method;
    let url;

    if (id) {
      // Atualizar Vaga (PUT /vagas/:id)
      method = "PUT";
      // Endpoint alterado: /vagas/:id (sem /api)
      url = `${API_URL}/vagas/${id}`;
    } else {
      // Adicionar Vaga (POST /vagas)
      method = "POST";
      // Endpoint alterado: /vagas (sem /api)
      url = `${API_URL}/vagas`;
    }

    response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vagaData),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(data.message, "success");

      document.querySelector("#form-vaga").reset();
      document.querySelector("#vaga-id").value = "";
      document.querySelector("#submit-btn").textContent = "Adicionar Vaga";

      renderMyVagas();
    } else {
      showMessage(
        data.message || `Erro ao ${id ? "atualizar" : "adicionar"} vaga.`,
        "danger"
      );
    }
  } catch (error) {
    console.error("Erro ao comunicar com a API:", error);
    showMessage(
      "Ocorreu um erro de rede. Verifique se o servidor está rodando.",
      "danger"
    );
  }
};

/**
 * Preenche o formulário com os dados de uma vaga para edição.
 * @param {number} id - O ID da vaga a ser editada.
 */
const editVaga = async (id) => {
  try {
    // Codifica o CNPJ para que a barra "/" seja lida corretamente na URL
    const encodedCNPJ = encodeURIComponent(loggedCompany.cnpj);

    const response = await fetch(`${API_URL}/vagas/empresa/${encodedCNPJ}`);
    const vagas = await response.json();

    const vagaToEdit = vagas.find((v) => v.id === id);

    if (vagaToEdit) {
      document.querySelector("#vaga-id").value = vagaToEdit.id;
      document.querySelector("#titulo").value = vagaToEdit.titulo;
      document.querySelector("#localizacao").value = vagaToEdit.localizacao;
      document.querySelector("#remuneracao").value = vagaToEdit.remuneracao;
      document.querySelector("#site-empresa").value = vagaToEdit.site_empresa;
      document.querySelector("#requisitos").value = Array.isArray(
        vagaToEdit.requisitos
      )
        ? vagaToEdit.requisitos.join(", ")
        : vagaToEdit.requisitos;

      document.querySelector("#submit-btn").textContent = "Salvar Edição";
      showMessage(`Editando vaga: ${vagaToEdit.titulo}`, "warning");
      window.scrollTo(0, 0);
    } else {
      showMessage("Vaga não encontrada.", "danger");
    }
  } catch (error) {
    console.error("Erro ao buscar vaga para edição:", error);
    showMessage("Erro ao buscar dados da vaga.", "danger");
  }
};

/**
 * Mostra o modal de confirmação antes de remover.
 * @param {number} id - O ID da vaga a ser removida.
 * @param {string} titulo - O título da vaga.
 */
const showConfirmRemove = (id, titulo) => {
  // Se o modal não existe, cria ele dinamicamente (para evitar alert())
  let modalEl = document.getElementById("confirmRemoveModal");
  if (!modalEl) {
    modalEl = document.createElement("div");
    modalEl.id = "confirmRemoveModal";
    modalEl.classList.add("modal", "fade");
    modalEl.setAttribute("tabindex", "-1");
    modalEl.setAttribute("aria-hidden", "true");
    modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">Confirmação de Exclusão</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p id="modal-remove-text"></p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-danger" id="confirm-remove-btn">Confirmar Exclusão</button>
                    </div>
                </div>
            </div>
        `;
    document.body.appendChild(modalEl);
  }

  document.getElementById(
    "modal-remove-text"
  ).textContent = `Tem certeza que deseja remover a vaga "${titulo}"? Esta ação é irreversível.`;
  const confirmBtn = document.getElementById("confirm-remove-btn");

  // Remove handlers antigos para evitar múltiplas chamadas
  const newConfirmHandler = () => {
    removeVaga(id);
    bootstrap.Modal.getInstance(modalEl).hide();
    confirmBtn.removeEventListener("click", newConfirmHandler);
  };

  confirmBtn.addEventListener("click", newConfirmHandler);

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
};

/**
 * Remove uma vaga permanentemente.
 * @param {number} id - O ID da vaga a ser removida.
 */
const removeVaga = async (id) => {
  if (!loggedCompany || !loggedCompany.cnpj) {
    showMessage("Erro de autenticação para remover a vaga.", "danger");
    return;
  }

  try {
    // Endpoint alterado: /vagas/:id (sem /api)
    const response = await fetch(`${API_URL}/vagas/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      // Precisamos enviar o CNPJ para validar que a empresa tem permissão para remover
      body: JSON.stringify({ cnpj_empresa: loggedCompany.cnpj }),
    });

    const data = await response.json();

    if (response.ok) {
      showMessage(data.message, "success");

      // Se a vaga removida era a que estava em edição, limpa o formulário
      if (document.querySelector("#vaga-id").value === id) {
        document.querySelector("#form-vaga").reset();
        document.querySelector("#vaga-id").value = "";
        document.querySelector("#submit-btn").textContent = "Adicionar Vaga";
      }

      renderMyVagas();
    } else {
      showMessage(data.message || "Erro ao remover vaga.", "danger");
    }
  } catch (error) {
    console.error("Erro ao remover vaga:", error);
    showMessage(
      "Ocorreu um erro de rede. Verifique se o servidor está rodando.",
      "danger"
    );
  }
};

const checkLoginState = () => {
  const loggedDataJSON = localStorage.getItem(LOGGED_DATA_KEY);

  if (!loggedDataJSON) {
    showMessage("Acesso negado. Faça login como empresa.", "warning");
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1500);
    return;
  }

  try {
    loggedCompany = JSON.parse(loggedDataJSON);
    document.querySelector(
      "#empresa-info"
    ).textContent = `Empresa: ${loggedCompany.nome}`;
    renderMyVagas();
  } catch (e) {
    console.error("Erro ao analisar dados de login.", e);
    showMessage("Sua sessão expirou. Faça login novamente.", "danger");
    handleLogout(false);
  }
};

const handleLogout = (showMsg = true) => {
  localStorage.removeItem(LOGGED_DATA_KEY);
  loggedCompany = null;
  if (showMsg) showMessage("Deslogado com sucesso.", "success");

  setTimeout(
    () => {
      window.location.href = "./login.html";
    },
    showMsg ? 1000 : 0
  );
};

document.addEventListener("DOMContentLoaded", () => {
  checkLoginState();

  const form = document.querySelector("#form-vaga");
  const logoutBtn = document.querySelector("#logout-btn");

  if (form) {
    form.addEventListener("submit", handleVagaSubmit);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => handleLogout(true));
  }
});
