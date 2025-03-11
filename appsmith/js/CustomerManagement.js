export default {
  // Variables to track customer form state
  formMode: 'add', // 'add' or 'edit'
  currentCustomerId: null,
  
  // Customer schema validation rules
  validationRules: {
    name: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    phone: {
      required: true,
      minLength: 10,
      maxLength: 15
    },
    email: {
      format: 'email'
    }
  },
  
  // Method to load customers from the database
  async loadCustomers() {
    try {
      // Reset search filter if any
      resetFilters.run();
      
      // Get all customers from the database
      const result = await getAllCustomers.run();
      
      // Format the results for the table
      return this.formatCustomersForTable(result);
    } catch (error) {
      console.error('Error loading customers:', error);
      showAlert('Error loading customers: ' + error.message, 'error');
      return [];
    }
  },
  
  // Helper method to format customers for table display
  formatCustomersForTable(customers) {
    if (!customers || !Array.isArray(customers)) {
      return [];
    }
    
    return customers.map(customer => ({
      id: customer.id,
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      registrationDate: this.formatDate(customer.created_at),
      totalOrders: customer.total_orders || 0,
      totalSpent: this.formatCurrency(customer.total_spent),
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
        day: 'numeric'
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
  
  // Method to filter customers based on search criteria
  async searchCustomers(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return this.loadCustomers();
      }
      
      const result = await searchCustomers.run({
        searchTerm: `%${searchTerm}%`
      });
      
      return this.formatCustomersForTable(result);
    } catch (error) {
      console.error('Error searching customers:', error);
      showAlert('Error searching customers: ' + error.message, 'error');
      return [];
    }
  },
  
  // Method to prepare form for adding a new customer
  addCustomer() {
    this.formMode = 'add';
    this.currentCustomerId = null;
    
    // Reset form fields
    resetCustomerForm.run();
    
    // Switch to the customer form tab
    navigateToTab.run({
      tabId: 'tab2'
    });
  },
  
  // Method to prepare form for editing an existing customer
  async editCustomer(customerId) {
    try {
      this.formMode = 'edit';
      this.currentCustomerId = customerId;
      
      // Get customer data
      const result = await getCustomerById.run({
        customerId: customerId
      });
      
      if (result && result.length > 0) {
        const customer = result[0];
        
        // Populate form fields
        populateCustomerForm.run({
          name: customer.name || "",
          phone: customer.phone || "",
          email: customer.email || "",
          address: customer.address || "",
          notes: customer.notes || ""
        });
        
        // Get customer orders
        await this.loadCustomerOrders(customerId);
        
        // Switch to the customer form tab
        navigateToTab.run({
          tabId: 'tab2'
        });
      } else {
        showAlert('Customer not found', 'error');
      }
    } catch (error) {
      console.error('Error loading customer for edit:', error);
      showAlert('Error loading customer: ' + error.message, 'error');
    }
  },
  
  // Method to load customer orders
  async loadCustomerOrders(customerId) {
    try {
      const orders = await getCustomerOrders.run({
        customerId: customerId
      });
      
      // Format orders for display
      const formattedOrders = orders.map(order => ({
        id: order.id,
        orderNumber: order.order_number || `#${order.id}`,
        orderDate: this.formatDate(order.created_at),
        orderStatus: this.translateStatus(order.order_status),
        totalAmount: this.formatCurrency(order.total_amount),
        itemCount: order.item_count || 0
      }));
      
      // Store orders in app store for display
      storeValue('customerOrders', formattedOrders);
      
      return formattedOrders;
    } catch (error) {
      console.error('Error loading customer orders:', error);
      showAlert('Error loading customer orders: ' + error.message, 'error');
      return [];
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
  
  // Method to validate form inputs
  validateCustomerForm(formData) {
    const errors = {};
    
    // Validate name
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'اسم العميل مطلوب';
    } else if (formData.name.length < 3) {
      errors.name = 'اسم العميل يجب أن يكون على الأقل 3 أحرف';
    }
    
    // Validate phone
    if (!formData.phone || formData.phone.trim() === '') {
      errors.phone = 'رقم الهاتف مطلوب';
    } else if (formData.phone.length < 10) {
      errors.phone = 'رقم الهاتف يجب أن يكون على الأقل 10 أرقام';
    }
    
    // Validate email (if provided)
    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'البريد الإلكتروني غير صالح';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  },
  
  // Method to save customer (create or update)
  async saveCustomer(formData) {
    // Validate form data
    const validation = this.validateCustomerForm(formData);
    
    if (!validation.isValid) {
      showValidationErrors.run({
        errors: validation.errors
      });
      return false;
    }
    
    try {
      if (this.formMode === 'add') {
        // Create new customer
        await createCustomer.run({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || '',
          address: formData.address || '',
          notes: formData.notes || ''
        });
        
        showAlert('تم إضافة العميل بنجاح', 'success');
      } else {
        // Update existing customer
        await updateCustomer.run({
          customerId: this.currentCustomerId,
          name: formData.name,
          phone: formData.phone,
          email: formData.email || '',
          address: formData.address || '',
          notes: formData.notes || ''
        });
        
        showAlert('تم تحديث بيانات العميل بنجاح', 'success');
      }
      
      // Reload customers list
      await reloadCustomersTable.run();
      
      // Switch back to customers list tab
      navigateToTab.run({
        tabId: 'tab1'
      });
      
      return true;
    } catch (error) {
      console.error('Error saving customer:', error);
      showAlert('Error saving customer: ' + error.message, 'error');
      return false;
    }
  },
  
  // Method to delete a customer
  async deleteCustomer(customerId) {
    // Show confirmation dialog
    const confirmed = await showDeleteConfirmation.run();
    
    if (!confirmed) {
      return false;
    }
    
    try {
      await deleteCustomer.run({
        customerId: customerId
      });
      
      showAlert('تم حذف العميل بنجاح', 'success');
      
      // Reload customers list
      await reloadCustomersTable.run();
      
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      showAlert('Error deleting customer: ' + error.message, 'error');
      return false;
    }
  },
  
  // Method to generate customer spending report
  async generateCustomerReport(customerId) {
    try {
      // Get customer details
      const customerResult = await getCustomerById.run({
        customerId: customerId
      });
      
      if (!customerResult || customerResult.length === 0) {
        showAlert('Customer not found', 'error');
        return null;
      }
      
      const customer = customerResult[0];
      
      // Get customer orders
      const orders = await getCustomerOrders.run({
        customerId: customerId
      });
      
      // Calculate report data
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
      const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      
      // Get order items for product preferences
      const orderItems = await getCustomerOrderItems.run({
        customerId: customerId
      });
      
      // Determine most purchased products
      const productCounts = {};
      orderItems.forEach(item => {
        const productId = item.product_id;
        productCounts[productId] = (productCounts[productId] || 0) + 1;
      });
      
      // Sort products by purchase count
      const sortedProducts = Object.entries(productCounts)
        .map(([productId, count]) => {
          const product = orderItems.find(item => item.product_id === parseInt(productId));
          return {
            productId: parseInt(productId),
            productName: product ? product.product_name : `Product ${productId}`,
            count: count
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 products
      
      // Generate report object
      const report = {
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          registrationDate: this.formatDate(customer.created_at)
        },
        statistics: {
          totalOrders: totalOrders,
          totalSpent: this.formatCurrency(totalSpent),
          avgOrderValue: this.formatCurrency(avgOrderValue),
          firstOrderDate: orders.length > 0 ? this.formatDate(orders[orders.length - 1].created_at) : 'N/A',
          lastOrderDate: orders.length > 0 ? this.formatDate(orders[0].created_at) : 'N/A'
        },
        topProducts: sortedProducts
      };
      
      // Display report in UI
      showCustomerReport.run({
        reportData: report
      });
      
      return report;
    } catch (error) {
      console.error('Error generating customer report:', error);
      showAlert('Error generating report: ' + error.message, 'error');
      return null;
    }
  }
};
