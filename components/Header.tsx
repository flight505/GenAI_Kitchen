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
    <header className="flex flex-col xs:flex-row justify-between items-center w-full mt-3 border-b pb-7 sm:px-4 px-2 border-unoform-gray-200 gap-2">
      <Link href="/" className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-unoform-sage rounded-lg flex items-center justify-center">
          <span className="text-white font-semibold text-lg">U</span>
        </div>
        <h1 className="sm:text-2xl text-xl font-semibold tracking-tight text-unoform-black">
          Unoform Kitchen Designer
        </h1>
      </Link>
      <nav className="flex items-center space-x-4">
        <a
          href="https://unoform.dk"
          target="_blank"
          rel="noopener noreferrer"
          className="text-unoform-gray-medium hover:text-unoform-black transition-colors duration-200 text-sm font-medium"
        >
          Visit Unoform.dk
        </a>
        
        {user ? (
          <>
            <Link
              href="/saved"
              className="text-unoform-gray-medium hover:text-unoform-black transition-colors duration-200 text-sm font-medium"
            >
              My Designs
            </Link>
            <Link
              href="/dream"
              className="bg-unoform-sage text-white px-4 py-2 rounded-lg font-medium hover:bg-unoform-sage-dark transition-all duration-200 shadow-subtle hover:shadow-soft text-sm"
            >
              Create Design
            </Link>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-unoform-gray-medium">
                {user.username}
              </span>
              <button
                onClick={() => logout()}
                className="text-unoform-gray-medium hover:text-unoform-black transition-colors duration-200 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-unoform-sage text-white px-6 py-2.5 rounded-lg font-medium hover:bg-unoform-sage-dark transition-all duration-200 shadow-subtle hover:shadow-soft text-sm"
          >
            Employee Login
          </Link>
        )}
      </nav>
    </header>
  );
}