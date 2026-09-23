import { View, Text, Pressable, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import type { CatalogItem } from '@nova/core';
import { useTheme } from '../theme/ThemeProvider';
import { space, radius, type } from '../theme/tokens';

const MEDIA: Record<string, ImageSourcePropType> = {
  '/assets/car.jpg': require('../../assets/car.jpg'),
  '/assets/house.jpg': require('../../assets/house.jpg'),
  '/assets/apartment.jpg': require('../../assets/apartment.jpg'),
  '/assets/laptop.jpg': require('../../assets/laptop.jpg'),
  '/assets/phone.jpg': require('../../assets/phone.jpg'),
  '/assets/shoes.jpg': require('../../assets/shoes.jpg'),
  '/assets/placeholder.jpg': require('../../assets/placeholder.jpg'),
};
export function mobileImage(image?: string): ImageSourcePropType {
  return MEDIA[image ?? ''] ?? require('../../assets/placeholder.jpg');
}

export function ListingCard({ item, money, subtitle, onPress }: { item: CatalogItem; money: string; subtitle: string; onPress: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.card, { backgroundColor: theme.surface, borderColor: theme.line, opacity: pressed ? .88 : 1 }]}>
      <View style={s.media}>
        <Image source={mobileImage(item.image)} style={s.photo} resizeMode="cover" />
        <View style={[s.heart, { backgroundColor: theme.bg }]}><Text style={{ color: theme.ink, fontSize: 17 }}>♡</Text></View>
      </View>
      <View style={s.body}>
        <Text style={[type.price, { color: theme.ink }]}>{money}</Text>
        <Text style={[s.title, { color: theme.ink2 }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[type.meta, { color: theme.muted }]} numberOfLines={1}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}
const s = StyleSheet.create({
  card:{borderWidth:1,borderRadius:radius.lg,overflow:'hidden',marginBottom:space.md}, media:{height:174,position:'relative'},
  photo:{width:'100%',height:'100%'}, heart:{position:'absolute',right:10,top:10,width:34,height:34,borderRadius:17,alignItems:'center',justifyContent:'center',opacity:.9},
  body:{padding:space.md,gap:5}, title:{fontSize:14,fontWeight:'650'},
});
