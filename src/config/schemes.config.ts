// Government Schemes Configuration
export interface Scheme {
  id: string
  title: string
  description: string
  deadline: string
  amount: string
  eligibility: string
  isNew: boolean
  isUrgent: boolean
  category: 'subsidy' | 'loan' | 'insurance' | 'training'
}

export const SCHEMES_CONFIG = {
  // Government Schemes Data
  schemes: [
    {
      id: '1',
      title: 'PM-KISAN Scheme 2025',
      description: 'Direct income support of ₹6000 per year to farmer families',
      deadline: '2025-03-31',
      amount: '₹6,000/year',
      eligibility: 'All farmer families with cultivable land',
      isNew: true,
      isUrgent: false,
      category: 'subsidy'
    },
    {
      id: '2',
      title: 'Crop Insurance Scheme',
      description: 'Comprehensive risk coverage for crops against natural calamities',
      deadline: '2025-02-15',
      amount: 'Up to ₹2,00,000',
      eligibility: 'All farmers with Aadhaar card',
      isNew: false,
      isUrgent: true,
      category: 'insurance'
    },
    {
      id: '3',
      title: 'Kisan Credit Card',
      description: 'Easy access to credit for agricultural needs at subsidized rates',
      deadline: '2025-12-31',
      amount: 'Up to ₹3,00,000',
      eligibility: 'Farmers with land records',
      isNew: true,
      isUrgent: false,
      category: 'loan'
    },
    {
      id: '4',
      title: 'Soil Health Card Scheme',
      description: 'Free soil testing and nutrient management recommendations',
      deadline: '2025-06-30',
      amount: 'Free Service',
      eligibility: 'All farmers',
      isNew: false,
      isUrgent: false,
      category: 'training'
    },
    {
      id: '5',
      title: 'Pradhan Mantri Fasal Bima Yojana',
      description: 'Comprehensive crop insurance with premium subsidy',
      deadline: '2025-04-15',
      amount: 'Up to ₹5,00,000',
      eligibility: 'Farmers with bank account',
      isNew: false,
      isUrgent: true,
      category: 'insurance'
    },
    {
      id: '6',
      title: 'National Agriculture Market (e-NAM)',
      description: 'Online trading platform for agricultural commodities',
      deadline: '2025-12-31',
      amount: 'Better Price Discovery',
      eligibility: 'All registered farmers',
      isNew: true,
      isUrgent: false,
      category: 'subsidy'
    },
    {
      id: '7',
      title: 'Micro Irrigation Fund',
      description: 'Financial support for drip and sprinkler irrigation systems',
      deadline: '2025-08-31',
      amount: 'Up to ₹1,50,000',
      eligibility: 'Small and marginal farmers',
      isNew: false,
      isUrgent: false,
      category: 'loan'
    }
  ] as Scheme[],
  
  // Category Configuration
  categories: {
    subsidy: {
      color: 'bg-green-500',
      icon: '💰',
      name: 'Subsidy'
    },
    loan: {
      color: 'bg-blue-500',
      icon: '🏦',
      name: 'Loan'
    },
    insurance: {
      color: 'bg-purple-500',
      icon: '🛡️',
      name: 'Insurance'
    },
    training: {
      color: 'bg-orange-500',
      icon: '📚',
      name: 'Training'
    }
  },
  
  // Urgent Notices
  urgentNotices: [
    {
      id: 'urgent-1',
      title: 'Crop Insurance Registration Deadline',
      message: 'Apply before 15th February 2025',
      fullMessage: 'The deadline for Crop Insurance Scheme registration is approaching fast. You must complete your registration before 15th February to ensure your crops are covered for the upcoming season.'
    }
  ],
  
  // Contact Information
  contact: {
    officialWebsite: 'gov.in',
    helpline: '1800-180-1551',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    helplines: {
      kisanCallCenter: '1800-180-1551',
      pmKisanHelpline: '155261',
      cropInsurance: '1800-200-7710'
    },
    portals: [
      'pmkisan.gov.in',
      'agrimarketing.gov.in',
      'mkisan.gov.in'
    ]
  },
  
  // UI Messages
  messages: {
    urgentBanner: 'URGENT: Registration Deadline Approaching',
    modalUrgentBanner: 'URGENT: Complete your applications before deadlines',
    moreAvailable: 'more schemes available',
    needHelp: '📞 Need Help?',
    helplineNumbers: 'Helpline Numbers',
    onlinePortals: 'Online Portals',
    allAvailableSchemes: '🌟 All Available Schemes',
    availableSchemes: 'Available schemes for farmers'
  }
} as const
