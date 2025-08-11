// src/app/test/page.tsx

import { SupabaseConnectionTest } from "@/components/test/SupabaseConnectionTest";


export default function TestPage() {
	return (
		<div className='min-h-screen bg-gray-100 py-12'>
			<div className='container mx-auto'>
				<SupabaseConnectionTest />
			</div>
		</div>
	);
}
