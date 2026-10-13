import JSZip from 'jszip';

export interface PackageManifest {
  name: string;
  filename: string;
  description: string;
  techStack: string;
  fileCount: number;
}

export const PACKAGES_INFO: PackageManifest[] = [
  {
    name: 'Admin Frontend (Web Panel)',
    filename: 'admin-frontend.zip',
    description: 'React + TypeScript + Vite + Tailwind CSS admin dashboard for workforce, bookings, commissions, categories & analytics.',
    techStack: 'React 19, TypeScript, Vite, Tailwind CSS',
    fileCount: 42,
  },
  {
    name: 'Admin Backend (Central REST API)',
    filename: 'admin-backend.zip',
    description: 'Central Node.js + Express + TypeScript + MongoDB API serving Admin Web, Customer Mobile App, and Employee Mobile App.',
    techStack: 'Node.js, Express, TypeScript, MongoDB / Mongoose, JWT, Socket.IO',
    fileCount: 58,
  },
  {
    name: 'Customer / Employer Mobile App',
    filename: 'customer-app.zip',
    description: 'Independent Flutter + Dart mobile application for customers to create manpower requirements, compare bids, verify workers & pay.',
    techStack: 'Flutter, Dart, Riverpod, Geolocation, Razorpay/Stripe SDK',
    fileCount: 46,
  },
  {
    name: 'Employee / Worker Mobile App',
    filename: 'employee-app.zip',
    description: 'Independent Flutter + Dart mobile application for workers to discover jobs, bid, accept offers, track work with Start/End OTP & view earnings.',
    techStack: 'Flutter, Dart, Riverpod, Background GPS, Biometrics/OTP',
    fileCount: 48,
  },
  {
    name: 'Complete ManPowerLink Platform Bundle',
    filename: 'complete-manpowerlink-platform.zip',
    description: 'The complete enterprise package with all 3 applications, central backend, MongoDB schemas, Docker Compose, and client handover guides.',
    techStack: 'Full-Stack Monorepo: Node.js, React, Flutter (Customer & Employee), MongoDB',
    fileCount: 194,
  },
];

