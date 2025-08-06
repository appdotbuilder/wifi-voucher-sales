
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { updateAdminCredentials } from '../handlers/update_admin_credentials';

// Define the input type locally since it's not in schema.ts
interface UpdateAdminCredentialsInput {
  current_username?: string;
  current_password?: string;
  new_username: string;
  new_password: string;
}

// Test input for creating initial admin
const initialAdminInput: UpdateAdminCredentialsInput = {
  new_username: 'admin',
  new_password: 'securepassword123'
};

// Test input for updating existing admin
const updateAdminInput: UpdateAdminCredentialsInput = {
  current_username: 'admin',
  current_password: 'securepassword123',
  new_username: 'newadmin',
  new_password: 'newsecurepassword456'
};

describe('updateAdminCredentials', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create initial admin credentials when none exist', async () => {
    const result = await updateAdminCredentials(initialAdminInput);

    expect(result.success).toBe(true);
    expect(result.message).toEqual('Initial admin credentials created successfully');

    // Verify admin was created in database
    const adminsResult = await db.execute(sql`
      SELECT username FROM admin_credentials
    `);
    
    const admins = adminsResult.rows as Array<{ username: string }>;

    expect(admins).toHaveLength(1);
    expect(admins[0].username).toEqual('admin');
  });

  it('should update existing admin credentials with valid current credentials', async () => {
    // Create initial admin
    await updateAdminCredentials(initialAdminInput);

    // Update credentials
    const result = await updateAdminCredentials(updateAdminInput);

    expect(result.success).toBe(true);
    expect(result.message).toEqual('Admin credentials updated successfully');

    // Verify credentials were updated
    const adminsResult = await db.execute(sql`
      SELECT username FROM admin_credentials
    `);
    
    const admins = adminsResult.rows as Array<{ username: string }>;

    expect(admins).toHaveLength(1);
    expect(admins[0].username).toEqual('newadmin');
  });

  it('should reject update with invalid current credentials', async () => {
    // Create initial admin
    await updateAdminCredentials(initialAdminInput);

    // Try to update with wrong current credentials
    const invalidInput: UpdateAdminCredentialsInput = {
      current_username: 'admin',
      current_password: 'wrongpassword',
      new_username: 'newadmin',
      new_password: 'newsecurepassword456'
    };

    const result = await updateAdminCredentials(invalidInput);

    expect(result.success).toBe(false);
    expect(result.message).toEqual('Current credentials are invalid');

    // Verify credentials were not updated
    const adminsResult = await db.execute(sql`
      SELECT username FROM admin_credentials
    `);
    
    const admins = adminsResult.rows as Array<{ username: string }>;

    expect(admins[0].username).toEqual('admin'); // Should still be original username
  });

  it('should reject update with invalid current username', async () => {
    // Create initial admin
    await updateAdminCredentials(initialAdminInput);

    // Try to update with wrong current username
    const invalidInput: UpdateAdminCredentialsInput = {
      current_username: 'wronguser',
      current_password: 'securepassword123',
      new_username: 'newadmin',
      new_password: 'newsecurepassword456'
    };

    const result = await updateAdminCredentials(invalidInput);

    expect(result.success).toBe(false);
    expect(result.message).toEqual('Current credentials are invalid');
  });

  it('should hash passwords properly', async () => {
    await updateAdminCredentials(initialAdminInput);

    // Verify password is hashed (not stored as plain text)
    const adminsResult = await db.execute(sql`
      SELECT password_hash FROM admin_credentials
    `);
    
    const admins = adminsResult.rows as Array<{ password_hash: string }>;

    expect(admins[0].password_hash).not.toEqual('securepassword123');
    expect(admins[0].password_hash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
  });

  it('should update timestamps correctly', async () => {
    // Create initial admin
    await updateAdminCredentials(initialAdminInput);

    const beforeUpdateResult = await db.execute(sql`
      SELECT created_at, updated_at FROM admin_credentials
    `);
    
    const beforeUpdate = beforeUpdateResult.rows as Array<{ created_at: string; updated_at: string }>;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update credentials
    await updateAdminCredentials(updateAdminInput);

    const afterUpdateResult = await db.execute(sql`
      SELECT created_at, updated_at FROM admin_credentials
    `);
    
    const afterUpdate = afterUpdateResult.rows as Array<{ created_at: string; updated_at: string }>;

    expect(afterUpdate[0].created_at).toEqual(beforeUpdate[0].created_at); // created_at should not change
    expect(new Date(afterUpdate[0].updated_at).getTime()).toBeGreaterThan(
      new Date(beforeUpdate[0].updated_at).getTime()
    ); // updated_at should be newer
  });
});
