interface NovaPoshtaConfig {
  apiKey: string;
  apiUrl: string;
}

interface ShipmentData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  address: string;
  deliveryType: 'home' | 'pickup'; // home delivery or pickup point
  pickupPointRef?: string; // Reference to pickup point if deliveryType is 'pickup'
  weight: number; // in kg
  cod?: number; // Cash on delivery amount
}

interface ShipmentResponse {
  tracking_number: string;
  status: string;
  reference: string;
}

class NovaPoshtaClient {
  private config: NovaPoshtaConfig;

  constructor() {
    this.config = {
      apiKey: process.env.NOVAPOSTA_API_KEY || '',
      apiUrl: process.env.NOVAPOSTA_API_URL || 'https://api.novaposhta.ua/v2.0/json',
    };

    if (!this.config.apiKey) {
      console.warn('Nova Poshta API key not configured');
    }
  }

  private async makeRequest(method: string, data: any): Promise<any> {
    try {
      const payload = {
        apiKey: this.config.apiKey,
        modelName: method.split('.')[0],
        calledMethod: method.split('.')[1],
        methodProperties: data,
        language: 'ru',
      };

      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Nova Poshta API error: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(`Nova Poshta error: ${result.errors?.join(', ') || 'Unknown error'}`);
      }

      return result.data;
    } catch (error) {
      console.error('Error calling Nova Poshta API:', error);
      throw error;
    }
  }

  async createShipment(data: ShipmentData): Promise<ShipmentResponse> {
    try {
      const shipmentData = {
        SenderAddress: 'default-warehouse-ref', // Sender address reference (should be configured)
        RecipientCityName: data.city,
        RecipientArea: '',
        RecipientAreaRegions: '',
        RecipientAddressName: data.address,
        RecipientName: data.customerName,
        RecipientPhone: data.customerPhone,
        RecipientEmail: data.customerEmail,
        ServiceType: data.deliveryType === 'home' ? '4' : '5', // 4 = Home delivery, 5 = Parcel locker
        CargoType: '2', // 2 = Parcel
        CargoWeight: data.weight,
        CargoDescription: `Order #${data.orderId}`,
        Comment: `Order ${data.orderId}`,
        Cost: data.cod || 0, // Cash on delivery
        SeatsAmount: '1',
        PayerType: data.cod ? 'Recipient' : 'Sender',
        PaymentMethod: 'Cash',
        DeliveryTimeframe: '1', // Next day delivery
      };

      // If pickup point delivery
      if (data.deliveryType === 'pickup' && data.pickupPointRef) {
        shipmentData.RecipientAddressName = data.pickupPointRef;
      }

      const result = await this.makeRequest('InternetDocument.save', shipmentData);

      return {
        tracking_number: result[0]?.Number || '',
        status: 'created',
        reference: result[0]?.Ref || '',
      };
    } catch (error) {
      console.error('Error creating Nova Poshta shipment:', error);
      throw error;
    }
  }

  async trackShipment(trackingNumber: string): Promise<any> {
    try {
      const result = await this.makeRequest('TrackingDocument.getStatusDocuments', {
        Documents: [
          {
            DocumentNumber: trackingNumber,
            Phone: '',
          },
        ],
      });

      return result?.[0] || null;
    } catch (error) {
      console.error('Error tracking Nova Poshta shipment:', error);
      throw error;
    }
  }

  async getPickupPoints(cityName: string): Promise<any[]> {
    try {
      const result = await this.makeRequest('AddressGeneral.getWarehouses', {
        CityName: cityName,
        Page: 1,
        Limit: 50,
      });

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error getting Nova Poshta pickup points:', error);
      throw error;
    }
  }

  async getCities(search?: string): Promise<any[]> {
    try {
      const result = await this.makeRequest('Address.getCities', {
        FindByString: search || '',
        Limit: 50,
      });

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error getting Nova Poshta cities:', error);
      throw error;
    }
  }
}

export const novaPoshtaClient = new NovaPoshtaClient();
