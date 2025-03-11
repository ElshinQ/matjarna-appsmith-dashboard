export default {
  // Configuration for n8n integration
  config: {
    // The base URL of the n8n server
    baseUrl: "https://hq.elshin.cloud",
    
    // Webhook endpoints to trigger n8n workflows
    webhooks: {
      lowStockAlert: "/webhook/low-stock-alert",
      newOrderNotification: "/webhook/new-order",
      inventoryUpdate: "/webhook/inventory-update",
      dailySalesReport: "/webhook/daily-sales-report"
    },
    
    // Headers for API authentication
    headers: {
      "Content-Type": "application/json"
    }
  },
  
  // Methods for n8n automation integration
  methods: {
    /**
     * Send a low stock alert to n8n
     * @param {Object} product - The product that is low in stock
     * @returns {Promise<Object>} - Response from n8n
     */
    async sendLowStockAlert(product) {
      try {
        // Get the webhook URL
        const webhookUrl = `${this.config.baseUrl}${this.config.webhooks.lowStockAlert}`;
        
        // Prepare the payload
        const payload = {
          productId: product.id,
          productName: product['اسم_المنتج'],
          productCode: product['رمز_المنتج'],
          currentStock: parseInt(product['الكمية'] || '0'),
          lowStockThreshold: parseInt(product['المخزون_المنخفض'] || '0'),
          category: product['التصنيف'],
          timestamp: new Date().toISOString()
        };
        
        // Send the request to n8n
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: this.config.headers,
          body: JSON.stringify(payload)
        });
        
        // Parse and return the response
        const responseData = await response.json();
        return {
          success: true,
          data: responseData
        };
      } catch (error) {
        console.error('Error sending low stock alert to n8n:', error);
        return {
          success: false,
          error: error.message
        };
      }
    },
    
    /**
     * Send a notification about a new order to n8n
     * @param {Object} order - The new order details
     * @returns {Promise<Object>} - Response from n8n
     */
    async sendNewOrderNotification(order) {
      try {
        // Get the webhook URL
        const webhookUrl = `${this.config.baseUrl}${this.config.webhooks.newOrderNotification}`;
        
        // Prepare the payload
        const payload = {
          orderId: order.id,
          customerName: order.customerName,
          orderTotal: order.total,
          orderItems: order.items,
          orderDate: order.date,
          orderStatus: order.status,
          timestamp: new Date().toISOString()
        };
        
        // Send the request to n8n
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: this.config.headers,
          body: JSON.stringify(payload)
        });
        
        // Parse and return the response
        const responseData = await response.json();
        return {
          success: true,
          data: responseData
        };
      } catch (error) {
        console.error('Error sending new order notification to n8n:', error);
        return {
          success: false,
          error: error.message
        };
      }
    },
    
    /**
     * Update inventory information in n8n
     * @param {Object} product - The product with updated inventory
     * @returns {Promise<Object>} - Response from n8n
     */
    async updateInventory(product) {
      try {
        // Get the webhook URL
        const webhookUrl = `${this.config.baseUrl}${this.config.webhooks.inventoryUpdate}`;
        
        // Prepare the payload
        const payload = {
          productId: product.id,
          productName: product['اسم_المنتج'],
          productCode: product['رمز_المنتج'],
          previousStock: product.previousStock,
          newStock: parseInt(product['الكمية'] || '0'),
          lowStockThreshold: parseInt(product['المخزون_المنخفض'] || '0'),
          updateType: product.previousStock > parseInt(product['الكمية'] || '0') ? 'decrease' : 'increase',
          timestamp: new Date().toISOString()
        };
        
        // Send the request to n8n
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: this.config.headers,
          body: JSON.stringify(payload)
        });
        
        // Parse and return the response
        const responseData = await response.json();
        return {
          success: true,
          data: responseData
        };
      } catch (error) {
        console.error('Error updating inventory in n8n:', error);
        return {
          success: false,
          error: error.message
        };
      }
    },
    
    /**
     * Request a daily sales report from n8n
     * @param {string} date - The date for which to generate the report (YYYY-MM-DD)
     * @returns {Promise<Object>} - Response from n8n with report data
     */
    async requestDailySalesReport(date) {
      try {
        // Get the webhook URL
        const webhookUrl = `${this.config.baseUrl}${this.config.webhooks.dailySalesReport}`;
        
        // Prepare the payload
        const payload = {
          date: date || new Date().toISOString().split('T')[0], // Default to today
          format: 'json',
          requestedBy: appsmith.user.email || 'system',
          timestamp: new Date().toISOString()
        };
        
        // Send the request to n8n
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: this.config.headers,
          body: JSON.stringify(payload)
        });
        
        // Parse and return the response
        const responseData = await response.json();
        return {
          success: true,
          data: responseData
        };
      } catch (error) {
        console.error('Error requesting daily sales report from n8n:', error);
        return {
          success: false,
          error: error.message
        };
      }
    },
    
    /**
     * Check if n8n is available and connected
     * @returns {Promise<boolean>} - Whether n8n is available
     */
    async checkConnection() {
      try {
        // Attempt to connect to n8n base URL
        const response = await fetch(this.config.baseUrl, {
          method: 'GET',
          headers: this.config.headers
        });
        
        return response.ok;
      } catch (error) {
        console.error('Error connecting to n8n:', error);
        return false;
      }
    }
  }
};
