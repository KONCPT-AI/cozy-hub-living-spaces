import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="text-xl font-bold"><img src="/logo.png" alt="Logo" className="w-27 h-10 object-contain" /></span>
            </Link>
            <p className="text-primary-foreground/80">
              Creating comfortable, affordable co-living spaces for students and working professionals.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 cursor-pointer hover:text-secondary transition-colors" />
              <Twitter className="h-5 w-5 cursor-pointer hover:text-secondary transition-colors" />
              <Instagram className="h-5 w-5 cursor-pointer hover:text-secondary transition-colors" />
              <Linkedin className="h-5 w-5 cursor-pointer hover:text-secondary transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-primary-foreground/80 hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link to="/spaces" className="text-primary-foreground/80 hover:text-secondary transition-colors">Explore Spaces</Link></li>
              <li><Link to="/how-it-works" className="text-primary-foreground/80 hover:text-secondary transition-colors">How It Works</Link></li>
              <li><Link to="/community" className="text-primary-foreground/80 hover:text-secondary transition-colors">Community Life</Link></li>
              <li><Link to="/blog" className="text-primary-foreground/80 hover:text-secondary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2">
              <li><span className="text-primary-foreground/80">Student Housing</span></li>
              <li><span className="text-primary-foreground/80">Professional Spaces</span></li>
              <li><span className="text-primary-foreground/80">Furnished Rooms</span></li>
              <li><span className="text-primary-foreground/80">Community Events</span></li>
              <li><span className="text-primary-foreground/80">24/7 Support</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-primary-foreground/80">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="text-primary-foreground/80">hello@coliving.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="text-primary-foreground/80">123 Living Street, City, State 12345</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-foreground/60">
              © 2024 COCO Living. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-primary-foreground/60 hover:text-secondary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-primary-foreground/60 hover:text-secondary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;