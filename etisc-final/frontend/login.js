const API_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const inputCNPJ = document.querySelector("#cnpj");
  const inputSenha = document.querySelector("#password");

  const LOGGED_DATA_KEY = "empresaLogada";

  if (!form || !inputCNPJ || !inputSenha) {
    console.error("Elementos do formulário de login não encontrados.");
    return;
  }

  // Máscara de CNPJ
  const formatCNPJ = () => {
    let value = inputCNPJ.value.replace(/\D/g, "");
    if (value.length > 2) value = value.replace(/^(\d{2})(\d)/, "$1.$2");
    if (value.length > 6)
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    if (value.length > 9) value = value.replace(/(\d{3})(\d)/, "$1/$2");
    if (value.length > 13) value = value.replace(/(\d{4})(\d)/, "$1-$2");
    inputCNPJ.value = value;
  };

  inputCNPJ.addEventListener("input", formatCNPJ);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cnpj = inputCNPJ.value.trim();
    const senha = inputSenha.value;

    if (cnpj.length !== 18) {
      alert("Digite um CNPJ válido e completo!");
      return;
    }
    if (senha.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/empresas/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cnpj, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login bem-sucedido (status 200)
        // Salva os dados da empresa (sem a senha, que é o que o servidor retorna)
        localStorage.setItem(LOGGED_DATA_KEY, JSON.stringify(data.empresa));

        alert(data.message);
        window.location.href = "./vagas-cadastro.html";
      } else {
        // Erro de credenciais (401) ou validação (400/500)
        alert("Erro no Login: " + (data.message || "Erro desconhecido."));
      }
    } catch (error) {
      console.error("Erro ao comunicar com a API de login:", error);
      alert("Ocorreu um erro de rede. Verifique se o servidor está rodando.");
    }
  });
});
