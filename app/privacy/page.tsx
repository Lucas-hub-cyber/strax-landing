import { LegalPage } from "@/components/legal/LegalPage";
import { STRAX_PRIVACY_VERSION } from "@/lib/legal";

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow={`Politica de datos · version ${STRAX_PRIVACY_VERSION}`}
      title="Política de Tratamiento de Datos STRAX"
      intro="STRAX opera como estándar estructural certificable para evaluar empresas mediante un modelo matemático por capas. Esta política define cómo se trata la información personal, empresarial y estructural usada por el sistema."
      sections={[
        {
          title: "Introducción institucional",
          body: [
            "STRAX no funciona como ERP, CRM ni consultoría tradicional. El sistema procesa información estructural para generar índices, trazabilidad y evidencia técnica sobre la arquitectura empresarial.",
            "El sistema STRAX procesa información estructural con fines de evaluación matemática. La integridad del dato es un principio fundacional del estándar.",
          ],
        },
        {
          title: "Responsable del tratamiento",
          body: [
            "El responsable del tratamiento será la entidad operadora de STRAX indicada en los documentos comerciales o contractuales vigentes. Para solicitudes formales, el canal de contacto será el correo institucional definido por STRAX.",
          ],
        },
        {
          title: "Tipos de datos tratados",
          body: [
            "Datos personales: nombre, correo, rol, identificación de usuario, actividad de acceso y datos asociados a la gestión de cuenta.",
            "Datos empresariales: información sobre industria, operación, procesos, finanzas aproximadas, equipo, herramientas, decisiones, sesiones y contexto del negocio.",
            "Datos estructurales: variables de evaluación por capas E, G, O, D y T, respuestas de diagnóstico, hallazgos, índices IIA, IRA, MIE, IF, hashes, versiones del modelo y logs de ejecución.",
          ],
        },
        {
          title: "Finalidad",
          body: [
            "La información se usa para evaluación matemática, cálculo de índices estructurales, trazabilidad de evaluaciones, certificación, monitoreo STRAX LIVE, generación de reportes, control de sesiones y operación segura de la plataforma.",
            "STRAX puede usar datos agregados o anonimizados para calibrar el estándar y mejorar la robustez del sistema sin identificar titulares específicos.",
          ],
        },
        {
          title: "Naturaleza del sistema",
          body: [
            "STRAX ejecuta un modelo matemático de evaluación estructural. Sus resultados no constituyen asesoría financiera, contable, legal, tributaria, inversión, ERP, CRM ni garantía de desempeño económico.",
          ],
        },
        {
          title: "Derechos del titular",
          body: [
            "Conforme a la Ley 1581 de 2012 de Colombia, el titular puede conocer, actualizar, rectificar, solicitar prueba de autorización, ser informado sobre el uso de sus datos, presentar quejas ante la Superintendencia de Industria y Comercio, revocar autorización y solicitar supresión cuando proceda.",
            "Estas solicitudes se atenderán por los canales institucionales de STRAX, sujeto a verificación de identidad y obligaciones legales o contractuales de conservación.",
          ],
        },
        {
          title: "Seguridad, logs y hash",
          body: [
            "STRAX incorpora versionamiento del modelo, logs de aceptación, trazabilidad de eventos y hash por evaluación para preservar integridad, auditoría y consistencia del dato estructural.",
            "La manipulación de datos, alteración de evidencias o intento de modificar resultados fuera del flujo autorizado puede generar suspensión de acceso o revocatoria de sello.",
          ],
        },
        {
          title: "Conservación",
          body: [
            "Los datos se conservarán durante la relación activa con el usuario o cliente y por el tiempo requerido para trazabilidad del estándar, defensa contractual, auditoría, certificación o cumplimiento legal.",
          ],
        },
        {
          title: "Transferencia internacional",
          body: [
            "STRAX puede usar infraestructura tecnológica o proveedores ubicados fuera de Colombia. Cuando exista transferencia o transmisión internacional, se aplicarán medidas contractuales, técnicas y organizacionales compatibles con el régimen de protección de datos aplicable.",
          ],
        },
        {
          title: "Contacto",
          body: [
            "Para ejercer derechos sobre datos personales o solicitar información sobre tratamiento, el titular deberá usar el canal institucional publicado por STRAX o el correo definido en la relación contractual.",
          ],
        },
      ]}
    />
  );
}
