export type SeedJob = {
	title: string;
	company: string;
	location: string;
	category: 'Web Development' | 'AI / ML' | 'Mobile Development';
	skills: string[];
	description: string;
	requirements: string[];
	salary?: string;
};

export const jobSeedData: SeedJob[] = [
	{
		title: 'Frontend Developer',
		company: 'PixelForge Labs',
		location: 'Lahore, PK',
		category: 'Web Development',
		skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST API'],
		description:
			'Build scalable UI modules for a SaaS dashboard, collaborate with product and backend teams, and improve UX performance.',
		requirements: [
			'2+ years in frontend development',
			'Strong React and TypeScript fundamentals',
			'Experience consuming REST APIs',
			'Good understanding of component architecture',
		],
		salary: '$20K - $32K',
	},
	{
		title: 'Senior Frontend Engineer',
		company: 'NorthPeak Digital',
		location: 'Remote',
		category: 'Web Development',
		skills: ['React', 'Next.js', 'TypeScript', 'GraphQL'],
		description:
			'Lead frontend architecture for multi-tenant web applications with strong code quality, accessibility, and performance goals.',
		requirements: [
			'5+ years frontend engineering experience',
			'Advanced React and Next.js skills',
			'GraphQL integration experience',
			'Mentoring junior developers',
		],
		salary: '$60K - $95K',
	},
	{
		title: 'Full Stack JavaScript Developer',
		company: 'CloudNest',
		location: 'Karachi, PK',
		category: 'Web Development',
		skills: ['Node.js', 'Express', 'React', 'MongoDB'],
		description:
			'Develop end-to-end features from APIs to polished interfaces in a collaborative Agile environment.',
		requirements: [
			'Hands-on MERN stack project experience',
			'API design and database schema knowledge',
			'Unit testing basics',
			'Clear communication with cross-functional teams',
		],
		salary: '$28K - $40K',
	},
	{
		title: 'Backend Node.js Developer',
		company: 'DataBridge Systems',
		location: 'Islamabad, PK',
		category: 'Web Development',
		skills: ['Node.js', 'Express', 'MongoDB', 'Redis'],
		description:
			'Own backend services for high-traffic platforms, improve reliability, and optimize API response times.',
		requirements: [
			'3+ years backend development',
			'Node.js and MongoDB expertise',
			'Caching and performance tuning experience',
			'Knowledge of authentication and authorization',
		],
		salary: '$30K - $48K',
	},
	{
		title: 'UI Engineer',
		company: 'BrightLabs',
		location: 'Hybrid - Lahore, PK',
		category: 'Web Development',
		skills: ['JavaScript', 'React', 'CSS', 'Figma'],
		description:
			'Translate design systems into production-ready interfaces and maintain visual consistency across the product.',
		requirements: [
			'2+ years UI engineering',
			'Strong CSS and responsive design',
			'Ability to collaborate with designers',
			'React component development experience',
		],
		salary: '$22K - $35K',
	},
	{
		title: 'DevOps-Aware Web Developer',
		company: 'ShipStack',
		location: 'Remote',
		category: 'Web Development',
		skills: ['React', 'Node.js', 'Docker', 'CI/CD'],
		description:
			'Develop web features and support deployment pipelines for fast and stable releases.',
		requirements: [
			'Experience with React and Node.js',
			'Docker and CI/CD familiarity',
			'Debugging in cloud environments',
			'Production issue troubleshooting',
		],
		salary: '$45K - $70K',
	},
	{
		title: 'Junior Web Developer',
		company: 'CodeHarbor',
		location: 'Faisalabad, PK',
		category: 'Web Development',
		skills: ['HTML', 'CSS', 'JavaScript', 'React'],
		description:
			'Contribute to customer-facing web applications while learning modern frontend and backend practices.',
		requirements: [
			'Strong programming fundamentals',
			'Portfolio with web projects',
			'Basic React knowledge',
			'Willingness to learn quickly',
		],
		salary: '$10K - $18K',
	},
	{
		title: 'Web Performance Engineer',
		company: 'VelocityApps',
		location: 'Remote',
		category: 'Web Development',
		skills: ['React', 'Lighthouse', 'Webpack', 'TypeScript'],
		description:
			'Improve page speed, optimize build pipelines, and monitor frontend performance metrics.',
		requirements: [
			'Experience with frontend build tooling',
			'Deep understanding of web vitals',
			'TypeScript proficiency',
			'Performance optimization track record',
		],
		salary: '$52K - $80K',
	},
	{
		title: 'Machine Learning Engineer',
		company: 'NeuronEdge',
		location: 'Bangalore, IN',
		category: 'AI / ML',
		skills: ['Python', 'PyTorch', 'TensorFlow', 'MLOps'],
		description:
			'Build and deploy production ML models for recommendation and prediction pipelines.',
		requirements: [
			'3+ years ML engineering experience',
			'Model training and deployment expertise',
			'Proficiency in Python ML ecosystem',
			'Experiment tracking knowledge',
		],
		salary: '$48K - $82K',
	},
	{
		title: 'AI Engineer (LLM Applications)',
		company: 'PromptLayer Labs',
		location: 'Remote',
		category: 'AI / ML',
		skills: ['Python', 'LangChain', 'Vector DB', 'FastAPI'],
		description:
			'Develop LLM-based workflows, retrieval pipelines, and evaluation loops for enterprise AI assistants.',
		requirements: [
			'Hands-on LLM project experience',
			'RAG pipeline understanding',
			'API development with FastAPI',
			'Prompt and response quality evaluation',
		],
		salary: '$65K - $110K',
	},
	{
		title: 'Data Scientist',
		company: 'InsightOrbit',
		location: 'Lahore, PK',
		category: 'AI / ML',
		skills: ['Python', 'Pandas', 'Scikit-learn', 'SQL'],
		description:
			'Analyze product data, build predictive models, and communicate insights to business teams.',
		requirements: [
			'Strong statistics and modeling skills',
			'SQL and data wrangling expertise',
			'Scikit-learn model development',
			'Storytelling with data',
		],
		salary: '$24K - $45K',
	},
	{
		title: 'Computer Vision Engineer',
		company: 'VisionGrid',
		location: 'Karachi, PK',
		category: 'AI / ML',
		skills: ['Python', 'OpenCV', 'PyTorch', 'Docker'],
		description:
			'Create image analysis models and optimize inference pipelines for edge and cloud systems.',
		requirements: [
			'Computer vision project portfolio',
			'Deep learning implementation experience',
			'Model optimization for deployment',
			'Docker-based workflows',
		],
		salary: '$35K - $60K',
	},
	{
		title: 'NLP Engineer',
		company: 'TextMind AI',
		location: 'Remote',
		category: 'AI / ML',
		skills: ['Python', 'Transformers', 'spaCy', 'Hugging Face'],
		description:
			'Design text classification and information extraction services for multilingual datasets.',
		requirements: [
			'NLP fundamentals and model training',
			'Transformer-based model familiarity',
			'Experience with evaluation metrics',
			'Python backend integration',
		],
		salary: '$55K - $90K',
	},
	{
		title: 'MLOps Engineer',
		company: 'DeployIQ',
		location: 'Dubai, UAE',
		category: 'AI / ML',
		skills: ['Python', 'Kubernetes', 'Docker', 'MLflow'],
		description:
			'Build scalable training and deployment pipelines, CI/CD for ML, and observability for model health.',
		requirements: [
			'MLOps and cloud deployment experience',
			'Kubernetes and container orchestration',
			'Experiment and model registry management',
			'Automation mindset',
		],
		salary: '$70K - $120K',
	},
	{
		title: 'Applied AI Research Engineer',
		company: 'FutureCompute',
		location: 'Remote',
		category: 'AI / ML',
		skills: ['Python', 'Deep Learning', 'PyTorch', 'Research'],
		description:
			'Prototype advanced models and transfer research ideas into production-grade AI features.',
		requirements: [
			'Strong deep learning fundamentals',
			'Research paper implementation ability',
			'Experiment design and documentation',
			'Collaboration with product teams',
		],
		salary: '$75K - $130K',
	},
	{
		title: 'Data Engineer (AI Platform)',
		company: 'PipelineCore',
		location: 'Islamabad, PK',
		category: 'AI / ML',
		skills: ['Python', 'SQL', 'Airflow', 'Spark'],
		description:
			'Develop reliable data pipelines and feature stores to power machine learning systems.',
		requirements: [
			'ETL and data modeling experience',
			'Airflow orchestration knowledge',
			'Strong SQL and Python skills',
			'Big data processing familiarity',
		],
		salary: '$34K - $58K',
	},
	{
		title: 'Android Developer',
		company: 'Mobix Labs',
		location: 'Lahore, PK',
		category: 'Mobile Development',
		skills: ['Kotlin', 'Android SDK', 'MVVM', 'Firebase'],
		description:
			'Build and maintain Android apps with clean architecture and high performance.',
		requirements: [
			'2+ years Android app development',
			'Kotlin and Android SDK proficiency',
			'State management and architecture skills',
			'Play Store release experience',
		],
		salary: '$18K - $30K',
	},
	{
		title: 'iOS Developer',
		company: 'SwiftWave',
		location: 'Remote',
		category: 'Mobile Development',
		skills: ['Swift', 'UIKit', 'SwiftUI', 'REST API'],
		description:
			'Develop elegant iOS experiences and optimize application performance for modern Apple devices.',
		requirements: [
			'Strong Swift programming skills',
			'Experience with UIKit or SwiftUI',
			'API integration experience',
			'App lifecycle and testing knowledge',
		],
		salary: '$42K - $78K',
	},
	{
		title: 'React Native Developer',
		company: 'CrossPlat Studio',
		location: 'Karachi, PK',
		category: 'Mobile Development',
		skills: ['React Native', 'TypeScript', 'Redux', 'Expo'],
		description:
			'Create cross-platform mobile apps with reusable components and robust performance.',
		requirements: [
			'Experience with React Native in production',
			'TypeScript and state management skills',
			'Knowledge of native module integration',
			'Debugging and profiling capability',
		],
		salary: '$26K - $44K',
	},
	{
		title: 'Flutter Developer',
		company: 'SkyApps',
		location: 'Remote',
		category: 'Mobile Development',
		skills: ['Flutter', 'Dart', 'Firebase', 'REST API'],
		description:
			'Build scalable Flutter applications for Android and iOS with smooth UI and clean code architecture.',
		requirements: [
			'2+ years Flutter development',
			'Dart programming experience',
			'Firebase integration',
			'REST API and state management understanding',
		],
		salary: '$24K - $42K',
	},
	{
		title: 'Mobile QA Automation Engineer',
		company: 'TestSprint',
		location: 'Islamabad, PK',
		category: 'Mobile Development',
		skills: ['Appium', 'JavaScript', 'CI/CD', 'Mobile Testing'],
		description:
			'Automate mobile test pipelines and ensure release quality across multiple devices.',
		requirements: [
			'Automation testing experience',
			'Appium scripting skills',
			'CI pipeline integration knowledge',
			'Defect analysis and reporting',
		],
		salary: '$20K - $34K',
	},
	{
		title: 'Mobile App Product Engineer',
		company: 'NovaLoop',
		location: 'Remote',
		category: 'Mobile Development',
		skills: ['React Native', 'Node.js', 'MongoDB', 'TypeScript'],
		description:
			'Work across mobile and backend layers to ship product features quickly and reliably.',
		requirements: [
			'Cross-functional product mindset',
			'React Native and backend integration experience',
			'Database and API fundamentals',
			'Good communication and ownership',
		],
		salary: '$38K - $62K',
	},
	{
		title: 'Junior Mobile Developer',
		company: 'AppStart',
		location: 'Peshawar, PK',
		category: 'Mobile Development',
		skills: ['Flutter', 'Dart', 'Git', 'UI Design'],
		description:
			'Assist in mobile app feature development and learn production practices with senior mentoring.',
		requirements: [
			'Basic Flutter/Dart understanding',
			'Strong programming fundamentals',
			'Version control familiarity',
			'Eagerness to learn and improve',
		],
		salary: '$9K - $16K',
	},
	{
		title: 'Senior Mobile Architect',
		company: 'Orbit Mobile',
		location: 'Remote',
		category: 'Mobile Development',
		skills: ['Kotlin', 'Swift', 'React Native', 'Architecture'],
		description:
			'Define mobile architecture strategy, performance standards, and cross-team engineering best practices.',
		requirements: [
			'7+ years mobile engineering',
			'Architecture and scalability expertise',
			'Leadership and mentoring skills',
			'Multi-platform development experience',
		],
		salary: '$90K - $145K',
	},
];
