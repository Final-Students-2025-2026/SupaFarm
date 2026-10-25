declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';

  type MaterialCommunityIconsProps = TextProps & {
    name: string;
    size?: number;
    color?: string;
  };

  const MaterialCommunityIcons: ComponentType<MaterialCommunityIconsProps>;
  export default MaterialCommunityIcons;
}
