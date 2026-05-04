import { LegalPage } from "@/components/legal/LegalPage";
import { STRAX_TERMS_VERSION } from "@/lib/legal";

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow={`Terminos · version ${STRAX_TERMS_VERSION}`}
      title="Términos y Condiciones STRAX"
      intro="Estos términos regulan el uso de STRAX como sistema estructural de evaluación empresarial, certificación y monitoreo. El acceso implica aceptación de las reglas técnicas, legales y operativas del estándar."
      sections={[
        {
          title: "Naturaleza del servicio",
          body: [
            "STRAX es un estándar estructural certificable que evalúa empresas mediante un modelo matemático por capas E, G, O, D y T. El sistema calcula índices estructurales, conserva trazabilidad, registra versiones y puede emitir evidencia para certificación.",
            "STRAX no es consultoría tradicional, ERP, CRM, asesoría financiera, asesoría legal, asesoría tributaria ni auditoría contable.",
          ],
        },
        {
          title: "No garantía de resultados",
          body: [
            "Los resultados, índices, hallazgos, reportes, recomendaciones operativas o mapas de riesgo no garantizan aumento de ingresos, reducción de costos, cierre de ventas, rentabilidad futura ni resultado financiero específico.",
            "El usuario reconoce que las decisiones empresariales posteriores al uso de STRAX son responsabilidad de la organización evaluada.",
          ],
        },
        {
          title: "Uso autorizado",
          body: [
            "El usuario debe usar STRAX dentro del flujo autorizado, sin alterar datos, intentar manipular resultados, evadir controles, replicar el estándar sin autorización o usar sellos fuera de licencia.",
          ],
        },
        {
          title: "Responsabilidad del usuario",
          body: [
            "El usuario declara que la información suministrada es verdadera, completa y suficiente según su conocimiento. La calidad del resultado depende de la integridad del dato ingresado.",
            "Si el usuario entrega datos falsos, incompletos o manipulados, STRAX podrá suspender evaluaciones, invalidar resultados, negar certificación o revocar sellos.",
          ],
        },
        {
          title: "Certificación y STRAX LIVE",
          body: [
            "La certificación estructural depende de la evaluación vigente, la consistencia del dato y, cuando aplique, la continuidad de STRAX LIVE activo.",
            "La pérdida de monitoreo, falta de actualización o ausencia de evidencia puede afectar el estado de certificación.",
          ],
        },
        {
          title: "Sello STRAX",
          body: [
            "Todo sello, insignia o marca de certificación STRAX opera como licencia limitada, no exclusiva, no transferible y revocable.",
            "STRAX podrá revocar el uso del sello por manipulación de datos, incumplimiento contractual, falta de pago, uso engañoso, alteración visual o comunicación que exceda el alcance certificado.",
          ],
        },
        {
          title: "Suspensión",
          body: [
            "STRAX podrá suspender acceso, evaluaciones, reportes, certificaciones o uso de sello por falta de pago, manipulación de datos, abuso del sistema, riesgo de seguridad, incumplimiento legal o uso contrario al estándar.",
          ],
        },
        {
          title: "Limitación de responsabilidad",
          body: [
            "En la máxima medida permitida por la ley aplicable, la responsabilidad total de STRAX frente a reclamaciones relacionadas con el uso del sistema estará limitada al valor efectivamente pagado por el usuario durante el periodo que origine la reclamación.",
          ],
        },
        {
          title: "Jurisdicción y conflictos",
          body: [
            "Estos términos se rigen por las leyes de Colombia. Las diferencias se procurarán resolver primero mediante arreglo directo. Si no hay acuerdo, se someterán a arbitraje en Colombia conforme a las reglas aplicables al centro de arbitraje definido por STRAX o por acuerdo entre las partes.",
          ],
        },
      ]}
    />
  );
}
