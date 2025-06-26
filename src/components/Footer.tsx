import logo from '../assets/logo-nuevo-negro.jpeg';

const Footer = () => {
  return (
    <footer className="bg-[#1A3D33] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img src={logo} alt="GreenPark Logo" className="h-24" />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white hover:text-[#8BAE52] transition-colors">
                  Todos los cursos
                </a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-[#8BAE52] transition-colors">
                  Inicio
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <div className="space-y-2 text-white">
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                + 56 998018174 

              </p>
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                info.greenparkacademy@gmail.com 

              </p>
              <p className="flex items-start">
                <svg className="w-4 h-4 mr-2 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                <span>Los Damascos 132 Francke ,<br/>OSORNO, CHILE</span>
              </p>
            </div>
            
            <div className="flex space-x-4 mt-4">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-[#8BAE52] hover:text-white transition-colors cursor-pointer">
                <span className="text-[#1A3D33] hover:text-white text-sm font-bold">f</span>
              </div>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-[#8BAE52] hover:text-white transition-colors cursor-pointer">
                <span className="text-[#1A3D33] hover:text-white text-sm font-bold">in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;