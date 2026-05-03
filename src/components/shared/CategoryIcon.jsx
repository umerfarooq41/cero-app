import React from 'react';
import { 
  Home, Car, Utensils, ShoppingBag, Heart, GraduationCap, 
  Plane, Wifi, Smartphone, Shirt, Gift, Coffee, Music,
  Briefcase, DollarSign, TrendingUp, Landmark, CreditCard,
  Banknote, PiggyBank, Receipt, Zap, Droplets, Fuel,
  Baby, Dog, Dumbbell, Gamepad2, BookOpen, Palette,
  Stethoscope, Shield, Bus, Train, Building, Wrench,
  Scissors, Gem, Clock, Star, Tag, FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  home: Home, car: Car, utensils: Utensils, shopping: ShoppingBag,
  heart: Heart, education: GraduationCap, plane: Plane, wifi: Wifi,
  phone: Smartphone, shirt: Shirt, gift: Gift, coffee: Coffee,
  music: Music, briefcase: Briefcase, dollar: DollarSign, trending: TrendingUp,
  bank: Landmark, credit: CreditCard, cash: Banknote, piggy: PiggyBank,
  receipt: Receipt, electric: Zap, water: Droplets, fuel: Fuel,
  baby: Baby, pet: Dog, gym: Dumbbell, gaming: Gamepad2,
  book: BookOpen, art: Palette, health: Stethoscope, insurance: Shield,
  bus: Bus, train: Train, building: Building, tools: Wrench,
  beauty: Scissors, jewelry: Gem, time: Clock, star: Star,
  tag: Tag, folder: FolderOpen,
};

export const iconNames = Object.keys(iconMap);

export default function CategoryIcon({ icon, color, size = 'md', className }) {
  const IconComponent = iconMap[icon] || Tag;
  const sizes = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11' };
  const iconSizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };

  return (
    <div 
      className={cn(
        "rounded-xl flex items-center justify-center shrink-0",
        sizes[size],
        className
      )}
      style={{ backgroundColor: (color || '#0078D4') + '18' }}
    >
      <IconComponent 
        className={iconSizes[size]}
        style={{ color: color || '#0078D4' }}
      />
    </div>
  );
}