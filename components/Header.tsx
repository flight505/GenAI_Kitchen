"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCurrentUser, logout } from "../utils/auth";

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <header className="flex flex-col xs:flex-row justify-between items-center w-full mt-3 border-b pb-7 sm:px-4 px-2 border-unoform-gray-dark gap-2">
      <Link href="/" className="flex items-center space-x-3">
        <h1 className="text-2xl font-light tracking-wider text-unoform-black uppercase">
          Unoform
        </h1>
      </Link>
      <nav className="flex items-center space-x-4">
        <a
          href="https://unoform.dk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-body text-unoform-gray-medium hover:text-unoform-black transition-colors duration-200 font-normal"
        >
          Visit Unoform.dk
        </a>
        
        {user ? (
          <>
            <Link
              href="/saved"
              className="text-body text-unoform-gray-medium hover:text-unoform-black transition-colors duration-200 font-normal"
            >
              My Designs
            </Link>
            <Link
              href="/professional"
              className="text-body text-unoform-gray-medium hover:text-unoform-black transition-colors duration-200 font-normal"
            >
              Professional
            </Link>
            <Link
              href="/dream"
              className="bg-unoform-gold text-white px-6 py-2 font-normal hover:bg-unoform-gold-dark transition-all duration-200 text-body uppercase tracking-wider"
            >
              Create Design
            </Link>
            <div className="flex items-center space-x-3">
              <span className="text-body text-unoform-gray-medium">
                {user.username}
              </span>
              <button
                onClick={() => logout()}
                className="text-body text-unoform-gray-medium hover:text-unoform-black transition-colors duration-200 font-normal"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="border border-unoform-black text-unoform-black px-6 py-2 font-normal hover:bg-unoform-black hover:text-white transition-all duration-200 text-body uppercase tracking-wider"
          >
            Employee Login
          </Link>
        )}
      </nav>
    </header>
  );
}