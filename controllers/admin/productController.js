const { Product } = require('../../models/productModel');
const { ProductDetail } = require('../../models/productDetailModel');
const Category = require('../../models/categoryModel');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../../middleware/loggerMiddleware');

const productController = {
    getAllProducts: async (req, res) => {
        try {
            const products = await Product.find()
                .populate('category_id')
                .populate('trademark')
                .sort({ created_at: -1 });
    
            const formattedProducts = products.map(product => {
                // Kiểm tra và xử lý dữ liệu trước khi truy cập
                const categoryName = product.category_id ? product.category_id.name : 'Unknown Category';
                const trademarkName = product.trademark ? 
                    (typeof product.trademark === 'string' ? product.trademark : product.trademark.name) 
                    : 'Unknown Brand';
    
                return {
                    id: product._id,
                    name: product.name || '',
                    baseProductName: product.name ? product.name.split(' ')[0] : '',
                    price: product.price || 0,
                    originalPrice: product.price || 0,
                    discountPrice: product.price ? (product.price * (1 - (product.discount || 0)/100)) : 0,
                    discount: product.discount || 0,
                    category: categoryName,
                    trademark: trademarkName,
                    images: product.images || [],
                    ram: product.ram || '',
                    storage: product.storage || '',
                    stock: product.stock || 0,
                    status: product.status || 'inactive',
                    release_year: product.release_year || new Date().getFullYear(),
                    needs: product.needs || [],
                    special_features: product.special_features || [],
                    rating: product.rating || 0,
                    link: product.link || ''
                };
            });
    
            // Log để debug
            console.log('Raw products:', products);
            console.log('Formatted products:', formattedProducts);
    
            res.json({
                success: true,
                data: formattedProducts
            });
        } catch (error) {
            console.error('Error getting products:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getProductDetails: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Fetch product and its details
            const [product, productDetails] = await Promise.all([
                Product.findById(id)
                .populate('category_id')
                .populate('trademark'),
                ProductDetail.findOne({ product_id: id })
            ]);
        
            if (!product || !productDetails) {
                return res.status(404).json({
                success: false,
                message: 'Product or details not found'
                });
            }
        
            // Combine data
            const response = {
                ...product.toObject(),
                details: productDetails.toObject()
            };
        
            res.json({
                success: true,
                data: response
            });
      
        } catch (error) {
          console.error('Error getting product details:', error);
          res.status(500).json({
            success: false,
            message: error.message
          });
        }
    },
      
    // updateProductDetails: async (req, res) => {
    //     try {
    //       const { id } = req.params;
    //       const updateData = req.body;
      
    //       // Parse details from form data
    //       const details = updateData.details ? JSON.parse(updateData.details) : null;
      
    //       // Update product basic info
    //       const updatedProduct = await Product.findByIdAndUpdate(
    //         id,
    //         {
    //           price: updateData.price,
    //           stock: updateData.stock,
    //           release_year: updateData.release_year
    //         },
    //         { new: true }
    //       );
      
    //       if (!updatedProduct) {
    //         return res.status(404).json({
    //           success: false,
    //           message: 'Product not found'
    //         });
    //       }
      
    //       // Update product details if provided
    //       if (details) {
    //         const updatedDetails = await ProductDetail.findOneAndUpdate(
    //           { product_id: id },
    //           {
    //             os: details.os,
    //             cpu: details.cpu,
    //             gpu: details.gpu,
    //             camera: details.camera,
    //             display: details.display,
    //             battery: details.battery,
    //             color_options: details.color_options,
    //             trademark: details.trademark
    //           },
    //           { new: true, upsert: true }
    //         );
      
    //         // Log để debug
    //         console.log('Updated details:', updatedDetails);
    //       }
      
    //       res.json({
    //         success: true,
    //         message: 'Product updated successfully',
    //         data: updatedProduct
    //       });
      
    //     } catch (error) {
    //       console.error('Error updating product:', error);
    //       res.status(500).json({
    //         success: false,
    //         message: error.message
    //       });
    //     }
    // },

    createProduct: async (req, res) => {
        try {
            const {
                name,
                price,
                stock,
                category_id,
                ram,
                storage,
                release_year,
                needs,
                special_features,
                productDetails 
            } = req.body;

            // Validate required fields
            if (!name || !price || !category_id || !storage) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            // Parse productDetails from string to object
            const parsedProductDetails = JSON.parse(productDetails);

            // Check if files were uploaded
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one image is required'
                });
            }

            // Get category info
            const category = await Category.findById(category_id);
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category'
                });
            }

            // Create folder structure for images
            const brandFolder = category.name.replace(/\s+/g, '').toUpperCase();
            const productFolder = name.replace(/\s+/g, '');
            const uploadPath = path.join(__dirname, '../../public/images/phone', brandFolder, productFolder);

            // Create folders if they don't exist
            await fs.mkdir(uploadPath, { recursive: true });

            // Generate product link
            const baseName = name.toLowerCase().replace(/\s+/g, '-');
            const isIphone = baseName.includes('iphone');
            const productLink = isIphone 
                ? `${baseName}-${storage.toLowerCase()}`
                : `${baseName}-${ram.toLowerCase()}-${storage.toLowerCase()}`;            

            // Process and move uploaded files
            const productImages = [];
            for (const file of req.files) {
                const fileName = `${Date.now()}-${file.originalname}`;
                const newFilePath = path.join(uploadPath, fileName);
                
                await fs.rename(file.path, newFilePath);
                
                // Store relative path in database
                productImages.push(`${fileName}`);
            }

            // Create new product
            const product = new Product({
                name,
                price: Number(price),
                stock: Number(stock),
                category_id,
                trademark: category_id,
                images: productImages,
                ram,
                storage,
                release_year: Number(release_year) || new Date().getFullYear(),
                needs: needs ? JSON.parse(needs) : [], // Parse giá trị string thành array
                special_features: special_features ? JSON.parse(special_features) : [], // Parse giá trị string thành array
                link: productLink,
            });

            await product.save();

            // Create product details
            const productDetail = new ProductDetail({
                product_id: product._id,
                trademark: parsedProductDetails.trademark,
                os: parsedProductDetails.os,
                cpu: parsedProductDetails.cpu,
                gpu: parsedProductDetails.gpu,
                camera: parsedProductDetails.camera,
                display: parsedProductDetails.display,
                battery: parsedProductDetails.battery,
                color_options: parsedProductDetails.color_options
            });

            await productDetail.save();

            // Log product creation
            await logger(
                req.user.userId,
                'CREATE',
                'PRODUCTS',
                `Thêm sản phẩm mới: ${product.name} (${product.storage}${product.ram ? `, ${product.ram}` : ''})`,
                req
            );

            res.json({
                success: true,
                message: 'Product created successfully',
                data: {
                    product,
                    productDetail
                }
            });

        } catch (error) {
            console.error('Error creating product:', error);
            // Clean up any uploaded files if there was an error
            if (req.files) {
                for (const file of req.files) {
                    if (file.path) {
                        await fs.unlink(file.path).catch(() => {});
                    }
                }
            }
            res.status(500).json({
                success: false,
                message: error.message || 'Error creating product'
            });
        }
    },

    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Get original product for logging changes
            const originalProduct = await Product.findById(id);
            if (!originalProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            // Parse details from form data
            const details = updateData.details ? JSON.parse(updateData.details) : null;
    
            // Handle images if files are uploaded
            if (req.files && req.files.length > 0) {
                const product = await Product.findById(id).populate('trademark');
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: 'Product not found'
                    });
                }
    
                if (product.trademark && product.trademark.name) {
                    // Create/verify folder exists
                    const productFolder = path.join(__dirname, '../../public/images/phone',
                        product.trademark.name.toUpperCase(),
                        product.name.replace(/\s+/g, '')
                    );
                    await fs.mkdir(productFolder, { recursive: true });
    
                    // Delete old images
                    if (product.images && product.images.length > 0) {
                        for (const image of product.images) {
                            const imagePath = path.join(productFolder, image);
                            await fs.unlink(imagePath).catch(() => {
                                console.log(`Failed to delete image: ${imagePath}`);
                            });
                        }
                    }
    
                    // Process and save new images
                    const newImages = [];
                    for (const file of req.files) {
                        const fileName = `${Date.now()}-${file.originalname}`;
                        const filePath = path.join(productFolder, fileName);
                        await fs.rename(file.path, filePath);
                        newImages.push(fileName);
                    }
    
                    // Update images array
                    updateData.images = newImages;
                }
            }
    
            // Update product basic info
            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                {
                    price: updateData.price,
                    stock: updateData.stock,
                    release_year: updateData.release_year,
                    discount: updateData.discount || 0,
                    ...(updateData.images && { images: updateData.images })
                },
                { new: true }
            ).populate('category_id').populate('trademark');
    
            // Update product details if provided
            if (details) {
                await ProductDetail.findOneAndUpdate(
                    { product_id: id },
                    {
                        os: details.os,
                        cpu: details.cpu,
                        gpu: details.gpu,
                        camera: details.camera,
                        display: details.display,
                        battery: details.battery,
                        color_options: details.color_options,
                        trademark: details.trademark
                    },
                    { new: true, upsert: true }
                );
            }

            // Prepare changes log
            const changes = [];
            if (updateData.price !== originalProduct.price) {
                changes.push(`Giá: ${originalProduct.price.toLocaleString('vi-VN')}đ → ${updateData.price.toLocaleString('vi-VN')}đ`);
            }
            if (updateData.stock !== originalProduct.stock) {
                changes.push(`Tồn kho: ${originalProduct.stock} → ${updateData.stock}`);
            }
            if (updateData.discount !== originalProduct.discount) {
                changes.push(`Giảm giá: ${originalProduct.discount}% → ${updateData.discount}%`);
            }

            // Log product update
            await logger(
                req.user.userId,
                'UPDATE',
                'PRODUCTS',
                `Cập nhật sản phẩm ${originalProduct.name}: ${changes.join(', ')}`,
                req
            );
    
            res.json({
                success: true,
                message: 'Product updated successfully',
                data: updatedProduct
            });
    
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;            
            const product = await Product.findById(id).populate('trademark');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
    
            if (product.trademark && product.trademark.name) {
                // Delete product images
                for (const image of product.images) {
                    const imagePath = path.join(__dirname, '../../public/images/phone', 
                        product.trademark.name.toUpperCase(), 
                        product.name.replace(/\s+/g, ''), 
                        image
                    );
                    await fs.unlink(imagePath).catch(() => {
                        console.log(`Failed to delete image: ${imagePath}`);
                    });
                }
            }
    
            // Delete product details
            await ProductDetail.deleteOne({ product_id: id });
    
            // Delete product
            await Product.findByIdAndDelete(id);

            // Log product deletion
            await logger(
                req.user.userId,
                'DELETE',
                'PRODUCTS',
                `Xóa sản phẩm: ${product.name}`,
                req
            );
    
            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get all categories
    getCategories: async (req, res) => {
        try {
            const categories = await Category.find().sort({ name: 1 });
            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            console.error('Error getting categories:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Create category
    createCategory: async (req, res) => {
        try {
            const { name, description, link } = req.body;
            const logo_url = req.file ? `/images/categories/${req.file.filename}` : '';

            const category = new Category({
                name,
                description,
                link,
                logo_url
            });

            await category.save();

            // Log category creation
            await logger(
                req.user.userId,
                'CREATE',
                'PRODUCTS',
                `Thêm danh mục mới: ${category.name}`,
                req
            );

            res.json({
                success: true,
                message: 'Category created successfully',
                data: category
            });
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Delete category
    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;

            // Check if category has products
            const productsCount = await Product.countDocuments({ category_id: id });
            if (productsCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete category with existing products'
                });
            }

            // Delete category logo
            const category = await Category.findById(id);
            if (category && category.logo_url) {
                const logoPath = path.join(__dirname, '../../public', category.logo_url);
                await fs.unlink(logoPath).catch(() => {});
            }

            await Category.findByIdAndDelete(id);

            // Log category deletion
            await logger(
                req.user.userId,
                'DELETE',
                'PRODUCTS',
                `Xóa danh mục: ${category.name}`,
                req
            );

            res.json({
                success: true,
                message: 'Category deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    searchProducts: async (req, res) => {
        try {
            const { query } = req.query;
            
            const products = await Product.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { 'trademark.name': { $regex: query, $options: 'i' } },
                    { 'category.name': { $regex: query, $options: 'i' } }
                ]
            })
            .populate('category_id')
            .populate('trademark');

            const formattedProducts = products.map(product => ({
                id: product._id,
                name: product.name,
                baseProductName: product.name.split(' ')[0],
                price: product.price,
                originalPrice: product.price,
                discountPrice: product.price * (1 - product.discount/100),
                discount: product.discount || 0,
                category: product.category_id.name,
                trademark: product.trademark.name,
                images: product.images,
                ram: product.ram,
                storage: product.storage,
                stock: product.stock,
                status: product.status,
                release_year: product.release_year,
                needs: product.needs,
                special_features: product.special_features,
                rating: product.rating,
                link: product.link
            }));

            res.json({
                success: true,
                data: formattedProducts
            });
        } catch (error) {
            console.error('Error searching products:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, link } = req.body;

            const originalCategory = await Category.findById(id);
    
            // Tìm category hiện tại
            const category = await Category.findById(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }
    
            // Xử lý upload logo mới (nếu có)
            if (req.file) {
                // Xóa logo cũ nếu tồn tại
                if (category.logo_url) {
                    const oldLogoPath = path.join(__dirname, '../../public', category.logo_url);
                    await fs.unlink(oldLogoPath).catch(() => {
                        console.log('Previous logo not found or already deleted');
                    });
                }
                // Cập nhật đường dẫn logo mới
                category.logo_url = `/images/categories/${req.file.filename}`;
            }
    
            // Cập nhật thông tin category
            category.name = name || category.name;
            category.description = description || category.description;
            category.link = link || category.link;
    
            // Lưu thay đổi
            const updatedCategory = await category.save();

            // Log category update
            const changes = [];
            if (updatedCategory.name !== originalCategory.name) {
                changes.push(`Tên: ${originalCategory.name} → ${name}`);
            }
            if (updatedCategory.description !== originalCategory.description) {
                changes.push('Cập nhật mô tả');
            }
            if (req.file) {
                changes.push('Cập nhật logo');
            }

            await logger(
                req.user.userId,
                'UPDATE',
                'PRODUCTS',
                `Cập nhật danh mục ${originalCategory.name}: ${changes.join(', ')}`,
                req
            );
    
            res.json({
                success: true,
                message: 'Category updated successfully',
                data: updatedCategory
            });
        } catch (error) {
            console.error('Error updating category:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },
};

module.exports = productController;