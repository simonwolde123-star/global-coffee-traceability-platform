/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageCode = "en" | "es" | "fr" | "pt" | "it" | "am";

export interface TranslationDictionary {
  // Navigation & General
  appName: string;
  worldwideCoops: string;
  activeIngress: string;
  signOut: string;
  currentDate: string;
  systemStatus: string;
  dataEncrypted: string;
  oflineIndicator: string;
  onlineIndicator: string;

  // Tabs
  tabMap: string;
  tabTraceability: string;
  tabBlockchain: string;
  tabAgronomy: string;
  tabMedia: string;
  tabEcom: string;
  tabEcosystem: string;

  // Auth Screen
  authTitle: string;
  secureIngress: string;
  secureIngressLocal: string;
  coopTraceability: string;
  loginTab: string;
  registerTab: string;
  fullNameLabel: string;
  usernameLabel: string;
  emailLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  loginButton: string;
  registerButton: string;
  demoAccessButton: string;
  demoCredentialsNote: string;
  authSuccessMessage: string;
  authErrorMessage: string;
  emailVerificationSubject: string;
  emailVerificationBody: string;
  enterVerificationCode: string;
  verificationSent: string;
  codeInvalid: string;
  verifySuccess: string;
  emailSimulatorTitle: string;
  verifyInputPlaceholder: string;
  resendCode: string;

  // Traceability Center
  traceTitle: string;
  activeCoffees: string;
  registerBatch: string;
  cancelForm: string;
  searchPlaceholder: string;
  cupScoreLabel: string;
  newLotLabel: string;
  lotIdLabel: string;
  farmOriginLabel: string;
  washingStationLabel: string;
  processingLabel: string;
  varietyLabel: string;
  fermentationLabel: string;
  moistureLabel: string;
  cuppingLabel: string;
  assembleButton: string;
  journeyTimeline: string;
  auditTitle: string;
  scaleMetric: string;
  
  // Traceability Steps
  stepHarvest: string;
  stepMilling: string;
  stepCurring: string;
  stepGrading: string;
  stepDispatch: string;
  stepDate: string;
  stepFerm: string;
  stepMoist: string;
  stepGrade: string;
  stepWeight: string;

  // Traceability Verification
  verifyTitle: string;
  verifySubtitle: string;
  verifyPlaceholder: string;
  verifyButton: string;
  verifiedOwner: string;

  // Printable Story Certificate
  certHeader: string;
  certTitle: string;
  certSub: string;
  printButton: string;
  downloadPdfButton: string;
  growerParticulars: string;
  territoryGeology: string;
  guaranteesLabel: string;
  guaranteesList: string[];
  lotSpecifics: string;
  cupperIndices: string;
  cupperNotes: string;
  certEcosystem: string;
  certFootnote: string;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: "BeanTrace Global",
    worldwideCoops: "Worldwide Cooperatives",
    activeIngress: "Active Ingress",
    signOut: "Terminal Sign Out",
    currentDate: "Current Date",
    systemStatus: "System Status: Optimal",
    dataEncrypted: "Data Encrypted & Distributed",
    oflineIndicator: "Local Mode",
    onlineIndicator: "Network Online",
    tabMap: "Operational Maps",
    tabTraceability: "Traceability Center",
    tabBlockchain: "Cryptographic Ledger",
    tabAgronomy: "Agronomy Forecaster",
    tabMedia: "Origin Media Vault",
    tabEcom: "Specialty B2B Trade",
    tabEcosystem: "Industry Ecosystem",

    authTitle: "BeanTrace Global",
    secureIngress: "Secure Global Ingress",
    secureIngressLocal: "No-Link Client Mode",
    coopTraceability: "Specialty Coffee Traceability Blockchain",
    loginTab: "Log In",
    registerTab: "Create Account",
    fullNameLabel: "Full Name",
    usernameLabel: "Username or Email Address",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm Password",
    loginButton: "Authorize Login Space",
    registerButton: "Create Global Partner Account",
    demoAccessButton: "Quick Demo Access (Elena Rostova)",
    demoCredentialsNote: "Seeded user credentials: auditor / password securePass123",
    authSuccessMessage: "Access Granted!",
    authErrorMessage: "Authentication failed. Please verify credentials.",
    emailVerificationSubject: "Your BeanTrace Security Verification Code",
    emailVerificationBody: "Welcome to BeanTrace Global. Please use the following 6-digit confirmation code to validate and approve your secure audit account:",
    enterVerificationCode: "Verify Your Global Account",
    verificationSent: "Verification code sent! Please check your Inbound Satellite Mailbox simulator below to verify your account.",
    codeInvalid: "Invalid verification code. Please request a new code or try again.",
    verifySuccess: "Account verified successfully! Welcome to BeanTrace Global.",
    emailSimulatorTitle: "Inbound Satellite Mail Server (Simulated Inbox)",
    verifyInputPlaceholder: "6-Digit Code",
    resendCode: "Resend Secure Code",

