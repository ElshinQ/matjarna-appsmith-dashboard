export default {
  // Configuration for ChatGPT integration
  config: {
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    model: "gpt-3.5-turbo",  // Can be updated to use newer models
    maxTokens: 150,
    temperature: 0.7,
    systemPrompt: "أنت مساعد متجر متخصص في بيع منتجات متنوعة. تساعد العملاء في الإجابة على أسئلتهم حول المنتجات والمخزون وسياسات المتجر. أجب باللغة العربية وبطريقة مختصرة ومفيدة للعميل."
  },

  // Methods for the chatbot functionality
  methods: {
    // Method to send a message to ChatGPT and get a response
    async sendMessage(message, productData = null) {
      // Get the API key from Appsmith's store
      const apiKey = appsmith.store.OPENAI_API_KEY;
      
      if (!apiKey) {
        return {
          error: true,
          message: "لم يتم تكوين مفتاح API لـ ChatGPT. يرجى التواصل مع مسؤول النظام."
        };
      }

      // Build the messages array
      const messages = [
        { role: "system", content: this.config.systemPrompt },
        { role: "user", content: message }
      ];

      // If product data is available, provide it to the AI
      if (productData) {
        messages.splice(1, 0, {
          role: "system",
          content: `معلومات المنتجات الحالية: ${JSON.stringify(productData)}`
        });
      }

      try {
        // Call the OpenAI API
        const response = await fetch(this.config.apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: messages,
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature
          })
        });

        const responseData = await response.json();

        if (responseData.choices && responseData.choices.length > 0) {
          return {
            success: true,
            message: responseData.choices[0].message.content
          };
        } else {
          return {
            error: true,
            message: "لم نتمكن من الحصول على رد من الذكاء الاصطناعي. يرجى المحاولة مرة أخرى."
          };
        }
      } catch (error) {
        console.error("ChatGPT API Error:", error);
        return {
          error: true,
          message: "حدث خطأ أثناء التواصل مع الذكاء الاصطناعي. يرجى المحاولة مرة أخرى لاحقًا."
        };
      }
    },

    // Method to check product availability
    async checkProductAvailability(productName) {
      try {
        // This assumes we have a query called 'getProductByName' already set up in Appsmith
        const result = await getProductByName.run({ productName: productName });
        
        if (result && result.length > 0) {
          const product = result[0];
          const quantity = parseInt(product['الكمية'] || '0');
          
          if (quantity > 0) {
            return {
              available: true,
              product: product,
              message: `نعم، المنتج "${product['اسم_المنتج']}" متوفر ولدينا ${quantity} قطعة في المخزون. سعر البيع هو ${product['سعر_البيع']} ريال.`
            };
          } else {
            return {
              available: false,
              product: product,
              message: `عذرًا، المنتج "${product['اسم_المنتج']}" غير متوفر حاليًا في المخزون.`
            };
          }
        } else {
          return {
            available: false,
            message: `لم نجد منتجًا بهذا الاسم "${productName}" في قاعدة البيانات.`
          };
        }
      } catch (error) {
        console.error("Error checking product availability:", error);
        return {
          error: true,
          message: "حدث خطأ أثناء التحقق من توفر المنتج. يرجى المحاولة مرة أخرى."
        };
      }
    },

    // Method to handle common FAQs
    handleFAQ(question) {
      // Map of common questions and their answers
      const faqs = {
        'ساعات العمل': 'ساعات العمل من الأحد إلى الخميس: 9 صباحًا - 9 مساءً، الجمعة والسبت: 2 ظهرًا - 10 مساءً.',
        'سياسة الإرجاع': 'يمكن إرجاع المنتجات خلال 14 يومًا من تاريخ الشراء شرط أن تكون بحالتها الأصلية مع الفاتورة.',
        'طرق الدفع': 'نقبل الدفع نقدًا، وبالبطاقات الائتمانية (فيزا/ماستركارد)، وعبر التحويل المصرفي، وبتطبيقات الدفع الإلكتروني.',
        'التوصيل': 'نوفر خدمة التوصيل لجميع مناطق المدينة خلال 24-48 ساعة. رسوم التوصيل 10 ريال للطلبات أقل من 100 ريال، ومجاني للطلبات الأعلى.',
        'الضمان': 'جميع المنتجات الإلكترونية تأتي مع ضمان لمدة سنة من تاريخ الشراء ضد عيوب التصنيع.'
      };

      // Check if the question matches any of our FAQs
      for (const [key, value] of Object.entries(faqs)) {
        if (question.includes(key)) {
          return {
            faqMatch: true,
            answer: value
          };
        }
      }

      // No match found
      return {
        faqMatch: false
      };
    }
  }
};
