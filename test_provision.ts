(global as any).localStorage = { getItem: () => null, setItem: () => {} };
import { provisionNewWebsite } from './src/lib/adminService';

async function run() {
  try {
    console.log("Starting test provision...");
    const res = await provisionNewWebsite({
      name: 'Test Website',
      businessCategory: 'Test',
      ownerName: 'Test Owner',
      ownerGoogleEmail: 'test@example.com',
      phone: '1234567890',
      country: 'Test',
      state: 'Test',
      city: 'Test',
      pincode: '123456',
      defaultTheme: 'theme1',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      enabledModules: { store: true },
      slug: 'test-website-123'
    });
    console.log("Success!", res);
  } catch (err: any) {
    console.error("Test failed:", err.message);
  }
}

run();
