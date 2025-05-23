# GenAI Kitchen - AI-Powered Kitchen Visualization for Unoform

A custom AI-powered kitchen design visualization tool built exclusively for [Unoform.dk](https://unoform.dk), Denmark's premier kitchen manufacturer. This application enables customers to reimagine their kitchen spaces with Unoform's signature Scandinavian design aesthetic.

[![GenAI Kitchen by Unoform](./public/screenshot.png)](https://genaikitchen-avse9hgjh-jespers-projects-dbff6d83.vercel.app)

## About Unoform

[Unoform.dk](https://unoform.dk) is a Danish kitchen manufacturer renowned for their minimalist Scandinavian design philosophy. With a focus on clean lines, premium materials, and functional elegance, Unoform creates kitchens that embody the best of Danish design tradition.

### Brand Integration
This application is fully integrated with Unoform's brand identity:
- **Colors**: Unoform gold (#C19A5B) and sophisticated grays (#4C4C4C)
- **Typography**: Work Sans font family for clean, modern readability
- **Design Language**: Minimalist UI reflecting Scandinavian design principles
- **AI Styling**: All generated designs automatically incorporate Unoform's signature aesthetic

## Features

### 🎨 AI-Powered Kitchen Visualization
Upload a photo of your existing kitchen and see it transformed with Unoform's signature design elements, including:
- Modern flat-panel or classic shaker cabinet styles
- Premium finishes in matte white, natural oak, or sophisticated black
- High-quality countertops in marble, granite, or butcher block
- Scandinavian-inspired color palettes and hardware

### ✏️ Advanced Editing Tools
- **Inpainting**: Selectively edit specific areas of your kitchen design
- **Variations**: Generate multiple design options with a single click
- **Undo/Redo**: Navigate through your design history effortlessly

### 💾 Personal Design Gallery
- Save your favorite designs to your personal gallery
- Access your saved designs anytime (requires employee login)
- Download high-resolution images for presentations

### 📱 Social Media Integration
- Share your designs directly to Instagram, Twitter/X, and LinkedIn
- Automatic image optimization for each platform
- Optional Unoform watermark for brand consistency

## Technical Details

The application leverages cutting-edge AI technology:
- **[Flux Canny Pro](https://replicate.com/black-forest-labs/flux-canny-pro)**: Maintains kitchen structure while applying new designs
- **[Flux Fill Pro](https://replicate.com/black-forest-labs/flux-fill-pro)**: Powers the selective editing feature
- **[Flux Redux Dev](https://replicate.com/black-forest-labs/flux-redux-dev)**: Creates design variations

Built with modern web technologies:
- **Next.js 13.4** with App Router for optimal performance
- **TypeScript** for type safety and developer experience
- **Tailwind CSS** with custom Unoform design system
- **Replicate API** for AI model integration
- **Bytescale** for image upload and optimization

## Image Processing Constraints

### Upload Requirements
- **File Types**: JPEG, JPG, and PNG formats are accepted
- **Maximum File Size**: 5MB per image
- **Automatic Resizing**: Uploaded images are automatically resized to fit within 1344x768 pixels (16:9 aspect ratio) for optimal processing
- **Format Conversion**: All images are automatically converted to JPEG format with 90% quality for consistency

### Output Specifications
- **Resolution**: All generated images are produced at 1344x768 pixels (16:9 aspect ratio)
- **Format**: WebP format for generated images, PNG for inpainted images
- **Quality**: High quality output with optimized file sizes

### Processing Limits
- **Rate Limiting**: Users without authentication have a limit of 5 generations per 24 hours
- **Processing Time**: Image generation typically takes 20-30 seconds
- **Safety Filters**: NSFW content is automatically filtered with a permissive tolerance level

## Access for Unoform Employees

The application is accessible at: https://genaikitchen-avse9hgjh-jespers-projects-dbff6d83.vercel.app

### Employee Login Credentials
Contact your IT department for access credentials. Default test accounts:
- Design Team: `design_team` / `ScandinavianStyle!`
- Demo Account: `demo_user` / `KitchenDesign123`

## Development Setup (For Unoform IT Team)

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager
- Access to Unoform's development environment variables

### Installation

1. Clone the repository:
```bash
git clone [internal-repo-url]
cd GenAI_Kitchen
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following:
```bash
REPLICATE_API_KEY=your_replicate_api_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_UPLOAD_API_KEY=your_bytescale_key
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run test:env         # Validate environment variables
npm run test:api         # Test API endpoints
npm run deploy           # Deploy to Vercel
```

## Deployment

The application is deployed on Vercel and automatically deploys from the main branch. Contact the IT department for deployment access and procedures.

## Support

For technical support or questions about the application:
- **IT Support**: Contact Unoform IT department
- **Bug Reports**: Submit issues through internal ticketing system
- **Feature Requests**: Contact the product development team

## License

This is a proprietary application developed exclusively for Unoform.dk. All rights reserved. Unauthorized use, reproduction, or distribution is prohibited.
