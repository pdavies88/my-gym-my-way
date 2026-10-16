export const EQUIPMENT_IDS = [
  'dumbbells',
  'barbell',
  'rack',
  'bench',
  'kettlebell',
  'pullupBar',
  'bands',
  'cable',
  'suspension',
  'medicineBall',
  'abWheel',
  'box',
  'jumpRope',
  'rower',
  'bike',
  'treadmill',
  'heavyBag',
] as const;

export type EquipmentId = (typeof EQUIPMENT_IDS)[number];

export type EquipmentGroup = 'Free weights' | 'Stations' | 'Accessories' | 'Cardio';

export interface Equipment {
  id: EquipmentId;
  name: string;
  group: EquipmentGroup;
  /** SF Symbol on iOS and Material Symbol on Android. */
  icon: { ios: string; android: string };
}

export const EQUIPMENT: readonly Equipment[] = [
  { id: 'dumbbells', name: 'Dumbbells', group: 'Free weights', icon: { ios: 'dumbbell', android: 'fitness_center' } },
  { id: 'barbell', name: 'Barbell and plates', group: 'Free weights', icon: { ios: 'dumbbell.fill', android: 'fitness_center' } },
  { id: 'kettlebell', name: 'Kettlebell', group: 'Free weights', icon: { ios: 'scalemass', android: 'weight' } },
  { id: 'medicineBall', name: 'Medicine ball', group: 'Free weights', icon: { ios: 'circle.fill', android: 'sports_volleyball' } },
  { id: 'rack', name: 'Squat rack', group: 'Stations', icon: { ios: 'square.split.2x1', android: 'view_column' } },
  { id: 'bench', name: 'Weight bench', group: 'Stations', icon: { ios: 'rectangle.fill', android: 'chair' } },
  { id: 'pullupBar', name: 'Pull-up bar', group: 'Stations', icon: { ios: 'figure.climbing', android: 'sports_gymnastics' } },
  { id: 'cable', name: 'Cable machine', group: 'Stations', icon: { ios: 'cable.connector', android: 'cable' } },
  { id: 'suspension', name: 'Suspension trainer (TRX)', group: 'Stations', icon: { ios: 'figure.strengthtraining.functional', android: 'sports_gymnastics' } },
  { id: 'bands', name: 'Resistance bands', group: 'Accessories', icon: { ios: 'lasso', android: 'gesture' } },
  { id: 'abWheel', name: 'Ab wheel', group: 'Accessories', icon: { ios: 'circle.circle', android: 'trip_origin' } },
  { id: 'box', name: 'Plyo box or step', group: 'Accessories', icon: { ios: 'shippingbox', android: 'inventory_2' } },
  { id: 'jumpRope', name: 'Jump rope', group: 'Accessories', icon: { ios: 'figure.jumprope', android: 'sports' } },
  { id: 'rower', name: 'Rowing machine', group: 'Cardio', icon: { ios: 'figure.rower', android: 'rowing' } },
  { id: 'bike', name: 'Exercise bike', group: 'Cardio', icon: { ios: 'figure.indoor.cycle', android: 'directions_bike' } },
  { id: 'treadmill', name: 'Treadmill', group: 'Cardio', icon: { ios: 'figure.run', android: 'directions_run' } },
  { id: 'heavyBag', name: 'Boxing bag and gloves', group: 'Cardio', icon: { ios: 'figure.boxing', android: 'sports_mma' } },
];

export const EQUIPMENT_GROUPS: readonly EquipmentGroup[] = ['Free weights', 'Stations', 'Accessories', 'Cardio'];

export function equipmentName(id: EquipmentId): string {
  return EQUIPMENT.find((item) => item.id === id)?.name ?? id;
}
