# CNC Calculator - Professional Machining & Programming Tools

A modern web application providing essential calculators and tools for CNC machining and programming. Built with React and designed for professional machinists, programmers, and hobbyists.

![CNC Calculator](https://img.shields.io/badge/CNC-Calculator-667eea?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-4.4.0-646cff?style=for-the-badge&logo=vite)

## 🚀 Features

### 🔩 Thread Calculator
- Calculate metric ISO thread dimensions
- External and internal thread parameters
- Automatic pitch calculation based on diameter
- Root diameter, thread depth, and mean diameter calculations

### 📐 Trigonometry Calculator
- Right triangle solver
- Input any 2 values to calculate the rest
- Supports both degrees and radians
- Interactive triangle diagram
- Click-to-copy results

### ⚡ Cutting Speed Calculator
- Milling and turning operations
- HSS and Carbide tool calculations
- Material-specific speed recommendations
- Automatic feed rate calculations
- Depth of cut parameters (ae, ap)

### 🔧 Face Milling Calculator
- Calculate step-over and number of passes
- Path length and cutting time estimation
- Material removal volume calculations
- G-Code generation with download
- Customizable overlap percentage

### 🛠️ Various Tools
- **Degree ↔ Radian Converter**: Quick angle conversions
- **Drill Point Calculator**: Calculate drill tip geometry
- **Quick Reference Tables**: Cutting parameters for common materials
- **Tap Drill Sizes**: Common metric thread tap drill reference

## 💻 Installation & Development

### Prerequisites
- Node.js 16+ and npm/yarn
- Git

### Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd cnc-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🚀 Deployment to Vercel

### Option 1: Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

Follow the prompts to configure your deployment.

### Option 2: Deploy via GitHub

1. Push your code to a GitHub repository

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "New Project"

4. Import your GitHub repository

5. Configure build settings (Vercel will auto-detect Vite):
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. Click "Deploy"

### Option 3: Direct Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/cnc-calculator)

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
VITE_APP_TITLE=CNC Calculator
VITE_API_URL=your-api-url-if-needed
```

### Customization

- **Styles**: Edit `src/index.css` for global styles
- **Calculators**: Modify components in `src/components/`
- **Material Data**: Update cutting speed tables in respective components

## 📱 Features & Usage

### Thread Calculator
1. Enter the nominal diameter
2. Either enter pitch manually or use "Auto Pitch" button
3. Click "Calculate" to get all thread parameters
4. Click on any result to copy to clipboard

### Trigonometry Calculator
1. Enter any 2 values (angle, hypotenuse, adjacent, or opposite)
2. Click "Calculate" to solve for the remaining values
3. Supports both degree and radian input

### Cutting Speed Calculator
1. Select operation type (Milling/Turning)
2. Choose tool material (HSS/Carbide)
3. Select workpiece material
4. Enter tool diameter
5. Calculate RPM from Vc or vice versa

### Face Milling Calculator
1. Enter cutter diameter and workpiece dimensions
2. Set overlap percentage (10-30% for finishing, 30-50% for roughing)
3. Calculate to see number of passes and time estimate
4. Download generated G-Code for your CNC machine

## 🎨 Technology Stack

- **Frontend**: React 18.2.0
- **Build Tool**: Vite 4.4.0
- **Styling**: Custom CSS with modern gradient design
- **Tabs**: React-Tabs for navigation
- **Deployment**: Optimized for Vercel

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository.

## 🙏 Acknowledgments

- Original VB.NET application for calculation formulas
- CNC machining community for feedback and suggestions
- React and Vite teams for excellent tools

---

Made with ❤️ for the CNC machining community