    traceTitle: "Traceability Journey Timeline",
    activeCoffees: "Active Coffees",
    registerBatch: "Register Batch",
    cancelForm: "Cancel Form",
    searchPlaceholder: "Search lot e.g., AA03...",
    cupScoreLabel: "Cup Score",
    newLotLabel: "New Cooperative Lot",
    lotIdLabel: "Lot Identifier*",
    farmOriginLabel: "Farm Origin",
    washingStationLabel: "Washing Station",
    processingLabel: "Processing",
    varietyLabel: "Variety",
    fermentationLabel: "Ferm (Hr)",
    moistureLabel: "Moist (%)",
    cuppingLabel: "Cupping",
    assembleButton: "Assemble Lot Registry",
    journeyTimeline: "Traceability Journey Timeline",
    auditTitle: "Coffee Audit",
    scaleMetric: "SCA Score",

    stepHarvest: "1. HARVEST & ORIGIN",
    stepMilling: "2. WET MILLING",
    stepCurring: "3. MOISTURE CURING",
    stepGrading: "4. GRADING MILL",
    stepDispatch: "5. DISPATCH TRANSIT",
    stepDate: "Date",
    stepFerm: "Ferm",
    stepMoist: "Moisture",
    stepGrade: "Grade",
    stepWeight: "Weight",

    verifyTitle: "Global Purchaser Verification Tool",
    verifySubtitle: "Enter buyer token credentials or company name to audit the Fairtrade block ledger lock.",
    verifyPlaceholder: "e.g. Royal Import Co...",
    verifyButton: "Validate Buyer",
    verifiedOwner: "Certified Owner lock",

