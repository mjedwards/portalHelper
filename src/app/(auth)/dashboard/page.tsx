/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import GhlService from "@/utils/api/ghlService";
import { getDefaultLocation } from "@/utils/api/authUtils.server";
import LocationSelector from "./components/LocationSelector";

// Define interfaces for the API response types
interface GHLBusiness {
	name: string;
	type: string;
	id: string;
	locationId?: string;
	phone?: string;
	email?: string;
	website?: string;
	address?: {
		line1?: string;
		city?: string;
		state?: string;
		postal_code?: string;
		country?: string;
	};
	[key: string]: any;
}

interface GHLContact {
	id: string;
	name: string;
	email?: string;
	phone?: string;
	[key: string]: any;
}

interface GHLContactsResponse {
	contacts: GHLContact[];
	total?: number;
	page?: number;
	limit?: number;
	[key: string]: any;
}

export default async function DashboardPage() {
	try {
		// Get default location ID
		const locationId = await getDefaultLocation();

		if (!locationId) {
			return (
				<div className='bg-white p-6 rounded-lg shadow'>
					<h1 className='text-2xl font-bold mb-4'>Dashboard</h1>
					<p className='text-red-500'>
						No default location found. Please select a location.
					</p>
					<LocationSelector />
				</div>
			);
		}

		// Fetch account info and contacts using GhlService
		const accountInfo = await GhlService.getBusinessDetails(locationId);
		const contactsResponse = await GhlService.getContacts(locationId);
		const contacts = contactsResponse?.contacts || [];

		return (
			<div className='bg-white p-6 rounded-lg shadow'>
				<div className='flex justify-between items-center mb-6'>
					<h1 className='text-2xl font-bold'>Dashboard</h1>
					<LocationSelector currentLocationId={locationId} />
				</div>

				<div className='mb-6'>
					<h2 className='text-xl font-semibold mb-2'>Account Information</h2>
					<div className='bg-gray-50 p-4 rounded'>
						<p>
							<strong>Name:</strong> {accountInfo.name}
						</p>
						<p>
							<strong>Type:</strong> {accountInfo.type}
						</p>
						{accountInfo.email && (
							<p>
								<strong>Email:</strong> {accountInfo.email}
							</p>
						)}
						{accountInfo.phone && (
							<p>
								<strong>Phone:</strong> {accountInfo.phone}
							</p>
						)}
					</div>
				</div>

				<div>
					<h2 className='text-xl font-semibold mb-2'>
						Recent Contacts ({contacts.length})
					</h2>
					{contacts.length > 0 ? (
						<ul className='divide-y divide-gray-200'>
							{contacts.map((contact) => (
								<li key={contact.id} className='py-3'>
									<p className='font-medium'>{contact.name}</p>
									{contact.email && (
										<p className='text-gray-600 text-sm'>{contact.email}</p>
									)}
								</li>
							))}
						</ul>
					) : (
						<p className='text-gray-600'>No contacts found.</p>
					)}
				</div>
			</div>
		);
	} catch (error: any) {
		console.error("Error loading dashboard data:", error);

		return (
			<div className='bg-white p-6 rounded-lg shadow'>
				<h1 className='text-2xl font-bold mb-4'>Dashboard</h1>
				<div className='bg-red-50 text-red-700 p-4 rounded'>
					<p>Error loading data: {error.message}</p>
					<p className='text-sm mt-2'>
						Please refresh the page or try logging in again.
					</p>
				</div>
			</div>
		);
	}
}
