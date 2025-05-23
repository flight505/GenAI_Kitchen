import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <Header />
        
        <main className="flex flex-col items-center justify-center text-center px-4 py-20">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-display-mobile sm:text-display font-extralight text-unoform-black mb-6">
              Transform Your Kitchen with{" "}
              <span className="text-unoform-gold">
                Danish Excellence
              </span>
            </h1>
            
            <p className="text-body text-unoform-gray-dark max-w-2xl mx-auto mb-12">
              Experience Unoform's signature Scandinavian design philosophy. 
              Upload a photo and watch AI reimagine your space with minimalist elegance and functional beauty.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/dream"
                className="bg-unoform-gold text-white px-8 py-3 font-normal uppercase tracking-wider hover:bg-unoform-gold-dark transition-all duration-200"
              >
                Start Designing Now
              </Link>
              <Link
                href="/login"
                className="border border-unoform-black text-unoform-black px-8 py-3 font-normal uppercase tracking-wider hover:bg-unoform-black hover:text-white transition-all duration-200"
              >
                Employee Access
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto mt-20">
            <div className="text-center">
              <h3 className="text-body font-normal text-unoform-black mb-4 uppercase tracking-wider">
                Upload
              </h3>
              <p className="text-body text-unoform-gray-dark">
                Simply upload a photo of your existing kitchen to get started
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-body font-normal text-unoform-black mb-4 uppercase tracking-wider">
                Customize
              </h3>
              <p className="text-body text-unoform-gray-dark">
                Select cabinet styles, materials, and finishes that match your vision
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-body font-normal text-unoform-black mb-4 uppercase tracking-wider">
                Transform
              </h3>
              <p className="text-body text-unoform-gray-dark">
                Get instant visualizations with Unoform's signature Danish aesthetic
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-24 text-center">
            <div className="flex flex-wrap justify-center items-center gap-12 text-sm text-unoform-gray uppercase tracking-wider">
              <span>Danish Design Heritage</span>
              <span>•</span>
              <span>Premium Materials</span>
              <span>•</span>
              <span>Sustainable Craftsmanship</span>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-24 max-w-3xl mx-auto text-center">
            <h2 className="text-h1-mobile sm:text-h1 font-light text-unoform-black mb-8">
              Ready to Experience Danish Kitchen Excellence?
            </h2>
            <Link
              href="/dream"
              className="border border-unoform-black text-unoform-black px-10 py-4 font-normal uppercase tracking-wider hover:bg-unoform-black hover:text-white transition-all duration-200 inline-block"
            >
              Begin Your Kitchen Journey
            </Link>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
