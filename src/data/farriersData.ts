import { Farrier, HoofLogEntry } from '../types';

export const MOCK_FARRIERS: Farrier[] = [
  {
    id: 'f-1',
    name: 'Mike Davis, CJF',
    rating: 4.9,
    location: 'Sonoma Radius, Certified MC#',
    verified: true,
    mcNumber: 'MC# 102938',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    specialties: ['Therapeutic Shoeing', 'Hot Shoeing', 'Thrown Shoe Emergency'],
    instantResponse: true,
    priceEstimate: '$180 / Full Set',
    lat: 38.4350,
    lng: -122.7050
  },
  {
    id: 'f-2',
    name: 'Sarah Lindquist, AFA',
    rating: 4.85,
    location: 'Santa Rosa & Petaluma',
    verified: true,
    mcNumber: 'MC# 884721',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    specialties: ['Barefoot Trimming', 'Correctional Trimming', 'Foal Hoof Conformation'],
    instantResponse: false,
    priceEstimate: '$75 / Barefoot Trim',
    lat: 38.2500,
    lng: -122.6200
  },
  {
    id: 'f-3',
    name: 'Jack Crawford, CJF APF-I',
    rating: 4.95,
    location: 'Petaluma & Marin County',
    verified: true,
    mcNumber: 'MC# 652914',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    specialties: ['Hunter/Jumper Aluminum Package', 'Bar Shoes & Pads', 'Hot Forge Shaping'],
    instantResponse: true,
    priceEstimate: '$220 / Full Show Package',
    lat: 38.2324,
    lng: -122.6367
  },
  {
    id: 'f-4',
    name: 'Travis Holloway',
    rating: 4.88,
    location: 'Sonoma Valley & Napa',
    verified: true,
    mcNumber: 'MC# 419208',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    specialties: ['Western Reining Slides', 'Ranch Horse Durability', 'Rockered Toes'],
    instantResponse: true,
    priceEstimate: '$160 / Full Steel Set',
    lat: 38.2919,
    lng: -122.4580
  },
  {
    id: 'f-5',
    name: 'Elena Rostova, DipWCF',
    rating: 5.0,
    location: 'Sebastopol & West Sonoma County',
    verified: true,
    mcNumber: 'MC# 993144',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    specialties: ['Dressage Biomechanical Balance', 'Natural Balance Barefoot', 'Glue-On Composite Shoes'],
    instantResponse: false,
    priceEstimate: '$190 / Custom Balance Set',
    lat: 38.4011,
    lng: -122.8231
  },
  {
    id: 'f-6',
    name: 'Brandon Cole, CJF',
    rating: 4.8,
    location: 'Healdsburg & Alexander Valley',
    verified: true,
    mcNumber: 'MC# 771239',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    specialties: ['Eventing Stud Hole Tapping', 'Leather Rim Pads', 'Emergency Thrown Shoe'],
    instantResponse: true,
    priceEstimate: '$175 / Full Set + Drill/Tap',
    lat: 38.6105,
    lng: -122.8692
  },
  {
    id: 'f-7',
    name: 'Megan O’Reilly, EEBW & Trimmer',
    rating: 4.92,
    location: 'Cotati & Rohnert Park',
    verified: true,
    mcNumber: 'MC# 542011',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    specialties: ['Natural Hoof Rehab', 'White Line Disease Care', 'EasyCare Boot Fitting'],
    instantResponse: false,
    priceEstimate: '$80 / Barefoot & Boot Fit',
    lat: 38.3277,
    lng: -122.7078
  },
  {
    id: 'f-8',
    name: 'Clayton Vance, Master Farrier',
    rating: 4.91,
    location: 'Napa & St. Helena',
    verified: true,
    mcNumber: 'MC# 839410',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    specialties: ['Venogram Alignment', 'Navicular Therapeutic Wedge Shoes', 'Custom Heart Bars'],
    instantResponse: true,
    priceEstimate: '$240 / Therapeutic Set',
    lat: 38.3000,
    lng: -122.3000
  },
  {
    id: 'f-9',
    name: 'Dustin Cooper',
    rating: 4.77,
    location: 'Novato & San Rafael',
    verified: true,
    mcNumber: 'MC# 612809',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300',
    specialties: ['Draft & Warmblood Sizing', 'Quarter Clip Forging', 'Routine Pasture Maintenance'],
    instantResponse: false,
    priceEstimate: '$165 / 4-Wheel Reset',
    lat: 38.1074,
    lng: -122.5697
  },
  {
    id: 'f-10',
    name: 'Kyle Stephenson, CJF',
    rating: 4.89,
    location: 'Vacaville & Solano County',
    verified: true,
    mcNumber: 'MC# 901248',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    specialties: ['Cero-Composite Synthetic Shoes', 'Speed & Barrel Reset', 'Mobile Anvil Rig'],
    instantResponse: true,
    priceEstimate: '$195 / Synthetic Sport Set',
    lat: 38.3566,
    lng: -121.9877
  }
];

export const MOCK_HOOF_LOGS: HoofLogEntry[] = [
  {
    id: 'hl-1',
    date: 'July 3, 2026',
    horseName: 'Thunder',
    notes: 'Reset front aluminum shoes with quarter clips. Heel expansion improved by 2mm.',
    beforePhoto: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&q=80&w=400',
    afterPhoto: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=400'
  }
];