    certHeader: "FAIRTRADE COOPERATIVE AUDITING CERTIFICATE",
    certTitle: "BeanTrace Certified Specialty Coffee",
    certSub: "High-Altitude Sustainable Agricultural Roster",
    printButton: "Print Story Card",
    downloadPdfButton: "Download Traceability Report",
    growerParticulars: "Grower Particulars",
    territoryGeology: "Territory Geology",
    guaranteesLabel: "Fairtrade Guarantees",
    guaranteesList: [
      "Certified Shade Forest Grown",
      "Verified Chemical-Free Sourcing",
      "Social Premium Premium Paid Lock"
    ],
    lotSpecifics: "Lot Specifics",
    cupperIndices: "Cuppers Grading Indices",
    cupperNotes: "Primary notes: Intensely citric acidity, jasmine fragrance, distinct floral sweet blackcurrant tones.",
    certEcosystem: "Ecosystem Certs",
    certFootnote: "Origina Traceability Core · Fully Compliant Global Ledger Standards"
  },
  es: {
    appName: "BeanTrace Global",
    worldwideCoops: "Cooperativas Mundiales",
    activeIngress: "Ingreso Activo",
    signOut: "Cerrar Sesión de Terminal",
    currentDate: "Fecha Actual",
    systemStatus: "Estado: Óptimo",
    dataEncrypted: "Datos Cifrados y Distribuidos",
    oflineIndicator: "Modo Local",
    onlineIndicator: "Red En Línea",
    tabMap: "Mapas Operativos",
    tabTraceability: "Centro de Trazabilidad",
    tabBlockchain: "Libro Criptográfico",
    tabAgronomy: "Pronóstico Agronómico",
    tabMedia: "Bóveda de Medios de Origen",
    tabEcom: "Comercio B2B de Especialidad",
    tabEcosystem: "Ecosistema del Sector",

    authTitle: "BeanTrace Global",
    secureIngress: "Ingreso Global Seguro",
    secureIngressLocal: "Modo Cliente sin Enlace",
    coopTraceability: "Blockchain de Trazabilidad de Café de Especialidad",
    loginTab: "Iniciar Sesión",
    registerTab: "Crear Cuenta",
    fullNameLabel: "Nombre Completo",
    usernameLabel: "Usuario o Correo Electrónico",
    emailLabel: "Dirección de Correo",
    passwordLabel: "Contraseña",
    confirmPasswordLabel: "Confirmar Contraseña",
    loginButton: "Autorizar Espacio de Acceso",
    registerButton: "Crear Cuenta de Socio Global",
    demoAccessButton: "Acceso Demo Rápido (Elena Rostova)",
    demoCredentialsNote: "Credenciales: auditor / contraseña securePass123",
    authSuccessMessage: "¡Acceso Concedido!",
    authErrorMessage: "Fallo de autenticación. Verifique las credenciales.",
    emailVerificationSubject: "Su Código de Verificación de Seguridad BeanTrace",
    emailVerificationBody: "Bienvenido a BeanTrace Global. Utilice el siguiente código de confirmación de 6 dígitos para validar y aprobar su cuenta de auditoría segura:",
    enterVerificationCode: "Verifique su Cuenta Global",
    verificationSent: "¡Código de verificación enviado! Revise el simulador de bandeja de entrada satelital de abajo para verificar su cuenta.",
    codeInvalid: "Código de verificación no válido. Solicite un nuevo código o intente de nuevo.",
    verifySuccess: "¡Cuenta verificada con éxito! Bienvenido a BeanTrace Global.",
    emailSimulatorTitle: "Servidor de Correo Satelital (Bandeja de Entrada Simulada)",
    verifyInputPlaceholder: "Código de 6 dígitos",
    resendCode: "Reenviar Código Seguro",

    traceTitle: "Línea de Tiempo del Viaje de Trazabilidad",
    activeCoffees: "Cafés Activos",
    registerBatch: "Registrar Lote",
    cancelForm: "Cancelar Formulario",
    searchPlaceholder: "Buscar lote ej., AA03...",
    cupScoreLabel: "Puntuación de Taza",
    newLotLabel: "Nuevo Lote de Cooperativa",
    lotIdLabel: "Identificador de Lote*",
    farmOriginLabel: "Origen de Finca",
    washingStationLabel: "Estación de Lavado",
    processingLabel: "Procesamiento",
    varietyLabel: "Variedad",
    fermentationLabel: "Ferm (Hr)",
    moistureLabel: "Humedad (%)",
    cuppingLabel: "Atribución de Taza",
    assembleButton: "Ensamblar Registro de Lote",
    journeyTimeline: "Línea de Tiempo del Viaje de Trazabilidad",
    auditTitle: "Auditoría de Café",
    scaleMetric: "Puntaje SCA",

    stepHarvest: "1. COSECHA Y ORIGEN",
    stepMilling: "2. BENEFICIO HÚMEDO",
    stepCurring: "3. CURADO DE HUMEDAD",
    stepGrading: "4. BENEFICIO SECO Y TRÍA",
    stepDispatch: "5. DESPACHO Y TRÁNSITO",
    stepDate: "Fecha",
    stepFerm: "Ferm",
    stepMoist: "Humedad",
    stepGrade: "Grado",
    stepWeight: "Peso",

    verifyTitle: "Herramienta de Verificación de Comprador",
    verifySubtitle: "Ingrese las credenciales del comprador o el nombre corporativo para verificar el seguro Blockchain.",
    verifyPlaceholder: "ej. Royal Import Co...",
    verifyButton: "Validar Comprador",
    verifiedOwner: "Bloqueo de Propietario Certificado",

    certHeader: "CERTIFICADO DE AUDITORÍA DE COOPERATIVA DE COMERCIO JUSTO",
    certTitle: "Café de Especialidad Certificado BeanTrace",
    certSub: "Registro de Agricultura Sostenible de Alta Altura",
    printButton: "Imprimir Tarjeta de Historia",
    downloadPdfButton: "Descargar Reporte de Trazabilidad",
    growerParticulars: "Detalles del Productor",
    territoryGeology: "Geología del Territorio",
    guaranteesLabel: "Garantías del Comercio Justo",
    guaranteesList: [
      "Cultivado Bajo Sombra en Bosque Certificado",
      "Abastecimiento Libre de Químicos Verificado",
      "Bloqueo de Pago de Prima de Desarrollo Social"
    ],
    lotSpecifics: "Especificaciones del Lote",
    cupperIndices: "Índice de Catación de Catadores",
    cupperNotes: "Notas principales: Acidez cítrica intensa, fragancia de jazmín, tonos definidos de grosella negra dulce.",
    certEcosystem: "Certificaciones Ecológicas",
    certFootnote: "Núcleo de Trazabilidad de Bean_Trace · Cumplimiento de Estándares de Libros Globales"
  },
  fr: {
    appName: "BeanTrace Global",
    worldwideCoops: "Coopératives Mondiales",
    activeIngress: "Accès Actif",
    signOut: "Déconnexion du Terminal",
    currentDate: "Date Actuelle",
    systemStatus: "Statut Système: Optimal",
    dataEncrypted: "Données Cryptées & Distribuées",
    oflineIndicator: "Mode Local",
    onlineIndicator: "Réseau en Ligne",
    tabMap: "Cartographie Opérationnelle",
    tabTraceability: "Centre de Traçabilité",
    tabBlockchain: "Registre Cryptographique",
    tabAgronomy: "Prévisions Agronomiques",
    tabMedia: "Coffre-fort des Médias",
    tabEcom: "Commerce B2B de Spécialité",
    tabEcosystem: "Écosystème du Secteur",

    authTitle: "BeanTrace Global",
    secureIngress: "Accès Global Sécurisé",
    secureIngressLocal: "Mode Client Sans Liaison",
    coopTraceability: "Blockchain de Traçabilité du Café de Spécialité",
    loginTab: "Se Connecter",
    registerTab: "Créer un Compte",
    fullNameLabel: "Nom Complet",
    usernameLabel: "Nom d'utilisateur ou Adresse Email",
    emailLabel: "Adresse Email",
    passwordLabel: "Mot de passe",
    confirmPasswordLabel: "Confirmer le Mot de passe",
    loginButton: "Autoriser l'Espace d'Accès",
    registerButton: "Créer un Compte Partenaire Global",
    demoAccessButton: "Accès Démo Rapide (Elena Rostova)",
    demoCredentialsNote: "Identifiants: auditor / mot de passe securePass123",
    authSuccessMessage: "Accès Autorisé!",
    authErrorMessage: "Échec d'authentification. Veuillez vérifier vos identifiants.",
    emailVerificationSubject: "Votre Code de Vérification de Sécurité BeanTrace",
    emailVerificationBody: "Bienvenue sur BeanTrace Global. Veuillez utiliser le code de confirmation à 6 chiffres suivant pour valider et approuver votre compte d'audit sécurisé:",
    enterVerificationCode: "Vérifiez Votre Compte Global",
    verificationSent: "Code de vérification envoyé! Veuillez vérifier le simulateur de boîte de réception satellite ci-dessous pour vérifier votre compte.",
    codeInvalid: "Code de vérification invalide. Veuillez demander un nouveau code ou réessayer.",
    verifySuccess: "Compte vérifié avec succès! Bienvenue sur BeanTrace Global.",
    emailSimulatorTitle: "Serveur de Messagerie Satellite (Boîte de Réception Simulée)",
    verifyInputPlaceholder: "Code à 6 chiffres",
    resendCode: "Renvoyer le Code Sécurisé",

    traceTitle: "Chronologie du Parcours de Traçabilité",
    activeCoffees: "Cafés Actifs",
    registerBatch: "Enregistrer un Lot",
    cancelForm: "Annuler le Formulaire",
    searchPlaceholder: "Rechercher un lot ex., AA03...",
    cupScoreLabel: "Score de Tasse",
    newLotLabel: "Nouveau Lot Coopératif",
    lotIdLabel: "Identifiant du Lot*",
    farmOriginLabel: "Origine de la Ferme",
    washingStationLabel: "Station de Lavage",
    processingLabel: "Traitement",
    varietyLabel: "Variété",
    fermentationLabel: "Ferm (Hr)",
    moistureLabel: "Humidité (%)",
    cuppingLabel: "Notes de Tasse",
    assembleButton: "Assembler le Registre du Lot",
    journeyTimeline: "Chronologie du Parcours de Traçabilité",
    auditTitle: "Audit du Café",
    scaleMetric: "Score SCA",

    stepHarvest: "1. RÉCOLTE & ORIGINE",
    stepMilling: "2. TRAITEMENT HUMIDE",
    stepCurring: "3. SÉCHAGE & AFFINAGE",
    stepGrading: "4. USINAGE & CALIBRAGE",
    stepDispatch: "5. EXPÉDITION & TRANSIT",
    stepDate: "Date",
    stepFerm: "Ferm",
    stepMoist: "Humidité",
    stepGrade: "Grade",
    stepWeight: "Poids",

    verifyTitle: "Outil de Vérification de l'Acheteur",
    verifySubtitle: "Saisissez les informations de l'acheteur ou le nom de l'entreprise pour auditer le verrouillage de la blockchain.",
    verifyPlaceholder: "ex. Royal Import Co...",
    verifyButton: "Valider l'Acheteur",
    verifiedOwner: "Verrou Propriétaire Certifié",

    certHeader: "CERTIFICAT D'AUDIT DE COOPÉRATIVE COMMERCE EQUITABLE",
    certTitle: "Café de Spécialité Certifié BeanTrace",
    certSub: "Registre d'Agriculture Durable de Haute Altitude",
    printButton: "Imprimer la Fiche descriptive",
    downloadPdfButton: "Télécharger le Rapport de Traçabilité",
    growerParticulars: "Informations sur le Producteur",
    territoryGeology: "Géologie du Territoire",
    guaranteesLabel: "Garanties du Commerce Équitable",
    guaranteesList: [
      "Cultivé sous Ombrage Forestier Certifié",
      "Approvisionnement Sans Produits Chimiques Vérifié",
      "Verrouillage du Paiement de la Prime Sociale"
    ],
    lotSpecifics: "Spécifications du Lot",
    cupperIndices: "Indices d'Évaluation des Catateurs",
    cupperNotes: "Notes principales: Acidité citrique intense, parfum de jasmin, notes florales distinctes de cassis doux.",
    certEcosystem: "Certifications Écologiques",
    certFootnote: "BeanTrace Traçabilité · Registre Conforme aux Standards Internationaux"
  },
  pt: {
    appName: "BeanTrace Global",
    worldwideCoops: "Cooperativas Mundiais",
    activeIngress: "Acesso Ativo",
    signOut: "Sair do Terminal",
    currentDate: "Data Atual",
    systemStatus: "Status do Sistema: Ideal",
    dataEncrypted: "Dados Criptografados e Distribuídos",
    oflineIndicator: "Modo Local",
    onlineIndicator: "Rede Conectada",
    tabMap: "Mapas Operacionais",
    tabTraceability: "Centro de Rastreabilidade",
    tabBlockchain: "Registro Criptográfico",
    tabAgronomy: "Previsão Agronômica",
    tabMedia: "Cofre de Mídia de Origem",
    tabEcom: "Comércio B2B de Especialidade",
    tabEcosystem: "Ecossistema do Setor",

    authTitle: "BeanTrace Global",
    secureIngress: "Acesso Global Seguro",
    secureIngressLocal: "Modo Cliente sem Conexão",
    coopTraceability: "Blockchain de Rastreabilidade de Café de Especialidade",
    loginTab: "Entrar",
    registerTab: "Criar Conta",
    fullNameLabel: "Nome Completo",
    usernameLabel: "Usuário ou Endereço de E-mail",
    emailLabel: "Endereço de E-mail",
    passwordLabel: "Senha",
    confirmPasswordLabel: "Confirmar Senha",
    loginButton: "Autorizar Espaço de Acesso",
    registerButton: "Criar Conta de Parceiro Global",
    demoAccessButton: "Acesso Demo Rápido (Elena Rostova)",
    demoCredentialsNote: "Credenciais: auditor / senha securePass123",
    authSuccessMessage: "Acesso Permitido!",
    authErrorMessage: "Falha na autenticação. Por favor, verifique suas credenciais.",
    emailVerificationSubject: "Seu Código de Verificação de Segurança BeanTrace",
    emailVerificationBody: "Bem-vindo ao BeanTrace Global. Use o seguinte código de confirmação de 6 dígitos para validar e aprovar sua conta de auditoria segura:",
    enterVerificationCode: "Verifique sua Conta Global",
    verificationSent: "Código de verificação enviado! Verifique o simulatore de caixa de entrada de satélite abaixo para verificar sua conta.",
    codeInvalid: "Código de verificação inválido. Solicite um novo código ou tente novamente.",
    verifySuccess: "Conta verificada com sucesso! Bem-vindo ao BeanTrace Global.",
    emailSimulatorTitle: "Servidor de Correio por Satélite (Caixa de Entrada Simulada)",
    verifyInputPlaceholder: "Código de 6 dígitos",
    resendCode: "Reenviar Código Seguro",

    traceTitle: "Cronologia da Jornada de Rastreabilidade",
    activeCoffees: "Cafés Ativos",
    registerBatch: "Registrar Lote",
    cancelForm: "Cancelar Formulário",
    searchPlaceholder: "Buscar lote ex., AA03...",
    cupScoreLabel: "Pontuação da Taza",
    newLotLabel: "Novo Lote de Cooperativa",
    lotIdLabel: "Identificador de Lote*",
    farmOriginLabel: "Origem da Finca",
    washingStationLabel: "Estação de Lavagem",
    processingLabel: "Processamento",
    varietyLabel: "Variedade",
    fermentationLabel: "Ferm (Hr)",
    moistureLabel: "Umidade (%)",
    cuppingLabel: "Classificação da Taza",
    assembleButton: "Montar Registro de Lote",
    journeyTimeline: "Cronologia da Jornada de Rastreabilidade",
    auditTitle: "Auditoria de Café",
    scaleMetric: "Pontuação SCA",

    stepHarvest: "1. COLHEITA E ORIGEM",
    stepMilling: "2. PROCESSAMENTO ÚMIDO",
    stepCurring: "3. SECAGEM E CURA",
    stepGrading: "4. PROCESSAMENTO SECO",
    stepDispatch: "5. DESPACHO E TRÂNSITO",
    stepDate: "Data",
    stepFerm: "Ferm",
    stepMoist: "Umidade",
    stepGrade: "Classificação",
    stepWeight: "Peso",

    verifyTitle: "Ferramenta de Verificação de Comprador",
    verifySubtitle: "Insira credenciais do comprador ou nome corporativo para auditar o bloqueio da blockchain.",
    verifyPlaceholder: "ex. Royal Import Co...",
    verifyButton: "Validar Comprador",
    verifiedOwner: "Bloqueio de Proprietário Certificado",

    certHeader: "CERTIFICADO DE AUDITORIA DE COOPERATIVA DE COMÉRCIO JUSTO",
    certTitle: "Café de Especialidade Certificado BeanTrace",
    certSub: "Registro de Agricultura Sustentável de Alta Altitude",
    printButton: "Imprimir Relato do Lote",
    downloadPdfButton: "Baixar Relatório de Rastreabilidade",
    growerParticulars: "Detalhes do Produtor",
    territoryGeology: "Geologia do Território",
    guaranteesLabel: "Garantias de Comércio Justo",
    guaranteesList: [
      "Cultivado Sob Sombra de Floresta Certificada",
      "Sourcing Verificado Livre de Produtos Químicos",
      "Bloqueio de Pagamento de Prêmio de Desenvolvimento Social"
    ],
    lotSpecifics: "Especificidades do Lote",
    cupperIndices: "Índice de Pontuação SCA",
    cupperNotes: "Notas principais: Acidez cítrica intensa, aroma de jasmim, tons florais distintos de cassis doce.",
    certEcosystem: "Certificações Ecológicas",
    certFootnote: "Rastreabilidade BeanTrace · Livro Conforme os Padrões Mundiais"
  },
  it: {
    appName: "BeanTrace Global",
    worldwideCoops: "Cooperative Mondiali",
    activeIngress: "Ingresso Attivo",
    signOut: "Disconnetti Terminale",
    currentDate: "Data Corrente",
    systemStatus: "Stato del Sistema: Ottimale",
    dataEncrypted: "Dati Crittografati e Distribuiti",
    oflineIndicator: "Modalità Locale",
    onlineIndicator: "Rete Online",
    tabMap: "Mappe Operative",
    tabTraceability: "Centro di Tracciabilità",
    tabBlockchain: "Registro Crittografico",
    tabAgronomy: "Previsioni Agronomiche",
    tabMedia: "Miglioramento Mediale",
    tabEcom: "Commercio B2B Specialità",
    tabEcosystem: "Ecosistema Industriale",

    authTitle: "BeanTrace Global",
    secureIngress: "Accesso Globale Sicuro",
    secureIngressLocal: "Modalità Locale Senza Connessione",
    coopTraceability: "Blockchain di Tracciabilità del Caffè Speciale",
    loginTab: "Accedi",
    registerTab: "Crea Account",
    fullNameLabel: "Nome Completo",
    usernameLabel: "Nome Utente o Indirizzo Email",
    emailLabel: "Indirizzo Email",
    passwordLabel: "Password",
    confirmPasswordLabel: "Conferma Password",
    loginButton: "Autorizza Spazio di Accesso",
    registerButton: "Crea Account Partner Globale",
    demoAccessButton: "Accesso Rapido Demo (Elena Rostova)",
    demoCredentialsNote: "Credenziali predefinite: auditor / password securePass123",
    authSuccessMessage: "Accesso Consentito!",
    authErrorMessage: "Autenticazione fallita. Verificare le credenziali.",
    emailVerificationSubject: "Codice di Verifica di Sicurezza BeanTrace",
    emailVerificationBody: "Benvenuto su BeanTrace Global. Utilizza il seguente codice di conferma a 6 cifre per convalidare e approvare il tuo account di audit sicuro:",
    enterVerificationCode: "Verifica il Tuo Account Globale",
    verificationSent: "Codice di verifica inviato! Controlla il simulatore di casella satellitare qui sotto per verificare il tuo account.",
    codeInvalid: "Codice di verifica non valido. Richiedi un nuovo codice o riprova.",
    verifySuccess: "Account verificato con successo! Benvenuto in BeanTrace Global.",
    emailSimulatorTitle: "Server di Posta Satellitare (Inbound Inbox Simulato)",
    verifyInputPlaceholder: "Codice a 6 cifre",
    resendCode: "Invia di nuovo il codice",

    traceTitle: "Cronologia del Viaggio di Tracciabilità",
    activeCoffees: "Caffè Attivi",
    registerBatch: "Registra Lotto",
    cancelForm: "Annulla Form",
    searchPlaceholder: "Cerca lotto es. AA03...",
    cupScoreLabel: "Punteggio di Tazza",
    newLotLabel: "Nuovo Lotto Cooperativa",
    lotIdLabel: "Identificatore Lotto*",
    farmOriginLabel: "Origine della Fattoria",
    washingStationLabel: "Stazione di Lavaggio",
    processingLabel: "Lavorazione",
    varietyLabel: "Varietà",
    fermentationLabel: "Ferm (Ore)",
    moistureLabel: "Umidità (%)",
    cuppingLabel: "Assaggio",
    assembleButton: "Assembla Registro Lotto",
    journeyTimeline: "Cronologia del Viaggio di Tracciabilità",
    auditTitle: "Audit del Caffè",
    scaleMetric: "Punteggio SCA",

    stepHarvest: "1. RACCOLTA E ORIGINE",
    stepMilling: "2. LAVORAZIONE SECCA/UMIDA",
    stepCurring: "3. STAGIONATURA E CURA",
    stepGrading: "4. SELEZIONE E CLASSIFICAZIONE",
    stepDispatch: "5. SPEDIZIONE E TRANSITO",
    stepDate: "Data",
    stepFerm: "Ferm",
    stepMoist: "Umidità",
    stepGrade: "Grado",
    stepWeight: "Peso",

    verifyTitle: "Strumento di Verifica Acquirente Globale",
    verifySubtitle: "Inserisci le credenziali dell'acquirente o il nome dell'azienda per verificare il blocco della blockchain.",
    verifyPlaceholder: "es. Royal Import Co...",
    verifyButton: "Convalida Acquirente",
    verifiedOwner: "Blocco Proprietario Certificato",

    certHeader: "CERTIFICATO DI AUDITING COOPERATIVA FAIRTRADE",
    certTitle: "Caffè Speciale Certificato BeanTrace",
    certSub: "Registro Agricolo Sostenibile ad Alta Quota",
    printButton: "Stampa Scheda della Storia",
    downloadPdfButton: "Scarica Rapporto Tracciabilità",
    growerParticulars: "Particolari del Coltivatore",
    territoryGeology: "Geologia del Territorio",
    guaranteesLabel: "Garanzie Fairtrade",
    guaranteesList: [
      "Coltivato all'Ombra della Foresta Certificata",
      "Approvvigionamento Senza Sostanze Chimiche",
      "Blocco Sociale Premium Pagato"
    ],
    lotSpecifics: "Specifiche del Lotto",
    cupperIndices: "Punteggio di Classificazione dei Cupper",
    cupperNotes: "Note primarie: Acidità citrica intensa, profumo di gelsomino, toni fioriti distinti di ribes nero dolce.",
    certEcosystem: "Certificazioni Ecocompatibili",
    certFootnote: "Nucleo Tracciabilità BeanTrace · Conforme agli Standard di Registro Internazionali"
  },
  am: {
    appName: "ቢንትሬስ ግሎባል",
    worldwideCoops: "ዓለም አቀፍ የህብረት ሥራ ማህበራት",
    activeIngress: "ገባሪ መግቢያ",
    signOut: "ከስርዓቱ ውጣ",
    currentDate: "የአሁኑ ቀን",
    systemStatus: "የስርዓት ሁኔታ፡ በጣም ጥሩ",
    dataEncrypted: "የተመሰጠረ እና የተከፋፈለ መረጃ",
    oflineIndicator: "አካባቢያዊ ሁነታ",
    onlineIndicator: "ኔትወርክ መስመር ላይ",
    tabMap: "የክዋኔ ካርታዎች",
    tabTraceability: "የክትትል ማዕከል",
    tabBlockchain: "ክሪፕቶግራፊክ መዝገብ",
    tabAgronomy: "የግብርና ትንበያ",
    tabMedia: "የምንጭ ሚዲያ ካዝና",
    tabEcom: "ልዩ የB2B ንግድ",
    tabEcosystem: "የኢንዱስትሪ ሥነ-ምህዳር",

    authTitle: "ቢንትሬስ ግሎባል",
    secureIngress: "ደህንነቱ የተጠበቀ ዓለም አቀፍ መግቢያ",
    secureIngressLocal: "ያለ ሊንክ የደንበኛ ሁነታ",
    coopTraceability: "ልዩ የቡና መከታተያ ብሎክቼይን",
    loginTab: "ግባ",
    registerTab: "መለያ ፍጠር",
    fullNameLabel: "ሙሉ ስም",
    usernameLabel: "የተጠቃሚ ስም ወይም የኢሜይል አድራሻ",
    emailLabel: "የኢሜይል አድራሻ",
    passwordLabel: "የይለፍ ቃል",
    confirmPasswordLabel: "የይለፍ ቃል ያረጋግጡ",
    loginButton: "የመግቢያ ቦታ ፍቀድ",
    registerButton: "አለም አቀፍ የአጋር መለያ ፍጠር",
    demoAccessButton: "ፈጣን ማሳያ መግቢያ (ኤሌና ሮስቶቫ)",
    demoCredentialsNote: "የተጠቃሚ መለያ፡ auditor / የይለፍ ቃል securePass123",
    authSuccessMessage: "መግባት ተፈቅዷል!",
    authErrorMessage: "ማረጋገጥ አልተሳካም። እባክዎ መረጃውን ያረጋግጡ።",
    emailVerificationSubject: "የቢንትሬስ ደህንነት ማረጋገጫ ኮድ",
    emailVerificationBody: "እንኳን ወደ ቢንትሬስ ግሎባል በደህና መጡ። ደህንነቱ የተጠበቀ የኦዲት መለያዎን ማረጋገጥ እና ማጽደቅ እባክዎ የሚከተሉትን ባለ 6-አሃዝ ኮድ ይጠቀሙ፡",
    enterVerificationCode: "ዓለም አቀፍ መለያዎን ያረጋግጡ",
    verificationSent: "የማረጋገጫ ኮድ ተልኳል! እባክዎ መለያዎን ለማረጋገጥ ከታች ያለውን የኢሜይል ማስመሰያ ሳጥን ይመልከቱ።",
    codeInvalid: "የገባው የማረጋገጫ ኮድ ትክክል አይደለም። እባክዎ አዲስ ኮድ ይጠይቁ ወይም እንደገና ይሞክሩ።",
    verifySuccess: "መለያው በስኬት ተረጋግጧል! እንኳን ወደ ቢንትሬስ ግሎባል በደህና መጡ።",
    emailSimulatorTitle: "ሳተላይት የኢሜይል አገልጋይ (የተመሰለ የገቢ መልዕክት ሳጥን)",
    verifyInputPlaceholder: "ባለ 6-አሃዝ ኮድ",
    resendCode: "ደህንነቱ የተጠበቀ ኮድ እንደገና ላክ",

    traceTitle: "የክትትል ጉዞ የጊዜ መስመር",
    activeCoffees: "አክቲቭ ቡናዎች",
    registerBatch: "ሎት ይመዝግቡ",
    cancelForm: "ፎርሙን ሰርዝ",
    searchPlaceholder: "ሎት ፈልግ ለምሳሌ AA03...",
    cupScoreLabel: "የኩባያ ውጤት",
    newLotLabel: "አዲስ የህብረት ስራ ሎት",
    lotIdLabel: "የሎት መለያ*",
    farmOriginLabel: "የእርሻ ምንጭ",
    washingStationLabel: "የማጠብ ጣቢያ",
    processingLabel: "አሰራር",
    varietyLabel: "ዓይነት",
    fermentationLabel: "የመፍላት ሰዓት (በሰዓት)",
    moistureLabel: "እርጥበት (%)",
    cuppingLabel: "መቅመስ",
    assembleButton: "የሎት መዝገብ ሰብስብ",
    journeyTimeline: "የክትትል ጉዞ የጊዜ መስመር",
    auditTitle: "የቡና ኦዲት",
    scaleMetric: "SCA ውጤት",

    stepHarvest: "1. ምርት እና ምንጭ",
    stepMilling: "2. እርጥብ ማቀነባበሪያ",
    stepCurring: "3. የእርጥበት ማከም",
    stepGrading: "4. ደረጃ አሰጣጥ",
    stepDispatch: "5. ትራንዚት እና መላክ",
    stepDate: "ቀን",
    stepFerm: "የመፍላት ሰዓት",
    stepMoist: "እርጥበት ውሃ",
    stepGrade: "ደረጃ",
    stepWeight: "ክብደት",

    verifyTitle: "ዓለም አቀፍ የገዢ ማረጋገጫ መሳሪያ",
    verifySubtitle: "የገዢውን መለያ ወይም የድርጅቱን ስም በማስገባት የብሎክቼይን መለያ ማረጋገጫን ይመልከቱ።",
    verifyPlaceholder: "ለምሳሌ Royal Import Co...",
    verifyButton: "ገዢውን ያረጋግጡ",
    verifiedOwner: "የተረጋገጠ ባለቤት መለያ",

    certHeader: "የፍትሃዊ ንግድ (FAIRTRADE) የኦዲት ምስክር ወረቀት",
    certTitle: "ቢንትሬስ የተረጋገጠ ልዩ ቡና",
    certSub: "በከፍተኛ ቦታ የሚመረት ዘላቂ የግብርና መዝገብ",
    printButton: "የታሪክ ካርድ ያትሙ",
    downloadPdfButton: "የክትትል ሪፖርት ያውርዱ",
    growerParticulars: "የአምራቹ ዝርዝሮች",
    territoryGeology: "የአካባቢው መልከዓ ምድር",
    guaranteesLabel: "የፍትሃዊ ንግድ ዋስትናዎች",
    guaranteesList: [
      "በጥላ ደን የተረጋገጠ እድገት",
      "ከኬሚካል ነፃ መሆኑ የተረጋገጠ",
      "ለማህበራዊ ልማት የሚከፈል ፕሪሚየም"
    ],
    lotSpecifics: "የሎት ዝርዝር መረጃዎች",
    cupperIndices: "የባለሙያ መቅመስ ደረጃዎች",
    cupperNotes: "ዋና ማስታወሻዎች፡ ከፍተኛ የሲትሪክ አሲድነት፣ የጃስሚን መዓዛ፣ ልዩ የአበቦች እና ጥቁር ኩራንት ጣዕም።",
    certEcosystem: "የስነ-ምህዳር ሰርተፊኬቶች",
    certFootnote: "ቢንትሬስ የክትትል ማዕከል · ዓለም አቀፍ ደረጃዎችን የጠበቀ መዝገብ"
  }
};
