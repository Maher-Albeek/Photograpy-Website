export const dynamic = "force-dynamic"
export const revalidate = 0

import Header from "@/components/include/Header"
import Footer from "@/components/include/Footer"
import HeroSection from "@/components/photoGallerySections/PhotoGalleryHero"
import ContentSection from "@/components/photoGallerySections/PhotoGalleryContent"
import BeforeAfterSection from "@/components/photoGallerySections/PhotoGalleryBeforeAfter"
import ContactSection from "@/components/sections/ContactSection"
import SectionTitle from "@/components/sections/TitelSection"


export default function PhotoGalleryPage() {
  return ( 
    <>
    <Header />
    <HeroSection />
    <SectionTitle title=" Gallery" bgcolor="#1b1b1b" txtcolor="#ff5a00" />
    <ContentSection />
    <SectionTitle title=" Before & After" bgcolor="#1b1b1b" txtcolor="#ff5a00" />
    <BeforeAfterSection />
    <SectionTitle title=" Contact" bgcolor="#1b1b1b" txtcolor="#ff5a00" />
    <ContactSection />
    <Footer />

    </>
    
    )
}
