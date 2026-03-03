export const dynamic = "force-dynamic"
export const revalidate = 0

import Header from "@/components/include/Header"
import Footer from "@/components/include/Footer"
import VideoGalleryHero from "@/components/videoGallerySections/VideoGalleryHero"
import VideoGalleryContent from "@/components/videoGallerySections/videoGalleryContent"
import ContactSection from "@/components/sections/ContactSection"
import SectionTitle from "@/components/sections/TitelSection"


export default function VideoGalleryPage() {
  return ( 
    <>
    <Header />
    <VideoGalleryHero />
    <VideoGalleryContent />
    <SectionTitle title=" Contact" bgcolor="#1b1b1b" txtcolor="#ff5a00" />
    <ContactSection />
    <Footer />

    </>
    
    )
}
