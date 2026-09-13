import { MarketplaceListing } from '../types';

export const MOCK_MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  // ==========================================
  // 1. HORSE TRAILERS (10 Listings with Multiple Real Trailer Photos)
  // ==========================================
  {
    id: 'mkt-1',
    title: '2022 Featherlite 3-Horse Slant Gooseneck with AC Living Quarters',
    category: 'trailers',
    price: 34500,
    location: 'Santa Rosa, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Horse_trailer.jpg/800px-Horse_trailer.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Horse_trailer_with_doors_open.jpg/800px-Horse_trailer_with_doors_open.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Horse_trailer_at_Fair.JPG/800px-Horse_trailer_at_Fair.JPG'
    ],
    sellerName: 'Tom Bradley',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    condition: 'Excellent Used',
    description: 'All-aluminum 3-horse slant load gooseneck with drop-down feed windows, collapsible rear tack compartment, insulated roof, 10-ply radial tires, and AC living quarters hookup. Includes walk-thru door to horse area and padded slam-latch dividers.',
    createdAt: '1 day ago',
    featured: true
  },
  {
    id: 'mkt-2',
    title: '2020 4-Star 2-Horse Bumper Pull Warmblood Deluxe',
    category: 'trailers',
    price: 18750,
    location: 'Petaluma, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Cheval_Liberte_Gold_One_Pullman_V2.jpg/800px-Cheval_Liberte_Gold_One_Pullman_V2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Pferdeanh%C3%A4nger_B%C3%B6ckmann_Comfort.jpg/800px-Pferdeanh%C3%A4nger_B%C3%B6ckmann_Comfort.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Horse_trailer_with_doors_open.jpg/800px-Horse_trailer_with_doors_open.jpg'
    ],
    sellerName: 'Garrison Equine Transport',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 5.0,
    sellerVerified: true,
    condition: 'Like New',
    description: 'Extra tall (7ft 8in) and extra wide warmblood spacing with easy-lift rear ramp, side escape doors, hydraulic jack, and oversized dressing room. Impeccably serviced with new wheel bearings and brake pads.',
    createdAt: '2 days ago'
  },
  {
    id: 'mkt-3',
    title: '2023 Cimarron Norstar 4-Horse Head-to-Head Gooseneck',
    category: 'trailers',
    price: 48900,
    location: 'Sonoma, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Equi-Trek_Star-Treka.jpg/800px-Equi-Trek_Star-Treka.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Horse_trailer_at_Fair.JPG/800px-Horse_trailer_at_Fair.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/BigComboTrailer.jpg/800px-BigComboTrailer.jpg'
    ],
    sellerName: 'West Coast Equestrian Rigs',
    sellerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    condition: 'Mint / Showroom',
    description: 'Premier show rig with side & rear loading ramps, box stall conversion capability, interior camera system, and insulated ceiling. Haul up to 4 large warmbloods in VIP comfort with ample central standing aisle.',
    createdAt: '3 days ago',
    featured: true
  },
  {
    id: 'mkt-4',
    title: '2019 Sundowner 2-Horse Straight Load Bumper Pull with Ramp',
    category: 'trailers',
    price: 14500,
    location: 'Napa, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Ifor_Williams_horsebox.jpg/800px-Ifor_Williams_horsebox.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Horse_trailer_with_doors_open.jpg/800px-Horse_trailer_with_doors_open.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Horse_trailer.jpg/800px-Horse_trailer.jpg'
    ],
    sellerName: 'Laura Kensington',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.8,
    sellerVerified: true,
    condition: 'Very Good',
    description: 'Lightweight aluminum trailer towable by standard SUVs/half-ton trucks. Padded chest and butt bars, removable head divider, and roomy walk-in front tack room with 2 saddle racks and bridle hooks.',
    createdAt: '4 days ago'
  },
  {
    id: 'mkt-5',
    title: '2021 Lakota 3-Horse Slant with 10ft Short Wall Living Quarters',
    category: 'trailers',
    price: 52000,
    location: 'Vacaville, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Equi-Trek_Star-Treka.jpg/800px-Equi-Trek_Star-Treka.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Horse_trailer.jpg/800px-Horse_trailer.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Horse_trailer_at_Fair.JPG/800px-Horse_trailer_at_Fair.JPG'
    ],
    sellerName: 'Bradford Ranch LLC',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.7,
    sellerVerified: true,
    condition: 'Excellent Used',
    description: 'Fully loaded living quarters with queen bed, full bathroom with shower, refrigerator, microwave, awning, and Onan 4.0kW generator. Heavy duty hydraulic jack and manger storage compartments.',
    createdAt: '5 days ago'
  },
  {
    id: 'mkt-6',
    title: '2018 Exiss 2-Horse Aluminum Slant Load with Tack Room',
    category: 'trailers',
    price: 11200,
    location: 'Novato, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Pferdeanh%C3%A4nger_B%C3%B6ckmann_Comfort.jpg/800px-Pferdeanh%C3%A4nger_B%C3%B6ckmann_Comfort.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Cheval_Liberte_Gold_One_Pullman_V2.jpg/800px-Cheval_Liberte_Gold_One_Pullman_V2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Horse_trailer_with_doors_open.jpg/800px-Horse_trailer_with_doors_open.jpg'
    ],
    sellerName: 'Cynthia Vance',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    sellerRating: 5.0,
    sellerVerified: true,
    condition: 'Good',
    description: 'Clean, dependable bumper pull trailer with rubber torsion axles, floor mats in great shape, LED interior lighting, and swing-out saddle rack in dressing room. Ready to haul.',
    createdAt: '6 days ago'
  },
  {
    id: 'mkt-6b',
    title: '2024 Bloomer 4-Horse Slant Gooseneck with Custom 14ft Outlaw LQ',
    category: 'trailers',
    price: 98500,
    location: 'Sonoma, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Horse_trailer_at_Fair.JPG/800px-Horse_trailer_at_Fair.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Equi-Trek_Star-Treka.jpg/800px-Equi-Trek_Star-Treka.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/BigComboTrailer.jpg/800px-BigComboTrailer.jpg'
    ],
    sellerName: 'Premier Rigs California',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 5.0,
    sellerVerified: true,
    condition: 'Brand New',
    description: 'The pinnacle of luxury horse transport. Heavy-duty hydraulic slide out, Italian leather sofa, satellite TV, dual 8,000lb axles with disc brakes, and integrated Manger camera monitoring system.',
    createdAt: '3 days ago',
    featured: true
  },
  {
    id: 'mkt-6c',
    title: '2017 Kingston 2-Horse Extra-Tall Straight Load with Dressing Room',
    category: 'trailers',
    price: 13800,
    location: 'Sebastopol, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Horse_trailer_with_doors_open.jpg/800px-Horse_trailer_with_doors_open.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Ifor_Williams_horsebox.jpg/800px-Ifor_Williams_horsebox.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Horsebox_and_trailer.jpg/800px-Horsebox_and_trailer.jpg'
    ],
    sellerName: 'David Sterling',
    sellerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    condition: 'Excellent Used',
    description: 'Classic Kingston craftsmanship with fiberglass roof for cooler interior temps. Easy-lift spring loaded rear ramp, full walk-thru front escape doors, and new Goodyear radial tires.',
    createdAt: '1 week ago'
  },
  {
    id: 'mkt-6d',
    title: '2021 Shadow 2-Horse Pro Series Aluminum Bumper Pull',
    category: 'trailers',
    price: 16200,
    location: 'Healdsburg, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Horsebox_and_trailer.jpg/800px-Horsebox_and_trailer.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Horse_trailer.jpg/800px-Horse_trailer.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Cheval_Liberte_Gold_One_Pullman_V2.jpg/800px-Cheval_Liberte_Gold_One_Pullman_V2.jpg'
    ],
    sellerName: 'Klaus Meier',
    sellerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.8,
    sellerVerified: true,
    condition: 'Like New',
    description: 'All-aluminum slant load with rear collapsible tack and rechargeable breakaway battery system. Sliding tinted safety windows and floor mats in pristine condition.',
    createdAt: '4 days ago'
  },
  {
    id: 'mkt-6e',
    title: '2023 Hart 3-Horse Gooseneck with Hay Rack & Water Tank',
    category: 'trailers',
    price: 41000,
    location: 'Petaluma, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Mightytrailer.jpg/800px-Mightytrailer.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/BigComboTrailer.jpg/800px-BigComboTrailer.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Horse_trailer_at_Fair.JPG/800px-Horse_trailer_at_Fair.JPG'
    ],
    sellerName: 'Sonoma Trailers & Supply',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.95,
    sellerVerified: true,
    condition: 'Like New',
    description: 'Triple-wall insulated construction with aerodynamic nose cone, roof-mounted 8ft hay pod with access ladder, 40-gallon pressurized water tank, and padded spring dividers.',
    createdAt: '2 days ago'
  },

  // ==========================================
  // 2. SADDLES & TACK (10 Listings)
  // ==========================================
  {
    id: 'mkt-7',
    title: 'Custom 17.5" CWD 2Gs Mademoiselle Jump Saddle',
    category: 'tack',
    price: 4650,
    location: 'Sonoma, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/JumpSaddle2.jpg/800px-JumpSaddle2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Selle1.jpg/800px-Selle1.jpg'
    ],
    sellerName: 'Elena Rostova',
    sellerAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 5.0,
    sellerVerified: true,
    description: 'Dark Havana full calfskin leather with carbon composite dynamick tree. Medium-wide tree, 3C forward flaps, integrated gel-injected foam panels for maximum shoulder freedom.',
    createdAt: '2 days ago',
    featured: true
  },
  {
    id: 'mkt-8',
    title: '17" Devoucoux Biarritz O Jumping Saddle (Oakbark Calfskin)',
    category: 'tack',
    price: 3800,
    location: 'Petaluma, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Showing-saddle.jpg/800px-Showing-saddle.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/English_saddle.jpg/800px-English_saddle.jpg'
    ],
    sellerName: 'Claire Montgomery',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    description: 'Semi-deep seat offering close-contact balance. 2A standard flap, D3D panels engineered for high-wither sport horses. Condition 9/10, cleaned weekly with Devoucoux balm.',
    createdAt: '3 days ago'
  },
  {
    id: 'mkt-9',
    title: '18" Voltaire Design Palm Beach Jump Saddle with Pro Panels',
    category: 'tack',
    price: 4200,
    location: 'San Rafael, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Selle1.jpg/800px-Selle1.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/JumpSaddle2.jpg/800px-JumpSaddle2.jpg'
    ],
    sellerName: 'Marcus Sterling',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.8,
    sellerVerified: true,
    description: 'Classic French luxury grain/calfskin hybrid with blue piping accents. 3AA long/forward flap, second-skin pro panels, fits wide-shouldered warmbloods and thoroughbreds.',
    createdAt: '4 days ago'
  },
  {
    id: 'mkt-10',
    title: '17.5" Antarès Contact Monoflap Cross Country Saddle',
    category: 'tack',
    price: 3400,
    location: 'Santa Rosa, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/English_saddle.jpg/800px-English_saddle.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/SaddleUnderside.jpg/800px-SaddleUnderside.jpg'
    ],
    sellerName: 'Devon Hughes',
    sellerAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    description: 'Flat seat eventing monoflap designed for extreme security and close contact over cross-country fences. Buffalo leather reinforcement on lower flap.',
    createdAt: '5 days ago'
  },
  {
    id: 'mkt-11',
    title: '16.5" Custom Saddlery Icon Flight Monoflap Dressage Saddle',
    category: 'tack',
    price: 2850,
    location: 'Sebastopol, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Dressage-saddle.jpg/800px-Dressage-saddle.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/SaddleUnderside.jpg/800px-SaddleUnderside.jpg'
    ],
    sellerName: 'Elena Rostova',
    sellerAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 5.0,
    sellerVerified: true,
    description: 'Supple Vienna leather with deep seat, large contoured thigh blocks, and adjustable polyflex tree. 100% natural wool flocked panels for custom reflocking.',
    createdAt: '5 days ago'
  },
  {
    id: 'mkt-12',
    title: '17" Stübben Genesis Special Dressage Saddle (Biomex Seat)',
    category: 'tack',
    price: 2100,
    location: 'Napa, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Dressage-saddle.jpg/800px-Dressage-saddle.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Showing-saddle.jpg/800px-Showing-saddle.jpg'
    ],
    sellerName: 'Kristin Walsh',
    sellerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.8,
    sellerVerified: true,
    description: 'Patented Biomex technology to protect the rider back and coccyx. Premium full-grain cowhide, 31cm medium tree, short wool-flocked panels.',
    createdAt: '6 days ago'
  },
  {
    id: 'mkt-13',
    title: '15.5" Dale Chavez Custom Silver Western Show Saddle',
    category: 'tack',
    price: 3950,
    location: 'Cloverdale, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Half_Arabian_Ladies_Western_Sidesaddle_%282668749735%29.jpg/800px-Half_Arabian_Ladies_Western_Sidesaddle_%282668749735%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Parts_of_an_Western_Saddle.jpg/800px-Parts_of_an_Western_Saddle.jpg'
    ],
    sellerName: 'Cody McCullough',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    sellerRating: 5.0,
    sellerVerified: true,
    description: 'Hand-carved floral tooling with sterling silver engraved corner plates, cantle trim, and matching breast collar. Full Quarter Horse Bars (FQHB) on wood/rawhide tree.',
    createdAt: '1 week ago'
  },
  {
    id: 'mkt-14',
    title: '16" Martin Saddlery FX3 Barrel Racing Saddle',
    category: 'tack',
    price: 2600,
    location: 'Petaluma, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Parts_of_an_Western_Saddle.jpg/800px-Parts_of_an_Western_Saddle.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Miniature_Hand_Made_1_8th_scale_western_saddle_%286338759214%29.jpg/800px-Miniature_Hand_Made_1_8th_scale_western_saddle_%286338759214%29.jpg'
    ],
    sellerName: 'Samantha Riggs',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    description: 'Designed by Clint Sherlin. Features the patented Axis tree for unrestricted shoulder turn, deep chocolate roughout leather with turquoise ostrich seat inlay.',
    createdAt: '1 week ago'
  },
  {
    id: 'mkt-15',
    title: 'Dy\'on Hunter Ergonomic Bridle & Saddle Tack Set',
    category: 'tack',
    price: 380,
    location: 'San Rafael, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/English_saddle.jpg/800px-English_saddle.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/JumpSaddle2.jpg/800px-JumpSaddle2.jpg'
    ],
    sellerName: 'Heritage Tack Room',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    sellerRating: 5.0,
    sellerVerified: true,
    description: 'English full size hunter bridle and matching saddle pad set in English sedgwick leather with anatomic padded monocrown headpiece, padded square raised browband, and matching laced reins.',
    createdAt: '3 days ago'
  },
  {
    id: 'mkt-15b',
    title: '17.5" Schleese Infinity Dressage Saddle (Fully Adjustable Tree)',
    category: 'tack',
    price: 3100,
    location: 'Santa Rosa, CA',
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Dressage-saddle.jpg/800px-Dressage-saddle.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Selle1.jpg/800px-Selle1.jpg'
    ],
    sellerName: 'Amanda Jenkins',
    sellerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.95,
    sellerVerified: true,
    description: 'Features the patented AdapTree which can be continuously adjusted wider or narrower by any certified saddle fitter as your horse muscles up. Independent PSI relief panels.',
    createdAt: '4 days ago'
  },

  // ==========================================
  // 3. HORSES & PONIES (10 Listings)
  // ==========================================
  {
    id: 'mkt-16',
    title: 'Grand Prix Dressage Prospect Dutch Warmblood (16.3hh Gelding)',
    category: 'horses',
    price: 65000,
    breed: 'Dutch Warmblood (KWPN)',
    ageYears: 7,
    discipline: 'Dressage (3rd/4th Level)',
    temperamentScore: 4,
    location: 'Sonoma, CA',
    images: [
      'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Sarah Jenkins',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    description: 'Impeccably bred 16.3hh gelding scoring 72%+ at 3rd level with confirmed flying changes and expressive trot half-passes. Full clean PPE report and 48 X-rays available for review.',
    createdAt: '2 days ago',
    featured: true
  },
  {
    id: 'mkt-17',
    title: '8yr Quarter Horse Gelding (Trail & Roping Veteran)',
    category: 'horses',
    price: 12000,
    breed: 'American Quarter Horse',
    ageYears: 8,
    discipline: 'Ranch Work / Trail',
    temperamentScore: 2,
    location: 'Santa Rosa, CA',
    images: [
      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Mike Davis',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.8,
    sellerVerified: true,
    description: 'Safe, dead-quiet trail partner with true one-hand neck rein. Confident through swift water crossings, heavy brush, and alongside highway traffic. Self-loads in any trailer.',
    createdAt: 'Yesterday'
  },
  {
    id: 'mkt-18',
    title: '6yr Holsteiner Jumper Mare (1.25m Competitor, Clean Vetting)',
    category: 'horses',
    price: 45000,
    breed: 'Holsteiner',
    ageYears: 6,
    discipline: 'Show Jumping (1.20m-1.30m)',
    temperamentScore: 5,
    location: 'Petaluma, CA',
    images: [
      'https://images.unsplash.com/photo-1566251037378-5e04e3bec343?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Oak Creek Sport Horses',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    sellerRating: 5.0,
    sellerVerified: true,
    description: 'Careful, scopey grey mare with huge stride and automatic lead changes. Placed top-3 at Sonoma Horse Park 6-Year-Old Jumper Classic. Sire: Cassini II.',
    createdAt: '4 days ago'
  },
  {
    id: 'mkt-19',
    title: '10yr Connemara/TB Eventing Gelding (USEA Novice Ready)',
    category: 'horses',
    price: 18500,
    breed: 'Connemara / Thoroughbred Cross',
    ageYears: 10,
    discipline: 'Eventing / Pony Club',
    temperamentScore: 3,
    location: 'Napa, CA',
    images: [
      'https://images.unsplash.com/photo-1534773728080-33d31da27ae5?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Jessica Thorne',
    sellerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    description: '15.1hh ultimate all-rounder for ambitious junior or adult amateur. Bold and brave into water and ditches, lovely rhythm in dressage ring, sound with no maintenance required.',
    createdAt: '5 days ago'
  },
  {
    id: 'mkt-19b',
    title: '5yr Irish Sport Horse Gelding (Hunt Seat & Equitation)',
    category: 'horses',
    price: 32000,
    breed: 'Irish Sport Horse (ISH)',
    ageYears: 5,
    discipline: 'Hunter / Equitation',
    temperamentScore: 3,
    location: 'Healdsburg, CA',
    images: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Marcus Sterling',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.85,
    sellerVerified: true,
    description: '16.2hh dapple grey gelding with textbook jumping form and an incredible brain. Naturally balanced canter, forgiving to distance mistakes, and hack winner in top company.',
    createdAt: '3 days ago'
  },
  {
    id: 'mkt-19c',
    title: '12yr Hanoverian Schoolmaster Mare (USDF Silver Medal Horse)',
    category: 'horses',
    price: 38000,
    breed: 'Hanoverian',
    ageYears: 12,
    discipline: 'Dressage (Prix St. Georges)',
    temperamentScore: 2,
    location: 'Sonoma, CA',
    images: [
      'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Elena Rostova',
    sellerAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 5.0,
    sellerVerified: true,
    description: 'Generous and patient PSG schoolmaster who has earned two riders their USDF Bronze and Silver medals. Auto tempis every 4 and 3 strides, effortless pirouettes, sound and easy keeper.',
    createdAt: '1 week ago'
  },
  {
    id: 'mkt-19d',
    title: '7yr Gypsy Vanner Gelding (Bombproof Family & Trail)',
    category: 'horses',
    price: 19500,
    breed: 'Gypsy Vanner',
    ageYears: 7,
    discipline: 'Pleasure / Trail / Driving',
    temperamentScore: 1,
    location: 'Sebastopol, CA',
    images: [
      'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Rachel Henderson',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    description: 'Stunning black & white piebald with magnificent feathering and double mane. Safe for small children or grandparents. Trained to ride and drive single or pair.',
    createdAt: '5 days ago'
  },
  {
    id: 'mkt-19e',
    title: '4yr AQHA Finished Reining Prospect (Sparks of Peppy Sire)',
    category: 'horses',
    price: 24000,
    breed: 'American Quarter Horse (AQHA)',
    ageYears: 4,
    discipline: 'Reining / Ranch Versatility',
    temperamentScore: 3,
    location: 'Petaluma, CA',
    images: [
      'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Mike Turner',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.8,
    sellerVerified: true,
    description: 'Gorgeous sorrel gelding with huge 20ft sliding stops, low-headed turnaround spins, and soft lead changes. NRHA Futurity eligible and ready to enter the show pen.',
    createdAt: '2 days ago'
  },
  {
    id: 'mkt-19f',
    title: '9yr Welsh Section B Pony Gelding (Short Stirrup / Leadline)',
    category: 'horses',
    price: 14000,
    breed: 'Welsh Pony (Section B)',
    ageYears: 9,
    discipline: 'Children\'s Hunter / Short Stirrup',
    temperamentScore: 1,
    location: 'Novato, CA',
    images: [
      'https://images.unsplash.com/photo-1534773728080-33d31da27ae5?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Gillian Hayes',
    sellerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.95,
    sellerVerified: true,
    description: '12.2hh cute-as-a-button bay pony. Flawless ground manners, stands for clippers/baths without tying, has packed young kids from walk/trot through crossrails.',
    createdAt: '6 days ago'
  },
  {
    id: 'mkt-19g',
    title: '8yr Friesian Gelding (Star Predicate, High School Dressage)',
    category: 'horses',
    price: 42000,
    breed: 'Friesian (KFPS)',
    ageYears: 8,
    discipline: 'Classical Dressage / Exhibition',
    temperamentScore: 2,
    location: 'Kenwood, CA',
    images: [
      'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Julian Ross',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.98,
    sellerVerified: true,
    description: 'Jet black with luxurious floor-length tail. Confirmed Spanish walk, passage, and piaffe. Extremely kind eye and gentle demeanor on the ground and under saddle.',
    createdAt: '3 days ago'
  },

  // ==========================================
  // 4. EQUINE GEAR & TECH (10 Listings)
  // ==========================================
  {
    id: 'mkt-20',
    title: 'Equisense Motion S Sensor & Heart Rate Monitor Set',
    category: 'gear',
    price: 320,
    location: 'Sebastopol, CA',
    images: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Taylor Morgan',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    description: 'Girth attachment sensor tracking cadence, symmetry, jump elevation, and heart rate zones with Bluetooth mobile sync. Barely used, in original case with extra electrode gel.',
    createdAt: '1 day ago'
  },
  {
    id: 'mkt-21',
    title: 'Sportz-Vibe ZX Wireless Massage Blanket (Full Horse Size)',
    category: 'gear',
    price: 680,
    location: 'Santa Rosa, CA',
    images: [
      'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Devon Hughes',
    sellerAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    description: 'Horseware Ireland wireless massage therapy rug with 4 rechargeable massage panels and wireless controller. Warm-up and recovery mode for performance athletes.',
    createdAt: '2 days ago'
  },
  {
    id: 'mkt-22',
    title: 'Pivotal Solo Wireless Auto-Tracking Camera for Equestrian Arena',
    category: 'gear',
    price: 490,
    location: 'Sonoma, CA',
    images: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Elena Rostova',
    sellerAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 5.0,
    sellerVerified: true,
    description: 'Autonomous camera tracking robot with wristband beacon and tripod. Automatically follows and zooms in on horse and rider from up to 200ft away. 4K 60fps recording.',
    createdAt: '3 days ago'
  },
  {
    id: 'mkt-23',
    title: 'Respond Systems Class 3b Equine Laser & Magnetic Blanket Combo',
    category: 'gear',
    price: 1850,
    location: 'Petaluma, CA',
    images: [
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Dr. Katherine Cole',
    sellerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.95,
    sellerVerified: true,
    description: 'Clinical grade PEMF pulsed magnetic therapy blanket with handheld multi-diode cold laser probe for tendon/ligament injury recovery and muscle tightness.',
    createdAt: '4 days ago'
  },
  {
    id: 'mkt-24',
    title: 'Ice-Vibe Vibration & Cooling Boots (Set of 4 Legs)',
    category: 'gear',
    price: 260,
    location: 'Napa, CA',
    images: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Marcus Sterling',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.85,
    sellerVerified: true,
    description: 'Complete front and hind boot kit with 4 cold gel packs and 4 rechargeable vibration panels. Stimulates lymphatic circulation while cooling post-cross-country legs.',
    createdAt: '5 days ago'
  },
  {
    id: 'mkt-25',
    title: 'Seaver CEEFIT Pulse & Motion Tracker for Dressage & Jumpers',
    category: 'gear',
    price: 290,
    location: 'Healdsburg, CA',
    images: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Sarah Jenkins',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    description: 'Advanced equine telemetry device measuring straightness, jump trajectory height, stride frequency, and ECG heart rate with smartphone sync.',
    createdAt: '6 days ago'
  },
  {
    id: 'mkt-26',
    title: 'Haygain HG One High-Heat Equine Hay Steamer',
    category: 'gear',
    price: 950,
    location: 'Sebastopol, CA',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Claire Montgomery',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    description: 'Patented spike manifold hay steamer that reaches 212°F to eliminate 99% of dust, mold, fungi, and bacteria. Essential for horses with IAD/heaves or respiratory sensitivities.',
    createdAt: '1 week ago'
  },
  {
    id: 'mkt-27',
    title: 'Equine Flexineb E3 Mobile Ultrasonic Inhaler / Nebulizer Kit',
    category: 'gear',
    price: 690,
    location: 'Santa Rosa, CA',
    images: [
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Dr. Sarah Evans',
    sellerAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    description: 'Silent, portable battery-powered aerosol delivery mask for administering saline solutions, bronchodilators, and antibiotics directly into the horse lower airway.',
    createdAt: '4 days ago'
  },
  {
    id: 'mkt-28',
    title: 'Bucas Buzz-Off Zebra Full Coverage Fly Sheet & Neck (78")',
    category: 'gear',
    price: 155,
    location: 'Novato, CA',
    images: [
      'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Cynthia Vance',
    sellerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    sellerRating: 5.0,
    sellerVerified: true,
    description: 'Scientific zebra stripe print scientifically proven to confuse and deter biting insects and horseflies. UV protection mesh with elasticated belly pad.',
    createdAt: '2 days ago'
  },
  {
    id: 'mkt-29',
    title: 'Arena Mate 6ft Quad Tow Arena Drag & Leveler',
    category: 'gear',
    price: 1150,
    location: 'Vacaville, CA',
    images: [
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Bradford Ranch LLC',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.7,
    sellerVerified: true,
    description: 'Heavy duty arena conditioner with spring tines, leveling blade, and crumbler roller. Towable behind an ATV, UTV, or compact tractor for GGT and sand footings.',
    createdAt: '5 days ago'
  },
  {
    id: 'mkt-30',
    title: 'Samshield Shadowmatt Crystal Leaf Riding Helmet (Medium 56cm)',
    category: 'apparel',
    price: 495,
    location: 'Woodside, CA',
    images: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Isabella Fontaine',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    sellerRating: 5.0,
    sellerVerified: true,
    condition: 'Like New',
    discipline: 'Hunter/Jumper',
    description: 'Authentic Samshield Shadowmatt helmet with Swarovski crystal leaf top accent and black chrome blazon. ASTM/SEI certified, memory foam liner included, worn only twice in rated equitation shows.',
    createdAt: '1 day ago'
  },
  {
    id: 'mkt-31',
    title: 'Parlanti Miami Dressage & Jumper Custom Tall Riding Boots (Size 39 EU / +1 Height)',
    category: 'apparel',
    price: 780,
    location: 'Petaluma, CA',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Danielle Brooks',
    sellerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.9,
    sellerVerified: true,
    condition: 'Excellent Used',
    discipline: 'Jumping / Equitation',
    description: 'Supple Italian calfskin leather tall boots with full rear zipper, elastic insert, and spur rests. Meticulously cleaned and conditioned with Parlanti cream after every ride.',
    createdAt: '3 days ago'
  },
  {
    id: 'mkt-32',
    title: 'Cavalleria Toscana Revolution Competition Show Coat (Women’s Italian 40 / US 4)',
    category: 'apparel',
    price: 620,
    location: 'Sonoma, CA',
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Taylor Morgan',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    sellerRating: 5.0,
    sellerVerified: true,
    condition: 'Like New',
    discipline: 'Dressage / Show Jumping',
    description: 'Technical 4-way stretch, water repellent, and bi-elastic competition jacket with perforated alcantara collar and logo embossed buttons. Breathable, wrinkle-free, and machine washable.',
    createdAt: '4 days ago'
  },
  {
    id: 'mkt-33',
    title: 'Pikeur Candice Full-Grip High Waist Breeches (White, US 26)',
    category: 'apparel',
    price: 195,
    location: 'Santa Rosa, CA',
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=800'
    ],
    sellerName: 'Megan Alvarez',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    sellerRating: 4.8,
    sellerVerified: true,
    condition: 'Brand New with Tags',
    discipline: 'Dressage',
    description: 'Brand new with original tags. Premium Schoeller microfibre fabric with polyurethane silicone full-seat grip, wide shaping waistband, and mobile phone side pocket.',
    createdAt: '2 days ago'
  }
];
