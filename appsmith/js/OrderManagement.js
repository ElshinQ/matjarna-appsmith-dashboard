export default {
  // Variables to track order form state
  formMode: 'add', // 'add' or 'edit'
  currentOrderId: null,
  orderStatusOptions: [
    { label: 'جديد', value: 'new' },
    { label: 'قيد المعالجة', value: 'processing' },
    { label: 'تم الشحن', value: 'shipped' },
    { label: 'تم التسليم', value: 'delivered' },
    { label: 'ملغي', value: 'canceled' }
  ],
  
  // Order schema validation rules
  validationRules: {
    customerName: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    customerPhone: {
      required: true,
      minLength: 10,
      maxLength: 15
    },
    orderItems: {
      required: true,
      minItems: 1
    },
    orderStatus: {
      required: true,
      validValues: ['new', 'processing', 'shipped', 'delivered', 'canceled']
    }
  },
  
  // Method to load orders from the database
  async loadOrders() {
    try {
      // Reset search filter if any
      resetFilters.run();
      
      // Get all orders from the database
      const result = await getAllOrders.run();
      
      // Format the results for the table
      return this.formatOrdersForTable(result);
    } catch (error) {
      console.error('Error loading orders:', error);
      showAlert('Error loading orders: ' + error.message, 'error');
      return [];
    }
  },
  
  // Helper method to format orders for table display
  formatOrdersForTable(orders) {
    if (!orders || !Array.isArray(orders)) {
      return [];
    }
    
    return orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number || `#${order.id}`,
      customerName: order.customer_name || "",
      customerPhone: order.customer_phone || "",
      orderDate: this.formatDate(order.created_at),
      orderStatus: this.translateStatus(order.order_status),
      totalAmount: this.formatCurrency(order.total_amount),
      itemCount: order.item_count || 0,
      // Add action buttons
      actions: "أزرار الإجراءات هنا"
    }));
  },
  
  // Format date for display
  formatDate(dateStr) {
    if (!dateStr) return "";
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  },
  
  // Format currency for display
  formatCurrency(amount) {
    if (amount === null || amount === undefined) return "0 ريال";
    
    try {
      return `${parseFloat(amount).toLocaleString('ar-SA')} ريال`;
    } catch (e) {
      return `${amount} ريال`;
    }
  },
  
  // Translate order status to Arabic
  translateStatus(status) {
    const statusMap = {
      'new': 'جديد',
      'processing': 'قيد المعالجة',
      'shipped': 'تم الشحن',
      'delivered': 'تم التسليم',
      'canceled': 'ملغي'
    };
    
    return statusMap[status] || status;
  },
  
  // Method to filter orders based on search criteria
  async searchOrders(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return this.loadOrders();
      }
      
      const result = await searchOrders.run({
        searchTerm: `%${searchTerm}%`
      });
      
      return this.formatOrdersForTable(result);
    } catch (error) {
      console.error('Error searching orders:', error);
      showAlert('Error searching orders: ' + error.message, 'error');
      return [];
    }
  },
  
  // Method to filter orders by status
  async filterOrdersByStatus(status) {
    try {
      if (!status || status === 'all') {
        return this.loadOrders();
      }
      
      const result = await getOrdersByStatus.run({
        status: status
      });
      
      return this.formatOrdersForTable(result);
    } catch (error) {
      console.error('Error filtering orders:', error);
      showAlert('Error filtering orders: ' + error.message, 'error');
      return [];
    }
  },
  
  // Method to prepare form for adding a new order
  addOrder() {
    this.formMode = 'add';
    this.currentOrderId = null;
    
    // Reset form fields
    resetOrderForm.run();
    
    // Initialize empty order items array
    storeValue('orderItems', []);
    
    // Load available products for selection
    this.loadAvailableProducts();
    
    // Switch to the order form tab
    navigateToTab.run({
      tabId: 'tab2'
    });
  },
  
  // Method to prepare form for editing an existing order
  async editOrder(orderId) {
    try {
      this.formMode = 'edit';
      this.currentOrderId = orderId;
      
      // Get order data
      const result = await getOrderById.run({
        orderId: orderId
      });
      
      if (result && result.length > 0) {
        const order = result[0];
        
        // Get order items
        const orderItems = await getOrderItems.run({
          orderId: orderId
        });
        
        // Store order items in app store
        storeValue('orderItems', orderItems);
        
        // Populate form fields
        populateOrderForm.run({
          orderNumber: order.order_number || `#${order.id}`,
          customerName: order.customer_name || "",
          customerPhone: order.customer_phone || "",
          orderStatus: order.order_status || "new",
          deliveryAddress: order.delivery_address || "",
          notes: order.notes || ""
        });
        
        // Load available products for selection
        await this.loadAvailableProducts();
        
        // Switch to the order form tab
        navigateToTab.run({
          tabId: 'tab2'
        });
      } else {
        showAlert('Order not found', 'error');
      }
    } catch (error) {
      console.error('Error loading order for edit:', error);
      showAlert('Error loading order: ' + error.message, 'error');
    }
  },
  
  // Load products for order form
  async loadAvailableProducts() {
    try {
      const result = await getProductsForOrder.run();
      storeValue('availableProducts', result);
      return result;
    } catch (error) {
      console.error('Error loading products:', error);
      showAlert('Error loading products: ' + error.message, 'error');
      return [];
    }
  },
  
  // Add product to current order
  addProductToOrder(productId, quantity) {
    try {
      // Get product details from available products
      const availableProducts = appsmith.store.availableProducts || [];
      const product = availableProducts.find(p => p.id === productId);
      
      if (!product) {
        showAlert('Product not found', 'error');
        return false;
      }
      
      // Check available quantity
      const availableQty = parseInt(product["الكمية"] || '0');
      if (quantity > availableQty) {
        showAlert(`Only ${availableQty} units available for this product`, 'warning');
        quantity = availableQty; // Limit quantity to available stock
      }
      
      // Calculate item total
      const price = parseFloat(product["سعر_البيع"] || '0');
      const total = price * quantity;
      
      // Create order item object
      const orderItem = {
        product_id: productId,
        product_name: product["اسم_المنتج"] || '',
        quantity: quantity,
        unit_price: price,
        total_price: total
      };
      
      // Get current order items
      const currentItems = appsmith.store.orderItems || [];
      
      // Check if product already exists in order
      const existingItemIndex = currentItems.findIndex(item => item.product_id === productId);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        currentItems[existingItemIndex].quantity += quantity;
        currentItems[existingItemIndex].total_price = 
          currentItems[existingItemIndex].quantity * currentItems[existingItemIndex].unit_price;
      } else {
        // Add new item
        currentItems.push(orderItem);
      }
      
      // Update order items in store
      storeValue('orderItems', currentItems);
      
      // Update order total
      this.updateOrderTotal();
      
      return true;
    } catch (error) {
      console.error('Error adding product to order:', error);
      showAlert('Error adding product: ' + error.message, 'error');
      return false;
    }
  },
  
  // Remove product from current order
  removeProductFromOrder(productId) {
    try {
      // Get current order items
      const currentItems = appsmith.store.orderItems || [];
      
      // Filter out the item to remove
      const updatedItems = currentItems.filter(item => item.product_id !== productId);
      
      // Update order items in store
      storeValue('orderItems', updatedItems);
      
      // Update order total
      this.updateOrderTotal();
      
      return true;
    } catch (error) {
      console.error('Error removing product from order:', error);
      showAlert('Error removing product: ' + error.message, 'error');
      return false;
    }
  },
  
  // Update order total amount
  updateOrderTotal() {
    try {
      const orderItems = appsmith.store.orderItems || [];
      
      // Calculate total
      const total = orderItems.reduce((sum, item) => sum + item.total_price, 0);
      
      // Update total field
      updateOrderTotal.run({
        total: total
      });
      
      return total;
    } catch (error) {
      console.error('Error updating order total:', error);
      return 0;
    }
  },
  
  // Method to validate form inputs
  validateOrderForm(formData) {
    const errors = {};
    
    // Validate customer name
    if (!formData.customerName || formData.customerName.trim() === '') {
      errors.customerName = 'اسم العميل مطلوب';
    } else if (formData.customerName.length < 3) {
      errors.customerName = 'اسم العميل يجب أن يكون على الأقل 3 أحرف';
    }
    
    // Validate customer phone
    if (!formData.customerPhone || formData.customerPhone.trim() === '') {
      errors.customerPhone = 'رقم الهاتف مطلوب';
    } else if (formData.customerPhone.length < 10) {
      errors.customerPhone = 'رقم الهاتف يجب أن يكون على الأقل 10 أرقام';
    }
    
    // Validate order items
    const orderItems = appsmith.store.orderItems || [];
    if (!orderItems || orderItems.length === 0) {
      errors.orderItems = 'يجب إضافة منتج واحد على الأقل للطلب';
    }
    
    // Validate order status
    if (!formData.orderStatus) {
      errors.orderStatus = 'حالة الطلب مطلوبة';
    } else {
      const validStatuses = this.orderStatusOptions.map(opt => opt.value);
      if (!validStatuses.includes(formData.orderStatus)) {
        errors.orderStatus = 'حالة الطلب غير صالحة';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  },
  
  // Method to save order (create or update)
  async saveOrder(formData) {
    // Validate form data
    const validation = this.validateOrderForm(formData);
    
    if (!validation.isValid) {
      showValidationErrors.run({
        errors: validation.errors
      });
      return false;
    }
    
    try {
      const orderItems = appsmith.store.orderItems || [];
      const orderTotal = this.updateOrderTotal();
      
      let orderId;
      
      if (this.formMode === 'add') {
        // Create new order
        const result = await createOrder.run({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          orderStatus: formData.orderStatus,
          deliveryAddress: formData.deliveryAddress || '',
          notes: formData.notes || '',
          totalAmount: orderTotal,
          itemCount: orderItems.length
        });
        
        if (result && result.length > 0) {
          orderId = result[0].id;
          
          // Create order items
          for (const item of orderItems) {
            await createOrderItem.run({
              orderId: orderId,
              productId: item.product_id,
              productName: item.product_name,
              quantity: item.quantity,
              unitPrice: item.unit_price,
              totalPrice: item.total_price
            });
            
            // Update product inventory
            await updateProductInventory.run({
              productId: item.product_id,
              quantity: item.quantity
            });
          }
          
          // Send notification about new order
          const orderData = {
            id: orderId,
            customerName: formData.customerName,
            total: orderTotal,
            items: orderItems,
            date: new Date().toISOString(),
            status: formData.orderStatus
          };
          
          await n8nIntegration.methods.sendNewOrderNotification(orderData);
          
          showAlert('تم إنشاء الطلب بنجاح', 'success');
        }
      } else {
        // Update existing order
        await updateOrder.run({
          orderId: this.currentOrderId,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          orderStatus: formData.orderStatus,
          deliveryAddress: formData.deliveryAddress || '',
          notes: formData.notes || '',
          totalAmount: orderTotal,
          itemCount: orderItems.length
        });
        
        orderId = this.currentOrderId;
        
        // Delete existing order items
        await deleteOrderItems.run({
          orderId: orderId
        });
        
        // Create new order items
        for (const item of orderItems) {
          await createOrderItem.run({
            orderId: orderId,
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.total_price
          });
        }
        
        showAlert('تم تحديث الطلب بنجاح', 'success');
      }
      
      // Reload orders list
      await reloadOrdersTable.run();
      
      // Switch back to orders list tab
      navigateToTab.run({
        tabId: 'tab1'
      });
      
      return true;
    } catch (error) {
      console.error('Error saving order:', error);
      showAlert('Error saving order: ' + error.message, 'error');
      return false;
    }
  },
  
  // Method to change order status
  async changeOrderStatus(orderId, newStatus) {
    try {
      await updateOrderStatus.run({
        orderId: orderId,
        status: newStatus
      });
      
      showAlert(`تم تغيير حالة الطلب إلى ${this.translateStatus(newStatus)}`, 'success');
      
      // Reload orders list
      await reloadOrdersTable.run();
      
      return true;
    } catch (error) {
      console.error('Error changing order status:', error);
      showAlert('Error changing order status: ' + error.message, 'error');
      return false;
    }
  },
  
  // Method to delete an order
  async deleteOrder(orderId) {
    // Show confirmation dialog
    const confirmed = await showDeleteConfirmation.run();
    
    if (!confirmed) {
      return false;
    }
    
    try {
      // Delete order items first
      await deleteOrderItems.run({
        orderId: orderId
      });
      
      // Delete the order
      await deleteOrder.run({
        orderId: orderId
      });
      
      showAlert('تم حذف الطلب بنجاح', 'success');
      
      // Reload orders list
      await reloadOrdersTable.run();
      
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      showAlert('Error deleting order: ' + error.message, 'error');
      return false;
    }
  },
  
  // Method to generate daily sales report
  async generateDailySalesReport(date) {
    try {
      // Format date to YYYY-MM-DD if provided, otherwise use today
      const reportDate = date ? new Date(date).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
      
      // Request report from n8n
      const reportResponse = await n8nIntegration.methods.requestDailySalesReport(reportDate);
      
      if (reportResponse.success && reportResponse.data) {
        // Display report in UI
        showSalesReport.run({
          reportData: reportResponse.data
        });
        
        return reportResponse.data;
      } else {
        showAlert('Failed to generate sales report', 'error');
        return null;
      }
    } catch (error) {
      console.error('Error generating sales report:', error);
      showAlert('Error generating report: ' + error.message, 'error');
      return null;
    }
  }
};