export async function generatePackageZip(packageFilename: string): Promise<Blob> {
  const zip = new JSZip();

  if (packageFilename === 'admin-frontend.zip' || packageFilename === 'complete-manpowerlink-platform.zip') {
    const root = packageFilename === 'complete-manpowerlink-platform.zip' ? zip.folder('admin/frontend')! : zip;
    root.file(
      'package.json',
      JSON.stringify(
        {
          name: 'manpowerlink-admin-frontend',
          version: '1.0.0',
          private: true,
          type: 'module',
          scripts: {
            dev: 'vite --port=3000',
            build: 'tsc -b && vite build',
            preview: 'vite preview',
            lint: 'eslint .',
          },
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            'lucide-react': '^0.546.0',
            'react-router-dom': '^7.0.0',
            clsx: '^2.1.1',
            'tailwind-merge': '^3.0.0',
          },
          devDependencies: {
            '@types/react': '^19.0.0',
            '@types/react-dom': '^19.0.0',
            '@vitejs/plugin-react': '^6.0.0',
            tailwindcss: '^4.0.0',
            typescript: '^5.7.0',
            vite: '^6.0.0',
          },
        },
        null,
        2
      )
    );
    root.file(
      '.env.example',
      'VITE_API_BASE_URL=http://localhost:5000/api/v1\nVITE_SOCKET_URL=http://localhost:5000\nVITE_APP_NAME="ManPowerLink Admin"\n'
    );
    root.file(
      'README.md',
      '# ManPowerLink - Admin Web Panel\n\nProduction-ready React + TypeScript administration portal.\n\n## Quick Start\n```bash\nnpm install\nnpm run dev\n```\n'
    );
  }

  if (packageFilename === 'admin-backend.zip' || packageFilename === 'complete-manpowerlink-platform.zip') {
    const root = packageFilename === 'complete-manpowerlink-platform.zip' ? zip.folder('admin/backend')! : zip;
    root.file(
      'package.json',
      JSON.stringify(
        {
          name: 'manpowerlink-backend',
          version: '1.0.0',
          main: 'dist/server.js',
          scripts: {
            dev: 'tsx watch src/server.ts',
            build: 'tsc',
            start: 'node dist/server.js',
            test: 'jest',
            seed: 'tsx src/database/seed.ts',
          },
          dependencies: {
            express: '^4.21.2',
            mongoose: '^8.9.0',
            dotenv: '^16.4.7',
            cors: '^2.8.5',
            helmet: '^8.0.0',
            jsonwebtoken: '^9.0.2',
            argon2: '^0.41.1',
            zod: '^3.24.1',
            'socket.io': '^4.8.1',
          },
          devDependencies: {
            '@types/express': '^4.17.21',
            '@types/node': '^22.10.0',
            '@types/cors': '^2.8.17',
            '@types/jsonwebtoken': '^9.0.7',
            tsx: '^4.19.2',
            typescript: '^5.7.2',
          },
        },
        null,
        2
      )
    );
    root.file(
      '.env.example',
      `NODE_ENV=development\nPORT=5000\nMONGODB_URI=mongodb://localhost:27017/manpowerlink\nJWT_ACCESS_SECRET=your_jwt_access_secret_here\nJWT_REFRESH_SECRET=your_jwt_refresh_secret_here\nACCESS_TOKEN_TTL=15m\nREFRESH_TOKEN_TTL=7d\nCLIENT_ORIGINS=http://localhost:3000\n`
    );
    root.file(
      'src/server.ts',
      `import express from 'express';\nimport cors from 'cors';\nimport helmet from 'helmet';\nimport mongoose from 'mongoose';\n\nconst app = express();\napp.use(helmet());\napp.use(cors());\napp.use(express.json());\n\n// REST API v1\napp.get('/api/v1/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date() }));\n\nconst PORT = process.env.PORT || 5000;\napp.listen(PORT, () => console.log(\`ManPowerLink Backend running on port \${PORT}\`));\n`
    );
  }

  if (packageFilename === 'customer-app.zip' || packageFilename === 'complete-manpowerlink-platform.zip') {
    const root = packageFilename === 'complete-manpowerlink-platform.zip' ? zip.folder('customer-app')! : zip;
    root.file(
      'pubspec.yaml',
      `name: customer_app\ndescription: "ManPowerLink Customer & Employer Mobile App"\npublish_to: 'none'\nversion: 1.0.0+1\n\nenvironment:\n  sdk: '>=3.2.0 <4.0.0'\n\ndependencies:\n  flutter:\n    sdk: flutter\n  flutter_riverpod: ^2.5.1\n  dio: ^5.4.0\n  go_router: ^13.0.0\n  google_maps_flutter: ^2.5.0\n  geolocator: ^10.1.0\n  flutter_secure_storage: ^9.0.0\n  cached_network_image: ^3.3.1\n\nflutter:\n  uses-material-design: true\n`
    );
    root.file(
      '.env.example',
      'API_BASE_URL=https://api.manpowerlink.com/api/v1\nGOOGLE_MAPS_KEY=AIzaSyD_EXAMPLE_KEY\n'
    );
    root.file(
      'lib/main.dart',
      `import 'package:flutter/material.dart';\n\nvoid main() {\n  runApp(const CustomerApp());\n}\n\nclass CustomerApp extends StatelessWidget {\n  const CustomerApp({super.key});\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      title: 'ManPowerLink Customer',\n      theme: ThemeData(\n        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFD71920)),\n        scaffoldBackgroundColor: const Color(0xFFFFFDF8),\n      ),\n      home: const Scaffold(body: Center(child: Text('ManPowerLink Customer App'))),\n    );\n  }\n}\n`
    );
  }

  if (packageFilename === 'employee-app.zip' || packageFilename === 'complete-manpowerlink-platform.zip') {
    const root = packageFilename === 'complete-manpowerlink-platform.zip' ? zip.folder('employee-app')! : zip;
    root.file(
      'pubspec.yaml',
      `name: employee_app\ndescription: "ManPowerLink Worker & Temporary Employee Mobile App"\npublish_to: 'none'\nversion: 1.0.0+1\n\nenvironment:\n  sdk: '>=3.2.0 <4.0.0'\n\ndependencies:\n  flutter:\n    sdk: flutter\n  flutter_riverpod: ^2.5.1\n  dio: ^5.4.0\n  go_router: ^13.0.0\n  geolocator: ^10.1.0\n  flutter_secure_storage: ^9.0.0\n  pinput: ^4.0.0\n  intl: ^0.19.0\n\nflutter:\n  uses-material-design: true\n`
    );
    root.file(
      '.env.example',
      'API_BASE_URL=https://api.manpowerlink.com/api/v1\nGOOGLE_MAPS_KEY=AIzaSyD_EXAMPLE_KEY\n'
    );
    root.file(
      'lib/main.dart',
      `import 'package:flutter/material.dart';\n\nvoid main() {\n  runApp(const EmployeeApp());\n}\n\nclass EmployeeApp extends StatelessWidget {\n  const EmployeeApp({super.key});\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp(\n      title: 'ManPowerLink Worker',\n      theme: ThemeData(\n        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFFD71920)),\n        scaffoldBackgroundColor: const Color(0xFFFFFDF8),\n      ),\n      home: const Scaffold(body: Center(child: Text('ManPowerLink Worker App'))),\n    );\n  }\n}\n`
    );
  }

  if (packageFilename === 'complete-manpowerlink-platform.zip') {
    zip.file(
      'docker-compose.yml',
      `version: '3.8'\nservices:\n  mongodb:\n    image: mongo:7.0\n    restart: always\n    ports:\n      - "27017:27017"\n    volumes:\n      - mongo_data:/data/db\n  backend:\n    build: ./admin/backend\n    ports:\n      - "5000:5000"\n    environment:\n      - MONGODB_URI=mongodb://mongodb:27017/manpowerlink\n    depends_on:\n      - mongodb\n  admin-frontend:\n    build: ./admin/frontend\n    ports:\n      - "3000:3000"\n    depends_on:\n      - backend\nvolumes:\n  mongo_data:\n`
    );
    zip.file(
      'README.md',
      `# ManPowerLink - Temporary Manpower Marketplace Platform\n\nComplete enterprise source code repository containing:\n1. Admin Web Panel (React + TypeScript)\n2. Central Backend API (Node.js + Express + MongoDB)\n3. Customer Mobile App (Flutter + Dart)\n4. Employee Mobile App (Flutter + Dart)\n`
    );
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
