export const locales = ['el', 'en'] as const
export type Locale = (typeof locales)[number]

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export const contact = {
  phoneDisplay: '+30 000 000 0000',
  phoneHref: 'tel:+300000000000',
  whatsappHref: 'https://wa.me/300000000000',
  appointmentHref: '#contact',
  email: 'info@example.com',
}

export const content = {
  el: {
    metadata: {
      title: 'Παθολόγος σε Σαντορίνη & Άλιμο | 24/7 Ιατρική Φροντίδα',
      description:
        'Έμπιστη παθολογική φροντίδα σε Άλιμο και Σαντορίνη, με 25 χρόνια εμπειρίας, κατ οίκον και ξενοδοχειακές επισκέψεις, τηλεϊατρική και υπηρεσίες για ταξιδιώτες.',
    },
    emergency: '24/7 Ιατρός στη Σαντορίνη',
    heroTitle: '25 χρόνια δίπλα στον άνθρωπο. Ιατρική φροντίδα σε Αθήνα & Σαντορίνη.',
    heroCopy:
      'Μια σταθερή ιατρική παρουσία για κατοίκους, επισκέπτες και ξενοδοχειακές μονάδες, με εμπειρία στην παθολογία, άμεση πρόσβαση και καθαρή καθοδήγηση όταν υπάρχει πίεση χρόνου.',
    primaryCta: 'Καλέστε άμεσα',
    secondaryCta: 'Κλείστε ραντεβού',
    proof: [
      ['25+', 'χρόνια κλινικής εμπειρίας'],
      ['24/7', 'διαθεσιμότητα για επείγοντα στη Σαντορίνη'],
      ['2', 'ιατρικά σημεία σε Άλιμο και Μεσαριά'],
    ],
    introEyebrow: 'Διπλή παρουσία',
    introTitle: 'Η εμπιστοσύνη του Αλίμου, με άμεση πρόσβαση στη Σαντορίνη.',
    introCopy:
      'Το site χωρίζει καθαρά δύο ανάγκες: τη συνεχή φροντίδα των μόνιμων ασθενών και την άμεση, αγγλόφωνη υποστήριξη για ταξιδιώτες που χρειάζονται γιατρό στο νησί.',
    servicesTitle: 'Υπηρεσίες',
    services: [
      {
        title: 'Γενική Παθολογία & Πρόληψη',
        copy: 'Check-up, ρύθμιση πίεσης, διαβήτη και χρόνιων νοσημάτων, με συνέχεια στην παρακολούθηση.',
      },
      {
        title: '24/7 επισκέψεις σε σπίτι ή ξενοδοχείο',
        copy: 'Άμεση αξιολόγηση σε ξενοδοχεία, βίλες και κατοικίες στη Σαντορίνη, με σαφείς οδηγίες για τα επόμενα βήματα.',
      },
      {
        title: 'Τηλεϊατρική & follow-up',
        copy: 'Συνέχεια της φροντίδας μετά την αναχώρηση, ιδανική για ταξιδιώτες που χρειάζονται ιατρική καθοδήγηση από απόσταση.',
      },
      {
        title: 'Travel medicine & IV therapies',
        copy: 'Υποστήριξη για αφυδάτωση, jet lag, γαστρεντερικά, λοιμώξεις και ανάγκες ταξιδιωτικής ιατρικής.',
      },
    ],
    locationsTitle: 'Τοποθεσίες',
    locations: [
      {
        title: 'Ιατρείο Αλίμου',
        copy: 'Σταθερό περιβάλλον για χρόνια παρακολούθηση, προληπτική ιατρική και οικογενειακή φροντίδα στην Αθήνα.',
      },
      {
        title: 'Ιατρείο Μεσαριάς, Σαντορίνη',
        copy: 'Κομβικό σημείο στο νησί για κατοίκους και επισκέπτες, με δυνατότητα επισκέψεων σε ξενοδοχεία και βίλες.',
      },
    ],
    touristsTitle: 'Για επισκέπτες της Σαντορίνης',
    touristsCopy:
      'Οι ταξιδιώτες χρειάζονται ασφάλεια, γλώσσα και ευκολία. Η αγγλόφωνη ιατρική επικοινωνία, οι επισκέψεις στο χώρο διαμονής και τα αναλυτικά reports για διεθνείς ασφαλιστικές μειώνουν την αβεβαιότητα από το πρώτο λεπτό.',
    touristBullets: [
      'English-speaking doctor in Santorini',
      'Hotel doctor visits and urgent assessment',
      'Medical reports and invoices for travel insurance',
      'Coordination with local healthcare infrastructure when needed',
    ],
    contactTitle: 'Άμεση επικοινωνία',
    contactCopy:
      'Αν πρόκειται για επείγον περιστατικό, προτιμήστε τηλεφωνική επικοινωνία. Για προγραμματισμένο ραντεβού, μπορείτε να ζητήσετε διαθέσιμη ώρα για Άλιμο, Μεσαριά ή τηλεϊατρική.',
    footer: 'Παθολογική φροντίδα σε Αθήνα και Σαντορίνη.',
  },
  en: {
    metadata: {
      title: 'Doctor in Santorini & Athens | 24/7 Medical Care',
      description:
        'Premium internal medicine care in Santorini and Athens, with 25 years of clinical experience, hotel visits, home visits, telemedicine and travel insurance documentation.',
    },
    emergency: '24/7 Doctor in Santorini',
    heroTitle: 'Premium medical care and emergency services in Santorini.',
    heroCopy:
      'Trusted internal medicine care for residents, travelers and hospitality partners, combining 25 years of clinical excellence with direct access when time matters.',
    primaryCta: 'Call an emergency doctor',
    secondaryCta: 'Book an appointment',
    proof: [
      ['25+', 'years of clinical experience'],
      ['24/7', 'urgent medical availability in Santorini'],
      ['2', 'medical locations in Athens and Santorini'],
    ],
    introEyebrow: 'Dual presence',
    introTitle: 'Long-standing trust in Athens. Immediate care in Santorini.',
    introCopy:
      'The practice serves two clear needs: continuous care for local patients and fast English-speaking medical support for visitors who need a doctor while away from home.',
    servicesTitle: 'Services',
    services: [
      {
        title: 'Internal Medicine & Preventive Care',
        copy: 'Check-ups, blood pressure and diabetes management, chronic disease follow-up and long-term patient guidance.',
      },
      {
        title: '24/7 home and hotel visits',
        copy: 'Prompt medical assessment at hotels, villas and residences in Santorini, with clear next steps and escalation when needed.',
      },
      {
        title: 'Telemedicine & follow-up consultations',
        copy: 'Continuity of care after departure, useful for travelers who need medical advice from abroad.',
      },
      {
        title: 'Travel medicine & IV therapies',
        copy: 'Support for dehydration, jet lag, gastrointestinal issues, infections and common travel medicine needs.',
      },
    ],
    locationsTitle: 'Locations',
    locations: [
      {
        title: 'Alimos practice, Athens',
        copy: 'A stable clinical setting for long-term monitoring, preventive medicine and family-oriented care.',
      },
      {
        title: 'Mesaria practice, Santorini',
        copy: 'A central Santorini location for residents and visitors, with hotel and villa visits available across the island.',
      },
    ],
    touristsTitle: 'For Santorini visitors',
    touristsCopy:
      'Visitors searching for a doctor need safety, language and convenience. English-speaking medical communication, visits at the place of stay and detailed reports for international insurance reduce uncertainty from the first minute.',
    touristBullets: [
      'Doctor in Santorini and Medical Center Mesaria',
      'Hotel doctor Santorini and urgent assessment',
      'Detailed medical reports and invoices for travel insurance',
      'Coordination with local healthcare infrastructure when needed',
    ],
    contactTitle: 'Contact the practice',
    contactCopy:
      'For urgent cases, calling is recommended. For scheduled care, request an appointment in Alimos, Mesaria or through telemedicine.',
    footer: 'Internal medicine care in Athens and Santorini.',
  },
} satisfies Record<Locale, {
  metadata: { title: string; description: string }
  emergency: string
  heroTitle: string
  heroCopy: string
  primaryCta: string
  secondaryCta: string
  proof: [string, string][]
  introEyebrow: string
  introTitle: string
  introCopy: string
  servicesTitle: string
  services: { title: string; copy: string }[]
  locationsTitle: string
  locations: { title: string; copy: string }[]
  touristsTitle: string
  touristsCopy: string
  touristBullets: string[]
  contactTitle: string
  contactCopy: string
  footer: string
}>
