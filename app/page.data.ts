export const GOOGLE_CALENDAR_URL =
  "https://calendar.app.google/MA3xeKtepvt2ANqP7";
export const LEAD_CAPTURE_URL = process.env.NEXT_PUBLIC_LEAD_CAPTURE_URL ?? "";

export const problemPoints = [
  "Procesos duplicados",
  "Decisiones lentas",
  "Sistemas desconectados",
  "Equipos desalineados",
];

export const diagnosticAreas = [
  {
    name: "Estrategia",
    detail: "Claridad de foco, prioridades y mecanismos reales de ejecucion.",
  },
  {
    name: "Gobierno",
    detail: "Roles, decisiones, escalamiento y control para operar sin friccion.",
  },
  {
    name: "Operaciones",
    detail: "Flujos, cuellos de botella y fricciones que erosionan margen.",
  },
  {
    name: "Datos",
    detail: "Calidad de informacion para decidir con velocidad y precision.",
  },
  {
    name: "Tecnologia",
    detail: "Arquitectura, integraciones y herramientas que sostienen la operacion.",
  },
];

export const benefits = [
  "Recuperar rentabilidad sin aumentar ventas",
  "Mejor toma de decisiones",
  "Mayor control del negocio",
  "Menor dependencia del fundador",
];

export const insights = [
  {
    id: "ventas",
    eyebrow: "Insight 01",
    title: "El mercado cree que el problema es ventas.",
    body: [
      "Pero cuando el margen cae mientras la operacion crece, el problema no esta afuera.",
      "Esta en como esta disenada la empresa.",
    ],
  },
  {
    id: "crecimiento",
    eyebrow: "Insight 02",
    title: "Crecer sin estructura solo acelera la perdida.",
    body: [
      "Mas clientes sobre una operacion fragil no corrigen el sistema.",
      "Escalan reprocesos, desgaste y decisiones cada vez mas lentas.",
    ],
  },
  {
    id: "fundador",
    eyebrow: "Insight 03",
    title: "Cuando todo depende del fundador, el negocio se vuelve cuello de botella.",
    body: [
      "La dependencia centralizada frena ritmo, control y capacidad de delegar.",
      "No es liderazgo: es una arquitectura que no logro madurar.",
    ],
  },
  {
    id: "datos",
    eyebrow: "Insight 04",
    title: "Sin datos confiables, la empresa opera por intuicion costosa.",
    body: [
      "La sensacion de avance puede esconder fugas de margen, retrabajo y desalineacion.",
      "La falta de lectura estructural hace que el problema se vea tarde.",
    ],
  },
];

export const questions = [
  {
    id: 1,
    text: "Cuantas personas tiene tu empresa?",
    options: ["1-10", "10-30", "30-100", "100+"],
  },
  {
    id: 2,
    text: "Tienes claridad real de tu margen de ganancia por linea, cliente o unidad de negocio?",
    options: ["Si total", "Parcial", "No"],
  },
  {
    id: 3,
    text: "Las decisiones clave dependen de ti?",
    options: ["Si", "Parcial", "No"],
  },
  {
    id: 4,
    text: "Existen reprocesos o retrabajos frecuentes?",
    options: ["Muchos", "Algunos", "Pocos"],
  },
  {
    id: 5,
    text: "Tus sistemas de tecnologia y datos comparten informacion confiable entre areas?",
    options: ["Si", "Parcial", "No"],
  },
  {
    id: 6,
    text: "Sientes que tu operacion esta desordenada?",
    options: ["Si", "Algo", "No"],
  },
];

export type Question = (typeof questions)[number];

export type RadarDimensionKey =
  | "estrategia"
  | "operaciones"
  | "datos"
  | "tecnologia"
  | "gobierno";

export type RadarDatum = {
  dimension: string;
  key: RadarDimensionKey;
  ideal: number;
  actual: number;
  fullMark: 100;
};

export const MARKETING_RADAR_DATA: RadarDatum[] = [
  {
    dimension: "ESTRATEGIA",
    key: "estrategia",
    ideal: 90,
    actual: 54,
    fullMark: 100,
  },
  {
    dimension: "OPERACIONES",
    key: "operaciones",
    ideal: 92,
    actual: 44,
    fullMark: 100,
  },
  {
    dimension: "DATOS",
    key: "datos",
    ideal: 88,
    actual: 39,
    fullMark: 100,
  },
  {
    dimension: "TECNOLOGIA",
    key: "tecnologia",
    ideal: 89,
    actual: 57,
    fullMark: 100,
  },
  {
    dimension: "GOBIERNO",
    key: "gobierno",
    ideal: 87,
    actual: 46,
    fullMark: 100,
  },
];

export type RadarInterpretation = {
  message: string;
  alert: string;
};

export function getRadarStructuralScore(data: RadarDatum[]) {
  const total = data.reduce((sum, item) => sum + item.actual, 0);

  return Math.round(total / data.length);
}

export function getRadarInterpretation(score: number): RadarInterpretation {
  if (score < 60) {
    return {
      message: "Estructura inestable.",
      alert: "Estas perdiendo dinero por desorden estructural.",
    };
  }

  if (score < 80) {
    return {
      message: "Estructura funcional con fricciones.",
      alert: "Hay fugas que estan frenando tu crecimiento.",
    };
  }

  return {
    message: "Estructura solida.",
    alert:
      "Aun con una base estable, pequenas fugas pueden erosionar margen si no se corrigen.",
  };
}

export function getScoreValue(answers: string[]) {
  let score = 0;

  answers.forEach((answer) => {
    if (answer === "No") score += 2;
    if (answer === "Parcial" || answer === "Algo") score += 1;
    if (answer === "Muchos") score += 2;
  });

  return score;
}

export function calculateScore(answers: string[]) {
  const score = getScoreValue(answers);

  if (score >= 7) return "ALTO";
  if (score >= 4) return "MEDIO";
  return "BAJO";
}

export function getResultText(level: string) {
  if (level === "ALTO") {
    return {
      title: "Fuga estructural critica detectada",
      desc: "Tu empresa probablemente esta perdiendo entre 10% y 20% de sus ingresos sin verlo.",
    };
  }

  if (level === "MEDIO") {
    return {
      title: "Fuga estructural relevante",
      desc: "Hay senales claras de perdida entre 5% y 10% de tus ingresos.",
    };
  }

  return {
    title: "Estructura estable (por ahora)",
    desc: "No hay senales criticas, pero el crecimiento puede amplificar errores ocultos.",
  };
}
