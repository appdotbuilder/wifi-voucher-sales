
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { UpdatePaymentGatewayInput } from '../../server/src/schema';
import type { PaymentGateway } from '../../server/src/db/schema';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [updateResult, setUpdateResult] = useState<PaymentGateway | null>(null);

  // Form state with proper typing
  const [formData, setFormData] = useState<UpdatePaymentGatewayInput>({
    id: 1, // Default to ID 1 for demo purposes
    is_enabled: undefined,
    config_data: undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Only send fields that have been modified (not undefined)
      const updateData: UpdatePaymentGatewayInput = {
        id: formData.id
      };
      
      if (formData.is_enabled !== undefined) {
        updateData.is_enabled = formData.is_enabled;
      }
      
      if (formData.config_data !== undefined && formData.config_data !== '') {
        updateData.config_data = formData.config_data;
      }

      const response = await trpc.updatePaymentGateway.mutate(updateData);
      setUpdateResult(response);
    } catch (error) {
      console.error('Failed to update payment gateway:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: 1,
      is_enabled: undefined,
      config_data: undefined
    });
    setUpdateResult(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">💳 Payment Gateway Settings</h1>
          <p className="text-gray-600 mt-2">Configure your payment gateway preferences</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-xl text-gray-800">Update Payment Gateway</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gateway-id" className="text-sm font-medium text-gray-700">
                  Gateway ID
                </Label>
                <Input
                  id="gateway-id"
                  type="number"
                  placeholder="Enter gateway ID"
                  value={formData.id}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: UpdatePaymentGatewayInput) => ({ 
                      ...prev, 
                      id: parseInt(e.target.value) || 1 
                    }))
                  }
                  min="1"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Gateway Status
                </Label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Switch
                    id="gateway-enabled"
                    checked={formData.is_enabled ?? false}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev: UpdatePaymentGatewayInput) => ({ 
                        ...prev, 
                        is_enabled: checked 
                      }))
                    }
                  />
                  <Label htmlFor="gateway-enabled" className="text-sm">
                    {formData.is_enabled ? '✅ Gateway Enabled' : '❌ Gateway Disabled'}
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="config-data" className="text-sm font-medium text-gray-700">
                  Configuration Data
                </Label>
                <Textarea
                  id="config-data"
                  placeholder="Enter gateway configuration (JSON, API keys, etc.)"
                  value={formData.config_data || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev: UpdatePaymentGatewayInput) => ({ 
                      ...prev, 
                      config_data: e.target.value || undefined 
                    }))
                  }
                  rows={4}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Optional: Leave empty to keep current configuration unchanged
                </p>
              </div>

              <div className="flex space-x-3">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? '⏳ Updating...' : '💾 Update Gateway'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  🔄 Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {updateResult && (
          <Card className="shadow-lg border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-800 flex items-center">
                ✅ Payment Gateway Updated Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Gateway ID:</span>
                  <span className="ml-2 text-gray-900">{updateResult.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{updateResult.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    updateResult.is_enabled 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {updateResult.is_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Updated:</span>
                  <span className="ml-2 text-gray-900">
                    {updateResult.updated_at.toLocaleString()}
                  </span>
                </div>
              </div>
              
              {updateResult.config_data && (
                <div className="mt-4">
                  <span className="font-medium text-gray-700">Configuration:</span>
                  <pre className="mt-1 p-3 bg-white border rounded text-xs overflow-x-auto">
                    {updateResult.config_data}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-center text-xs text-gray-500">
          💡 Note: This demo uses a placeholder implementation. In production, the gateway data would be fetched from and saved to a real database.
        </div>
      </div>
    </div>
  );
}

export default App;
