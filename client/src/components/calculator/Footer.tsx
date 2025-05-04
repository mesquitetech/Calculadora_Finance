import React from "react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-neutral-dark text-white mt-12 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">Investment Financing Calculator &copy; {currentYear}</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-neutral-lighter hover:text-white">Terms of Service</a>
            <a href="#" className="text-neutral-lighter hover:text-white">Privacy Policy</a>
            <a href="#" className="text-neutral-lighter hover:text-white">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
