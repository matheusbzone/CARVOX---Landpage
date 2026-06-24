import { Property, FaqItem } from "./types";

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "prop-1",
    protocol: "BR-SP-3501608-F43A-8C21",
    name: "Fazenda Estrela D'Oeste",
    city: "Areias",
    state: "SP",
    zipCode: "12820-000",
    areaHa: 154.2,
    ownerName: "José da Silva Santos",
    ownerCpf: "123.456.789-00",
    status: "Ativo",
    submissionDate: "12/04/2021",
    appAreaHa: 12.4,
    legalReserveHa: 30.84,
    vegetationAreaHa: 45.2,
    notifications: [],
  },
  {
    id: "prop-2",
    protocol: "BR-MG-3118607-D832-2A1F",
    name: "Sítio Recanto Verde",
    city: "Contagem",
    state: "MG",
    zipCode: "32000-000",
    areaHa: 45.8,
    ownerName: "José da Silva Santos",
    ownerCpf: "123.456.789-00",
    status: "Pendente",
    submissionDate: "05/08/2023",
    appAreaHa: 4.2,
    legalReserveHa: 9.16,
    vegetationAreaHa: 11.5,
    notifications: [
      "Sobreposição detectada com limite de Unidade de Conservação vizinha. Favor revisar o georreferenciamento.",
      "Comprovação de posse do imóvel rural pendente de envio de escritura ou documento equivalente."
    ],
  },
  {
    id: "prop-3",
    protocol: "BR-MT-5103403-E92A-4B7C",
    name: "Estância Mato Grosso",
    city: "Cuiabá",
    state: "MT",
    zipCode: "78000-000",
    areaHa: 1240.5,
    ownerName: "Maria Eduarda Medeiros",
    ownerCpf: "987.654.321-11",
    status: "Ativo",
    submissionDate: "20/10/2022",
    appAreaHa: 98.6,
    legalReserveHa: 434.175,
    vegetationAreaHa: 512.3,
    notifications: [],
  },
  {
    id: "prop-4",
    protocol: "BR-PA-1501402-B12D-9E8F",
    name: "Fazenda Rio Amazonas",
    city: "Belém",
    state: "PA",
    zipCode: "66000-000",
    areaHa: 520.4,
    ownerName: "Carlos Alberto Souza",
    ownerCpf: "456.789.123-22",
    status: "Retificado",
    submissionDate: "14/01/2024",
    appAreaHa: 41.5,
    legalReserveHa: 416.32,
    vegetationAreaHa: 430.1,
    justification: "Correção das coordenadas do limite norte após nova medição com GPS geodésico de alta precisão.",
    notifications: [],
  }
];

export const MOCK_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    category: "Geral",
    question: "O que é o Cadastro Ambiental Rural (CAR)?",
    answer: "O CAR é um registro público eletrônico nacional, obrigatório para todos os imóveis rurais. Sua finalidade é integrar as informações ambientais das propriedades e posses rurais, compondo uma base de dados para controle, monitoramento, planejamento ambiental e econômico, além de combate ao desmatamento."
  },
  {
    id: "faq-2",
    category: "Inscrição",
    question: "Quem é obrigado a se inscrever no CAR?",
    answer: "Todos os imóveis rurais do país (propriedades ou posses, públicas ou privadas) devem ser obrigatoriamente inscritos no CAR. Isso inclui assentamentos de reforma agrária, áreas de povos indígenas e comunidades tradicionais."
  },
  {
    id: "faq-3",
    category: "Inscrição",
    question: "Quais são os documentos necessários para a inscrição?",
    answer: "É necessário possuir os dados do proprietário/possuidor (CPF ou CNPJ), comprovante de propriedade ou posse (escritura, contrato de compra e venda, etc.), e a planta com o perímetro do imóvel, as áreas de vegetação nativa, Áreas de Preservação Permanente (APP), de Uso Restrito e de Reserva Legal."
  },
  {
    id: "faq-4",
    category: "Reserva Legal",
    question: "O que é Reserva Legal e qual o percentual exigido?",
    answer: "A Reserva Legal é uma área localizada no interior da propriedade rural que deve ser preservada para o uso sustentável dos recursos naturais e a conservação da biodiversidade. Os percentuais mínimos variam de acordo com a região:\n- 80% em imóveis na Floresta Amazônica (Amazônia Legal);\n- 35% em imóveis no Cerrado (Amazônia Legal);\n- 20% nas demais regiões do país (Campos Gerais da Amazônia Legal e todo o resto do Brasil)."
  },
  {
    id: "faq-5",
    category: "Retificação",
    question: "Quando devo retificar meu cadastro do CAR?",
    answer: "A retificação deve ser feita sempre que houver necessidade de alterar qualquer informação declarada anteriormente, como a correção de limites georreferenciados do imóvel, inclusão ou exclusão de proprietários, alteração de áreas de uso do solo, ou em atendimento a notificações de irregularidades emitidas pelo órgão ambiental."
  },
  {
    id: "faq-6",
    category: "Módulo",
    question: "Como funciona o Módulo de Cadastro off-line?",
    answer: "O Módulo de Cadastro off-line é um programa que pode ser baixado e instalado no computador do usuário. Ele permite preencher todas as informações cadastrais e geográficas do imóvel mesmo sem conexão com a internet. Após concluir o preenchimento, o programa gera um arquivo com extensão '.car', que deve ser enviado ao sistema por meio deste portal na opção 'Envie seu CAR'."
  }
];
