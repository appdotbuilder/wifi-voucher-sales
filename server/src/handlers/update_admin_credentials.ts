
import { db } from '../db';
import { sql } from 'drizzle-orm';

// Define the input type locally since it's not in schema.ts
interface UpdateAdminCredentialsInput {
  current_username?: string;
  current_password?: string;
  new_username: string;
  new_password: string;
}

// Since no admin credentials table is defined in schema, we'll create one dynamically
// In a real implementation, this should be in the schema file
const createAdminCredentialsTable = async () => {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS admin_credentials (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);
};

const hashPassword = async (password: string): Promise<string> => {
  // Simple hash implementation using Bun's built-in crypto
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
};

export async function updateAdminCredentials(input: UpdateAdminCredentialsInput): Promise<{ success: boolean; message: string }> {
  try {
    // Ensure admin credentials table exists
    await createAdminCredentialsTable();

    // Get current admin credentials
    const currentAdminResult = await db.execute(sql`
      SELECT username, password_hash FROM admin_credentials LIMIT 1
    `);

    const currentAdmin = currentAdminResult.rows as Array<{ username: string; password_hash: string }>;

    // If no admin exists, create initial admin
    if (currentAdmin.length === 0) {
      const hashedPassword = await hashPassword(input.new_password);
      
      await db.execute(sql`
        INSERT INTO admin_credentials (username, password_hash)
        VALUES (${input.new_username}, ${hashedPassword})
      `);

      return {
        success: true,
        message: 'Initial admin credentials created successfully'
      };
    }

    // Verify current credentials if provided
    if (input.current_username && input.current_password) {
      const admin = currentAdmin[0];
      const isValidUsername = admin.username === input.current_username;
      const isValidPassword = await verifyPassword(input.current_password, admin.password_hash);

      if (!isValidUsername || !isValidPassword) {
        return {
          success: false,
          message: 'Current credentials are invalid'
        };
      }
    }

    // Update credentials
    const hashedNewPassword = await hashPassword(input.new_password);
    
    await db.execute(sql`
      UPDATE admin_credentials 
      SET username = ${input.new_username}, 
          password_hash = ${hashedNewPassword},
          updated_at = NOW()
      WHERE id = (SELECT id FROM admin_credentials LIMIT 1)
    `);

    return {
      success: true,
      message: 'Admin credentials updated successfully'
    };

  } catch (error) {
    console.error('Admin credentials update failed:', error);
    throw error;
  }
}
