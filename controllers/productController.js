const { ProductDetail } = require('../models/productDetailModel');
const { Product, PRODUCT_NEEDS, SPECIAL_FEATURES } = require('../models/productModel');
const Review = require('../models/reviewModel');
const Category = require('../models/categoryModel');
const UserProfile = require('../models/userProfileModel');

//Run this code when reloading the page
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Delete product
    await Product.findByIdAndDelete(productId);
    
    // Remove product from all users' favorites
    await User.updateMany(
      { favorite_products: productId },
      { $pull: { favorite_products: productId } }
    );

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const productController = {
  getAllProductsByBrand: async (req, res) => {
    try {
      // Get random products for each brand
      const brands = await ProductDetail.distinct('trademark');
      const result = {};

      for (const brand of brands) {
        // First get product details for this brand
        const productDetails = await ProductDetail.aggregate([
          { $match: { trademark: brand } },
          { $sample: { size: 3 } }
        ]);

        const productIds = productDetails.map(detail => detail.product_id);

        // Get the actual products
        const products = await Product.find({
          _id: { $in: productIds }  
        }).lean();

        // Get reviews stats for these products
        const reviewStats = await Review.aggregate([
          {
            $match: {
              product_id: { $in: productIds },
              status: 'approved',
              parent_id: null
            }
          },
          {
            $group: {
              _id: '$product_id',
              averageRating: { $avg: '$rating' },
              totalReviews: { $sum: 1 }
            }
          }
        ]);

        // Format products with their details
        const formattedProducts = products.map(product => {
          const detail = productDetails.find(d => 
            d.product_id.toString() === product._id.toString()
          );
          const ratingData = reviewStats.find(stat => 
            stat._id.toString() === product._id.toString()
          );

          if (!detail) return null;

          // Format the images array
          const formattedImages = product.images.map(image => {
            // const formattedTrademark = detail.trademark.toUpperCase();
            // const formattedProductName = product.name.replace(/\s+/g, '');
            // return `/images/phone/${formattedTrademark}/${formattedProductName}/${image}`;
            return image;
          });

          return {
            id: product._id,
            name: `${product.name} ${product.ram}/${product.storage}`,
            baseProductName: product.name,
            trademark: detail.trademark || category.name,
            price: product.price,
            images: formattedImages, // Use formatted images array
            // image: formattedImages[0],
            rating: {
              average: ratingData ? Math.round(ratingData.averageRating * 10) / 10 : 0,
              count: ratingData ? ratingData.totalReviews : 0
            },
            needs: product.needs,
            special_features: product.special_features,
            meta: product.meta,
            link: product.link,
            specs: {
              os: detail.os,
              cpu: detail.cpu,
              gpu: detail.gpu,
              camera: {
                main: detail.camera.main,
                front: detail.camera.front
              },
              display: {
                type: detail.display.type,
                size: detail.display.size,
                refresh_rate: detail.display.refresh_rate,
                brightness: detail.display.brightness
              },
              battery: {
                capacity: detail.battery.capacity,
                charging: detail.battery.charging
              }
            },
            variant: {
              storage: product.storage,
              ram: product.ram
            },
            color_options: detail.color_options
          };
        }).filter(Boolean);

        if (formattedProducts.length > 0) {
          result[brand] = formattedProducts;
        }
      }

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error in getAllProductsByBrand:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getProductsByBrand: async (req, res) => {
    try {
      const { brand } = req.params;
      console.log('Fetching products for brand path:', brand);

      // First, find the category based on the link
      const category = await Category.findOne({ 
        link: { $regex: new RegExp(`/products/${brand}$`, 'i') }
      });
      
      console.log('Found category:', category);
  
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Brand category not found for path: ${brand}`
        });
      }

      // Find products matching the category name
      const productDetails = await ProductDetail.find({ 
        trademark: { $regex: new RegExp(`^${category.name}$`, 'i') }
      }).lean();
  
      console.log(`Found ${productDetails.length} product details for brand ${category.name}`);
  
      if (!productDetails || productDetails.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No products found for brand ${category.name}`
        });
      }

      const productIds = productDetails.map(detail => detail.product_id);

      // Get the actual products
      const products = await Product.find({
        _id: { $in: productIds }
      }).lean();

      // Get reviews stats for all products
      const reviewStats = await Review.aggregate([
        {
          $match: {
            product_id: { $in: productIds },
            status: 'approved',
            parent_id: null
          }
        },
        {
          $group: {
            _id: '$product_id',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);

      // Format the products data
      const formattedProducts = products.map(product => {
        const detail = productDetails.find(d => 
          d.product_id.toString() === product._id.toString()
        );
        const ratingData = reviewStats.find(stat => 
          stat._id.toString() === product._id.toString()
        );

        const baseProductName = product.name.split(' ')
          .filter(part => !part.includes('GB') && !part.includes('/'))
          .join(' ');

        const isIphone = baseProductName.toLowerCase().includes('iphone');
        const displayName = isIphone
            ? `${baseProductName} ${product.storage}`
            : `${baseProductName} ${product.ram}/${product.storage}`;

        console.log('Formatted product name:', {
            baseProductName,
            displayName
        });

        const formattedImages = product.images.map(image => {
          if (image.startsWith('/images/')) {
              return image;
          }
          const formattedTrademark = detail?.trademark?.toUpperCase() || category.name.toUpperCase();
          const formattedName = product.name.replace(/\s+/g, '');
          return `/images/phone/${formattedTrademark}/${formattedName}/${image}`;
        });

        return {
          id: product._id,
          name: displayName,
          baseProductName: baseProductName,
          price: Number(product.price),
          originalPrice: Number(product.original_price || product.price),
          discountPrice: Number(product.price * (1 - (product.discount || 0) / 100)),
          discount: Number(product.discount || 0),
          image: formattedImages[0], 
          images: formattedImages,
          variant: {
            ram: product.ram,
            storage: product.storage
          },
          rating: {
            average: ratingData ? Math.round(ratingData.averageRating * 10) / 10 : 0,
            count: ratingData ? ratingData.totalReviews : 0
          },
          specs: detail ? {
            os: detail.os,
            cpu: detail.cpu,
            gpu: detail.gpu,
            camera: {
              main: detail.camera?.main,
              front: detail.camera?.front
            },
            display: {
              type: detail.display?.type,
              size: detail.display?.size,
              refresh_rate: detail.display?.refresh_rate,
              brightness: detail.display?.brightness
            },
            battery: {
              capacity: detail.battery?.capacity,
              charging: detail.battery?.charging
            }
          } : null,
          trademark: category.name
        };
      });

      console.log(`Found ${formattedProducts.length} products for ${category.name}`);

      res.json({
        success: true,
        data: formattedProducts,
        total: formattedProducts.length,
        brand: {
          name: category.name,
          description: category.description,
          logo: category.logo_url
        }
      });

    } catch (error) {
      console.error('Error in getProductsByBrand:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching products',
        error: error.message
      });
    }
  },

  getFilteredProducts: async (req, res) => {
    try {
      const { 
        hang,       // Array of brands (Xiaomi,iPhone,Realme,Vivo)
        price,      // "0-34232698"
        manhinh,    // Array of refresh rates (120Hz,144Hz)
        nam,        // Array of years (2025,2024,2023,2022)
        bonho,      // Array of storage options (64GB,128GB,512GB)
        ram,        // Array of RAM options (3GB,12GB,8GB)
        nhucau,     // Array of needs (Chụp ảnh quay phim,Pin khủng trên 5000mAh)
        tinhnang    // Array of features (Bảo mật khuôn mặt 3D,Công nghệ NFC)
      } = req.query;
  
      console.log('Received filters:', req.query); // Debug log
  
      // Build queries
      let productQuery = {};
      let detailQuery = {};
  
      // 1. Price Filter
      if (price) {
        const [min, max] = price.split('-').map(Number);
        productQuery.price = { 
          $gte: min || 0, 
          $lte: max || Number.MAX_SAFE_INTEGER 
        };
      }
  
      // 2. Release Year Filter
      if (nam) {
        const years = nam.split(',').map(Number);
        productQuery.release_year = { $in: years };
      }
  
      // 3. Storage Filter
      if (bonho) {
        const storageOptions = bonho.split(',');
        productQuery.storage = { $in: storageOptions };
      }
  
      // 4. RAM Filter
      if (ram) {
        const ramOptions = ram.split(',');
        productQuery.ram = { $in: ramOptions };
      }
  
      // 5. Needs Filter
      if (nhucau) {
        const needs = decodeURIComponent(nhucau).split(',');
        productQuery.needs = { $in: needs };
      }
  
      // 6. Special Features Filter
      if (tinhnang) {
        const features = decodeURIComponent(tinhnang).split(',');
        productQuery.special_features = { $in: features };
      }
  
      // 7. Brand Filter
      if (hang) {
        const brands = hang.split(',');
        detailQuery.trademark = { 
          $in: brands.map(brand => new RegExp(`^${brand}$`, 'i'))
        };
      }
  
      // 8. Screen Refresh Rate Filter
      if (manhinh) {
        const refreshRates = manhinh.split(',');
        detailQuery['display.refresh_rate'] = { $in: refreshRates };
      }
  
      console.log('Product Query:', productQuery); // Debug log
      console.log('Detail Query:', detailQuery); // Debug log
  
      // Execute queries
      const productDetails = await ProductDetail.find(detailQuery).lean();
      const productIds = productDetails.map(detail => detail.product_id);
  
      const products = await Product.find({
        _id: { $in: productIds },
        ...productQuery
      }).lean();
  
      // Get ratings
      const reviewStats = await Review.aggregate([
        {
          $match: {
            product_id: { $in: products.map(p => p._id) },
            status: 'approved',
            parent_id: null
          }
        },
        {
          $group: {
            _id: '$product_id',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);
  
      // Format results
      const formattedProducts = products.map(product => {
        const detail = productDetails.find(d => 
          d.product_id.toString() === product._id.toString()
        );
        
        const ratingData = reviewStats.find(stat => 
          stat._id.toString() === product._id.toString()
        );
  
        return {
          id: product._id,
          name: `${product.name} ${product.ram}/${product.storage}`,
          baseProductName: product.name,
          images: product.images,
          price: product.price,
          originalPrice: product.original_price || product.price,
          discountPrice: product.price * (1 - (product.discount || 0) / 100),
          discount: product.discount || 0,
          rating: {
            average: ratingData ? Math.round(ratingData.averageRating * 10) / 10 : 0,
            count: ratingData ? ratingData.totalReviews : 0
          },
          specs: {
            os: detail?.os || 'N/A',
            cpu: detail?.cpu || 'N/A',
            gpu: detail?.gpu || 'N/A',
            ram: product.ram,
            storage: product.storage,
            screenTech: detail?.display?.type || 'N/A',
            screenSize: detail?.display?.size || 'N/A',
            refreshRate: detail?.display?.refresh_rate || 'N/A',
            rearCamera: detail?.camera?.main || 'N/A',
            frontCamera: detail?.camera?.front || 'N/A',
            battery: detail?.battery?.capacity || 'N/A',
            charging: detail?.battery?.charging || 'N/A'
          },
          link: product.link,
          meta: product.meta,
          needs: product.needs,
          special_features: product.special_features,
          variant: {
            ram: product.ram,
            storage: product.storage
          },
          trademark: detail?.trademark || 'N/A',
          release_year: product.release_year
        };
      });
  
      // Send response
      res.json({
        success: true,
        data: formattedProducts,
        total: formattedProducts.length,
        filters: {
          brands: hang?.split(',') || [],
          price: price || '0-50000000',
          screens: manhinh?.split(',') || [],
          years: nam?.split(',') || [],
          memories: bonho?.split(',') || [],
          rams: ram?.split(',') || [],
          needs: nhucau ? decodeURIComponent(nhucau).split(',') : [],
          features: tinhnang ? decodeURIComponent(tinhnang).split(',') : []
        }
      });
  
    } catch (error) {
      console.error('Filter products error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getHotProducts: async (req, res) => {
    try {
      // First get random products
      const randomProducts = await Product.aggregate([
        { $sample: { size: 10 } }
      ]);
      
      if (!randomProducts || randomProducts.length === 0) {
        return res.json({ success: true, data: [] });
      }
  
      const productIds = randomProducts.map(product => product._id);
  
      // Get product details
      const productDetails = await ProductDetail.find({
        product_id: { $in: productIds }
      }).lean();
  
      // Get reviews for these products
      const reviewStats = await Review.aggregate([
        {
          $match: {
            product_id: { $in: productIds },
            status: 'approved',
            parent_id: null
          }
        },
        {
          $group: {
            _id: '$product_id',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);
  
      const hotProducts = randomProducts.map(product => {
        const detail = productDetails.find(d => 
          d.product_id.toString() === product._id.toString()
        );
        
        if (!detail) return null;
  
        // Find rating stats for this product
        const ratingData = reviewStats.find(stat => 
          stat._id.toString() === product._id.toString()
        );
  
        return {
          id: product._id,
          name: `${product.name} ${product.ram}/${product.storage}`,
          baseProductName: product.name,
          price: product.price,
          trademark: detail.trademark,
          image: product.images[0],
          images: product.images,
          rating: {
            average: ratingData ? Math.round(ratingData.averageRating * 10) / 10 : 0,
            count: ratingData ? ratingData.totalReviews : 0
          },
          needs: product.needs,
          special_features: product.special_features,
          meta: product.meta,
          link: product.link,
          specs: {
            os: detail.os,
            cpu: detail.cpu,
            gpu: detail.gpu,
            camera: {
              main: detail.camera.main,
              front: detail.camera.front
            },
            display: {
              type: detail.display.type,
              size: detail.display.size,
              refresh_rate: detail.display.refresh_rate,
              brightness: detail.display.brightness
            },
            battery: {
              capacity: detail.battery.capacity,
              charging: detail.battery.charging
            }
          },
          variant: {
            storage: product.storage,
            ram: product.ram
          },
          color_options: detail.color_options,
          trademark: detail.trademark
        };
      }).filter(Boolean);
  
      res.json({ success: true, data: hotProducts });
    } catch (error) {
      console.error('Error in getHotProducts:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getProductByLink: async (req, res) => {
    try {
      const { link } = req.params;
      console.log('Received link:', link);

      let productQuery = {};
      if (link.toLowerCase().includes('iphone')) {
        const linkParts = link.split('-');
        const storage = linkParts.pop(); // Get last part (storage)
        const baseName = linkParts.join('-'); // Rejoin remaining parts for base name
        
        productQuery = {
          name: new RegExp(`^${baseName.replace(/-/g, ' ')}$`, 'i'),
          storage: storage.toUpperCase()
        };
      } else {
        // For non-iPhones, parse RAM and storage
        const linkParts = link.split('-');
        const storage = linkParts.pop(); // Get last part (storage)
        const ram = linkParts.pop(); // Get second to last part (RAM)
        // Remove '5g' from comparison if present
        const baseName = linkParts.join('-');
        
        // Create a case-insensitive query for the name
        const namePattern = new RegExp(`^${baseName.replace(/-/g, ' ')}$`, 'i');
        
        productQuery = {
          $and: [
            { name: namePattern },
            { ram: ram.toUpperCase() },
            { storage: storage.toUpperCase() }
          ]
        };
      }

      console.log('Product Query:', productQuery); // Debug log

      // Find the product
      const product = await Product.findOne(productQuery).lean();
      console.log('Found Product:', product); // Debug log

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

    // Get product details with proper error handling
    const detail = await ProductDetail.findOne({ 
      product_id: product._id 
    }).lean();

    if (!detail) {
      console.log('No details found for product ID:', product._id);
      return res.status(404).json({
        success: false,
        message: 'Product details not found'
      });
    }
  
      // Get reviews stats
      const reviewStats = await Review.aggregate([
        {
          $match: {
            product_id: product._id,
            status: 'approved',
            parent_id: null
          }
        },
        {
          $group: {
            _id: '$product_id',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);
  
      // Get approved reviews
      const reviews = await Review.find({
        product_id: product._id,
        status: 'approved',
        parent_id: null
      })
      .sort({ created_at: -1 })
      .limit(5)
      .lean();

      let userProfile = null;
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Change from User to UserProfile
        const profile = await UserProfile.findOne({ user_id: decoded.userId })
            .select('full_name phone_number address')
            .lean();
        
        if (profile) {
            userProfile = {
                full_name: profile.full_name,
                phone_number: profile.phone_number,
                address: profile.address
            };
        }
      }
  
      const formattedProduct = {
        id: product._id,
        name: product.name,
        baseProductName: product.name,
        images: product.images.map(image => {
          // Format the image path:
          // 1. Convert trademark to uppercase
          // 2. Remove spaces from product name
          const formattedTrademark = detail.trademark.toUpperCase();
          const formattedProductName = product.name.replace(/\s+/g, '');
          
          return `/images/phone/${formattedTrademark}/${formattedProductName}/${image}`;
        }),
        rating: {
          average: reviewStats[0] ? Math.round(reviewStats[0].averageRating * 10) / 10 : 0,
          count: reviewStats[0] ? reviewStats[0].totalReviews : 0
        },
        reviews: reviews.map(review => ({
          name: review.user_name,
          comment: review.content,
          rating: review.rating,
          created_at: review.created_at
        })),
        specs: {
          os: detail.os,
          cpu: detail.cpu,
          gpu: detail.gpu,
          camera: {
            main: detail.camera.main,
            front: detail.camera.front
          },
          display: {
            type: detail.display.type,
            size: detail.display.size,
            refresh_rate: detail.display.refresh_rate,
            brightness: detail.display.brightness
          },
          battery: {
            capacity: detail.battery.capacity,
            charging: detail.battery.charging
          }
        },
        memoryOptions: [product.storage],
        ramOptions: product.ram ? {
          [product.storage]: product.ram
        } : null,
        colorOptions: detail.color_options,
        prices: {
          [product.storage]: product.price
        },
        originalPrice: product.original_price || product.price,
        discount: product.discount || 0,
        meta: product.meta,
        needs: product.needs,
        special_features: product.special_features,
        variant: {
          storage: product.storage,
          ram: product.ram
        },
        trademark: detail.trademark,
        shippingInfo: 'Chọn địa chỉ giao hàng',
        stock: product.stock,
        userProfile: userProfile
      };
      console.log('Image paths:', formattedProduct.images);
      res.json({
        success: true,
        data: formattedProduct
      });
  
    } catch (error) {
      console.error('Error in getProductByLink:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getProductsByName: async (req, res) => {
    try {
        const { name } = req.query;
        const products = await Product.find({ name }).lean();
        const productDetails = await ProductDetail.find({ product_id: { $in: products.map(p => p._id) } }).lean();

        const formattedProducts = products.map(product => {
            const detail = productDetails.find(d => d.product_id.toString() === product._id.toString());
            return {
                id: product._id,
                name: product.name,
                baseProductName: product.name,
                images: product.images,
                rating: product.rating,
                specs: detail ? detail.specs : {},
                memoryOptions: [product.storage],
                ramOptions: product.ram ? { [product.storage]: product.ram } : null,
                colorOptions: detail ? detail.color_options : [],
                prices: { [product.storage]: product.price },
                originalPrice: product.original_price || product.price,
                discount: product.discount || 0,
                meta: product.meta,
                needs: product.needs,
                special_features: product.special_features,
                variant: {
                    storage: product.storage,
                    ram: product.ram
                },
                trademark: detail ? detail.trademark : '',
                link: product.link // Ensure link is included here
            };
        });

        res.json({ success: true, data: formattedProducts });
    } catch (error) {
        console.error('Error in getProductsByName:', error);
        res.status(500).json({ success: false, message: error.message });
    }
  },

  // searchProducts: async (req, res) => {
  //   try {
  //       const { query } = req.query;
        
  //       if (!query) {
  //           return res.json({
  //               success: true,
  //               data: []
  //           });
  //       }

  //       const products = await Product.find({
  //           $or: [
  //               { name: { $regex: query, $options: 'i' } },
  //               { baseProductName: { $regex: query, $options: 'i' } }
  //           ]
  //       })
  //       .populate('productDetails')
  //       .lean();

  //       res.json({
  //           success: true,
  //           data: products
  //       });
  //   } catch (error) {
  //       console.error('Search products error:', error);
  //       res.status(500).json({
  //           success: false,
  //           message: error.message
  //       });
  //   }
  // },

  // Get all products
  getAllProducts: async (req, res) => {
      try {
          const products = await Product.find()
              .populate('productDetails')
              .lean();

          res.json({
              success: true,
              data: products
          });
      } catch (error) {
          console.error('Get all products error:', error);
          res.status(500).json({
              success: false,
              message: error.message
          });
      }
  },

  // Get product by ID
  getProductById: async (req, res) => {
      try {
          const product = await Product.findById(req.params.id)
              .populate('productDetails')
              .lean();

          if (!product) {
              return res.status(404).json({
                  success: false,
                  message: 'Product not found'
              });
          }

          res.json({
              success: true,
              data: product
          });
      } catch (error) {
          console.error('Get product by ID error:', error);
          res.status(500).json({
              success: false,
              message: error.message
          });
      }
  },

  searchProducts: async (req, res) => {
    try {
        const { query } = req.query;        
        
        if (!query) {
            return res.json({
                success: true,
                data: []
            });
        }

        // Find products matching the search query
        const products = await Product.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { baseProductName: { $regex: query, $options: 'i' } }
            ]
        }).lean();

        // Get product details for all found products
        const productDetails = await ProductDetail.find({
            product_id: { $in: products.map(p => p._id) }
        }).lean();

        // Format the response
        const formattedProducts = products.map(product => {
            const detail = productDetails.find(d => 
                d.product_id.toString() === product._id.toString()
            );

            return {
                id: product._id,
                name: product.name,
                baseProductName: product.baseProductName || product.name,
                images: product.images,
                trademark: detail?.trademark,
                originalPrice: product.original_price || product.price,
                discountPrice: product.price * (1 - (product.discount || 0) / 100),
                discount: product.discount || 0,
                rating: product.rating || { average: 0, count: 0 },
                specs: {
                    os: detail?.os || 'N/A',
                    cpu: detail?.cpu || 'N/A',
                    gpu: detail?.gpu || 'N/A',
                    ram: product.ram || 'N/A',
                    storage: product.storage || 'N/A',
                    rearCamera: detail?.camera?.main || 'N/A',
                    frontCamera: detail?.camera?.front || 'N/A',
                    screenTech: detail?.display?.type || 'N/A',
                    screenSize: detail?.display?.size || 'N/A',
                    refreshRate: detail?.display?.refresh_rate || 'N/A',
                    brightness: detail?.display?.brightness || 'N/A',
                    battery: detail?.battery?.capacity || 'N/A',
                    charging: detail?.battery?.charging || 'N/A'
                },
                variant: {
                    ram: product.ram,
                    storage: product.storage
                }
            };
        });

        res.json({
            success: true,
            data: formattedProducts
        });
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
  },

  getProductDetail: async (req, res) => {
    try {
        const { link } = req.params;
        const product = await Product.findOne({ link })
            .populate('trademark')
            .lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Thêm domain vào đường dẫn hình ảnh
        product.images = product.images.map(image => 
            image.startsWith('http') ? image : `${process.env.API_URL || 'http://localhost:3000'}${image}`
        );

        return res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
  },
};

module.exports = productController;