const API_URL = "http://localhost:5000";

// Aplica a máscara de CNPJ no campo de entrada.
const formatCNPJ = () => {
  const input = document.querySelector("#cnpj");
  if (!input) return;

  const inputValue = input.value.replace(/\D/g, "");
  let formattedValue = "";

  // Formato CNPJ: 11.222.333/4444-55
  if (inputValue.length === 14) {
    formattedValue = inputValue.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  } else {
    // Permite que o usuário digite o CNPJ sem a máscara completa
    let value = inputValue;
    if (value.length > 2) value = value.replace(/^(\d{2})(\d)/, "$1.$2");
    if (value.length > 6)
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    if (value.length > 9) value = value.replace(/(\d{3})(\d)/, "$1/$2");
    if (value.length > 13) value = value.replace(/(\d{4})(\d)/, "$1-$2");
    formattedValue = value;
  }

  input.value = formattedValue;
};

const handleCadastro = async (event) => {
  event.preventDefault();

  const inputNome = document.querySelector("#nome");
  const inputCNPJ = document.querySelector("#cnpj");
  const inputSenha = document.querySelector("#password");

  const nome = inputNome.value.trim();
  const cnpj = inputCNPJ.value.trim();
  const senha = inputSenha.value;

  if (nome.length < 3) {
    alert("O nome da empresa deve ter pelo menos 3 caracteres!");
    return;
  }

  // A validação completa é pelo tamanho da string formatada
  if (cnpj.length !== 18) {
    alert("O CNPJ deve estar no formato completo (11.222.333/4444-55)!");
    return;
  }

  if (senha.length < 6) {
    alert("A senha deve ter no mínimo 6 caracteres!");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/empresas/cadastro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, cnpj, senha }),
    });

    const data = await response.json();

    if (response.ok) {
      // Cadastro realizado com sucesso (status 201)
      alert(data.message + " Você pode fazer login agora.");
      window.location.href = "./login.html";
    } else if (response.status === 409) {
      // CNPJ já cadastrado (status 409 - Conflict)
      alert(data.message);
    } else {
      // Outros erros de validação (400) ou servidor (500)
      alert("Erro ao cadastrar: " + (data.message || "Erro desconhecido."));
    }
  } catch (error) {
    console.error("Erro ao comunicar com a API de cadastro:", error);
    alert("Ocorreu um erro de rede. Verifique se o servidor está rodando.");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const inputCNPJ = document.querySelector("#cnpj");

  if (inputCNPJ) {
    inputCNPJ.addEventListener("input", formatCNPJ);
  }

  if (form) {
    form.addEventListener("submit", handleCadastro);
  }
});
