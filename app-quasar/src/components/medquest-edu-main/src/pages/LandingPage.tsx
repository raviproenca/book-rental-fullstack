import {
  LandingHeader,
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  SocialProofSection,
  PricingSection,
  FAQSection,
  CTASection,
  Footer,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="dark bg-background">
      <div className="min-h-screen bg-background text-foreground">
        <LandingHeader />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SocialProofSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
