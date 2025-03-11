export default {
  // Variables to track product form state
  formMode: 'add', // 'add' or 'edit'
  currentProductId: null,
  
  // Product schema validation rules
  validationRules: {
    productName: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    category: {
      required: true
    },
    costPrice: {
      required: true,
      isNumeric: true,
      min: 0
    },
    sellingPrice: {
      required: true,
      isNumeric: true,
      min: 0
    },
    quantity: {
      required: true,
      isNumeric: true,
      isInteger: true,
      min: 0
    },
    lowStockThreshold: {
      required: true,
      isNumeric: true,
      isInteger: true,
      min: 0
    },
    productCode: {
      required: true,
      minLength: 2,
      maxLength: 20
    }
  },
  
  // Method to load products from the database
  async loadProducts() {
    try {
      // Reset search filter if any
      resetFilters.run();
      
      // Get all products from the database
      const result = await getAllProducts.run();
      
      // Format the results for the table
      return result.map(product => ({
        id: product.id,
        "اسم_المنتج": product["اسم_المنتج"] || "",
        "التصنيف": product["التصنيف"] || "",
        "سعر_التكلفة": product["سعر_التكلفة"] || "0",
        "سعر_البيع": product["سعر_البيع"] || "0",
        "الكمية": product["الكمية"] || "0",
        "رمز_المنتج": product["رمز_المنتج"] || "",
        "الوصف": product["الوصف"] || "",
        "إجمالي_المخزون": product["إجمالي_المخزون"] || "0",
        "المخزون_المنخفض": product["المخزون_المنخفض"] || "0"
      }));
    } catch (error) {
      console.error('Error loading products:', error);
      showAlert('Error loading products: ' + error.message, 'error');
      return [];
    }
  },
  
  // Method to filter products based on search criteria
  async searchProducts(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return this.loadProducts();
      }
      
      const result = await searchProducts.run({
        searchTerm: `%${searchTerm}%`
      });
      
      return result.map(product => ({
        id: product.id,
        "اسم_المنتج": product["اسم_المنتج"] || "",
        "التصنيف": product["التصنيف"] || "",
        "سعر_التكلفة": product["سعر_التكلفة"] || "0",
        "سعر_البيع": product["سعر_البيع"] || "0",
        "الكمية": product["الكمية"] || "0",
        "رمز_المنتج": product["رمز_المنتج"] || "",
        "الوصف": product["الوصف"] || "",
        "إجمالي_المخزون": product["إجمالي_المخزون"] || "0",
        "المخزون_المنخفض": product["المخزون_المنخفض"] || "0"
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      showAlert('Error searching products: ' + error.message, 'error');
      return [];
    }
  },
  
  // Method to prepare form for adding a new product
  addProduct() {
    this.formMode = 'add';
    this.currentProductId = null;
    
    // Reset form fields
    resetProductForm.run();
    
    // Switch to the product form tab
    navigateToTab.run({
      tabId: 'tab2'
    });
  },
  
  // Method to prepare form for editing an existing product
  async editProduct(productId) {
    try {
      this.formMode = 'edit';
      this.currentProductId = productId;
      
      // Get product data
      const result = await getProductById.run({
        productId: productId
      });
      
      if (result && result.length > 0) {
        const product = result[0];
        
        // Populate form fields
        populateProductForm.run({
          productName: product["اسم_المنتج"] || "",
          category: product["التصنيف"] || "",
          costPrice: product["سعر_التكلفة"] || "0",
          sellingPrice: product["سعر_البيع"] || "0",
          quantity: product["الكمية"] || "0",
          productCode: product["رمز_المنتج"] || "",
          description: product["الوصف"] || "",
          totalStock: product["إجمالي_المخزون"] || "0",
          lowStockThreshold: product["المخزون_المنخفض"] || "0",
          image: product["الصورة"] || ""
        });
        
        // Switch to the product form tab
        navigateToTab.run({
          tabId: 'tab2'
        });
      } else {
        showAlert('Product not found', 'error');
      }
    } catch (error) {
      console.error('Error loading product for edit:', error);
      showAlert('Error loading product: ' + error.message, 'error');
    }
  },
  
  // Method to validate form inputs
  validateForm(formData) {
    const errors = {};
    
    // Validate product name
    if (!formData.productName || formData.productName.trim() === '') {
      errors.productName = 'اسم المنتج مطلوب';
    } else if (formData.productName.length < 3) {
      errors.productName = 'اسم المنتج يجب أن يكون على الأقل 3 أحرف';
    }
    
    // Validate category
    if (!formData.category || formData.category.trim() === '') {
      errors.category = 'التصنيف مطلوب';
    }
    
    // Validate cost price
    if (!formData.costPrice) {
      errors.costPrice = 'سعر التكلفة مطلوب';
    } else {
      const costPrice = parseFloat(formData.costPrice);
      if (isNaN(costPrice) || costPrice < 0) {
        errors.costPrice = 'سعر التكلفة يجب أن يكون رقم موجب';
      }
    }
    
    // Validate selling price
    if (!formData.sellingPrice) {
      errors.sellingPrice = 'سعر البيع مطلوب';
    } else {
      const sellingPrice = parseFloat(formData.sellingPrice);
      if (isNaN(sellingPrice) || sellingPrice < 0) {
        errors.sellingPrice = 'سعر البيع يجب أن يكون رقم موجب';
      }
    }
    
    // Validate quantity
    if (!formData.quantity) {
      errors.quantity = 'الكمية مطلوبة';
    } else {
      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity < 0 || quantity !== parseFloat(formData.quantity)) {
        errors.quantity = 'الكمية يجب أن تكون رقم صحيح موجب';
      }
    }
    
    // Validate low stock threshold
    if (!formData.lowStockThreshold) {
      errors.lowStockThreshold = 'حد المخزون المنخفض مطلوب';
    } else {
      const threshold = parseInt(formData.lowStockThreshold);
      if (isNaN(threshold) || threshold < 0 || threshold !== parseFloat(formData.lowStockThreshold)) {
        errors.lowStockThreshold = 'حد المخزون المنخفض يجب أن يكون رقم صحيح موجب';
      }
    }
    
    // Validate product code
    if (!formData.productCode || formData.productCode.trim() === '') {
      errors.productCode = 'رمز المنتج مطلوب';
    } else if (formData.productCode.length < 2) {
      errors.productCode = 'رمز المنتج يجب أن يكون على الأقل حرفين';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  },
  
  // Method to save product (create or update)
  async saveProduct(formData) {
    // Validate form data
    const validation = this.validateForm(formData);
    
    if (!validation.isValid) {
      showValidationErrors.run({
        errors: validation.errors
      });
      return false;
    }
    
    try {
      let result;
      
      if (this.formMode === 'add') {
        // Create new product
        result = await createProduct.run({
          productName: formData.productName,
          category: formData.category,
          costPrice: formData.costPrice,
          sellingPrice: formData.sellingPrice,
          image: formData.image || '',
          quantity: formData.quantity,
          productCode: formData.productCode,
          description: formData.description || '',
          totalStock: formData.totalStock || formData.quantity,
          lowStockThreshold: formData.lowStockThreshold
        });
        
        showAlert('تم إضافة المنتج بنجاح', 'success');
      } else {
        // Update existing product
        result = await updateProduct.run({
          productId: this.currentProductId,
          productName: formData.productName,
          category: formData.category,
          costPrice: formData.costPrice,
          sellingPrice: formData.sellingPrice,
          image: formData.image || '',
          quantity: formData.quantity,
          productCode: formData.productCode,
          description: formData.description || '',
          totalStock: formData.totalStock || formData.quantity,
          lowStockThreshold: formData.lowStockThreshold
        });
        
        showAlert('تم تحديث المنتج بنجاح', 'success');
      }
      
      // Check for low stock and trigger alert if needed
      if (parseInt(formData.quantity) <= parseInt(formData.lowStockThreshold)) {
        // Get the product with all fields for the alert
        const productForAlert = result[0] || {
          id: this.currentProductId,
          'اسم_المنتج': formData.productName,
          'رمز_المنتج': formData.productCode,
          'الكمية': formData.quantity,
          'المخزون_المنخفض': formData.lowStockThreshold,
          'التصنيف': formData.category
        };
        
        // Send low stock alert
        await n8nIntegration.methods.sendLowStockAlert(productForAlert);
      }
      
      // Reload products list
      await reloadProductsTable.run();
      
      // Switch back to products list tab
      navigateToTab.run({
        tabId: 'tab1'
      });
      
      return true;
    } catch (error) {
      console.error('Error saving product:', error);
      showAlert('Error saving product: ' + error.message, 'error');
      return false;
    }
  },
  
  // Method to delete a product
  async deleteProduct(productId) {
    // Show confirmation dialog
    const confirmed = await showDeleteConfirmation.run();
    
    if (!confirmed) {
      return false;
    }
    
    try {
      await deleteProduct.run({
        productId: productId
      });
      
      showAlert('تم حذف المنتج بنجاح', 'success');
      
      // Reload products list
      await reloadProductsTable.run();
      
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      showAlert('Error deleting product: ' + error.message, 'error');
      return false;
    }
  },
  
  // Method to check for low stock products and send notifications
  async checkLowStockProducts() {
    try {
      const result = await getLowStockProducts.run();
      
      if (result && result.length > 0) {
        // Update low stock count on dashboard
        updateLowStockCount.run({
          count: result.length
        });
        
        // Optionally send notifications for all low stock products
        for (const product of result) {
          await n8nIntegration.methods.sendLowStockAlert(product);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error checking low stock products:', error);
      return [];
    }
  }
};
