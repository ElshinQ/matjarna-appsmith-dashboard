export default {
  // PostgreSQL query templates for Appsmith
  queries: {
    // Inventory Queries
    getProducts: `SELECT * FROM inventory ORDER BY id DESC`,
    getProductById: `SELECT * FROM inventory WHERE id = {{productId}}`,
    getProductsByCategory: `SELECT * FROM inventory WHERE "التصنيف" = {{category}} ORDER BY id DESC`,
    getLowStockProducts: `SELECT * FROM inventory WHERE "الكمية"::integer <= "المخزون_المنخفض"::integer ORDER BY id DESC`,
    createProduct: `INSERT INTO inventory("اسم_المنتج", "التصنيف", "سعر_التكلفة", "سعر_البيع", "الصورة", "الكمية", "رمز_المنتج", "الوصف", "إجمالي_المخزون", "المخزون_المنخفض", created_at)
      VALUES ({{productName}}, {{category}}, {{costPrice}}, {{sellingPrice}}, {{image}}, {{quantity}}, {{productCode}}, {{description}}, {{totalStock}}, {{lowStockThreshold}}, NOW())
      RETURNING *`,
    updateProduct: `UPDATE inventory
      SET "اسم_المنتج" = {{productName}},
          "التصنيف" = {{category}},
          "سعر_التكلفة" = {{costPrice}},
          "سعر_البيع" = {{sellingPrice}},
          "الصورة" = {{image}},
          "الكمية" = {{quantity}},
          "رمز_المنتج" = {{productCode}},
          "الوصف" = {{description}},
          "إجمالي_المخزون" = {{totalStock}},
          "المخزون_المنخفض" = {{lowStockThreshold}}
      WHERE id = {{productId}}
      RETURNING *`,
    deleteProduct: `DELETE FROM inventory WHERE id = {{productId}}`,
    
    // Product Variant Queries
    getProductVariants: `SELECT * FROM product_variant ORDER BY id DESC`,
    getProductVariantById: `SELECT * FROM product_variant WHERE id = {{variantId}}`,
    getVariantsByProductId: `SELECT * FROM product_variant WHERE "معر_ف_المنتج" = {{productId}} ORDER BY id DESC`,
    createProductVariant: `INSERT INTO product_variant("_رمز_المنتج", "معر_ف_المنتج", "الكمية", "المخزون_المنخفض", "_سعر_التكلفة", "سعر_البيع", "التنويع", "الوصف", created_at)
      VALUES ({{productCode}}, {{productId}}, {{quantity}}, {{lowStockThreshold}}, {{costPrice}}, {{sellingPrice}}, {{variant}}, {{description}}, NOW())
      RETURNING *`,
    updateProductVariant: `UPDATE product_variant
      SET "_رمز_المنتج" = {{productCode}},
          "معر_ف_المنتج" = {{productId}},
          "الكمية" = {{quantity}},
          "المخزون_المنخفض" = {{lowStockThreshold}},
          "_سعر_التكلفة" = {{costPrice}},
          "سعر_البيع" = {{sellingPrice}},
          "التنويع" = {{variant}},
          "الوصف" = {{description}},
          updated_at = NOW()
      WHERE id = {{variantId}}
      RETURNING *`,
    deleteProductVariant: `DELETE FROM product_variant WHERE id = {{variantId}}`,
    
    // User Authentication Queries
    getUserByUsername: `SELECT * FROM users WHERE username = {{username}}`,
    createUser: `INSERT INTO users(username, password_hash, email, created_at, updated_at)
      VALUES ({{username}}, {{passwordHash}}, {{email}}, NOW(), NOW())
      RETURNING *`,
    updateUserPassword: `UPDATE users
      SET password_hash = {{passwordHash}},
          updated_at = NOW()
      WHERE id = {{userId}}
      RETURNING *`,
  },
  
  // Helper methods to initialize database connections
  connectionConfigs: {
    matjarnaDB: {
      host: 'postgres',  // Docker service name
      port: 5432,
      database: 'matjarna_db',
      username: 'noor',
      password: 'MyDB123456',
      ssl: false
    },
    authDB: {
      host: 'postgres',  // Docker service name
      port: 5432,
      database: 'auth_db',
      username: 'noor',
      password: 'MyDB123456',
      ssl: false
    }
  },
  
  // Methods for processing data results
  methods: {
    // Calculate dashboard statistics
    calculateDashboardStats: async () => {
      try {
        // Get total products count
        const productsResult = await storeQuery.run();
        const totalProducts = productsResult.length;
        
        // Get low stock products count
        const lowStockResult = await lowStockQuery.run();
        const lowStockCount = lowStockResult.length;
        
        // Calculate total inventory value
        let totalInventoryValue = 0;
        productsResult.forEach(product => {
          const quantity = parseInt(product['الكمية'] || '0');
          const sellingPrice = parseFloat(product['سعر_البيع'] || '0');
          totalInventoryValue += quantity * sellingPrice;
        });
        
        return {
          totalProducts,
          lowStockCount,
          totalInventoryValue: totalInventoryValue.toFixed(2)
        };
      } catch (error) {
        console.error('Error calculating dashboard stats:', error);
        throw error;
      }
    },
    
    // Format product data for display
    formatProductForDisplay: (product) => {
      return {
        id: product.id,
        productName: product['اسم_المنتج'],
        category: product['التصنيف'],
        costPrice: product['سعر_التكلفة'],
        sellingPrice: product['سعر_البيع'],
        quantity: product['الكمية'],
        productCode: product['رمز_المنتج'],
        description: product['الوصف'],
        totalStock: product['إجمالي_المخزون'],
        lowStockThreshold: product['المخزون_المنخفض'],
        image: product['الصورة'],
        profit: parseFloat(product['سعر_البيع'] || 0) - parseFloat(product['سعر_التكلفة'] || 0),
        isLowStock: parseInt(product['الكمية'] || 0) <= parseInt(product['المخزون_المنخفض'] || 0)
      };
    },
    
    // Format variant data for display
    formatVariantForDisplay: (variant) => {
      return {
        id: variant.id,
        productId: variant['معر_ف_المنتج'],
        productCode: variant['_رمز_المنتج'],
        variant: variant['التنويع'],
        costPrice: variant['_سعر_التكلفة'],
        sellingPrice: variant['سعر_البيع'],
        quantity: variant['الكمية'],
        lowStockThreshold: variant['المخزون_المنخفض'],
        description: variant['الوصف'],
        profit: parseFloat(variant['سعر_البيع'] || 0) - parseFloat(variant['_سعر_التكلفة'] || 0),
        isLowStock: parseInt(variant['الكمية'] || 0) <= parseInt(variant['المخزون_المنخفض'] || 0)
      };
    }
  }
};
