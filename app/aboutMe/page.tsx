export const dynamic = "force-dynamic"
export const revalidate = 0

import Header from "@/components/include/Header"
import Footer from "@/components/include/Footer"
import HeroSection from "@/components/aboutMeSections/HeroSection"
import AboutContent from "@/components/aboutMeSections/AboutContent"
import ContactSection from "@/components/sections/ContactSection"
import SectionTitle from "@/components/sections/TitelSection"

export default function AboutMePage() {
  return ( 
    <>
    <Header />
    <HeroSection />
    <AboutContent />
    <SectionTitle title=" Contact" bgcolor="#1b1b1b" txtcolor="#ff5a00" />
    <ContactSection />
    <Footer />

    </>
    
    )
}
