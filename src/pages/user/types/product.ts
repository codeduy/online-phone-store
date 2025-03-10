// export interface Product {
//     variant: any;
//     baseProductName: any;
//     id: string;
//     name: string;
//     price: string;
//     originalPrice?: string;
//     image: string;
//     rating: number;
//     discount?: string;
// }

// export interface Product {
//     id: string;
//     name: string;
//     baseProductName: string;
//     originalPrice: number;
//     discountPrice: number;
//     discount: number;
//     image: string;
//     rating: {
//       average: number;
//       count: number;
//     };
//     needs: string[];  // Removed optional since these are required
//     special_features: string[];
//     meta: string;
//     link: string;
//     specs: {  // Removed optional since these are required
//       os: string;
//       cpu: string;
//       gpu: string;
//       camera: {
//         main: string;
//         front: string;
//       };
//       display: {
//         type: string;
//         size: string;
//         refresh_rate: string;
//         brightness: string;
//       };
//       battery: {
//         capacity: string;
//         charging: string;
//       };
//     };
//     variant: {  // Removed optional since these are required
//       storage: string;
//       ram: string;
//     };
//     color_options: string[];  // Removed optional 
//   }

export interface Product {
  link: any;
  id: string;
  _id?: string;
  name: string;
  baseProductName: string;
  images: string[];
  trademark: {
    name: string;
  } | string;
  image?: string;
  price: number;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  rating?: {
    average: number;
    count?: number;
  };
  specs?: {
    os?: string;
    cpu?: string;
    gpu?: string;
    ram?: string;
    storage?: string;
    rearCamera?: string;
    frontCamera?: string;
    screenTech?: string;
    screenSize?: string;
    refreshRate?: string;
    brightness?: string;
    battery: {
      capacity: string;
      charging: string;
    };
    charging?: string;
  };
  variant?: {
    ram?: string;
    storage?: string;
  };
  productDetails?: {
    os?: string;
    cpu?: string;
    gpu?: string;
    camera?: {
      main?: string;
      front?: string;
    };
    display?: {
      type?: string;
      size?: string;
      refresh_rate?: string;
      brightness?: string;
    };
    battery?: {
      capacity?: string;
      charging?: string;
    };
  };
}