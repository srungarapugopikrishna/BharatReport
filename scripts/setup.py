#!/usr/bin/env python3
"""
JanataReport Project Setup Script
This script helps set up the full-stack JanataReport application
"""

import os
import sys
import subprocess
import platform
import webbrowser
from pathlib import Path

class JanataReportSetup:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.server_dir = self.project_root / "server"
        self.client_dir = self.project_root / "client"
        
    def check_node_installed(self):
        """Check if Node.js is installed"""
        try:
            result = subprocess.run(['node', '--version'], 
                                  capture_output=True, text=True, check=True)
            print(f"✅ Node.js is installed: {result.stdout.strip()}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Node.js is not installed")
            return False
    
    def check_npm_installed(self):
        """Check if npm is installed"""
        try:
            result = subprocess.run(['npm', '--version'], 
                                  capture_output=True, text=True, check=True)
            print(f"✅ npm is installed: {result.stdout.strip()}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ npm is not installed")
            return False
    
    def install_node_dependencies(self):
        """Install Node.js dependencies for the project"""
        print("\n📦 Installing Node.js dependencies...")
        
        # Install root dependencies
        print("Installing root dependencies...")
        try:
            subprocess.run(['npm', 'install'], cwd=self.project_root, check=True)
            print("✅ Root dependencies installed")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install root dependencies: {e}")
            return False
        
        # Install server dependencies
        print("Installing server dependencies...")
        try:
            subprocess.run(['npm', 'install'], cwd=self.server_dir, check=True)
            print("✅ Server dependencies installed")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install server dependencies: {e}")
            return False
        
        # Install client dependencies
        print("Installing client dependencies...")
        try:
            subprocess.run(['npm', 'install'], cwd=self.client_dir, check=True)
            print("✅ Client dependencies installed")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install client dependencies: {e}")
            return False
        
        return True
    
    def create_env_files(self):
        """Create environment files from examples"""
        print("\n🔧 Setting up environment files...")
        
        # Server .env file
        server_env_example = self.server_dir / "env.example"
        server_env = self.server_dir / ".env"
        
        if server_env_example.exists() and not server_env.exists():
            server_env.write_text(server_env_example.read_text())
            print("✅ Created server/.env file")
        elif server_env.exists():
            print("✅ Server .env file already exists")
        
        # Client .env file
        client_env = self.client_dir / ".env"
        if not client_env.exists():
            client_env.write_text("REACT_APP_API_URL=http://localhost:5000/api\nREACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key")
            print("✅ Created client/.env file")
        else:
            print("✅ Client .env file already exists")
    
    def check_postgresql(self):
        """Check if PostgreSQL is available"""
        try:
            result = subprocess.run(['psql', '--version'], 
                                  capture_output=True, text=True, check=True)
            print(f"✅ PostgreSQL is available: {result.stdout.strip()}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ PostgreSQL is not installed or not in PATH")
            return False
    
    def setup_database(self):
        """Set up the database"""
        print("\n🗄️ Setting up database...")
        
        if not self.check_postgresql():
            print("Please install PostgreSQL first:")
            print("1. Download from: https://www.postgresql.org/download/windows/")
            print("2. Install with PostGIS extension")
            print("3. Add PostgreSQL to your PATH")
            return False
        
        # Create database
        print("Creating database...")
        try:
            subprocess.run([
                'psql', '-U', 'postgres', '-c', 
                'CREATE DATABASE janata_report;'
            ], check=True)
            print("✅ Database created")
        except subprocess.CalledProcessError:
            print("⚠️ Database might already exist or connection failed")
        
        # Enable PostGIS extension
        print("Enabling PostGIS extension...")
        try:
            subprocess.run([
                'psql', '-U', 'postgres', '-d', 'janata_report', '-c',
                'CREATE EXTENSION IF NOT EXISTS postgis;'
            ], check=True)
            print("✅ PostGIS extension enabled")
        except subprocess.CalledProcessError as e:
            print(f"⚠️ PostGIS setup failed: {e}")
        
        return True
    
    def seed_database(self):
        """Seed the database with sample data"""
        print("\n🌱 Seeding database...")
        try:
            subprocess.run(['npm', 'run', 'seed'], cwd=self.server_dir, check=True)
            print("✅ Database seeded successfully")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Database seeding failed: {e}")
            return False
    
    def run_development_servers(self):
        """Start the development servers"""
        print("\n🚀 Starting development servers...")
        print("This will start both the backend and frontend servers.")
        print("Press Ctrl+C to stop both servers.")
        
        try:
            # Start both servers concurrently
            subprocess.run(['npm', 'run', 'dev'], cwd=self.project_root, check=True)
        except KeyboardInterrupt:
            print("\n🛑 Servers stopped")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to start servers: {e}")
    
    def print_next_steps(self):
        """Print next steps for the user"""
        print("\n" + "="*60)
        print("🎉 JanataReport Setup Complete!")
        print("="*60)
        print("\nNext steps:")
        print("1. Update server/.env with your database credentials")
        print("2. Update client/.env with your Google Maps API key")
        print("3. Run: python setup.py --start to start the development servers")
        print("\nAccess the application:")
        print("- Frontend: http://localhost:3000")
        print("- Backend API: http://localhost:5000")
        print("\nDefault admin credentials:")
        print("- Email: admin@janatareport.com")
        print("- Password: admin123")
        print("\nFor more information, see README.md")
    
    def run_setup(self):
        """Run the complete setup process"""
        print("🚀 JanataReport Project Setup")
        print("="*40)
        
        # Check prerequisites
        if not self.check_node_installed():
            print("\n❌ Node.js is required but not installed.")
            print("Please install Node.js from: https://nodejs.org/")
            print("Then run this script again.")
            return False
        
        if not self.check_npm_installed():
            print("\n❌ npm is required but not installed.")
            print("Please install Node.js (which includes npm) from: https://nodejs.org/")
            return False
        
        # Install dependencies
        if not self.install_node_dependencies():
            print("\n❌ Failed to install dependencies")
            return False
        
        # Create environment files
        self.create_env_files()
        
        # Setup database
        self.setup_database()
        
        # Seed database
        self.seed_database()
        
        # Print next steps
        self.print_next_steps()
        
        return True

def main():
    setup = JanataReportSetup()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--start':
        setup.run_development_servers()
    else:
        setup.run_setup()

if __name__ == "__main__":
    main()
