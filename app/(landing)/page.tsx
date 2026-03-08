import "@/components/landing/landing.css"
import Navbar from "@/components/landing/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import StatsBar from "@/components/landing/StatsBar"
import FeaturesSection from "@/components/landing/FeaturesSection"
import HowItWorks from "@/components/landing/HowItWorks"
import PricingSection from "@/components/landing/PricingSection"
import TestimonialSection from "@/components/landing/TestimonialSection"
import CtaSection from "@/components/landing/CtaSection"
import Footer from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <HowItWorks />
      <PricingSection />
      <TestimonialSection />
      <CtaSection />
      <Footer />
    </>
  )
}