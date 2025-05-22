import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function HomePage() {
  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen bg-unoform-white">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 sm:mt-20 mt-20">
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-normal text-unoform-black sm:text-7xl">
          Reimagine your kitchen with{" "}
          <span className="relative whitespace-nowrap text-unoform-sage">
            <span className="relative">Unoform's</span>
          </span>{" "}
          signature Danish design.
        </h1>
        <h2 className="mx-auto mt-12 max-w-xl text-lg text-unoform-gray-medium leading-7">
          Experience the perfect blend of Scandinavian minimalism and functional elegance. 
          Upload your kitchen photo and let AI transform it with Unoform's timeless aesthetic.
        </h2>
        <Link
          className="bg-unoform-sage rounded-lg text-white font-medium px-8 py-4 sm:mt-10 mt-8 hover:bg-unoform-sage-dark transition-all duration-200 shadow-soft hover:shadow-medium transform hover:-translate-y-0.5"
          href="/dream"
        >
          Start Your Kitchen Transformation
        </Link>
        <div className="flex justify-between items-center w-full flex-col sm:mt-10 mt-6">
          <div className="flex flex-col space-y-10 mt-4 mb-16">
            <div className="flex sm:space-x-8 sm:flex-row flex-col">
              <div>
                <h3 className="mb-2 font-medium text-lg text-unoform-charcoal">Before</h3>
                <Image
                  alt="Original photo of a kitchen"
                  src="/original-pic.jpg"
                  className="w-full object-cover h-96 rounded-2xl"
                  width={400}
                  height={400}
                />
              </div>
              <div className="sm:mt-0 mt-8">
                <h3 className="mb-2 font-medium text-lg text-unoform-charcoal">After - Unoform Design</h3>
                <Image
                  alt="Generated photo of a kitchen"
                  width={400}
                  height={400}
                  src="/generated-pic-2.jpg"
                  className="w-full object-cover h-96 rounded-2xl sm:mt-0 mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
