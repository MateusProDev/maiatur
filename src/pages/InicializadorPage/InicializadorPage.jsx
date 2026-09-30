import React, { useState } from "react";
import { collection, doc, setDoc, getDocs, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "./InicializadorPage.css";

/*
 * Imagens padrão dos serviços, servidas pelo Cloudinary (f_auto,q_auto:eco).
 * Os PNGs locais antigos (aviaoservico.png, jericoaquaraservico.png,
 * fortalezacityservico.png) foram removidos por pesarem ~1,4 MB cada.
 */
const SERVICES_DEFAULT_IMAGE = {
  transfer: 'https://res.cloudinary.com/dqejvdl8w/image/upload/f_auto,q_auto:eco,dpr_auto,c_fill,w_600,h_600/services/q459tqsslmbtdmp5hojb.jpg',
  passeio: 'https://res.cloudinary.com/dqejvdl8w/image/upload/f_auto,q_auto:eco,dpr_auto,c_fill,w_600,h_600/services/fniea42zhtccycew2ogm.jpg',
  citytour: 'https://res.cloudinary.com/dqejvdl8w/image/upload/f_auto,q_auto:eco,dpr_auto,c_fill,w_600,h_600/services/awotkycgcb1cyqzezj6x.jpg'
};

const DEFAULT_SERVICES = [
  {
    id: 1731340800000,
    title: 'Transfers & Receptivo',
    description: 'Transporte seguro do aeroporto ao hotel com conforto e pontualidade',
    image: SERVICES_DEFAULT_IMAGE.transfer,
    alt: 'Transfers e Receptivo em Fortaleza',
    color: '#21A657',
    link: '/pacotes',
    linkText: 'Saiba mais'
  },
  {
    id: 1731340800001,
    title: 'Passeios Privativos',
    description: 'Experiências exclusivas com roteiros personalizados para você',
    image: SERVICES_DEFAULT_IMAGE.passeio,
    alt: 'Passeios Privativos em Fortaleza',
    color: '#EE7C35',
    link: '/pacotes',
    linkText: 'Saiba mais'
  },
  {
    id: 1731340800002,
    title: 'City Tours',
    description: 'Conheça as principais atrações e cultura local com nossos guias',
    image: SERVICES_DEFAULT_IMAGE.citytour,
    alt: 'City Tour em Fortaleza',
    color: '#F8C144',
    link: '/pacotes',
    linkText: 'Saiba mais'
  }
];

const InicializadorPage = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMigracao, setLoadingMigracao] = useState(false);
  const [loadingServicos, setLoadingServicos] = useState(false);
  const [resultado, setResultado] = useState("");
  const [resultadoMigracao, setResultadoMigracao] = useState("");
  const [resultadoServicos, setResultadoServicos] = useState("");
  const [loadingCriarFaltantes, setLoadingCriarFaltantes] = useState(false);
  const [resultadoCriarFaltantes, setResultadoCriarFaltantes] = useState("");

  const inicializarServicos = async () => {
    setLoadingServicos(true);
    setResultadoServicos("");

    try {
      const servicesData = {
        active: true,
        badge: 'Experiências Personalizadas',
        title: 'Nossos Serviços',
        subtitle: 'Cada detalhe pensado para tornar sua viagem perfeita',
        services: DEFAULT_SERVICES
      };

      await setDoc(doc(db, 'content', 'servicesSection'), servicesData);
      
      setResultadoServicos(
        "✅ 3 serviços inicializados com sucesso!\n" +
        "   1. Transfers & Receptivo (verde)\n" +
        "   2. Passeios Privativos (laranja)\n" +
        "   3. City Tours (amarelo)\n\n" +
        "Acesse /admin/services para gerenciar!"
      );
    } catch (error) {
      console.error("Erro ao inicializar serviços:", error);
      setResultadoServicos(`❌ Erro: ${error.message}`);
    } finally {
      setLoadingServicos(false);
    }
  };

  const criarCamposFaltantes = async () => {
    setLoadingCriarFaltantes(true);
    setResultadoCriarFaltantes("");

    try {
      let resumoMensagens = [];

      const listas = [
        {
          id: 'passeios',
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
          ]
        },
        {
          id: 'veiculos',
          items: [
            "Carro até 4 pessoas",
            "Van até 10 pessoas",
            "Micro-ônibus até 20 pessoas",
            "Ônibus até 40 pessoas",
            "Transfer Executivo",
            "Transfer Premium",
            "Buggy",
            "4x4"
          ]
        },
        {
          id: 'hoteis',
          items: [
            "Hotel Praia Centro",
            "Resort Beach Park",
            "Hotel Beira Mar",
            "Pousada Iracema",
            "Hotel Sonata de Iracema",
            "Vila Galé Fortaleza",
            "Gran Marquise Hotel",
            "Seara Praia Hotel",
            "Outro (especificar no campo observações)"
          ]
        },
        {
          id: 'aeroportos',
          items: [
            "Aeroporto Internacional de Fortaleza (FOR)",
            "Aeroporto de Jericoacoara (JJD)",
            "Aeroporto Regional de Juazeiro do Norte (JDO)"
          ]
        }
      ];

      for (const list of listas) {
        const ref = doc(db, 'listas', list.id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          await setDoc(ref, { items: list.items, atualizadoEm: new Date().toISOString() });
          resumoMensagens.push(`✅ Lista '${list.id}' criada (não existia)`);
        } else {
          const dados = snap.data() || {};
          const existentes = Array.isArray(dados.items) ? dados.items : [];
          const faltantes = list.items.filter(i => !existentes.includes(i));

          if (faltantes.length > 0) {
            const novos = existentes.concat(faltantes);
            await updateDoc(ref, { items: novos, atualizadoEm: new Date().toISOString() });
            resumoMensagens.push(`⚠️ Lista '${list.id}' atualizada — adicionados ${faltantes.length} itens`);
          } else {
            resumoMensagens.push(`⏭️ Lista '${list.id}' já contém todos os itens`);
          }
        }
      }

      const modeloRef = doc(db, 'reservas', '_modelo');
      const modeloSnap = await getDoc(modeloRef);
      const modeloPadrao = {
        tipo: 'passeio',
        status: 'pendente',
        responsavel: { nome: '', email: '', ddi: '+55', telefone: '' },
        quantidades: { adultos: 0, criancas: 0, malas: 0 },
        passageiros: [],
        pagamento: { forma: 'Pix', valorTotal: 0 },
        observacoes: '',
        detalhes: {},
        criadoEm: new Date(),
        _isModelo: true
      };

      if (!modeloSnap.exists()) {
        await setDoc(modeloRef, modeloPadrao);
        resumoMensagens.push("✅ Documento 'reservas/_modelo' criado (não existia)");
      } else {
        const atual = modeloSnap.data() || {};
        const updates = {};

        Object.keys(modeloPadrao).forEach(k => {
          if (typeof atual[k] === 'undefined') updates[k] = modeloPadrao[k];
        });

        if (Object.keys(updates).length > 0) {
          await updateDoc(modeloRef, updates);
          resumoMensagens.push(`⚠️ 'reservas/_modelo' atualizado — adicionados campos: ${Object.keys(updates).join(', ')}`);
        } else {
          resumoMensagens.push("⏭️ 'reservas/_modelo' já possui todos os campos necessários");
        }
      }

      const servicesRef = doc(db, 'content', 'servicesSection');
      const servicesSnap = await getDoc(servicesRef);
      const servicesDefault = {
        active: true,
        badge: 'Experiências Personalizadas',
        title: 'Nossos Serviços',
        subtitle: 'Cada detalhe pensado para tornar sua viagem perfeita',
        services: DEFAULT_SERVICES
      };

      if (!servicesSnap.exists()) {
        await setDoc(servicesRef, servicesDefault);
        resumoMensagens.push("✅ 'content/servicesSection' criado (não existia)");
      } else {
        const atual = servicesSnap.data() || {};
        const existentes = Array.isArray(atual.services) ? atual.services : [];
        const existentesIds = existentes.map(s => s.id);
        const faltantes = servicesDefault.services.filter(s => !existentesIds.includes(s.id));

        if (faltantes.length > 0) {
          const merged = existentes.concat(faltantes);
          const updates = { services: merged };
          if (!atual.title) updates.title = servicesDefault.title;
          if (!atual.subtitle) updates.subtitle = servicesDefault.subtitle;
          if (!atual.badge) updates.badge = servicesDefault.badge;
          await updateDoc(servicesRef, updates);
          resumoMensagens.push(`⚠️ 'content/servicesSection' atualizado — adicionados ${faltantes.length} serviços`);
        } else {
          resumoMensagens.push("⏭️ 'content/servicesSection' já possui os 3 serviços padrões");
        }
      }

      setResultadoCriarFaltantes(resumoMensagens.join('\n'));
    } catch (error) {
      console.error('Erro ao criar campos faltantes:', error);
      setResultadoCriarFaltantes(`❌ Erro: ${error.message}`);
    } finally {
      setLoadingCriarFaltantes(false);
    }
  };

  const inicializar = async () => {
    setLoading(true);
    setResultado("");

    try {
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

      await setDoc(doc(db, "listas", "hoteis"), {
        tipo: "hoteis",
        ativo: true,
        ordem: 1,
        items: [
          "Hotel Praia Centro",
          "Resort Beach Park",
          "Hotel Beira Mar",
          "Pousada Iracema",
          "Hotel Sonata de Iracema",
          "Vila Galé Fortaleza",
          "Gran Marquise Hotel",
          "Seara Praia Hotel",
          "Outro (especificar no campo observações)"
        ],
        atualizadoEm: new Date().toISOString(),
      });

      await setDoc(doc(db, "listas", "aeroportos"), {
        tipo: "aeroportos",
        ativo: true,
        ordem: 2,
        items: [
          "Aeroporto Internacional de Fortaleza (FOR)",
          "Aeroporto de Jericoacoara (JJD)",
          "Aeroporto Regional de Juazeiro do Norte (JDO)"
        ],
        atualizadoEm: new Date().toISOString(),
      });

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
        "- ✓ Lista de passeios criada (10 destinos)\n" +
        "- ✓ Lista de veículos criada (8 opções)\n" +
        "- ✓ Lista de hotéis criada (9 opções)\n" +
        "- ✓ Lista de aeroportos criada (3 aeroportos)\n" +
        "- ✓ Documento modelo criado\n\n" +
        "O sistema está pronto para receber reservas.\n" +
        "Acesse: /admin/reservas para gerenciar reservas.\n" +
        "Acesse: /admin/pacotes para adicionar pacotes com categorias.");

    } catch (error) {
      console.error("Erro ao inicializar:", error);
      setResultado(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const migrarCategoriaPacotes = async () => {
    setLoadingMigracao(true);
    setResultadoMigracao("");
    
    try {
      console.log('🔄 Iniciando migração de categorias...');
      
      const querySnapshot = await getDocs(collection(db, 'pacotes'));
      let atualizados = 0;
      let jaExistentes = 0;
      let mensagens = [];
      
      for (const docSnap of querySnapshot.docs) {
        const dados = docSnap.data();
        
        if (!dados.categoria) {
          await updateDoc(doc(db, 'pacotes', docSnap.id), {
            categoria: 'passeio'
          });
          mensagens.push(`✅ "${dados.titulo}" → categoria "passeio" adicionada`);
          atualizados++;
        } else {
          mensagens.push(`⏭️  "${dados.titulo}" → já tem categoria "${dados.categoria}"`);
          jaExistentes++;
        }
      }
      
      setResultadoMigracao(
        `✅ Migração concluída!\n\n` +
        `📊 Resumo:\n` +
        `- ${atualizados} pacotes atualizados\n` +
        `- ${jaExistentes} pacotes já tinham categoria\n` +
        `- Total: ${querySnapshot.size} pacotes\n\n` +
        `Detalhes:\n${mensagens.join('\n')}`
      );
      
    } catch (error) {
      console.error('❌ Erro durante migração:', error);
      setResultadoMigracao(`❌ Erro: ${error.message}`);
    } finally {
      setLoadingMigracao(false);
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

        <button
          onClick={criarCamposFaltantes}
          disabled={loadingCriarFaltantes}
          className="btn-inicializar"
          style={{ backgroundColor: "#f59e0b", marginLeft: 8 }}
        >
          {loadingCriarFaltantes ? "Executando..." : "Criar Campos Faltantes (não sobrescrever)"}
        </button>

        {resultadoCriarFaltantes && (
          <div className={`resultado ${resultadoCriarFaltantes.includes("✅") ? "sucesso" : "erro"}`}>
            <pre>{resultadoCriarFaltantes}</pre>
          </div>
        )}

        <hr style={{ margin: "40px 0", border: "1px solid #ddd" }} />

        <h2>🔄 Migrar Categorias dos Pacotes</h2>
        <p>
          Se você criou pacotes ANTES desta atualização, execute esta migração para
          adicionar o campo <code>categoria</code> aos pacotes existentes.
        </p>

        <div className="alerta">
          <strong>ℹ️ Info:</strong> Esta ação adiciona categoria="passeio" aos pacotes
          que não possuem este campo. Pacotes com categoria já definida não serão alterados.
        </div>

        <button
          onClick={migrarCategoriaPacotes}
          disabled={loadingMigracao}
          className="btn-inicializar"
          style={{ backgroundColor: "#2196F3" }}
        >
          {loadingMigracao ? "Migrando..." : "Migrar Categorias"}
        </button>

        {resultadoMigracao && (
          <div className={`resultado ${resultadoMigracao.includes("✅") ? "sucesso" : "erro"}`}>
            <pre>{resultadoMigracao}</pre>
          </div>
        )}

        <hr style={{ margin: "40px 0", border: "1px solid #ddd" }} />

        <h2>🎯 Inicializar Seção de Serviços</h2>
        <p>
          Cria/atualiza a seção "Nossos Serviços" na homepage com 3 serviços padrão:
        </p>

        <ul className="lista-acoes">
          <li>✅ Transfers & Receptivo (verde #21A657)</li>
          <li>✅ Passeios Privativos (laranja #EE7C35)</li>
          <li>✅ City Tours (amarelo #F8C144)</li>
        </ul>

        <div className="alerta">
          <strong>ℹ️ Info:</strong> Esta ação cria o documento <code>content/servicesSection</code>
          com os 3 serviços. Você poderá gerenciar em <code>/admin/services</code> depois.
        </div>

        <button
          onClick={inicializarServicos}
          disabled={loadingServicos}
          className="btn-inicializar"
          style={{ backgroundColor: "#10b981" }}
        >
          {loadingServicos ? "Inicializando..." : "🚀 Inicializar 3 Serviços"}
        </button>

        {resultadoServicos && (
          <div className={`resultado ${resultadoServicos.includes("✅") ? "sucesso" : "erro"}`}>
            <pre>{resultadoServicos}</pre>
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
