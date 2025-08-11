/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserProfile {
	id: string;
	first_name?: string;
	last_name?: string;
	phone?: string;
	timezone?: string;
	dashboard_preferences?: Record<string, any>;
	notification_settings?: {
		email_notifications: boolean;
		push_notifications: boolean;
		performance_alerts: boolean;
	};
	created_at: string;
	updated_at: string;
}

export interface UserGHLConnection {
	id: string;
	user_id: string;

	access_token: string;
	refresh_token: string;
	token_type: string;
	expires_at: string;
	scope?: string;

	ghl_user_id?: string;
	ghl_company_id?: string;
	ghl_user_type?: string;

	ghl_email?: string;
	ghl_name?: string;
	ghl_phone?: string;
	ghl_profile_data?: Record<string, any>;

	is_active: boolean;
	last_sync_at?: string;
	connection_error?: string;

	created_at: string;
	updated_at: string;
}

export interface UserGHLLocation {
	id: string;
	user_id: string;
	ghl_connection_id: string;

	ghl_location_id: string;
	name: string;
	address?: Record<string, any>;
	timezone?: string;
	phone?: string;
	email?: string;
	website?: string;

	is_default: boolean;
	is_active: string;
	location_settings?: Record<string, any>;
	raw_location_data?: Record<string, any>;

	created_at: string;
	updated_at: string;
}
