import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Como funciona o período gratuito?",
    a: "Você pode usar o MEDQUEST gratuitamente com acesso a 10 questões por dia e 2 disciplinas. Não precisa de cartão de crédito para começar.",
  },
  {
    q: "Posso cancelar a assinatura Pro a qualquer momento?",
    a: "Sim! Não há fidelidade. Você pode cancelar quando quiser e continuará com acesso até o final do período pago.",
  },
  {
    q: "As questões são baseadas em quais provas?",
    a: "Nosso banco inclui questões baseadas em provas da faculdade e preparação para o internato das principais instituições do Brasil, além de questões autorais elaboradas por especialistas.",
  },
  {
    q: "Como funciona a revisão espaçada?",
    a: "Usamos um algoritmo de repetição espaçada (similar ao Anki) que identifica as questões que você errou ou teve dificuldade e as apresenta novamente em intervalos otimizados para maximizar a retenção.",
  },
  {
    q: "Posso usar no celular?",
    a: "Sim! O MEDQUEST é totalmente responsivo e funciona perfeitamente no navegador do seu celular ou tablet.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
};

export function FAQSection() {
  return (
    <section id="faq" className="relative scroll-mt-20 overflow-hidden px-6 py-28">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 30% 50%, hsl(var(--gold) / 0.03) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Left: heading */}
          <motion.div
            className="lg:col-span-2 lg:sticky lg:top-28"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={containerVariants}
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/[0.06] px-4 py-1.5 text-xs font-medium tracking-wide text-gold">
                FAQ
              </span>
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="mt-5 text-3xl font-bold text-foreground sm:text-4xl"
            >
              Perguntas Frequentes
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground"
            >
              Tudo que você precisa saber sobre o MEDQUEST. Não encontrou sua resposta? Entre em contato.
            </motion.p>
          </motion.div>

          {/* Right: accordion */}
          <motion.div
            className="lg:col-span-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <AccordionItem
                    value={`faq-${i}`}
                    className="rounded-xl border border-border/60 bg-card px-5 transition-colors duration-300 hover:border-gold/20 data-[state=open]:border-gold/25 data-[state=open]:bg-gradient-to-r data-[state=open]:from-gold/[0.03] data-[state=open]:to-transparent"
                  >
                    <AccordionTrigger className="py-5 text-left text-sm font-medium text-foreground hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
