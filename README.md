# Hockey Live App

An AI-powered multi-camera hockey game streaming and compilation platform that transforms parent phone recordings into professional-quality game videos with automated commentary.

## Overview

Hockey Live App revolutionizes how hockey games are recorded and shared by coordinating multiple parent smartphones to create seamless, high-quality game videos. The platform automatically determines optimal camera positions, synchronizes recordings, and compiles footage into professional broadcasts that surpass LiveBarn quality at a fraction of the cost.

## Key Features

### Phase 1: Multi-Camera Coordination
- **Automated Camera Positioning**: App determines optimal camera locations based on arena type
- **Seamless Parent Experience**: One-click joining with QR codes or game codes
- **Real-time Synchronization**: All cameras sync automatically for seamless compilation
- **Professional Quality Output**: HD video compilation with intelligent camera switching

### Phase 2: AI-Enhanced Features (Future)
- **Player Tracking**: Real-time player identification and tracking using Meta's SAM 2
- **Enhanced Overlays**: Player names, numbers, and statistical information
- **Event Detection**: Automated recognition of goals, saves, and key plays

### Phase 3: Automated Commentary (Future)
- **AI Commentary Generation**: Professional play-by-play using advanced language models
- **Voice Synthesis**: Broadcast-quality commentary with natural speech
- **Multi-language Support**: Commentary in multiple languages

## Target Market

- **Primary**: U16-U18 hockey leagues and their families
- **Secondary**: Junior and adult recreational hockey
- **Geography**: North America (expanding to international markets)

## Technical Architecture

### Mobile Application
- **Platform**: React Native (iOS and Android)
- **Core Features**: Camera control, game synchronization, position guidance
- **Backend**: FastAPI with PostgreSQL database
- **Real-time Processing**: Multi-camera stream coordination and compilation

### Backend Services
- **Game Management**: Session creation, participant coordination, synchronization
- **Video Processing**: Multi-stream compilation, quality enhancement, intelligent switching
- **Arena Configuration**: Automated positioning system for different rink types
- **User Management**: Authentication, subscriptions, family group management

## Getting Started

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hockey-live-app.git
   cd hockey-live-app
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   pip install -r requirements.txt
   
   # Mobile app dependencies
   cd mobile/ios
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Update with your configuration
   # Database URL, API keys, etc.
   ```

4. **Run the application**
   ```bash
   # Start backend server
   uvicorn main:app --reload
   
   # Start mobile app (in separate terminal)
   cd mobile/ios
   npm start
   ```

### For Parents (End Users)

1. **Download the app** from App Store or Google Play
2. **Receive game invitation** with QR code or 6-digit code
3. **Join game session** by scanning code or entering manually
4. **Follow position guidance** to set up your camera
5. **Start recording** when prompted (automatic synchronization)
6. **Access compiled video** 15-20 minutes after game completion

## Documentation

### Technical Documentation
- [`/docs/architecture_overview.md`](/docs/architecture_overview.md) - System architecture and design
- [`/docs/api_documentation.md`](/docs/api_documentation.md) - API endpoints and usage
- [`/docs/setup_guide.md`](/docs/setup_guide.md) - Development environment setup
- [`/docs/deployment_guide.md`](/docs/deployment_guide.md) - Production deployment

### Research and Future Features
- [`/docs/research/sam2_integration.md`](/docs/research/sam2_integration.md) - Meta SAM 2 integration plans
- [`/docs/research/arena_configurations.md`](/docs/research/arena_configurations.md) - Arena positioning system
- [`/docs/research/video_processing_pipeline.md`](/docs/research/video_processing_pipeline.md) - Video compilation architecture

### Phase-Specific Documentation
- [`/docs/phase1/arena_positioning_system.md`](/docs/phase1/arena_positioning_system.md) - Automated positioning implementation
- [`/docs/phase1/parent_user_flow.md`](/docs/phase1/parent_user_flow.md) - Parent user experience design
- [`/docs/future_phases/ai_integration_roadmap.md`](/docs/future_phases/ai_integration_roadmap.md) - AI feature roadmap

## Technology Stack

### Core Technologies
- **Frontend**: React Native, JavaScript/TypeScript
- **Backend**: FastAPI, Python
- **Database**: PostgreSQL with SQLAlchemy
- **Real-time**: WebSockets for game synchronization
- **Video Processing**: FFmpeg, OpenCV
- **Authentication**: JWT tokens with refresh

### AI and Machine Learning (Future Phases)
- **Computer Vision**: Meta SAM 2 for player tracking
- **Video Analysis**: Grok 4 Heavy (when available)
- **Natural Language**: Advanced language models for commentary
- **Speech Synthesis**: ElevenLabs or Fish.audio for TTS

### Infrastructure
- **Cloud**: AWS/Azure for scalable video processing
- **CDN**: CloudFront for video delivery
- **Storage**: S3 for video files and assets
- **Monitoring**: Structured logging and metrics

## Competitive Advantages

1. **Cost Efficiency**: Significantly cheaper than LiveBarn while providing better quality
2. **Community Driven**: Parents participate in recording, reducing operational costs
3. **AI Integration**: Advanced features not available in competing platforms
4. **Scalability**: Automated systems reduce manual intervention
5. **Quality**: Professional broadcast quality through multi-camera coordination

## Revenue Model

### Subscription Tiers
- **Basic**: Live compilation only ($9.99/month)
- **Premium**: HD downloads, highlights, sharing ($19.99/month)
- **Elite**: AI commentary, advanced analytics ($29.99/month)

### Monetization Strategy
- **Family Subscriptions**: Group pricing for multiple family members
- **Team Subscriptions**: Bulk pricing for entire teams
- **Parent Incentives**: Credits for consistent camera participation
- **Referral Program**: Bonuses for bringing new subscribers

## Contributing

We welcome contributions to the Hockey Live App! Please read our contributing guidelines and code of conduct.

### Development Process
1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Code review and merge

### Areas for Contribution
- Mobile app UI/UX improvements
- Backend API optimization
- Video processing enhancements
- Documentation updates
- Testing and quality assurance

## Roadmap

### Phase 1 (Current): Basic Multi-Camera System
-  Arena positioning system
-  Parent synchronization flow
-  Video compilation pipeline
- = Beta testing with local teams

### Phase 2 (6-12 months): AI Enhancement
- = SAM 2 integration for player tracking
- = Enhanced video overlays
- = Basic event detection
- = Performance optimization

### Phase 3 (12-24 months): Automated Commentary
- ó Grok 4 Heavy integration
- ó Commentary generation system
- ó TTS integration
- ó Multi-language support

### Phase 4 (24+ months): Complete AI Broadcasting
- ó Advanced analytics
- ó Automated highlight generation
- ó Predictive insights
- ó International expansion

## Support

- **Documentation**: Comprehensive guides in `/docs` directory
- **Issues**: Report bugs and request features via GitHub Issues
- **Community**: Join our Discord server for discussions
- **Contact**: support@hockeylive.app

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Meta AI for SAM 2 technology
- OpenAI for AI integration guidance
- The hockey community for inspiration and feedback
- Contributing developers and testers

---

**Hockey Live App** - Bringing professional-quality hockey broadcasting to every rink, one game at a time.