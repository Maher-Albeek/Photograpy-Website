export const dynamic = "force-dynamic"
export const revalidate = 0

import Header from "@/components/include/Header"
import HeroSection from "@/components/sections/HeroSection"
import AboutSection from "@/components/sections/AboutSection"
import PhotosGallerySection from "@/components/sections/PhotosGallerySection"
import VideosGallerySection from "@/components/sections/VideosGallerySection"
import TestimonialsSection from "@/components/sections/TestimonialsSection"
import SectionTitle from "@/components/sections/TitelSection"
import FAQSection from "@/components/sections/FAQSection"
import ContactSection from "@/components/sections/ContactSection"
import Footer from "@/components/include/Footer"
import CookieBanner from "@/components/include/CookieBanner"


export default function HomePage() {
  return (
    <>
      <Header />
      <HeroSection />

      <SectionTitle title=" About me" bgcolor="#1b1b1b" txtcolor="#ff5a00"/>
      <AboutSection  txtcolor="#ffe7d0" />

      <SectionTitle title=" Photos Gallery" bgcolor="#1b1b1b" txtcolor="#ff5a00"/>
      <PhotosGallerySection   />

      <VideosGallerySection  />

      <SectionTitle title=" Testimonials" bgcolor="#1b1b1b" txtcolor="#ff5a00" />
      <TestimonialsSection  txtcolor="#ffe7d0" />

      <SectionTitle title=" FAQ" bgcolor="#1b1b1b" txtcolor="#ff5a00"/>
      <FAQSection  />

      <SectionTitle title=" Contact" bgcolor="#1b1b1b" txtcolor="#ff5a00" />
      <ContactSection  />
      <Footer />
      <CookieBanner />
    </>
  )
}
