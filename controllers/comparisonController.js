const { Product } = require('../models/productModel');
const { ProductDetail } = require('../models/productDetailModel');

const comparisonController = {
    searchProducts: async (req, res) => {
        try {
          const { query } = req.query;
          
          if (!query) {
            return res.json({ 
              success: true, 
              data: [] 
            });
          }
    
          // Find products and populate details
          const products = await Product.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { baseProductName: { $regex: query, $options: 'i' } }
            ]
          }).populate('productDetails').lean();
    
          const formattedProducts = products.map(product => ({
            id: product._id,
            name: `${product.name} ${product.ram}/${product.storage}`,
            baseProductName: product.name,
            price: product.price,
            image: product.images[0],
            rating: product.rating,
            meta: product.meta,
            link: product.link,
            specs: {
              os: product.productDetails?.os,
              cpu: product.productDetails?.cpu,
              gpu: product.productDetails?.gpu,
              camera: product.productDetails?.camera,
              display: product.productDetails?.display,
              battery: product.productDetails?.battery
            },
            variant: {
              storage: product.storage,
              ram: product.ram
            }
          }));
    
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

    compareProducts: async (req, res) => {
        try {
            const { slugs } = req.query;
            console.log('[CompareProducts] Received slugs:', slugs);

            if (!slugs) {
                return res.status(400).json({
                    success: false,
                    message: 'Product slugs are required'
                });
            }

            const productQueries = slugs.split('-vs-').map(slug => {
                const parts = slug.split('-');
                const storage = parts.pop(); // Get last part as storage
                const isIphone = parts[0].toLowerCase() === 'iphone';
                let name;
                
                // For iPhone products, combine all parts except storage
                if (isIphone) {
                    name = parts.join(' ');
                    return {
                        baseProductName: { 
                            $regex: new RegExp(name.replace(/-/g, ' '), 'i')
                        },
                        'variant.storage': storage
                    };
                }
                
                // For non-iPhone products (keeping existing logic)
                const ram = parts.pop();
                name = parts.join(' ');
                return {
                    baseProductName: { 
                        $regex: new RegExp(name.replace(/-/g, ' '), 'i')
                    },
                    'variant.storage': storage,
                    'variant.ram': ram
                };
            });

            console.log('[CompareProducts] Queries:', productQueries);

            // Execute queries and populate product details
            const products = await Promise.all(
                productQueries.map(query => 
                    Product.findOne(query)
                        .populate({
                            path: 'productDetails',
                            select: 'specs camera display battery'
                        })
                        .lean()
                )
            );

            // Add debug logging
            console.log('[CompareProducts] Found products:', 
                products.map(p => p ? `${p.baseProductName} ${p.variant?.storage}` : 'Not found')
            );

            const formatProductImages = (product, trademark) => {
              console.log('Formatting images for product:', {
                  name: product.name,
                  trademark: trademark,
                  originalImages: product.images
              });
          
              return product.images.map(image => {
                  // If image already contains full path, return as is
                  if (image.startsWith('/images/phone/')) {
                      console.log('Image already has full path:', image);
                      return image;
                  }
          
                  // Otherwise construct proper path
                  const formattedTrademark = trademark?.toUpperCase() || 'UNKNOWN';
                  const formattedName = product.baseProductName.replace(/\s+/g, '');
                  const newPath = `/images/phone/${formattedTrademark}/${formattedName}/${image}`;
                  
                  console.log('Constructed new image path:', {
                      originalImage: image,
                      newPath,
                      trademark: formattedTrademark,
                      productName: formattedName
                  });
                  
                  return newPath;
              });
            };

            // Format response data with proper field mapping
            const formattedProducts = products
                .filter(product => product) // Filter out null/undefined products
                .map(product => ({
                    id: product._id,
                    name: product.name,
                    baseProductName: product.baseProductName,
                    images: formatProductImages(product, product.productDetails?.trademark),
                    trademark: product.productDetails?.trademark || '',
                    originalPrice: product.price,
                    discountPrice: product.price * (1 - (product.discount || 0) / 100),
                    discount: product.discount || 0,
                    rating: product.rating?.average || 0,
                    specs: {
                        os: product.productDetails?.specs?.os || product.specs?.os || 'N/A',
                        cpu: product.productDetails?.specs?.cpu || product.specs?.cpu || 'N/A',
                        gpu: product.productDetails?.specs?.gpu || product.specs?.gpu || 'N/A',
                        ram: product.variant?.ram || 'N/A',
                        storage: product.variant?.storage || 'N/A',
                        rearCamera: product.productDetails?.camera?.main || product.specs?.rearCamera || 'N/A',
                        frontCamera: product.productDetails?.camera?.front || product.specs?.frontCamera || 'N/A',
                        screenTech: product.productDetails?.display?.type || product.specs?.screenTech || 'N/A',
                        screenSize: product.productDetails?.display?.size || product.specs?.screenSize || 'N/A',
                        refreshRate: product.productDetails?.display?.refresh_rate || product.specs?.refreshRate || 'N/A',
                        brightness: product.productDetails?.display?.brightness || product.specs?.brightness || 'N/A',
                        battery: product.productDetails?.battery?.capacity || product.specs?.battery || 'N/A',
                        charging: product.productDetails?.battery?.charging || product.specs?.charging || 'N/A'
                    },
                    variant: {
                        ram: product.variant?.ram,
                        storage: product.variant?.storage
                    }
                }));

            // Return even if some products weren't found
            return res.status(200).json({
                success: true,
                data: formattedProducts,
                totalFound: formattedProducts.length,
                totalRequested: productQueries.length
            });

        } catch (error) {
            console.error('[CompareProducts] Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server khi tìm sản phẩm',
                error: error.message
            });
        }
    }
};

module.exports = comparisonController;