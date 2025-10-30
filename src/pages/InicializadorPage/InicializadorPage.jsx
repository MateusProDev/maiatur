import React, { useState } from "react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "./InicializadorPage.css";

const InicializadorPage = () => {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState("");

  const inicializar = async () => {
    setLoading(true);
    setResultado("");

    try {
      // 1. Criar lista de passeios
      await setDoc(doc(db, "listas", "passeios"), {
        items: [
          "Beach Park",
          "Cumbuco",
          "Jericoacoara",
          "Canoa Quebrada",
          "Morro Branco e Praia das Fontes",
          "Lagoinha",
          "Flecheiras",
          "Cumbuco com Passeio de Buggy",
          "City Tour Fortaleza",
          "Praia do Futuro"
        ],
        atualizadoEm: new Date().toISOString(),
      });

      // 2. Criar lista de veículos
      await setDoc(doc(db, "listas", "veiculos"), {
        items: [
          "Carro até 4 pessoas",
          "Van até 10 pessoas",
          "Micro-ônibus até 20 pessoas",
          "Ônibus até 40 pessoas",
          "Transfer Executivo",
          "Transfer Premium",
          "Buggy",
          "4x4"
        ],
        atualizadoEm: new Date().toISOString(),
      });

      // 3. Criar documento modelo (para fixar schema)
      await setDoc(doc(db, "reservas", "_modelo"), {
        tipo: "passeio",
        status: "pendente",
        responsavel: {
          nome: "",
          email: "",
          ddi: "+55",
          telefone: "",
        },
        quantidades: {
          adultos: 0,
          criancas: 0,
          malas: 0,
        },
        passageiros: [],
        pagamento: {
          forma: "Pix",
          valorTotal: 0,
        },
        observacoes: "",
        detalhes: {},
        criadoEm: new Date(),
        _isModelo: true,
      });

      setResultado("✅ Inicialização concluída com sucesso!\n\n" +
        "- ✓ Lista de passeios criada\n" +
        "- ✓ Lista de veículos criada\n" +
        "- ✓ Documento modelo criado\n\n" +
        "O sistema está pronto para receber reservas.");

    } catch (error) {
      console.error("Erro ao inicializar:", error);
      setResultado(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inicializador-page">
      <div className="inicializador-container">
        <h1>🔧 Inicializador do Sistema</h1>
        <p>
          Este inicializador irá criar as estruturas necessárias no Firestore:
        </p>
        
        <ul className="lista-acoes">
          <li>Coleção <code>listas/passeios</code> com exemplos de passeios</li>
          <li>Coleção <code>listas/veiculos</code> com tipos de veículos</li>
          <li>Documento modelo em <code>reservas/_modelo</code></li>
        </ul>

        <div className="alerta">
          <strong>⚠️ Atenção:</strong> Execute isso apenas uma vez. Se já foram criados, 
          esta ação irá sobrescrever os dados existentes.
        </div>

        <button
          onClick={inicializar}
          disabled={loading}
          className="btn-inicializar"
        >
          {loading ? "Inicializando..." : "Inicializar Sistema"}
        </button>

        {resultado && (
          <div className={`resultado ${resultado.includes("✅") ? "sucesso" : "erro"}`}>
            <pre>{resultado}</pre>
          </div>
        )}

        <div className="info-adicional">
          <h3>Próximos Passos</h3>
          <ol>
            <li>Execute a inicialização clicando no botão acima</li>
            <li>Configure as regras de segurança do Firestore</li>
            <li>Deploy das Cloud Functions</li>
            <li>Configure as variáveis de ambiente do SMTP</li>
            <li>Teste o sistema completo</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default InicializadorPage;
